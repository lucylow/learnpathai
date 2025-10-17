# ai-service/multimodal_recommender.py
"""
Multi-Modal Content Recommendation System.
Learns user preferences for video, text, interactive content and adapts recommendations.
"""
from typing import Dict, List, Tuple
from pydantic import BaseModel
import numpy as np
from datetime import datetime, timedelta


class ModalityEngagement(BaseModel):
    """Engagement metrics for a content modality."""
    modality: str  # video, text, interactive, quiz
    view_count: int = 0
    completion_rate: float = 0.0  # 0-1
    avg_time_spent: float = 0.0  # minutes
    quiz_score_after: float = 0.0  # 0-1
    user_rating: float = 0.5  # 0-1
    last_updated: datetime = datetime.now()


class ResourceMetrics(BaseModel):
    """Metrics for a specific resource."""
    resource_id: str
    modality: str
    completed: bool
    time_spent: float  # minutes
    quiz_score_after: Optional[float] = None
    user_rating: Optional[float] = None
    timestamp: datetime


class ModalityPreferences(BaseModel):
    """Learned preferences for content modalities."""
    user_id: str
    preferences: Dict[str, float]  # modality -> score (0-1)
    confidence: float  # how confident we are in these preferences
    sample_size: int  # number of interactions used
    last_updated: datetime


class MultiModalRecommender:
    """
    Recommends resources based on learned modality preferences.
    Uses exponential moving average to adapt to changing preferences.
    """
    
    def __init__(self, alpha: float = 0.3):
        """
        Args:
            alpha: learning rate for EMA (0-1, higher = faster adaptation)
        """
        self.alpha = alpha
        self.modality_types = ['video', 'text', 'interactive', 'quiz']
        
    def update_preferences(
        self,
        current_prefs: Dict[str, float],
        new_metrics: ResourceMetrics
    ) -> Dict[str, float]:
        """
        Update modality preferences based on new interaction.
        
        Uses exponential moving average:
        new_pref = alpha * new_engagement + (1 - alpha) * old_pref
        
        Args:
            current_prefs: current preference scores per modality
            new_metrics: metrics from latest resource interaction
            
        Returns:
            updated preference scores
        """
        modality = new_metrics.modality
        
        # Compute engagement score from metrics
        engagement_score = self._compute_engagement(new_metrics)
        
        # Update preference for this modality
        old_pref = current_prefs.get(modality, 0.5)
        new_pref = self.alpha * engagement_score + (1 - self.alpha) * old_pref
        
        # Update dict
        updated = current_prefs.copy()
        updated[modality] = new_pref
        
        return updated
    
    def _compute_engagement(self, metrics: ResourceMetrics) -> float:
        """
        Compute engagement score from resource metrics.
        
        Returns:
            engagement score (0-1)
        """
        score = 0.0
        weights = {}
        
        # Factor 1: Completion (40%)
        if metrics.completed:
            score += 0.4
            weights['completion'] = 0.4
        else:
            # Partial credit based on time spent
            expected_time = 15.0  # minutes (typical resource length)
            partial = min(metrics.time_spent / expected_time, 1.0)
            score += 0.4 * partial
            weights['completion'] = 0.4 * partial
        
        # Factor 2: Time spent (20%)
        # Sweet spot: 10-30 minutes. Too short = disengaged, too long = confused
        time_score = 0.0
        if 10 <= metrics.time_spent <= 30:
            time_score = 1.0
        elif metrics.time_spent < 10:
            time_score = metrics.time_spent / 10.0
        else:  # > 30
            time_score = max(0.5, 1.0 - (metrics.time_spent - 30) / 60)
        
        score += 0.2 * time_score
        weights['time'] = 0.2 * time_score
        
        # Factor 3: Quiz performance (30%)
        if metrics.quiz_score_after is not None:
            score += 0.3 * metrics.quiz_score_after
            weights['quiz'] = 0.3 * metrics.quiz_score_after
        else:
            # No quiz data, use neutral
            score += 0.15
            weights['quiz'] = 0.15
        
        # Factor 4: Explicit rating (10%)
        if metrics.user_rating is not None:
            score += 0.1 * metrics.user_rating
            weights['rating'] = 0.1 * metrics.user_rating
        else:
            score += 0.05
            weights['rating'] = 0.05
        
        return min(1.0, score)
    
    def rank_resources_by_modality(
        self,
        resources: List[Dict],
        preferences: Dict[str, float],
        base_scores: Dict[str, float]
    ) -> List[Dict]:
        """
        Re-rank resources based on modality preferences.
        
        Args:
            resources: list of resource dicts with 'id', 'modality', 'base_score'
            preferences: modality preference scores
            base_scores: base ranking scores from other signals
            
        Returns:
            re-ranked resources with updated scores
        """
        ranked = []
        
        for resource in resources:
            modality = resource.get('modality', 'text')
            base_score = base_scores.get(resource['id'], 0.5)
            modality_pref = preferences.get(modality, 0.5)
            
            # Boost score by modality preference
            # Formula: final = base * (1 + pref_boost)
            # pref_boost ranges from -0.3 to +0.5
            pref_boost = (modality_pref - 0.5) * 1.0
            final_score = base_score * (1 + pref_boost)
            
            ranked.append({
                **resource,
                'base_score': base_score,
                'modality_boost': pref_boost,
                'final_score': final_score,
                'modality_preference': modality_pref
            })
        
        # Sort by final score
        ranked.sort(key=lambda x: -x['final_score'])
        
        return ranked
    
    def get_preference_insights(
        self,
        preferences: Dict[str, float],
        sample_size: int
    ) -> Dict:
        """
        Generate human-readable insights about preferences.
        
        Returns:
            dict with insights and recommendations
        """
        # Find top modality
        sorted_prefs = sorted(preferences.items(), key=lambda x: -x[1])
        top_modality = sorted_prefs[0][0] if sorted_prefs else 'video'
        top_score = sorted_prefs[0][1] if sorted_prefs else 0.5
        
        # Confidence based on sample size
        confidence = min(1.0, sample_size / 20.0)  # confident after 20 interactions
        
        # Generate insights
        insights = []
        
        if top_score > 0.7:
            insights.append(f"You strongly prefer {top_modality} content ({top_score:.0%} engagement)")
        elif top_score > 0.6:
            insights.append(f"You tend to engage well with {top_modality} content")
        else:
            insights.append("Your learning style is balanced across modalities")
        
        # Identify weaknesses
        bottom_modality = sorted_prefs[-1][0] if sorted_prefs else None
        bottom_score = sorted_prefs[-1][1] if sorted_prefs else 0.5
        
        if bottom_score < 0.4:
            insights.append(f"Consider giving {bottom_modality} content another try")
        
        # Recommendations
        recommendations = []
        if top_score > 0.7:
            recommendations.append(f"Prioritize {top_modality} resources in your path")
        
        if confidence < 0.5:
            recommendations.append("Try different content types to help us personalize better")
        
        return {
            'top_modality': top_modality,
            'top_score': top_score,
            'preferences': dict(sorted_prefs),
            'confidence': confidence,
            'sample_size': sample_size,
            'insights': insights,
            'recommendations': recommendations
        }
    
    def suggest_diverse_content(
        self,
        preferences: Dict[str, float],
        available_resources: List[Dict],
        diversity_factor: float = 0.3
    ) -> List[Dict]:
        """
        Suggest content with some diversity to prevent filter bubbles.
        
        Args:
            preferences: current modality preferences
            available_resources: resources to choose from
            diversity_factor: 0-1, how much diversity to inject
            
        Returns:
            mixed list balancing preference and diversity
        """
        # Split into preferred and exploratory
        n_total = len(available_resources)
        n_explore = int(n_total * diversity_factor)
        n_prefer = n_total - n_explore
        
        # Get top preferences
        sorted_prefs = sorted(preferences.items(), key=lambda x: -x[1])
        top_modalities = [m for m, _ in sorted_prefs[:2]]
        bottom_modalities = [m for m, _ in sorted_prefs[2:]]
        
        # Separate resources
        preferred = [r for r in available_resources if r.get('modality') in top_modalities]
        exploratory = [r for r in available_resources if r.get('modality') in bottom_modalities]
        
        # Sample
        selected_preferred = preferred[:n_prefer]
        selected_exploratory = exploratory[:n_explore]
        
        # Combine and tag
        results = []
        for r in selected_preferred:
            results.append({**r, 'reason': 'matches_your_preference'})
        for r in selected_exploratory:
            results.append({**r, 'reason': 'recommended_to_explore'})
        
        return results


