# ai-service/predictive_model.py
"""
Predictive Learning Path Generator using Machine Learning.
Predicts which concepts students will struggle with and recommends interventions.
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from pydantic import BaseModel
import joblib
from pathlib import Path

try:
    from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("scikit-learn not available")


class StudentProfile(BaseModel):
    """Current student profile for prediction."""
    user_id: str
    current_mastery: Dict[str, float]  # concept -> mastery (0-1)
    time_spent_total: float  # hours
    avg_attempts_per_concept: float
    preferred_modality: str  # video, text, interactive
    learning_pace: str  # slow, medium, fast
    recent_performance_trend: float  # -1 to 1 (declining to improving)


class PredictionResult(BaseModel):
    """Prediction of future performance and recommendations."""
    concept: str
    predicted_mastery: float  # predicted mastery after intervention
    struggle_probability: float  # probability of struggling (0-1)
    recommended_intervention: str
    recommended_resources: List[str]
    estimated_time_to_mastery: float  # hours
    confidence: float  # model confidence (0-1)


class PerformancePredictor:
    """
    Predicts future student performance using ML models.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize predictor.
        
        Args:
            model_path: path to saved model file
        """
        self.model = None
        self.scaler = None
        self.feature_names = [
            'current_mastery',
            'time_spent',
            'attempts_count',
            'modality_match',  # 0 or 1
            'concept_difficulty',
            'prerequisite_mastery',
            'recent_trend'
        ]
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
        elif SKLEARN_AVAILABLE:
            self._initialize_default_model()
    
    def _initialize_default_model(self):
        """Initialize with default pre-trained model (or heuristics)."""
        # Use Gradient Boosting for regression
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        # Note: In production, load actual trained weights
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        """
        Train the model on historical data.
        
        Args:
            X_train: feature matrix (n_samples, n_features)
            y_train: target values (future mastery scores)
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("scikit-learn required for training")
        
        # Standardize features
        X_scaled = self.scaler.fit_transform(X_train)
        
        # Train model
        self.model.fit(X_scaled, y_train)
    
    def predict_next_mastery(
        self,
        current_mastery: float,
        time_spent: float,
        attempts: int,
        concept_difficulty: float,
        prerequisite_mastery: float,
        modality_match: bool,
        recent_trend: float
    ) -> PredictionResult:
        """
        Predict future mastery for a concept.
        
        Args:
            current_mastery: current mastery level (0-1)
            time_spent: hours spent on concept
            attempts: number of practice attempts
            concept_difficulty: difficulty rating (0-1)
            prerequisite_mastery: avg mastery of prerequisites (0-1)
            modality_match: whether resource matches preferred modality
            recent_trend: recent performance trend (-1 to 1)
            
        Returns:
            PredictionResult with predictions and recommendations
        """
        # Feature vector
        features = np.array([[
            current_mastery,
            time_spent,
            attempts,
            1.0 if modality_match else 0.0,
            concept_difficulty,
            prerequisite_mastery,
            recent_trend
        ]])
        
        if self.model and self.scaler and SKLEARN_AVAILABLE:
            # ML prediction
            features_scaled = self.scaler.transform(features)
            predicted_mastery = self.model.predict(features_scaled)[0]
            confidence = 0.85  # Model confidence
        else:
            # Heuristic fallback
            predicted_mastery = self._heuristic_prediction(
                current_mastery, time_spent, attempts,
                concept_difficulty, prerequisite_mastery, modality_match
            )
            confidence = 0.65
        
        # Clip to valid range
        predicted_mastery = np.clip(predicted_mastery, 0, 1)
        
        # Calculate struggle probability
        struggle_prob = 1.0 - predicted_mastery
        
        # Determine intervention
        intervention, resources, est_time = self._recommend_intervention(
            current_mastery,
            predicted_mastery,
            struggle_prob,
            concept_difficulty
        )
        
        return PredictionResult(
            concept="target_concept",  # Fill from context
            predicted_mastery=float(predicted_mastery),
            struggle_probability=float(struggle_prob),
            recommended_intervention=intervention,
            recommended_resources=resources,
            estimated_time_to_mastery=est_time,
            confidence=confidence
        )
    
    def _heuristic_prediction(
        self,
        current: float,
        time: float,
        attempts: int,
        difficulty: float,
        prereq: float,
        modality_match: bool
    ) -> float:
        """Heuristic-based prediction (when ML model not available)."""
        # Base prediction: weighted combination
        base = (
            0.3 * current +  # current state
            0.2 * min(time / 5.0, 1.0) +  # time effort (cap at 5 hours)
            0.15 * min(attempts / 10.0, 1.0) +  # practice count
            0.2 * prereq +  # prerequisite knowledge
            0.1 * (1.0 - difficulty) +  # easier = higher predicted
            0.05 * (1.0 if modality_match else 0.5)
        )
        
        # Add learning curve (diminishing returns)
        learning_gain = 0.15 * (1.0 - current)
        
        return base + learning_gain
    
    def _recommend_intervention(
        self,
        current: float,
        predicted: float,
        struggle_prob: float,
        difficulty: float
    ) -> Tuple[str, List[str], float]:
        """
        Recommend intervention based on predictions.
        
        Returns:
            (intervention_type, resource_list, estimated_hours)
        """
        # High struggle probability
        if struggle_prob > 0.6:
            return (
                "intensive_scaffolding",
                [
                    "prerequisite_review",
                    "step_by_step_tutorial",
                    "worked_examples",
                    "interactive_practice",
                    "ai_tutor_session"
                ],
                4.0  # estimated hours
            )
        
        # Moderate struggle
        if struggle_prob > 0.4:
            return (
                "guided_practice",
                [
                    "video_tutorial",
                    "practice_exercises",
                    "concept_summary"
                ],
                2.5
            )
        
        # Low predicted mastery gain
        if predicted - current < 0.15:
            return (
                "targeted_reinforcement",
                [
                    "advanced_examples",
                    "challenge_problems",
                    "peer_discussion"
                ],
                1.5
            )
        
        # On track
        return (
            "standard_path",
            [
                "recommended_video",
                "standard_exercises"
            ],
            1.0
        )
    
    def predict_learning_path(
        self,
        profile: StudentProfile,
        available_concepts: List[str],
        concept_difficulties: Dict[str, float],
        prerequisites: Dict[str, List[str]]
    ) -> List[Dict]:
        """
        Generate optimized learning path for student.
        
        Args:
            profile: student profile
            available_concepts: list of concepts to learn
            concept_difficulties: difficulty rating per concept
            prerequisites: prerequisite mapping
            
        Returns:
            ordered list of concept recommendations with predictions
        """
        predictions = []
        
        for concept in available_concepts:
            # Skip if already mastered
            if profile.current_mastery.get(concept, 0) > 0.85:
                continue
            
            # Check prerequisite readiness
            prereqs = prerequisites.get(concept, [])
            prereq_mastery = np.mean([
                profile.current_mastery.get(p, 0) for p in prereqs
            ]) if prereqs else 1.0
            
            # Skip if prerequisites not ready
            if prereq_mastery < 0.5:
                continue
            
            # Predict performance
            current_mastery = profile.current_mastery.get(concept, 0)
            difficulty = concept_difficulties.get(concept, 0.5)
            modality_match = True  # Simplified
            
            prediction = self.predict_next_mastery(
                current_mastery,
                profile.time_spent_total / len(available_concepts),
                profile.avg_attempts_per_concept,
                difficulty,
                prereq_mastery,
                modality_match,
                profile.recent_performance_trend
            )
            
            predictions.append({
                "concept": concept,
                "priority_score": struggle_prob * (1 - current_mastery),  # prioritize struggling + important
                "prediction": prediction
            })
        
        # Sort by priority (concepts most likely to need help)
        predictions.sort(key=lambda x: -x['priority_score'])
        
        return predictions
    
    def save_model(self, path: str):
        """Save trained model to disk."""
        if self.model and self.scaler:
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names
            }, path)
    
    def load_model(self, path: str):
        """Load trained model from disk."""
        data = joblib.load(path)
        self.model = data['model']
        self.scaler = data['scaler']
        self.feature_names = data.get('feature_names', self.feature_names)


# FastAPI integration
"""
# Add to ai-service/app.py:

from predictive_model import PerformancePredictor, StudentProfile

predictor = PerformancePredictor()

@app.post("/predict_performance")
async def predict_performance(profile: StudentProfile):
    # Get predictions for next concepts
    concept_difficulties = {
        'loops': 0.6,
        'functions': 0.7,
        'arrays': 0.65,
        # ... from knowledge graph
    }
    
    prerequisites = knowledge_graph  # Your existing KG
    
    path = predictor.predict_learning_path(
        profile,
        list(knowledge_graph.keys()),
        concept_difficulties,
        prerequisites
    )
    
    return {
        "recommended_path": path[:5],  # Top 5 priorities
        "total_estimated_time": sum(p['prediction'].estimated_time_to_mastery for p in path[:5])
    }
"""

