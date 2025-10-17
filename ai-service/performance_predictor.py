"""
Performance Prediction & Proactive Intervention System
Predicts learning trajectories and identifies risk factors
"""
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json


@dataclass
class LearningHistory:
    """Single learning event"""
    user_id: str
    concept_id: str
    timestamp: datetime
    mastery: float
    correct: bool
    time_spent: float
    confidence: float = 0.5


@dataclass
class RiskFactor:
    """Identified risk factor"""
    type: str  # 'slow_progress', 'inconsistent_engagement', 'low_persistence', 'knowledge_gap'
    severity: str  # 'low', 'medium', 'high'
    message: str
    confidence: float


@dataclass
class Intervention:
    """Recommended intervention"""
    type: str  # 'remediation', 'motivational', 'acceleration', 'support'
    priority: str  # 'low', 'medium', 'high'
    action: str
    message: str
    resources: List[str] = None
    
    def __post_init__(self):
        if self.resources is None:
            self.resources = []


@dataclass
class LearningTrajectory:
    """Predicted learning trajectory"""
    user_id: str
    concept_id: str
    predicted_mastery: float
    confidence: float
    estimated_time: float  # hours to mastery
    risk_factors: List[RiskFactor]
    recommendations: List[Intervention]


@dataclass
class PredictiveFeatures:
    """Features for prediction"""
    # Learner characteristics
    prior_mastery: float
    learning_velocity: float
    consistency: float
    engagement_level: float
    
    # Concept characteristics
    concept_difficulty: float
    prerequisite_strength: float
    
    # Temporal features
    time_of_day: int
    day_of_week: int
    learning_stamina: float
    
    # Behavioral patterns
    error_rate: float
    help_seeking: float
    persistence: float


