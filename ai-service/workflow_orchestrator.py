"""
AI Workflow Orchestrator
Integrates all AI components into unified adaptive learning pipeline:
1. User Assessment & Knowledge State Extraction
2. Knowledge Graph Traversal
3. Bayesian Mastery Estimation
4. Gap Analysis & Prioritization
5. Multi-Armed Bandit Resource Selection
6. Path Optimization
7. Real-Time Adaptation
"""
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import time
import json

from knowledge_graph import KnowledgeGraph, ConceptNode
from bandit_optimizer import ContextualBandit, Resource
from path_optimizer import PathOptimizer, AdaptivePathOptimizer, LearningPath, PathStep
from models.beta_kt import BetaKT


@dataclass
class UserAttempt:
    """Single learning attempt"""
    concept: str
    correct: bool
    time_spent: float  # seconds
    confidence: float = 0.5  # 0-1
    timestamp: float = field(default_factory=time.time)
    resource_id: Optional[str] = None


@dataclass
class KnowledgeState:
    """Extracted knowledge state from user attempts"""
    user_id: str
    mastery_estimates: Dict[str, float]  # concept -> mastery
    confidence_scores: Dict[str, float]  # concept -> confidence
    learning_velocity: float  # Rate of mastery gain
    engagement_level: float  # 0-1
    preferred_learning_style: str = "visual"
    recent_attempts: List[UserAttempt] = field(default_factory=list)


@dataclass
class LearningRecommendation:
    """Complete learning recommendation"""
    user_id: str
    recommended_path: LearningPath
    next_concepts: List[str]
    suggested_resources: List[Resource]
    estimated_completion_time: float
    adaptation_triggers: Dict[str, any]
    metadata: Dict[str, any] = field(default_factory=dict)


