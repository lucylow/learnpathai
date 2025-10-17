"""
Multi-Armed Bandit Optimization for Resource Selection
Implements Thompson Sampling and UCB algorithms
"""
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from scipy.stats import beta as beta_dist
import json


@dataclass
class Resource:
    """Learning resource representation"""
    id: str
    title: str
    type: str  # 'video', 'article', 'quiz', 'interactive'
    concept: str
    difficulty: float  # 0.0-1.0
    embedding: List[float] = field(default_factory=list)
    engagement_score: float = 0.5
    completion_rate: float = 0.5
    avg_time_minutes: float = 10.0
    
    # Bandit statistics
    successes: int = 0  # Number of times resource led to mastery gain
    failures: int = 0   # Number of times resource didn't help
    pulls: int = 0      # Number of times resource was shown
    

class MultiArmedBandit:
    """
    Multi-Armed Bandit for optimal resource selection.
    Balances exploration (trying new resources) and exploitation (using proven resources).
    """
    
    def __init__(self, algorithm: str = "thompson", alpha: float = 1.0, beta: float = 1.0):
        """
        Args:
            algorithm: 'thompson' (Thompson Sampling) or 'ucb' (Upper Confidence Bound)
            alpha: Prior successes for Beta distribution
            beta: Prior failures for Beta distribution
        """
        self.algorithm = algorithm
        self.alpha = alpha
        self.beta = beta
        self.resources: Dict[str, Resource] = {}
        
    def add_resource(self, resource: Resource):
        """Add a resource to the bandit pool"""
        self.resources[resource.id] = resource
        
    def thompson_sampling(self, 
                         candidates: List[str],
                         n_samples: int = 1000) -> str:
        """
        Thompson Sampling: Sample from Beta posterior for each resource
        and select the one with highest sample.
        
        Args:
            candidates: List of resource IDs to choose from
            n_samples: Number of samples to draw
            
        Returns:
            Selected resource ID
        """
        if not candidates:
            return None
            
        best_resource = None
        best_sample = -1
        
        for resource_id in candidates:
            if resource_id not in self.resources:
                continue
                
            resource = self.resources[resource_id]
            
            # Beta posterior parameters
            alpha_post = self.alpha + resource.successes
            beta_post = self.beta + resource.failures
            
            # Sample from Beta distribution
            sample = np.random.beta(alpha_post, beta_post)
            
            if sample > best_sample:
                best_sample = sample
                best_resource = resource_id
                
        return best_resource
        
    def ucb_selection(self, 
                     candidates: List[str],
                     total_pulls: int,
                     c: float = 2.0) -> str:
        """
        Upper Confidence Bound: Select resource with highest UCB score
        UCB = mean_reward + c * sqrt(log(total_pulls) / resource_pulls)
        
        Args:
            candidates: List of resource IDs
            total_pulls: Total number of pulls across all resources
            c: Exploration parameter (higher = more exploration)
            
        Returns:
            Selected resource ID
        """
        if not candidates:
            return None
            
        best_resource = None
        best_ucb = -np.inf
        
        for resource_id in candidates:
            if resource_id not in self.resources:
                continue
                
            resource = self.resources[resource_id]
            
            # Handle resources never pulled (infinite UCB)
            if resource.pulls == 0:
                return resource_id
                
            # Calculate mean reward
            mean_reward = resource.successes / resource.pulls if resource.pulls > 0 else 0.5
            
            # UCB calculation
            exploration_bonus = c * np.sqrt(
                np.log(max(total_pulls, 1)) / resource.pulls
            )
            ucb_score = mean_reward + exploration_bonus
            
            if ucb_score > best_ucb:
                best_ucb = ucb_score
                best_resource = resource_id
                
        return best_resource
        
    def select_resource(self, 
                       candidates: List[str],
                       total_pulls: Optional[int] = None) -> str:
        """
        Select best resource using configured algorithm
        
        Args:
            candidates: List of candidate resource IDs
            total_pulls: Required for UCB algorithm
            
        Returns:
            Selected resource ID
        """
        if self.algorithm == "thompson":
            return self.thompson_sampling(candidates)
        elif self.algorithm == "ucb":
            if total_pulls is None:
                total_pulls = sum(r.pulls for r in self.resources.values())
            return self.ucb_selection(candidates, total_pulls)
        else:
            # Fallback: random selection
            return np.random.choice(candidates) if candidates else None
            
    def update_reward(self, resource_id: str, success: bool):
        """
        Update bandit statistics after resource usage
        
        Args:
            resource_id: ID of used resource
            success: Whether resource led to learning gain
        """
        if resource_id not in self.resources:
            return
            
        resource = self.resources[resource_id]
        resource.pulls += 1
        
        if success:
            resource.successes += 1
        else:
            resource.failures += 1
            
    def get_statistics(self, resource_id: str) -> Dict:
        """Get statistics for a resource"""
        if resource_id not in self.resources:
            return {}
            
        resource = self.resources[resource_id]
        
        success_rate = (
            resource.successes / resource.pulls 
            if resource.pulls > 0 else 0.5
        )
        
        # Confidence interval (95%)
        if resource.pulls > 0:
            alpha_post = self.alpha + resource.successes
            beta_post = self.beta + resource.failures
            ci_low = beta_dist.ppf(0.025, alpha_post, beta_post)
            ci_high = beta_dist.ppf(0.975, alpha_post, beta_post)
        else:
            ci_low, ci_high = 0.0, 1.0
            
        return {
            'resource_id': resource_id,
            'success_rate': success_rate,
            'successes': resource.successes,
            'failures': resource.failures,
            'pulls': resource.pulls,
            'confidence_interval': (ci_low, ci_high)
        }
        
    def get_all_statistics(self) -> List[Dict]:
        """Get statistics for all resources"""
        return [
            self.get_statistics(resource_id)
            for resource_id in self.resources.keys()
        ]
        
    def export_state(self) -> Dict:
        """Export bandit state for persistence"""
        return {
            'algorithm': self.algorithm,
            'alpha': self.alpha,
            'beta': self.beta,
            'resources': {
                resource_id: {
                    'id': r.id,
                    'title': r.title,
                    'type': r.type,
                    'concept': r.concept,
                    'difficulty': r.difficulty,
                    'successes': r.successes,
                    'failures': r.failures,
                    'pulls': r.pulls,
                    'engagement_score': r.engagement_score,
                    'completion_rate': r.completion_rate
                }
                for resource_id, r in self.resources.items()
            }
        }
        
    @classmethod
    def from_state(cls, state: Dict) -> 'MultiArmedBandit':
        """Load bandit from saved state"""
        bandit = cls(
            algorithm=state.get('algorithm', 'thompson'),
            alpha=state.get('alpha', 1.0),
            beta=state.get('beta', 1.0)
        )
        
        for resource_data in state.get('resources', {}).values():
            resource = Resource(
                id=resource_data['id'],
                title=resource_data['title'],
                type=resource_data['type'],
                concept=resource_data['concept'],
                difficulty=resource_data['difficulty'],
                engagement_score=resource_data.get('engagement_score', 0.5),
                completion_rate=resource_data.get('completion_rate', 0.5),
                successes=resource_data.get('successes', 0),
                failures=resource_data.get('failures', 0),
                pulls=resource_data.get('pulls', 0)
            )
            bandit.add_resource(resource)
            
        return bandit


