"""
Bayesian Knowledge Tracing with Item Response Theory Hybrid Model
Combines BKT's interpretability with IRT's ability estimation
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from scipy.stats import norm
import json


@dataclass
class UserState:
    """User knowledge state with IRT ability parameter"""
    user_id: str
    concept_mastery: Dict[str, float]
    theta: float = 0.0  # IRT ability parameter
    confidence_intervals: Dict[str, Tuple[float, float]] = None
    last_updated: str = None
    
    def __post_init__(self):
        if self.confidence_intervals is None:
            self.confidence_intervals = {}


@dataclass
class ConceptParams:
    """Concept parameters for BKT and IRT"""
    concept_id: str
    beta: float = 0.0  # IRT difficulty
    slip: float = 0.1  # BKT slip probability
    guess: float = 0.2  # BKT guess probability
    learn: float = 0.3  # BKT learning rate
    transit: float = 0.1  # BKT transition probability
    discrimination: float = 1.7  # IRT discrimination parameter


@dataclass
class MasteryUpdate:
    """Result of mastery update"""
    concept_id: str
    prior_mastery: float
    posterior_mastery: float
    confidence: float
    ability: float
    standard_error: float


class BKTIRTHybrid:
    """
    Hybrid model combining:
    - Bayesian Knowledge Tracing for interpretable mastery tracking
    - Item Response Theory for ability estimation
    """
    
    def __init__(self):
        self.user_states: Dict[str, UserState] = {}
        self.concept_params: Dict[str, ConceptParams] = {}
        self.discrimination = 1.7  # Common IRT scaling factor
        
    def initialize_concept(
        self, 
        concept_id: str,
        difficulty: float = 0.0,
        slip: float = 0.1,
        guess: float = 0.2
    ):
        """Initialize parameters for a concept"""
        self.concept_params[concept_id] = ConceptParams(
            concept_id=concept_id,
            beta=difficulty,
            slip=slip,
            guess=guess
        )
        
    def get_user_state(self, user_id: str) -> UserState:
        """Get or create user state"""
        if user_id not in self.user_states:
            self.user_states[user_id] = UserState(
                user_id=user_id,
                concept_mastery={},
                theta=0.0
            )
        return self.user_states[user_id]
    
    def get_concept_params(self, concept_id: str) -> ConceptParams:
        """Get or create concept parameters"""
        if concept_id not in self.concept_params:
            self.initialize_concept(concept_id)
        return self.concept_params[concept_id]
    
    def update_mastery(
        self,
        user_id: str,
        concept_id: str,
        correct: bool,
        time_spent: float = 0.0
    ) -> MasteryUpdate:
        """
        Update mastery using BKT + IRT hybrid approach
        
        Args:
            user_id: User identifier
            concept_id: Concept identifier
            correct: Whether attempt was correct
            time_spent: Time spent on attempt (seconds)
            
        Returns:
            MasteryUpdate with detailed information
        """
        user_state = self.get_user_state(user_id)
        concept_params = self.get_concept_params(concept_id)
        
        # Get prior mastery (default 0.3 for new concepts)
        prior_mastery = user_state.concept_mastery.get(concept_id, 0.3)
        
        # 1. BKT Update: Calculate likelihood
        likelihood = self._calculate_likelihood(
            correct, prior_mastery, concept_params
        )
        
        # 2. Bayesian posterior update
        posterior_mastery = self._bayesian_update(prior_mastery, likelihood)
        
        # 3. IRT ability estimation
        ability_update = self._update_ability_estimate(
            user_state.theta,
            concept_params.beta,
            correct,
            concept_params.discrimination
        )
        
        # 4. Calculate confidence
        confidence = self._calculate_confidence(
            prior_mastery,
            posterior_mastery,
            time_spent
        )
        
        # 5. Apply learning and forgetting
        posterior_mastery = self._apply_learning_forgetting(
            posterior_mastery,
            correct,
            concept_params.learn,
            time_spent
        )
        
        # Update user state
        user_state.concept_mastery[concept_id] = posterior_mastery
        user_state.theta = ability_update['theta']
        user_state.confidence_intervals[concept_id] = self._calculate_ci(
            posterior_mastery, ability_update['se']
        )
        
        return MasteryUpdate(
            concept_id=concept_id,
            prior_mastery=prior_mastery,
            posterior_mastery=posterior_mastery,
            confidence=confidence,
            ability=ability_update['theta'],
            standard_error=ability_update['se']
        )
    
    def _calculate_likelihood(
        self,
        correct: bool,
        mastery: float,
        params: ConceptParams
    ) -> float:
        """Calculate likelihood using BKT model"""
        if correct:
            # P(correct) = P(knows) * (1 - slip) + P(doesn't know) * guess
            return mastery * (1 - params.slip) + (1 - mastery) * params.guess
        else:
            # P(incorrect) = P(knows) * slip + P(doesn't know) * (1 - guess)
            return mastery * params.slip + (1 - mastery) * (1 - params.guess)
    
    def _bayesian_update(self, prior: float, likelihood: float) -> float:
        """Bayesian posterior update"""
        # Normalize posterior
        numerator = prior * likelihood
        denominator = prior * likelihood + (1 - prior) * (1 - likelihood)
        
        if denominator == 0:
            return prior
        
        posterior = numerator / denominator
        return np.clip(posterior, 0.01, 0.99)
    
    def _update_ability_estimate(
        self,
        theta: float,
        beta: float,
        correct: bool,
        discrimination: float
    ) -> Dict[str, float]:
        """
        Update IRT ability estimate using Newton-Raphson
        
        Uses 2PL (Two-Parameter Logistic) IRT model:
        P(correct|theta, beta) = 1 / (1 + exp(-discrimination * (theta - beta)))
        """
        # Calculate probability of correct response
        z = discrimination * (theta - beta)
        probability = 1 / (1 + np.exp(-z))
        
        # Fisher information for standard error
        information = (discrimination ** 2) * probability * (1 - probability)
        
        # Newton-Raphson update
        residual = (1 if correct else 0) - probability
        
        # Prevent division by zero
        if information < 1e-6:
            information = 1e-6
        
        theta_update = theta + residual / information
        
        # Bound theta to reasonable range
        theta_update = np.clip(theta_update, -3, 3)
        
        # Standard error
        se = 1 / np.sqrt(information) if information > 0 else 1.0
        
        return {
            'theta': theta_update,
            'se': se,
            'probability': probability
        }
    
    def _calculate_confidence(
        self,
        prior: float,
        posterior: float,
        time_spent: float
    ) -> float:
        """
        Calculate confidence in mastery estimate
        
        Factors:
        - Change magnitude (smaller = more stable = higher confidence)
        - Time spent (more time = more information = higher confidence)
        - Distance from boundaries (0 or 1)
        """
        # Change-based confidence
        change = abs(posterior - prior)
        change_confidence = 1.0 - change
        
        # Time-based confidence (normalize to 0-1, max at 60 seconds)
        time_confidence = min(time_spent / 60.0, 1.0)
        
        # Boundary-based confidence (lower near 0 or 1)
        boundary_distance = min(posterior, 1 - posterior) * 2
        
        # Weighted combination
        confidence = (
            0.4 * change_confidence +
            0.3 * time_confidence +
            0.3 * boundary_distance
        )
        
        return np.clip(confidence, 0.1, 0.95)
    
    def _apply_learning_forgetting(
        self,
        mastery: float,
        correct: bool,
        learn_rate: float,
        time_spent: float
    ) -> float:
        """
        Apply learning gain or forgetting based on performance
        
        - Correct answer: slight learning boost
        - Incorrect answer: no penalty (growth mindset)
        - Time factor: more time = more learning
        """
        if correct:
            # Learning boost proportional to time and current mastery gap
            learning_potential = 1.0 - mastery
            time_factor = min(time_spent / 30.0, 1.0)  # Normalize to 30s
            boost = learn_rate * learning_potential * time_factor * 0.1
            mastery += boost
        
        return np.clip(mastery, 0.01, 0.99)
    
    def _calculate_ci(
        self,
        mastery: float,
        standard_error: float
    ) -> Tuple[float, float]:
        """Calculate 95% confidence interval"""
        z_score = 1.96  # 95% CI
        margin = z_score * standard_error
        
        lower = max(0.01, mastery - margin)
        upper = min(0.99, mastery + margin)
        
        return (lower, upper)
    
    def predict_performance(
        self,
        user_id: str,
        concept_id: str
    ) -> Dict[str, float]:
        """
        Predict probability of correct response
        Uses hybrid BKT + IRT
        """
        user_state = self.get_user_state(user_id)
        concept_params = self.get_concept_params(concept_id)
        
        mastery = user_state.concept_mastery.get(concept_id, 0.3)
        theta = user_state.theta
        beta = concept_params.beta
        
        # BKT prediction
        bkt_prob = mastery * (1 - concept_params.slip) + \
                   (1 - mastery) * concept_params.guess
        
        # IRT prediction
        z = self.discrimination * (theta - beta)
        irt_prob = 1 / (1 + np.exp(-z))
        
        # Weighted combination (favor IRT for ability, BKT for mastery)
        combined_prob = 0.6 * bkt_prob + 0.4 * irt_prob
        
        return {
            'combined_probability': combined_prob,
            'bkt_probability': bkt_prob,
            'irt_probability': irt_prob,
            'mastery': mastery,
            'ability': theta,
            'difficulty': beta
        }
    
    def get_knowledge_state(self, user_id: str) -> Dict:
        """Get complete knowledge state for user"""
        user_state = self.get_user_state(user_id)
        
        # Calculate overall mastery
        masteries = list(user_state.concept_mastery.values())
        overall_mastery = np.mean(masteries) if masteries else 0.3
        
        # Calculate learning velocity (recent trend)
        learning_velocity = self._estimate_learning_velocity(user_id)
        
        return {
            'user_id': user_id,
            'concept_mastery': dict(user_state.concept_mastery),
            'overall_mastery': float(overall_mastery),
            'ability': float(user_state.theta),
            'confidence_intervals': {
                k: [float(v[0]), float(v[1])]
                for k, v in user_state.confidence_intervals.items()
            },
            'learning_velocity': float(learning_velocity),
            'concept_count': len(user_state.concept_mastery)
        }
    
    def _estimate_learning_velocity(self, user_id: str) -> float:
        """
        Estimate learning velocity (rate of mastery improvement)
        Placeholder - would use historical data in production
        """
        user_state = self.get_user_state(user_id)
        
        # Simple estimate based on ability parameter
        # Positive theta = faster learner
        velocity = (user_state.theta + 3) / 6  # Normalize to 0-1
        return np.clip(velocity, 0.0, 1.0)
    
    def export_state(self) -> Dict:
        """Export model state for persistence"""
        return {
            'user_states': {
                user_id: {
                    'user_id': state.user_id,
                    'concept_mastery': state.concept_mastery,
                    'theta': state.theta,
                    'confidence_intervals': {
                        k: list(v) for k, v in state.confidence_intervals.items()
                    }
                }
                for user_id, state in self.user_states.items()
            },
            'concept_params': {
                concept_id: {
                    'concept_id': params.concept_id,
                    'beta': params.beta,
                    'slip': params.slip,
                    'guess': params.guess,
                    'learn': params.learn,
                    'transit': params.transit,
                    'discrimination': params.discrimination
                }
                for concept_id, params in self.concept_params.items()
            }
        }
    
    def load_state(self, state: Dict):
        """Load model state from persistence"""
        # Load user states
        for user_id, user_data in state.get('user_states', {}).items():
            self.user_states[user_id] = UserState(
                user_id=user_data['user_id'],
                concept_mastery=user_data['concept_mastery'],
                theta=user_data['theta'],
                confidence_intervals={
                    k: tuple(v) for k, v in user_data.get('confidence_intervals', {}).items()
                }
            )
        
        # Load concept parameters
        for concept_id, params_data in state.get('concept_params', {}).items():
            self.concept_params[concept_id] = ConceptParams(**params_data)


# Global instance
bkt_irt_model = BKTIRTHybrid()


if __name__ == "__main__":
    # Test the hybrid model
    print("=== BKT-IRT Hybrid Model Test ===\n")
    
    model = BKTIRTHybrid()
    
    # Initialize concepts
    model.initialize_concept("variables", difficulty=0.0, slip=0.1, guess=0.2)
    model.initialize_concept("loops", difficulty=0.5, slip=0.15, guess=0.15)
    
    # Simulate learning sequence
    user_id = "test_user_1"
    
    print("Learning sequence:")
    attempts = [
        ("variables", True, 10.0),
        ("variables", True, 15.0),
        ("variables", False, 20.0),
        ("loops", False, 25.0),
        ("loops", True, 30.0),
        ("loops", True, 35.0),
    ]
    
    for concept, correct, time_spent in attempts:
        update = model.update_mastery(user_id, concept, correct, time_spent)
        print(f"{concept}: {correct} -> mastery: {update.posterior_mastery:.3f}, "
              f"ability: {update.ability:.3f}, confidence: {update.confidence:.3f}")
    
    print("\nFinal knowledge state:")
    state = model.get_knowledge_state(user_id)
    print(f"Overall mastery: {state['overall_mastery']:.3f}")
    print(f"Ability (theta): {state['ability']:.3f}")
    print(f"Concept masteries: {state['concept_mastery']}")
    
    print("\nPrediction for next attempt:")
    for concept in ["variables", "loops"]:
        pred = model.predict_performance(user_id, concept)
        print(f"{concept}: {pred['combined_probability']:.3f} "
              f"(BKT: {pred['bkt_probability']:.3f}, IRT: {pred['irt_probability']:.3f})")

