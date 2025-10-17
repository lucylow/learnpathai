"""
Content Intelligence Pipeline
Analyzes educational content for concepts, difficulty, and readability
"""
import re
import math
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from collections import Counter
import numpy as np


@dataclass
class Concept:
    """Extracted concept"""
    text: str
    frequency: int
    relevance: float
    type: str = 'declarative'  # 'declarative', 'procedural', 'action'


@dataclass
class ContentAnalysis:
    """Result of content analysis"""
    resource_id: str
    concepts: List[Concept]
    difficulty: float
    cognitive_load: str  # 'low', 'medium', 'high'
    readability: float
    engagement_potential: float
    metadata: Dict


class ContentAnalyzer:
    """
    Analyzes educational content using NLP techniques
    """
    
    def __init__(self):
        # Educational concept patterns
        self.concept_patterns = [
            r'\b(algorithm|function|variable|loop|array|object|class|method)\b',
            r'\b(addition|subtraction|multiplication|division|equation)\b',
            r'\b(noun|verb|adjective|sentence|paragraph)\b',
        ]
        
        # Common educational stopwords
        self.stopwords = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
            'can', 'could', 'may', 'might', 'must', 'this', 'that', 'these', 'those'
        }
        
        # Complex vocabulary for difficulty estimation
        self.complex_words = set([
            'algorithm', 'abstraction', 'encapsulation', 'polymorphism',
            'recursion', 'iteration', 'optimization', 'complexity',
            'derivative', 'integral', 'asymptotic', 'heuristic'
        ])
    
    def analyze_content(
        self,
        content: str,
        resource_id: str = "unknown",
        resource_type: str = "text"
    ) -> ContentAnalysis:
        """
        Analyze content for educational value
        
        Args:
            content: Text content to analyze
            resource_id: Resource identifier
            resource_type: Type of resource
            
        Returns:
            ContentAnalysis with detailed metrics
        """
        # Extract concepts
        concepts = self.extract_concepts(content)
        
        # Calculate difficulty
        difficulty = self.calculate_difficulty(content, concepts)
        
        # Estimate cognitive load
        cognitive_load = self.estimate_cognitive_load(content, concepts)
        
        # Calculate readability
        readability = self.calculate_readability(content)
        
        # Predict engagement potential
        engagement_potential = self.predict_engagement(
            content, resource_type, difficulty
        )
        
        return ContentAnalysis(
            resource_id=resource_id,
            concepts=concepts,
            difficulty=difficulty,
            cognitive_load=cognitive_load,
            readability=readability,
            engagement_potential=engagement_potential,
            metadata={
                'word_count': len(content.split()),
                'sentence_count': len(re.split(r'[.!?]+', content)),
                'unique_concepts': len(concepts)
            }
        )
    
    def extract_concepts(self, content: str) -> List[Concept]:
        """Extract key educational concepts from content"""
        # Tokenize and clean
        words = re.findall(r'\b\w+\b', content.lower())
        words = [w for w in words if w not in self.stopwords and len(w) > 3]
        
        # Count frequencies
        word_counts = Counter(words)
        
        # Extract noun phrases (simplified - would use spaCy in production)
        concepts_dict: Dict[str, Dict] = {}
        
        # Pattern-based extraction
        for pattern in self.concept_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                concept_text = match.group(0).lower()
                if concept_text not in concepts_dict:
                    concepts_dict[concept_text] = {
                        'frequency': 0,
                        'type': 'declarative'
                    }
                concepts_dict[concept_text]['frequency'] += 1
        
        # Frequency-based extraction
        for word, count in word_counts.most_common(20):
            if count > 1 and word not in concepts_dict:
                concepts_dict[word] = {
                    'frequency': count,
                    'type': 'declarative'
                }
        
        # Identify procedural concepts (action verbs)
        action_patterns = r'\b(calculate|compute|solve|implement|design|create|build)\b'
        action_matches = re.finditer(action_patterns, content, re.IGNORECASE)
        for match in action_matches:
            concept_text = match.group(0).lower()
            if concept_text not in concepts_dict:
                concepts_dict[concept_text] = {
                    'frequency': 1,
                    'type': 'procedural'
                }
            else:
                concepts_dict[concept_text]['type'] = 'procedural'
        
        # Calculate relevance scores
        max_freq = max([c['frequency'] for c in concepts_dict.values()]) if concepts_dict else 1
        
        concepts = []
        for text, data in concepts_dict.items():
            relevance = data['frequency'] / max_freq
            
            # Boost relevance for technical terms
            if text in self.complex_words:
                relevance *= 1.5
            
            concepts.append(Concept(
                text=text,
                frequency=data['frequency'],
                relevance=min(relevance, 1.0),
                type=data['type']
            ))
        
        # Sort by relevance
        concepts.sort(key=lambda c: c.relevance, reverse=True)
        
        return concepts[:10]  # Return top 10
    
    def calculate_difficulty(
        self,
        content: str,
        concepts: List[Concept]
    ) -> float:
        """
        Calculate content difficulty (0-1)
        
        Factors:
        - Lexical complexity
        - Sentence structure
        - Concept density
        - Technical vocabulary
        """
        # Lexical complexity
        lexical_score = self.analyze_lexical_complexity(content)
        
        # Structural complexity
        structural_score = self.analyze_structural_complexity(content)
        
        # Conceptual density
        conceptual_score = self.analyze_conceptual_density(content, concepts)
        
        # Weighted combination
        difficulty = (
            0.35 * lexical_score +
            0.30 * structural_score +
            0.35 * conceptual_score
        )
        
        return np.clip(difficulty, 0.0, 1.0)
    
    def analyze_lexical_complexity(self, content: str) -> float:
        """Analyze lexical complexity of text"""
        words = re.findall(r'\b\w+\b', content.lower())
        
        if not words:
            return 0.5
        
        # Average word length
        avg_word_length = np.mean([len(w) for w in words])
        length_score = min(avg_word_length / 10.0, 1.0)
        
        # Lexical diversity (unique words / total words)
        lexical_diversity = len(set(words)) / len(words)
        
        # Complex word ratio
        complex_ratio = sum(1 for w in words if w in self.complex_words) / len(words)
        
        # Combine factors
        complexity = (
            0.4 * length_score +
            0.3 * lexical_diversity +
            0.3 * complex_ratio
        )
        
        return np.clip(complexity, 0.0, 1.0)
    
    def analyze_structural_complexity(self, content: str) -> float:
        """Analyze sentence and structural complexity"""
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return 0.5
        
        # Average sentence length
        avg_sentence_length = np.mean([len(s.split()) for s in sentences])
        length_score = min(avg_sentence_length / 30.0, 1.0)
        
        # Sentence length variance (more variance = more complex)
        sentence_lengths = [len(s.split()) for s in sentences]
        if len(sentence_lengths) > 1:
            variance_score = min(np.std(sentence_lengths) / 15.0, 1.0)
        else:
            variance_score = 0.5
        
        # Subordinate clause indicators
        subordinate_patterns = r'\b(because|although|while|since|if|unless|when|where)\b'
        subordinate_count = len(re.findall(subordinate_patterns, content, re.IGNORECASE))
        subordinate_score = min(subordinate_count / len(sentences), 1.0)
        
        # Combine factors
        complexity = (
            0.4 * length_score +
            0.3 * variance_score +
            0.3 * subordinate_score
        )
        
        return np.clip(complexity, 0.0, 1.0)
    
    def analyze_conceptual_density(
        self,
        content: str,
        concepts: List[Concept]
    ) -> float:
        """Analyze density of educational concepts"""
        word_count = len(content.split())
        
        if word_count == 0:
            return 0.5
        
        # Concept density (concepts per 100 words)
        concept_density = len(concepts) / word_count * 100
        density_score = min(concept_density / 10.0, 1.0)  # 10 concepts per 100 words = max
        
        # Average concept relevance
        avg_relevance = np.mean([c.relevance for c in concepts]) if concepts else 0.5
        
        # Technical term ratio
        technical_ratio = sum(
            1 for c in concepts if c.text in self.complex_words
        ) / max(len(concepts), 1)
        
        # Combine factors
        density = (
            0.4 * density_score +
            0.3 * avg_relevance +
            0.3 * technical_ratio
        )
        
        return np.clip(density, 0.0, 1.0)
    
    def estimate_cognitive_load(
        self,
        content: str,
        concepts: List[Concept]
    ) -> str:
        """Estimate cognitive load category"""
        # Calculate factors
        difficulty = self.calculate_difficulty(content, concepts)
        concept_count = len(concepts)
        word_count = len(content.split())
        
        # Cognitive load formula
        load_score = (
            0.5 * difficulty +
            0.3 * min(concept_count / 10.0, 1.0) +
            0.2 * min(word_count / 500.0, 1.0)
        )
        
        if load_score < 0.33:
            return 'low'
        elif load_score < 0.67:
            return 'medium'
        else:
            return 'high'
    
    def calculate_readability(self, content: str) -> float:
        """
        Calculate readability score (Flesch Reading Ease)
        Returns 0-1 (1 = most readable)
        """
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        words = re.findall(r'\b\w+\b', content)
        
        if not sentences or not words:
            return 0.5
        
        # Count syllables (simplified)
        syllable_count = sum(self.count_syllables(word) for word in words)
        
        # Flesch Reading Ease
        # RE = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        words_per_sentence = len(words) / len(sentences)
        syllables_per_word = syllable_count / len(words)
        
        flesch_score = 206.835 - 1.015 * words_per_sentence - 84.6 * syllables_per_word
        
        # Normalize to 0-1 (higher = more readable)
        # Flesch scores range from 0-100
        normalized_score = np.clip(flesch_score / 100.0, 0.0, 1.0)
        
        return normalized_score
    
    def count_syllables(self, word: str) -> int:
        """Count syllables in a word (simplified)"""
        word = word.lower()
        vowels = 'aeiou'
        syllable_count = 0
        previous_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not previous_was_vowel:
                syllable_count += 1
            previous_was_vowel = is_vowel
        
        # Adjust for silent 'e'
        if word.endswith('e'):
            syllable_count -= 1
        
        # Ensure at least one syllable
        if syllable_count == 0:
            syllable_count = 1
        
        return syllable_count
    
    def predict_engagement(
        self,
        content: str,
        resource_type: str,
        difficulty: float
    ) -> float:
        """Predict engagement potential"""
        # Base engagement by type
        type_scores = {
            'video': 0.8,
            'interactive': 0.9,
            'article': 0.6,
            'quiz': 0.7,
            'text': 0.5
        }
        base_score = type_scores.get(resource_type, 0.5)
        
        # Length factor (not too short, not too long)
        word_count = len(content.split())
        optimal_length = 300  # words
        length_factor = math.exp(-((word_count - optimal_length) ** 2) / (2 * 150 ** 2))
        
        # Difficulty factor (moderate difficulty is most engaging)
        optimal_difficulty = 0.5
        difficulty_factor = 1.0 - abs(difficulty - optimal_difficulty)
        
        # Question factor (questions increase engagement)
        question_count = len(re.findall(r'\?', content))
        question_factor = min(question_count / 5.0, 1.0)
        
        # Combine factors
        engagement = (
            0.4 * base_score +
            0.2 * length_factor +
            0.2 * difficulty_factor +
            0.2 * question_factor
        )
        
        return np.clip(engagement, 0.0, 1.0)