class ContextualBandit(MultiArmedBandit):
    """
    Contextual Multi-Armed Bandit: Considers learner context
    (mastery level, learning style, time of day) for better selection
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Context weights: how much to adjust based on context
        self.context_weights = {
            'mastery_match': 0.3,
            'learning_style_match': 0.2,
            'time_preference': 0.1,
            'difficulty_match': 0.4
        }
        
    def calculate_context_score(self,
                                resource: Resource,
                                learner_mastery: float,
                                learning_style: str = "visual",
                                available_time: float = 30.0) -> float:
        """
        Calculate context-adjusted score for resource
        
        Args:
            resource: Resource to score
            learner_mastery: Current mastery level (0-1)
            learning_style: Learner preference ('visual', 'reading', 'interactive')
            available_time: Minutes available
            
        Returns:
            Context score (0-1)
        """
        # Difficulty match: Optimal when resource slightly harder than mastery
        optimal_difficulty = learner_mastery + 0.1
        difficulty_match = 1.0 - abs(resource.difficulty - optimal_difficulty)
        difficulty_match = max(0, min(1, difficulty_match))
        
        # Learning style match
        style_map = {
            'visual': {'video': 1.0, 'interactive': 0.7, 'article': 0.3, 'quiz': 0.5},
            'reading': {'article': 1.0, 'quiz': 0.7, 'video': 0.4, 'interactive': 0.5},
            'interactive': {'interactive': 1.0, 'quiz': 0.9, 'video': 0.6, 'article': 0.3},
            'hands-on': {'interactive': 1.0, 'quiz': 0.8, 'video': 0.5, 'article': 0.3}
        }
        learning_style_match = style_map.get(learning_style, {}).get(resource.type, 0.5)
        
        # Time match
        time_match = 1.0 if resource.avg_time_minutes <= available_time else 0.5
        
        # Mastery match (prefer resources that worked for similar mastery levels)
        mastery_match = resource.engagement_score
        
        # Weighted combination
        context_score = (
            self.context_weights['difficulty_match'] * difficulty_match +
            self.context_weights['learning_style_match'] * learning_style_match +
            self.context_weights['time_preference'] * time_match +
            self.context_weights['mastery_match'] * mastery_match
        )
        
        return context_score
        
    def select_contextual_resource(self,
                                   candidates: List[str],
                                   learner_mastery: float,
                                   learning_style: str = "visual",
                                   available_time: float = 30.0) -> str:
        """
        Select resource considering learner context
        
        Returns:
            Selected resource ID
        """
        if not candidates:
            return None
            
        # Get bandit scores
        bandit_scores = {}
        for resource_id in candidates:
            if resource_id not in self.resources:
                continue
                
            resource = self.resources[resource_id]
            
            # Thompson sampling score
            alpha_post = self.alpha + resource.successes
            beta_post = self.beta + resource.failures
            bandit_score = np.random.beta(alpha_post, beta_post)
            
            # Context score
            context_score = self.calculate_context_score(
                resource, learner_mastery, learning_style, available_time
            )
            
            # Combined score (weighted average)
            combined_score = 0.6 * bandit_score + 0.4 * context_score
            bandit_scores[resource_id] = combined_score
            
        # Select best
        best_resource = max(bandit_scores.keys(), key=lambda k: bandit_scores[k])
        return best_resource


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    if not vec1 or not vec2:
        return 0.0
        
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    return np.dot(vec1, vec2) / (norm1 * norm2)


def gaussian_pdf(x: float, mu: float = 0.0, sigma: float = 1.0) -> float:
    """Gaussian probability density function"""
    return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)


if __name__ == "__main__":
    print("=== Multi-Armed Bandit Test ===\n")
    
    # Create bandit
    bandit = ContextualBandit(algorithm="thompson")
    
    # Add sample resources
    resources = [
        Resource("vid1", "Intro to Loops", "video", "loops", 0.3),
        Resource("art1", "Loop Basics Article", "article", "loops", 0.3),
        Resource("quiz1", "Loop Practice", "quiz", "loops", 0.4),
        Resource("int1", "Interactive Loop Builder", "interactive", "loops", 0.5),
    ]
    
    for r in resources:
        bandit.add_resource(r)
        
    # Simulate learner interactions
    print("Simulating 50 interactions...\n")
    for i in range(50):
        # Select resource
        selected = bandit.select_contextual_resource(
            candidates=[r.id for r in resources],
            learner_mastery=0.3 + i * 0.01,
            learning_style="visual",
            available_time=20.0
        )
        
        # Simulate outcome (video and interactive tend to work better)
        success = np.random.random() < (0.7 if selected in ["vid1", "int1"] else 0.4)
        bandit.update_reward(selected, success)
        
    # Print statistics
    print("Final Statistics:")
    for stat in bandit.get_all_statistics():
        print(f"{stat['resource_id']}: {stat['success_rate']:.2%} success rate "
              f"({stat['successes']}/{stat['pulls']} pulls)")