class PerformancePredictor:
    """
    Predicts learning performance and generates proactive interventions
    """
    
    def __init__(self):
        self.history_buffer: Dict[str, List[LearningHistory]] = {}
        self.feature_cache: Dict[str, PredictiveFeatures] = {}
        
    def add_history(self, history: LearningHistory):
        """Add learning event to history"""
        key = f"{history.user_id}:{history.concept_id}"
        
        if key not in self.history_buffer:
            self.history_buffer[key] = []
        
        self.history_buffer[key].append(history)
        
        # Keep only recent history (last 100 events)
        self.history_buffer[key] = self.history_buffer[key][-100:]
    
    def predict_trajectory(
        self,
        user_id: str,
        concept_id: str,
        current_mastery: float = 0.3,
        concept_difficulty: float = 0.5
    ) -> LearningTrajectory:
        """
        Predict learning trajectory for user on concept
        
        Args:
            user_id: User identifier
            concept_id: Concept identifier
            current_mastery: Current mastery level
            concept_difficulty: Concept difficulty (0-1)
            
        Returns:
            LearningTrajectory with predictions and recommendations
        """
        # Extract predictive features
        features = self._extract_features(
            user_id, concept_id, current_mastery, concept_difficulty
        )
        
        # Predict future mastery
        predicted_mastery = self._predict_mastery(features, current_mastery)
        
        # Estimate time to mastery
        estimated_time = self._estimate_time_to_mastery(
            features, current_mastery, predicted_mastery
        )
        
        # Calculate prediction confidence
        confidence = self._calculate_prediction_confidence(features)
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(features)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            features, risk_factors, predicted_mastery
        )
        
        return LearningTrajectory(
            user_id=user_id,
            concept_id=concept_id,
            predicted_mastery=predicted_mastery,
            confidence=confidence,
            estimated_time=estimated_time,
            risk_factors=risk_factors,
            recommendations=recommendations
        )
    
    def _extract_features(
        self,
        user_id: str,
        concept_id: str,
        current_mastery: float,
        concept_difficulty: float
    ) -> PredictiveFeatures:
        """Extract predictive features from history"""
        key = f"{user_id}:{concept_id}"
        history = self.history_buffer.get(key, [])
        
        # Get all user history across concepts
        all_user_history = []
        for hist_key, hist_list in self.history_buffer.items():
            if hist_key.startswith(f"{user_id}:"):
                all_user_history.extend(hist_list)
        
        return PredictiveFeatures(
            prior_mastery=current_mastery,
            learning_velocity=self._calculate_learning_velocity(history),
            consistency=self._calculate_consistency(all_user_history),
            engagement_level=self._calculate_engagement(all_user_history),
            concept_difficulty=concept_difficulty,
            prerequisite_strength=self._estimate_prerequisite_strength(
                user_id, concept_id
            ),
            time_of_day=datetime.now().hour,
            day_of_week=datetime.now().weekday(),
            learning_stamina=self._calculate_stamina(all_user_history),
            error_rate=self._calculate_error_rate(history),
            help_seeking=0.5,  # Placeholder
            persistence=self._calculate_persistence(history)
        )
    
    def _calculate_learning_velocity(
        self,
        history: List[LearningHistory]
    ) -> float:
        """Calculate rate of mastery improvement"""
        if len(history) < 2:
            return 0.1  # Default moderate velocity
        
        # Calculate mastery change per hour
        masteries = [h.mastery for h in history]
        time_span = (history[-1].timestamp - history[0].timestamp).total_seconds() / 3600
        
        if time_span < 0.1:
            return 0.1
        
        mastery_gain = masteries[-1] - masteries[0]
        velocity = mastery_gain / time_span
        
        return np.clip(velocity, -0.5, 0.5)
    
    def _calculate_consistency(
        self,
        history: List[LearningHistory]
    ) -> float:
        """Calculate consistency of engagement"""
        if len(history) < 3:
            return 0.5
        
        # Calculate time gaps between sessions
        timestamps = sorted([h.timestamp for h in history])
        gaps = [
            (timestamps[i+1] - timestamps[i]).total_seconds() / 3600
            for i in range(len(timestamps) - 1)
        ]
        
        # Lower variance = higher consistency
        if len(gaps) > 0:
            std_dev = np.std(gaps)
            mean_gap = np.mean(gaps)
            
            if mean_gap > 0:
                cv = std_dev / mean_gap  # Coefficient of variation
                consistency = 1.0 / (1.0 + cv)
            else:
                consistency = 0.5
        else:
            consistency = 0.5
        
        return np.clip(consistency, 0.0, 1.0)
    
    def _calculate_engagement(
        self,
        history: List[LearningHistory]
    ) -> float:
        """Calculate engagement level"""
        if len(history) == 0:
            return 0.5
        
        # Recent activity frequency
        recent_cutoff = datetime.now() - timedelta(days=7)
        recent_events = [h for h in history if h.timestamp > recent_cutoff]
        
        # Engagement based on frequency and time spent
        frequency_score = min(len(recent_events) / 20.0, 1.0)  # 20 events/week = max
        
        avg_time = np.mean([h.time_spent for h in history])
        time_score = min(avg_time / 300.0, 1.0)  # 5 min average = max
        
        engagement = 0.6 * frequency_score + 0.4 * time_score
        
        return np.clip(engagement, 0.0, 1.0)
    
    def _calculate_stamina(
        self,
        history: List[LearningHistory]
    ) -> float:
        """Calculate learning stamina (sustained attention)"""
        if len(history) < 5:
            return 0.5
        
        # Check if time spent declines over sessions (fatigue)
        recent_history = history[-10:]
        times = [h.time_spent for h in recent_history]
        
        # Calculate trend
        if len(times) > 1:
            x = np.arange(len(times))
            slope = np.polyfit(x, times, 1)[0]
            
            # Positive slope = increasing stamina
            # Negative slope = decreasing stamina
            stamina = 0.5 + slope / 100.0  # Normalize
        else:
            stamina = 0.5
        
        return np.clip(stamina, 0.0, 1.0)
    
    def _calculate_error_rate(
        self,
        history: List[LearningHistory]
    ) -> float:
        """Calculate error rate for concept"""
        if len(history) == 0:
            return 0.5
        
        errors = sum(1 for h in history if not h.correct)
        error_rate = errors / len(history)
        
        return error_rate
    
    def _calculate_persistence(
        self,
        history: List[LearningHistory]
    ) -> float:
        """Calculate persistence (keeps trying after failures)"""
        if len(history) < 3:
            return 0.5
        
        # Look for patterns: failure followed by retry
        persistence_count = 0
        for i in range(len(history) - 1):
            if not history[i].correct and history[i+1].correct:
                persistence_count += 1
        
        persistence = persistence_count / max(len(history) - 1, 1)
        
        return np.clip(persistence, 0.0, 1.0)
    
    def _estimate_prerequisite_strength(
        self,
        user_id: str,
        concept_id: str
    ) -> float:
        """Estimate strength of prerequisite knowledge"""
        # Placeholder - would use knowledge graph in production
        # Check mastery of related concepts
        
        related_masteries = []
        for hist_key, hist_list in self.history_buffer.items():
            if hist_key.startswith(f"{user_id}:") and hist_list:
                related_masteries.append(hist_list[-1].mastery)
        
        if related_masteries:
            return np.mean(related_masteries)
        
        return 0.5
    
    def _predict_mastery(
        self,
        features: PredictiveFeatures,
        current_mastery: float
    ) -> float:
        """Predict future mastery level"""
        # Simple linear model (in production, use trained ML model)
        
        # Base prediction on current mastery
        predicted = current_mastery
        
        # Adjust based on learning velocity
        predicted += features.learning_velocity * 0.3
        
        # Adjust based on engagement
        predicted += (features.engagement_level - 0.5) * 0.2
        
        # Adjust based on difficulty match
        difficulty_match = 1.0 - abs(features.concept_difficulty - current_mastery)
        predicted += (difficulty_match - 0.5) * 0.1
        
        # Adjust based on consistency
        predicted += (features.consistency - 0.5) * 0.1
        
        return np.clip(predicted, 0.0, 1.0)
    
    def _estimate_time_to_mastery(
        self,
        features: PredictiveFeatures,
        current_mastery: float,
        predicted_mastery: float
    ) -> float:
        """Estimate hours to reach mastery (0.8+)"""
        mastery_target = 0.8
        mastery_gap = max(mastery_target - current_mastery, 0.0)
        
        # Base time estimation
        base_time = mastery_gap * 10.0  # 10 hours per mastery point
        
        # Adjust based on learning velocity
        if features.learning_velocity > 0:
            velocity_factor = 1.0 / (features.learning_velocity + 0.1)
        else:
            velocity_factor = 2.0
        
        # Adjust based on difficulty
        difficulty_factor = 1.0 + features.concept_difficulty
        
        # Adjust based on engagement
        engagement_factor = 2.0 - features.engagement_level
        
        estimated_time = base_time * velocity_factor * difficulty_factor * engagement_factor
        
        return max(estimated_time, 0.5)  # Minimum 30 minutes
    
    def _calculate_prediction_confidence(
        self,
        features: PredictiveFeatures
    ) -> float:
        """Calculate confidence in prediction"""
        # Higher data quality = higher confidence
        
        confidence_factors = [
            features.consistency,
            features.engagement_level,
            1.0 - abs(features.prior_mastery - 0.5) * 2,  # More certain away from boundary
        ]
        
        confidence = np.mean(confidence_factors)
        
        return np.clip(confidence, 0.3, 0.9)
    
    def _identify_risk_factors(
        self,
        features: PredictiveFeatures
    ) -> List[RiskFactor]:
        """Identify learning risk factors"""
        risks = []
        
        # Slow progress
        if features.learning_velocity < 0.05:
            risks.append(RiskFactor(
                type='slow_progress',
                severity='high' if features.learning_velocity < 0.02 else 'medium',
                message='Learning progress is slower than expected',
                confidence=0.8
            ))
        
        # Inconsistent engagement
        if features.consistency < 0.3:
            risks.append(RiskFactor(
                type='inconsistent_engagement',
                severity='medium',
                message='Inconsistent learning patterns detected',
                confidence=0.7
            ))
        
        # Low persistence
        if features.persistence < 0.2:
            risks.append(RiskFactor(
                type='low_persistence',
                severity='medium',
                message='Learner gives up quickly on challenging tasks',
                confidence=0.75
            ))
        
        # Knowledge gap
        if features.prerequisite_strength < 0.4:
            risks.append(RiskFactor(
                type='knowledge_gap',
                severity='high',
                message='Prerequisite knowledge appears weak',
                confidence=0.85
            ))
        
        # High error rate
        if features.error_rate > 0.7:
            risks.append(RiskFactor(
                type='difficulty_mismatch',
                severity='high',
                message='Content may be too difficult',
                confidence=0.9
            ))
        
        return risks
    
    def _generate_recommendations(
        self,
        features: PredictiveFeatures,
        risks: List[RiskFactor],
        predicted_mastery: float
    ) -> List[Intervention]:
        """Generate proactive interventions"""
        recommendations = []
        
        # Address each risk factor
        for risk in risks:
            if risk.type == 'slow_progress':
                recommendations.append(Intervention(
                    type='remediation',
                    priority='high',
                    action='suggest_alternative_resources',
                    message='Let\'s try a different learning approach to help you progress faster.',
                    resources=[]
                ))
            
            elif risk.type == 'inconsistent_engagement':
                recommendations.append(Intervention(
                    type='motivational',
                    priority='medium',
                    action='send_reminder',
                    message='Regular practice helps! Try to set aside a few minutes each day.',
                    resources=[]
                ))
            
            elif risk.type == 'low_persistence':
                recommendations.append(Intervention(
                    type='support',
                    priority='medium',
                    action='provide_encouragement',
                    message='You\'re doing great! Don\'t give up - every challenge makes you stronger.',
                    resources=[]
                ))
            
            elif risk.type == 'knowledge_gap':
                recommendations.append(Intervention(
                    type='remediation',
                    priority='high',
                    action='suggest_prerequisite_review',
                    message='Let\'s review some foundational concepts to build a stronger base.',
                    resources=[]
                ))
        
        # Positive reinforcement for strong performance
        if predicted_mastery > 0.8 and features.learning_velocity > 0.1:
            recommendations.append(Intervention(
                type='acceleration',
                priority='medium',
                action='suggest_advanced_content',
                message='Excellent progress! Ready to tackle more advanced concepts?',
                resources=[]
            ))
        
        return recommendations
    
    def export_features(self, user_id: str, concept_id: str) -> Dict:
        """Export features for analysis"""
        key = f"{user_id}:{concept_id}"
        history = self.history_buffer.get(key, [])
        
        if not history:
            return {}
        
        features = self._extract_features(user_id, concept_id, 0.5, 0.5)
        
        return {
            'user_id': user_id,
            'concept_id': concept_id,
            'learning_velocity': features.learning_velocity,
            'consistency': features.consistency,
            'engagement_level': features.engagement_level,
            'persistence': features.persistence,
            'error_rate': features.error_rate,
            'history_length': len(history)
        }


