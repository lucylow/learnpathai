# ai-service/resource_ranker.py
"""
Hybrid resource ranking system.
Combines multiple signals: semantic similarity, modality match, 
difficulty alignment, and historical success rates.
"""
import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass

try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False


@dataclass
class UserProfile:
    """User learning profile."""
    preferred_modality: str = 'video'  # video, text, interactive
    level: float = 0.5  # 0-1, overall skill level
    mastery: Dict[str, float] = None  # concept -> mastery
    learning_pace: str = 'medium'  # slow, medium, fast
    
    def __post_init__(self):
        if self.mastery is None:
            self.mastery = {}


@dataclass
class Resource:
    """Resource with metadata."""
    id: str
    title: str
    description: str = ''
    concepts: List[str] = None
    modality: str = 'video'
    difficulty: str = 'beginner'  # beginner, intermediate, advanced
    duration_minutes: float = 10
    embed: Optional[np.ndarray] = None
    
    def __post_init__(self):
        if self.concepts is None:
            self.concepts = []


class ResourceRanker:
    """
    Hybrid ranking system for educational resources.
    """
    
    def __init__(self, 
                 embedding_model: str = 'all-MiniLM-L6-v2',
                 success_stats: Optional[Dict[str, float]] = None,
                 weights: Optional[Dict[str, float]] = None):
        """
        Args:
            embedding_model: sentence-transformers model
            success_stats: dict of resource_id -> success_rate (0-1)
            weights: scoring weights (content_sim, modality, difficulty, success, freshness)
        """
        self.encoder = None
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            self.encoder = SentenceTransformer(embedding_model)
        
        self.success_stats = success_stats or {}
        
        # Default weights
        self.weights = weights or {
            'content_sim': 0.35,
            'modality': 0.15,
            'difficulty': 0.20,
            'success': 0.20,
            'freshness': 0.10
        }
        
        # Normalize weights
        total = sum(self.weights.values())
        self.weights = {k: v / total for k, v in self.weights.items()}
        
        # Difficulty level mapping
        self.difficulty_map = {
            'beginner': 0.2,
            'intermediate': 0.5,
            'advanced': 0.8
        }
    
    def embed_resources(self, resources: List[Resource]) -> List[Resource]:
        """
        Compute embeddings for resources (modifies in place).
        
        Args:
            resources: list of Resource objects
            
        Returns:
            same list with embeddings added
        """
        if not self.encoder:
            print("Warning: embeddings not available")
            return resources
        
        for res in resources:
            text = f"{res.title}. {res.description}"
            res.embed = self.encoder.encode(text, convert_to_numpy=True)
        
        return resources
    
    def rank_resources(self, 
                      user: UserProfile,
                      concept: str,
                      resources: List[Resource],
                      query: Optional[str] = None) -> List[Dict]:
        """
        Rank resources for a given user and concept.
        
        Args:
            user: user profile
            concept: target concept to learn
            resources: list of candidate resources
            query: optional custom query for semantic search
            
        Returns:
            list of dicts with resource + score, sorted by score (descending)
        """
        if not resources:
            return []
        
        # Prepare query embedding
        query_text = query or f"Learn {concept}"
        query_embed = None
        if self.encoder:
            query_embed = self.encoder.encode(query_text, convert_to_numpy=True)
        
        # Get user's current level for the concept
        user_level = user.mastery.get(concept, 0.0)
        
        ranked = []
        
        for res in resources:
            scores = {}
            
            # 1. Content similarity (semantic)
            if query_embed is not None and res.embed is not None:
                sim = util.cos_sim(query_embed, res.embed).item()
                scores['content_sim'] = max(0, sim)  # clip to [0, 1]
            else:
                # Fallback: keyword match
                scores['content_sim'] = 1.0 if concept in res.concepts else 0.3
            
            # 2. Modality match
            scores['modality'] = 1.0 if res.modality == user.preferred_modality else 0.6
            
            # 3. Difficulty alignment
            res_difficulty = self.difficulty_map.get(res.difficulty, 0.5)
            # Prefer resources slightly above current level
            target_difficulty = min(0.9, user_level + 0.1)
            diff_gap = abs(res_difficulty - target_difficulty)
            scores['difficulty'] = 1.0 - diff_gap
            
            # 4. Historical success rate
            success_rate = self.success_stats.get(res.id, 0.5)  # default to neutral
            scores['success'] = success_rate
            
            # 5. Freshness / recency (placeholder - could use timestamps)
            # For now, just use a constant
            scores['freshness'] = 0.7
            
            # Aggregate weighted score
            total_score = sum(
                self.weights[key] * scores[key]
                for key in self.weights
            )
            
            ranked.append({
                'resource': res,
                'score': total_score,
                'score_breakdown': scores
            })
        
        # Sort by score (descending)
        ranked.sort(key=lambda x: -x['score'])
        
        return ranked
    
    def rank_and_filter(self,
                       user: UserProfile,
                       concept: str,
                       resources: List[Resource],
                       top_k: int = 5,
                       min_score: float = 0.3) -> List[Dict]:
        """
        Rank and filter resources.
        
        Args:
            user: user profile
            concept: target concept
            resources: candidate resources
            top_k: max number to return
            min_score: minimum score threshold
            
        Returns:
            filtered and ranked list
        """
        ranked = self.rank_resources(user, concept, resources)
        
        # Filter by min score
        filtered = [r for r in ranked if r['score'] >= min_score]
        
        # Take top K
        return filtered[:top_k]
    
    def explain_ranking(self, ranked_resource: Dict) -> str:
        """
        Generate explanation for a ranking.
        
        Args:
            ranked_resource: dict from rank_resources() with 'score_breakdown'
            
        Returns:
            human-readable explanation
        """
        res = ranked_resource['resource']
        breakdown = ranked_resource['score_breakdown']
        
        # Find top contributing factors
        factors = sorted(breakdown.items(), key=lambda x: -x[1])
        
        explanation = f"Recommended '{res.title}' (score: {ranked_resource['score']:.2f}) because:\n"
        
        for factor, score in factors[:3]:
            if factor == 'content_sim':
                explanation += f"  - High content relevance ({score:.2f})\n"
            elif factor == 'modality':
                explanation += f"  - Matches your preferred {res.modality} format ({score:.2f})\n"
            elif factor == 'difficulty':
                explanation += f"  - Appropriate difficulty level ({score:.2f})\n"
            elif factor == 'success':
                explanation += f"  - High success rate with other students ({score:.2f})\n"
        
        return explanation