class AIWorkflowOrchestrator:
    """
    Central orchestrator for all AI workflows.
    Manages the complete adaptive learning pipeline.
    """
    
    def __init__(self,
                 knowledge_graph: KnowledgeGraph,
                 resources_db: Dict[str, List[Resource]],
                 config: Optional[Dict] = None):
        """
        Args:
            knowledge_graph: Pre-built knowledge graph
            resources_db: Map of concept_id -> available resources
            config: Configuration parameters
        """
        self.kg = knowledge_graph
        self.resources_db = resources_db
        self.config = config or {}
        
        # Initialize AI components
        self.mastery_estimator = BetaKT(
            alpha=self.config.get('kt_alpha', 1.0),
            beta=self.config.get('kt_beta', 1.0)
        )
        
        self.bandit = ContextualBandit(
            algorithm=self.config.get('bandit_algorithm', 'thompson')
        )
        
        # Load resources into bandit
        for concept_resources in resources_db.values():
            for resource in concept_resources:
                self.bandit.add_resource(resource)
                
        self.path_optimizer = AdaptivePathOptimizer(knowledge_graph)
        
        # State tracking
        self.user_states: Dict[str, KnowledgeState] = {}
        self.active_paths: Dict[str, LearningPath] = {}
        
    # ==================== WORKFLOW 1: User Assessment ====================
    
    def extract_knowledge_state(self, 
                               user_id: str,
                               attempts: List[UserAttempt],
                               prior_mastery: Optional[Dict[str, float]] = None) -> KnowledgeState:
        """
        Extract knowledge state from user attempts.
        Implements temporal feature extraction and normalization.
        
        Args:
            user_id: User identifier
            attempts: List of recent attempts
            prior_mastery: Optional prior mastery estimates
            
        Returns:
            Extracted knowledge state
        """
        if not attempts:
            return KnowledgeState(
                user_id=user_id,
                mastery_estimates=prior_mastery or {},
                confidence_scores={},
                learning_velocity=0.0,
                engagement_level=0.5
            )
            
        # Normalize attempts
        max_time = self.config.get('max_attempt_time', 300.0)  # 5 minutes
        normalized_attempts = [
            {
                'concept': att.concept,
                'correct': att.correct,
                'time_spent': min(att.time_spent, max_time) / max_time,
                'confidence': att.confidence,
                'timestamp': att.timestamp
            }
            for att in attempts
        ]
        
        # Sort by timestamp for temporal patterns
        normalized_attempts.sort(key=lambda x: x['timestamp'])
        
        # Extract temporal patterns (recency weighting)
        decay_rate = self.config.get('temporal_decay', 0.1)
        recency_weights = [
            np.exp(-i * decay_rate) 
            for i in range(len(normalized_attempts))
        ]
        recency_weights.reverse()
        
        # Estimate mastery using Bayesian KT
        mastery_estimates = self.mastery_estimator.predict_mastery(
            [{'concept': a['concept'], 'correct': a['correct']} for a in normalized_attempts],
            prior_mastery
        )
        
        # Calculate confidence scores (based on consistency)
        confidence_scores = self._calculate_confidence_scores(attempts)
        
        # Calculate learning velocity (mastery gain over time)
        learning_velocity = self._calculate_learning_velocity(attempts, mastery_estimates)
        
        # Calculate engagement level
        engagement_level = self._calculate_engagement(attempts)
        
        # Infer learning style
        preferred_style = self._infer_learning_style(attempts)
        
        state = KnowledgeState(
            user_id=user_id,
            mastery_estimates=mastery_estimates,
            confidence_scores=confidence_scores,
            learning_velocity=learning_velocity,
            engagement_level=engagement_level,
            preferred_learning_style=preferred_style,
            recent_attempts=attempts[-50:]  # Keep last 50
        )
        
        self.user_states[user_id] = state
        return state
        
    def _calculate_confidence_scores(self, attempts: List[UserAttempt]) -> Dict[str, float]:
        """Calculate confidence in mastery estimates based on consistency"""
        concept_attempts = {}
        for att in attempts:
            if att.concept not in concept_attempts:
                concept_attempts[att.concept] = []
            concept_attempts[att.concept].append(att.correct)
            
        confidence = {}
        for concept, results in concept_attempts.items():
            if len(results) < 3:
                confidence[concept] = 0.3  # Low confidence with few attempts
            else:
                # Higher consistency = higher confidence
                consistency = 1.0 - np.std(results)
                sample_size_factor = min(1.0, len(results) / 10.0)
                confidence[concept] = consistency * sample_size_factor
                
        return confidence
        
    def _calculate_learning_velocity(self, 
                                    attempts: List[UserAttempt],
                                    current_mastery: Dict[str, float]) -> float:
        """Calculate rate of mastery improvement"""
        if len(attempts) < 5:
            return 0.5  # Default velocity
            
        # Look at attempts over time windows
        recent_window = attempts[-10:]
        older_window = attempts[-20:-10] if len(attempts) >= 20 else attempts[-10:]
        
        recent_success_rate = np.mean([a.correct for a in recent_window])
        older_success_rate = np.mean([a.correct for a in older_window])
        
        velocity = recent_success_rate - older_success_rate
        return max(0.0, min(1.0, 0.5 + velocity))
        
    def _calculate_engagement(self, attempts: List[UserAttempt]) -> float:
        """Calculate engagement level from attempt patterns"""
        if not attempts:
            return 0.5
            
        # Factors: time spent, consistency, completion
        avg_time = np.mean([a.time_spent for a in attempts])
        avg_confidence = np.mean([a.confidence for a in attempts])
        
        # Higher engagement = appropriate time + high confidence
        time_factor = min(1.0, avg_time / 60.0)  # Normalize by 1 minute
        confidence_factor = avg_confidence
        
        return 0.6 * time_factor + 0.4 * confidence_factor
        
    def _infer_learning_style(self, attempts: List[UserAttempt]) -> str:
        """Infer preferred learning style from resource usage"""
        resource_types = [a.resource_id.split('_')[0] for a in attempts if a.resource_id]
        
        if not resource_types:
            return "visual"  # Default
            
        # Count by type
        type_counts = {}
        for rtype in resource_types:
            type_counts[rtype] = type_counts.get(rtype, 0) + 1
            
        # Most used type
        preferred = max(type_counts.items(), key=lambda x: x[1])[0]
        
        style_map = {
            'video': 'visual',
            'article': 'reading',
            'quiz': 'hands-on',
            'interactive': 'interactive'
        }
        
        return style_map.get(preferred, 'visual')
        
    # ==================== WORKFLOW 2-3: Graph Traversal & Mastery ====================
    
    def analyze_knowledge_gaps(self, 
                               user_id: str,
                               mastery_threshold: float = 0.7) -> List[Tuple[str, float, int]]:
        """
        Identify and prioritize knowledge gaps.
        
        Returns:
            List of (concept_id, mastery, unmet_prereqs) sorted by priority
        """
        state = self.user_states.get(user_id)
        if not state:
            return []
            
        # Update knowledge graph with current mastery
        for concept_id, mastery in state.mastery_estimates.items():
            self.kg.update_mastery(concept_id, mastery)
            
        # Get gaps from knowledge graph
        gaps = self.kg.get_gap_concepts(mastery_threshold)
        
        # Enhance with confidence scores
        enhanced_gaps = []
        for concept_id, mastery, unmet in gaps:
            confidence = state.confidence_scores.get(concept_id, 0.5)
            # Lower confidence = higher priority for remediation
            priority_score = (1.0 - confidence) * (1.0 - mastery)
            enhanced_gaps.append((concept_id, mastery, unmet, priority_score))
            
        # Sort by priority score
        enhanced_gaps.sort(key=lambda x: -x[3])
        
        return [(g[0], g[1], g[2]) for g in enhanced_gaps]
        
    # ==================== WORKFLOW 4-5: Resource Selection ====================
    
    def select_optimal_resources(self,
                                concept_id: str,
                                user_id: str,
                                n_resources: int = 3) -> List[Resource]:
        """
        Select optimal resources using Multi-Armed Bandit with context.
        
        Args:
            concept_id: Concept to get resources for
            user_id: User ID for personalization
            n_resources: Number of resources to select
            
        Returns:
            List of selected resources
        """
        state = self.user_states.get(user_id)
        if not state:
            return []
            
        # Get candidate resources
        candidates = self.resources_db.get(concept_id, [])
        if not candidates:
            return []
            
        candidate_ids = [r.id for r in candidates]
        
        # Select using contextual bandit
        selected_ids = []
        for _ in range(min(n_resources, len(candidates))):
            # Filter out already selected
            available = [rid for rid in candidate_ids if rid not in selected_ids]
            if not available:
                break
                
            selected_id = self.bandit.select_contextual_resource(
                candidates=available,
                learner_mastery=state.mastery_estimates.get(concept_id, 0.0),
                learning_style=state.preferred_learning_style,
                available_time=30.0  # Assume 30 min per resource
            )
            
            if selected_id:
                selected_ids.append(selected_id)
                
        # Get resource objects
        selected_resources = [
            r for r in candidates if r.id in selected_ids
        ]
        
        return selected_resources
        
    # ==================== WORKFLOW 6: Path Optimization ====================
    
    def generate_optimal_path(self,
                             user_id: str,
                             target_concepts: List[str],
                             max_time: float = 180.0) -> LearningPath:
        """
        Generate optimal learning path using dynamic programming.
        
        Args:
            user_id: User ID
            target_concepts: Concepts to master
            max_time: Time budget in minutes
            
        Returns:
            Optimized learning path
        """
        state = self.user_states.get(user_id)
        if not state:
            # Create default state
            state = KnowledgeState(
                user_id=user_id,
                mastery_estimates={},
                confidence_scores={},
                learning_velocity=0.5,
                engagement_level=0.5
            )
            
        # Generate path
        path = self.path_optimizer.generate_path(
            user_id=user_id,
            target_concepts=target_concepts,
            available_resources=self.resources_db,
            current_mastery=state.mastery_estimates,
            max_time=max_time,
            mastery_threshold=self.config.get('mastery_threshold', 0.7)
        )
        
        # Optimize difficulty progression
        path = self.path_optimizer.optimize_difficulty_progression(path)
        
        # Store active path
        self.active_paths[user_id] = path
        
        return path
        
    # ==================== WORKFLOW 7: Real-Time Adaptation ====================
    
    def adapt_path_realtime(self,
                           user_id: str,
                           step_completed: int,
                           mastery_gained: float,
                           completed_successfully: bool) -> LearningPath:
        """
        Adapt learning path in real-time based on performance.
        
        Args:
            user_id: User ID
            step_completed: Index of completed step
            mastery_gained: Mastery gain from step (0-1)
            completed_successfully: Whether step was completed
            
        Returns:
            Adapted learning path
        """
        # Get current path
        current_path = self.active_paths.get(user_id)
        if not current_path or step_completed >= len(current_path.steps):
            return current_path
            
        # Update performance history
        state = self.user_states.get(user_id)
        if state:
            recent_performance = [(mastery_gained, completed_successfully)]
            
            # Adapt path
            adapted_path = self.path_optimizer.adapt_path(
                current_path=current_path,
                current_step_index=step_completed,
                recent_performance=recent_performance
            )
            
            # Update stored path
            self.active_paths[user_id] = adapted_path
            
            return adapted_path
            
        return current_path
        
    # ==================== UNIFIED WORKFLOW ====================
    
    def generate_learning_recommendation(self,
                                        user_id: str,
                                        attempts: List[UserAttempt],
                                        target_concepts: List[str],
                                        max_time: float = 180.0) -> LearningRecommendation:
        """
        Complete workflow: Generate personalized learning recommendation.
        
        This orchestrates all AI workflows:
        1. Extract knowledge state
        2. Traverse knowledge graph
        3. Estimate mastery
        4. Analyze gaps
        5. Select resources with bandit
        6. Optimize path
        7. Set up adaptation triggers
        
        Args:
            user_id: User ID
            attempts: Recent learning attempts
            target_concepts: Desired concepts to master
            max_time: Time budget
            
        Returns:
            Complete learning recommendation
        """
        start_time = time.time()
        
        # 1. Extract knowledge state
        state = self.extract_knowledge_state(user_id, attempts)
        
        # 2-3. Analyze gaps (uses graph traversal + mastery)
        gaps = self.analyze_knowledge_gaps(user_id)
        
        # 4-6. Generate optimal path (includes resource selection)
        path = self.generate_optimal_path(user_id, target_concepts, max_time)
        
        # 7. Set up adaptation triggers
        adaptation_triggers = {
            'low_mastery_threshold': 0.3,
            'high_mastery_threshold': 0.8,
            'completion_rate_threshold': 0.5,
            'check_frequency': 'per_step'
        }
        
        # Get next concepts and resources
        next_concepts = [step.concept_id for step in path.steps[:3]]
        next_resources = []
        if path.steps:
            next_resources = path.steps[0].resources
            
        # Calculate completion time
        latency = time.time() - start_time
        
        recommendation = LearningRecommendation(
            user_id=user_id,
            recommended_path=path,
            next_concepts=next_concepts,
            suggested_resources=next_resources,
            estimated_completion_time=path.total_time,
            adaptation_triggers=adaptation_triggers,
            metadata={
                'knowledge_gaps': len(gaps),
                'learning_velocity': state.learning_velocity,
                'engagement_level': state.engagement_level,
                'preferred_style': state.preferred_learning_style,
                'path_quality': self.path_optimizer.calculate_path_quality(path),
                'generation_latency_ms': latency * 1000
            }
        )
        
        return recommendation
        
    # ==================== Utility Methods ====================
    
    def update_resource_feedback(self,
                                resource_id: str,
                                success: bool):
        """Update bandit with resource effectiveness feedback"""
        self.bandit.update_reward(resource_id, success)
        
    def export_state(self) -> Dict:
        """Export orchestrator state for persistence"""
        return {
            'user_states': {
                uid: {
                    'user_id': state.user_id,
                    'mastery_estimates': state.mastery_estimates,
                    'confidence_scores': state.confidence_scores,
                    'learning_velocity': state.learning_velocity,
                    'engagement_level': state.engagement_level,
                    'preferred_learning_style': state.preferred_learning_style
                }
                for uid, state in self.user_states.items()
            },
            'bandit_state': self.bandit.export_state(),
            'knowledge_graph': self.kg.export_graph()
        }
        
    def get_analytics(self, user_id: str) -> Dict:
        """Get analytics for a user"""
        state = self.user_states.get(user_id)
        path = self.active_paths.get(user_id)
        
        if not state:
            return {}
            
        return {
            'user_id': user_id,
            'mastery_distribution': {
                concept: mastery
                for concept, mastery in state.mastery_estimates.items()
            },
            'learning_velocity': state.learning_velocity,
            'engagement_level': state.engagement_level,
            'preferred_style': state.preferred_learning_style,
            'current_path_progress': {
                'total_steps': len(path.steps) if path else 0,
                'estimated_time': path.total_time if path else 0,
                'path_quality': self.path_optimizer.calculate_path_quality(path) if path else {}
            }
        }