# Global instance
performance_predictor = PerformancePredictor()


if __name__ == "__main__":
    print("=== Performance Predictor Test ===\n")
    
    predictor = PerformancePredictor()
    
    # Simulate learning history
    user_id = "test_user"
    concept_id = "loops"
    
    # Add some history
    base_time = datetime.now() - timedelta(days=7)
    for i in range(10):
        predictor.add_history(LearningHistory(
            user_id=user_id,
            concept_id=concept_id,
            timestamp=base_time + timedelta(hours=i*6),
            mastery=0.3 + i * 0.05,
            correct=i % 3 != 0,  # Some failures
            time_spent=120 + np.random.randint(-30, 30),
            confidence=0.6 + i * 0.02
        ))
    
    # Predict trajectory
    trajectory = predictor.predict_trajectory(
        user_id=user_id,
        concept_id=concept_id,
        current_mastery=0.55,
        concept_difficulty=0.5
    )
    
    print(f"Predicted mastery: {trajectory.predicted_mastery:.3f}")
    print(f"Confidence: {trajectory.confidence:.3f}")
    print(f"Estimated time to mastery: {trajectory.estimated_time:.1f} hours")
    
    print(f"\nRisk factors ({len(trajectory.risk_factors)}):")
    for risk in trajectory.risk_factors:
        print(f"  - {risk.type} ({risk.severity}): {risk.message}")
    
    print(f"\nRecommendations ({len(trajectory.recommendations)}):")
    for rec in trajectory.recommendations:
        print(f"  - {rec.type} ({rec.priority}): {rec.message}")

