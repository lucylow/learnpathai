# ai-service/content_intelligence.py
"""
Content Intelligence Pipeline:
- ASR transcription (Whisper)
- Concept extraction (sentence-transformers)
- Difficulty scoring (heuristics + embeddings)
"""
import re
import json
from typing import Dict, List, Tuple, Optional
from pathlib import Path
import numpy as np

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("Warning: whisper not available. Install with: pip install openai-whisper")

try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("Warning: sentence-transformers not available. Install with: pip install sentence-transformers")


class ConceptExtractor:
    """
    Extract concepts from text using sentence embeddings and similarity.
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', 
                 concept_ontology: Optional[Dict[str, str]] = None):
        """
        Args:
            model_name: sentence-transformers model name
            concept_ontology: dict mapping concept name -> description
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError("sentence-transformers required. Install with: pip install sentence-transformers")
        
        self.model = SentenceTransformer(model_name)
        
        # Default programming concept ontology
        self.concept_ontology = concept_ontology or {
            'variables': 'variable declaration, assignment, naming, data types, integers, strings, booleans',
            'loops': 'for loops, while loops, iteration, repetition, loop control, break, continue',
            'conditionals': 'if statements, else, elif, boolean logic, comparison operators',
            'functions': 'function definition, parameters, arguments, return values, function calls',
            'arrays': 'lists, arrays, indexing, slicing, array operations',
            'objects': 'objects, classes, instances, attributes, methods, OOP',
            'strings': 'string manipulation, concatenation, formatting, string methods',
            'debugging': 'debugging, error messages, stack traces, print statements, breakpoints',
            'algorithms': 'algorithms, problem solving, complexity, optimization',
            'recursion': 'recursive functions, base case, recursive case, call stack'
        }
        
        # Precompute concept embeddings
        self.concept_embeddings = {}
        for concept, desc in self.concept_ontology.items():
            self.concept_embeddings[concept] = self.model.encode(desc, convert_to_tensor=True)
    
    def extract_concepts(self, text: str, threshold: float = 0.45,
                        top_k: int = 5) -> List[Tuple[str, float]]:
        """
        Extract concepts from text based on semantic similarity.
        
        Args:
            text: input text (transcript, description, etc.)
            threshold: minimum similarity threshold
            top_k: return top K concepts
            
        Returns:
            list of (concept, similarity_score) tuples, sorted by score
        """
        if not text.strip():
            return []
        
        # Split into sentences for better granularity
        sentences = self._split_sentences(text)
        
        # Score each concept
        concept_scores = {}
        
        for sentence in sentences:
            if len(sentence.split()) < 3:  # skip very short sentences
                continue
            
            sent_emb = self.model.encode(sentence, convert_to_tensor=True)
            
            for concept, concept_emb in self.concept_embeddings.items():
                sim = util.cos_sim(sent_emb, concept_emb).item()
                
                if sim > threshold:
                    # Take maximum similarity across all sentences
                    concept_scores[concept] = max(concept_scores.get(concept, 0), sim)
        
        # Sort by score
        sorted_concepts = sorted(concept_scores.items(), key=lambda x: -x[1])
        
        return sorted_concepts[:top_k]
    
    def extract_concepts_from_file(self, file_path: str, **kwargs) -> List[Tuple[str, float]]:
        """Extract concepts from a text file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
        return self.extract_concepts(text, **kwargs)
    
    @staticmethod
    def _split_sentences(text: str) -> List[str]:
        """Split text into sentences."""
        # Simple sentence splitting
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]


class DifficultyScorer:
    """
    Estimate content difficulty using multiple signals.
    """
    
    def __init__(self):
        self.difficulty_levels = ['beginner', 'intermediate', 'advanced']
    
    def score_text(self, text: str) -> Dict[str, any]:
        """
        Score text difficulty using multiple heuristics.
        
        Returns:
            dict with 'level' (str), 'score' (float 0-1), and 'metrics' (dict)
        """
        if not text.strip():
            return {'level': 'beginner', 'score': 0.0, 'metrics': {}}
        
        # Compute various metrics
        metrics = {}
        
        # 1. Flesch-Kincaid readability
        metrics['flesch_kincaid'] = self._flesch_kincaid(text)
        
        # 2. Average sentence length
        sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
        words = text.split()
        metrics['avg_sentence_length'] = len(words) / max(len(sentences), 1)
        
        # 3. Vocabulary sophistication (avg word length)
        metrics['avg_word_length'] = np.mean([len(w) for w in words]) if words else 0
        
        # 4. Technical term density (words with 8+ chars and special patterns)
        technical_words = [w for w in words if len(w) >= 8 or re.search(r'[A-Z_]', w)]
        metrics['technical_density'] = len(technical_words) / max(len(words), 1)
        
        # Aggregate into overall score (0-1)
        # Normalize and weight each metric
        fk_score = np.clip(metrics['flesch_kincaid'] / 20, 0, 1)  # normalize FK to 0-1
        length_score = np.clip(metrics['avg_sentence_length'] / 30, 0, 1)
        word_score = np.clip(metrics['avg_word_length'] / 10, 0, 1)
        tech_score = metrics['technical_density']
        
        overall_score = (
            0.3 * fk_score +
            0.2 * length_score +
            0.2 * word_score +
            0.3 * tech_score
        )
        
        # Map to difficulty level
        if overall_score < 0.35:
            level = 'beginner'
        elif overall_score < 0.65:
            level = 'intermediate'
        else:
            level = 'advanced'
        
        return {
            'level': level,
            'score': float(overall_score),
            'metrics': metrics
        }
    
    @staticmethod
    def _flesch_kincaid(text: str) -> float:
        """
        Compute Flesch-Kincaid grade level.
        Formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
        """
        sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
        words = re.findall(r'\b\w+\b', text.lower())
        
        if not sentences or not words:
            return 0.0
        
        # Estimate syllables (simple heuristic)
        total_syllables = sum(DifficultyScorer._count_syllables(w) for w in words)
        
        words_per_sentence = len(words) / len(sentences)
        syllables_per_word = total_syllables / len(words)
        
        fk_grade = 0.39 * words_per_sentence + 11.8 * syllables_per_word - 15.59
        
        return max(0, fk_grade)
    
    @staticmethod
    def _count_syllables(word: str) -> int:
        """Estimate syllable count (simple heuristic)."""
        word = word.lower()
        vowels = 'aeiouy'
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllable_count += 1
            prev_was_vowel = is_vowel
        
        # Adjust for silent 'e'
        if word.endswith('e'):
            syllable_count -= 1
        
        return max(1, syllable_count)


class TranscriptionService:
    """
    Audio/video transcription using Whisper.
    """
    
    def __init__(self, model_size: str = 'base'):
        """
        Args:
            model_size: whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        """
        if not WHISPER_AVAILABLE:
            raise ImportError("whisper required. Install with: pip install openai-whisper")
        
        print(f"Loading Whisper model: {model_size}")
        self.model = whisper.load_model(model_size)
    
    def transcribe(self, audio_path: str, language: str = 'en') -> Dict:
        """
        Transcribe audio/video file.
        
        Args:
            audio_path: path to audio/video file
            language: language code (e.g., 'en', 'es')
            
        Returns:
            dict with 'text' (full transcript), 'segments' (timestamped), 'language'
        """
        result = self.model.transcribe(
            audio_path,
            language=language,
            task='transcribe',
            verbose=False
        )
        
        return {
            'text': result['text'],
            'segments': result['segments'],
            'language': result['language']
        }
    
    def transcribe_with_confidence(self, audio_path: str) -> Dict:
        """
        Transcribe with per-segment confidence scores.
        
        Returns:
            dict with transcript and average confidence
        """
        result = self.transcribe(audio_path)
        
        # Compute average confidence from segments
        confidences = []
        for seg in result['segments']:
            # Whisper doesn't directly provide confidence, but we can use other signals
            # For now, use length as proxy (longer segments = more confident)
            confidences.append(min(1.0, len(seg['text'].split()) / 10))
        
        avg_confidence = np.mean(confidences) if confidences else 0.5
        
        return {
            **result,
            'avg_confidence': float(avg_confidence)
        }


class ContentIntelligencePipeline:
    """
    End-to-end content intelligence pipeline.
    """
    
    def __init__(self, whisper_model: str = 'base', 
                 embedding_model: str = 'all-MiniLM-L6-v2'):
        """
        Args:
            whisper_model: whisper model size
            embedding_model: sentence-transformers model
        """
        self.transcription_service = None
        if WHISPER_AVAILABLE:
            self.transcription_service = TranscriptionService(whisper_model)
        
        self.concept_extractor = None
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            self.concept_extractor = ConceptExtractor(embedding_model)
        
        self.difficulty_scorer = DifficultyScorer()
    
    def process_video(self, video_path: str) -> Dict:
        """
        Full pipeline: transcribe -> extract concepts -> score difficulty.
        
        Args:
            video_path: path to video file
            
        Returns:
            dict with transcript, concepts, difficulty, and metadata
        """
        if not self.transcription_service:
            raise ImportError("Whisper not available")
        
        # Step 1: Transcribe
        print(f"Transcribing {video_path}...")
        transcript_result = self.transcription_service.transcribe_with_confidence(video_path)
        
        text = transcript_result['text']
        
        # Step 2: Extract concepts
        print("Extracting concepts...")
        concepts = []
        if self.concept_extractor:
            concepts = self.concept_extractor.extract_concepts(text)
        
        # Step 3: Score difficulty
        print("Scoring difficulty...")
        difficulty = self.difficulty_scorer.score_text(text)
        
        return {
            'transcript': text,
            'segments': transcript_result['segments'],
            'confidence': transcript_result.get('avg_confidence', 0.5),
            'concepts': [{'name': c, 'score': s} for c, s in concepts],
            'difficulty': difficulty,
            'metadata': {
                'language': transcript_result.get('language'),
                'duration': transcript_result['segments'][-1]['end'] if transcript_result['segments'] else 0
            }
        }
    
    def process_text(self, text: str) -> Dict:
        """
        Process text content (for articles, docs, etc.).
        
        Returns:
            dict with concepts, difficulty
        """
        concepts = []
        if self.concept_extractor:
            concepts = self.concept_extractor.extract_concepts(text)
        
        difficulty = self.difficulty_scorer.score_text(text)
        
        return {
            'text': text,
            'concepts': [{'name': c, 'score': s} for c, s in concepts],
            'difficulty': difficulty
        }


# CLI for testing
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python content_intelligence.py <text|video> <path>")
        sys.exit(1)
    
    mode = sys.argv[1]
    path = sys.argv[2]
    
    pipeline = ContentIntelligencePipeline()
    
    if mode == 'text':
        with open(path, 'r') as f:
            text = f.read()
        result = pipeline.process_text(text)
    elif mode == 'video':
        result = pipeline.process_video(path)
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)
    
    print(json.dumps(result, indent=2))