if __name__ == "__main__":
    from knowledge_graph import create_sample_cs_knowledge_graph
    
    print("=== AI Workflow Orchestrator Test ===\n")
    
    # Setup
    kg = create_sample_cs_knowledge_graph()
    
    resources_db = {
        "loops": [
            Resource("loop_vid1", "Loops Video", "video", "loops", 0.4, 
                    engagement_score=0.8, avg_time_minutes=15),
            Resource("loop_quiz1", "Loops Quiz", "quiz", "loops", 0.5,
                    engagement_score=0.7, avg_time_minutes=10),
        ],
        "functions": [
            Resource("func_art1", "Functions Article", "article", "functions", 0.5,
                    engagement_score=0.75, avg_time_minutes=20),
        ]
    }
    
    orchestrator = AIWorkflowOrchestrator(kg, resources_db)
    
    # Simulate user attempts
    attempts = [
        UserAttempt("variables", True, 45, 0.8),
        UserAttempt("variables", True, 30, 0.9),
        UserAttempt("operators", True, 50, 0.7),
        UserAttempt("conditionals", False, 90, 0.4),
        UserAttempt("conditionals", True, 70, 0.6),
    ]
    
    # Generate recommendation
    recommendation = orchestrator.generate_learning_recommendation(
        user_id="test_user_123",
        attempts=attempts,
        target_concepts=["functions"],
        max_time=60.0
    )
    
    print(f"Recommendation for user: {recommendation.user_id}")
    print(f"Learning Path: {len(recommendation.recommended_path.steps)} steps")
    print(f"Estimated time: {recommendation.estimated_completion_time:.1f} minutes")
    print(f"Next concepts: {recommendation.next_concepts}")
    print(f"\nMetadata:")
    for key, value in recommendation.metadata.items():
        print(f"  {key}: {value}")
    print(f"\nGeneration latency: {recommendation.metadata['generation_latency_ms']:.2f}ms")