# FastAPI integration
"""
# Add to ai-service/app.py:

from multimodal_recommender import MultiModalRecommender, ResourceMetrics, ModalityPreferences

mm_recommender = MultiModalRecommender()

# Track user interactions
user_preferences = {}  # user_id -> ModalityPreferences

@app.post("/track_resource_interaction")
async def track_interaction(metrics: ResourceMetrics):
    user_id = metrics.user_id
    
    # Get current preferences
    if user_id not in user_preferences:
        user_preferences[user_id] = ModalityPreferences(
            user_id=user_id,
            preferences={'video': 0.5, 'text': 0.5, 'interactive': 0.5, 'quiz': 0.5},
            confidence=0.0,
            sample_size=0,
            last_updated=datetime.now()
        )
    
    current = user_preferences[user_id]
    
    # Update preferences
    updated_prefs = mm_recommender.update_preferences(
        current.preferences,
        metrics
    )
    
    current.preferences = updated_prefs
    current.sample_size += 1
    current.confidence = min(1.0, current.sample_size / 20.0)
    current.last_updated = datetime.now()
    
    return current

@app.get("/modality_insights/{user_id}")
async def get_insights(user_id: str):
    if user_id not in user_preferences:
        return {"error": "No data for user"}
    
    prefs = user_preferences[user_id]
    insights = mm_recommender.get_preference_insights(
        prefs.preferences,
        prefs.sample_size
    )
    
    return insights
"""