# Global instance
content_analyzer = ContentAnalyzer()


if __name__ == "__main__":
    print("=== Content Analyzer Test ===\n")
    
    # Sample educational content
    sample_content = """
    In computer science, an algorithm is a finite sequence of well-defined instructions,
    typically used to solve a class of specific problems or to perform a computation.
    Algorithms are used as specifications for performing calculations and data processing.
    More advanced algorithms can perform automated deductions and use mathematical and
    logical tests to divert the code execution through various routes. Understanding
    algorithm complexity is crucial for writing efficient code. Time complexity measures
    how the runtime of an algorithm increases with input size, while space complexity
    measures memory usage.
    """
    
    analyzer = ContentAnalyzer()
    analysis = analyzer.analyze_content(
        sample_content,
        resource_id="algo_intro_1",
        resource_type="article"
    )
    
    print(f"Resource ID: {analysis.resource_id}")
    print(f"Difficulty: {analysis.difficulty:.3f}")
    print(f"Cognitive Load: {analysis.cognitive_load}")
    print(f"Readability: {analysis.readability:.3f}")
    print(f"Engagement Potential: {analysis.engagement_potential:.3f}")
    
    print(f"\nExtracted Concepts ({len(analysis.concepts)}):")
    for concept in analysis.concepts[:5]:
        print(f"  - {concept.text} (relevance: {concept.relevance:.2f}, type: {concept.type})")
    
    print(f"\nMetadata:")
    for key, value in analysis.metadata.items():
        print(f"  {key}: {value}")