# Example usage
if __name__ == '__main__':
    # Create sample resources
    resources = [
        Resource(
            id='res_1',
            title='Python For Loops Tutorial',
            description='Learn for loops with examples',
            concepts=['loops'],
            modality='video',
            difficulty='beginner',
            duration_minutes=15
        ),
        Resource(
            id='res_2',
            title='Advanced Loop Patterns',
            description='Nested loops and optimization',
            concepts=['loops'],
            modality='text',
            difficulty='advanced',
            duration_minutes=30
        ),
        Resource(
            id='res_3',
            title='Interactive Loop Exercises',
            description='Practice loops with coding challenges',
            concepts=['loops'],
            modality='interactive',
            difficulty='intermediate',
            duration_minutes=20
        )
    ]
    
    # Create ranker
    ranker = ResourceRanker(
        success_stats={
            'res_1': 0.85,
            'res_2': 0.70,
            'res_3': 0.90
        }
    )
    
    # Embed resources
    ranker.embed_resources(resources)
    
    # Create user profile
    user = UserProfile(
        preferred_modality='video',
        level=0.4,
        mastery={'variables': 0.7, 'loops': 0.3}
    )
    
    # Rank
    ranked = ranker.rank_resources(user, 'loops', resources)
    
    print("Rankings:")
    for item in ranked:
        res = item['resource']
        print(f"  {res.title}: {item['score']:.3f}")
        print(f"    {ranker.explain_ranking(item)}")

