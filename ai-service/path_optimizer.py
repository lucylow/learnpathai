"""
Learning Path Optimization using Dynamic Programming
Generates optimal learning sequences maximizing mastery while respecting dependencies
"""
import numpy as np
from typing import List, Dict, Set, Tuple, Optional
from dataclasses import dataclass
from knowledge_graph import KnowledgeGraph, ConceptNode
from bandit_optimizer import Resource
import heapq


@dataclass
class PathStep:
    """Single step in a learning path"""
    concept_id: str
    concept_name: str
    resources: List[Resource]
    estimated_time: float  # minutes
    difficulty: float
    mastery_gain_potential: float
    prerequisites_met: bool = True
    

@dataclass
class LearningPath:
    """Complete learning path with metadata"""
    path_id: str
    user_id: str
    steps: List[PathStep]
    total_time: float
    estimated_mastery_gain: float
    diversity_score: float  # Variety of resource types
    difficulty_progression: List[float]
    

class PathOptimizer:
    """
    Generates optimal learning paths using dynamic programming.
    Optimizes for: mastery gain, time efficiency, diversity, smooth difficulty progression
    """
    
    def __init__(self,
                 knowledge_graph: KnowledgeGraph,
                 weight_mastery: float = 0.4,
                 weight_time: float = 0.2,
                 weight_diversity: float = 0.2,
                 weight_difficulty: float = 0.2):
        """
        Args:
            knowledge_graph: Knowledge graph with concept dependencies
            weight_mastery: Weight for mastery gain
            weight_time: Weight for time efficiency (inverse)
            weight_diversity: Weight for resource diversity
            weight_difficulty: Weight for smooth difficulty progression
        """
        self.kg = knowledge_graph
        self.w_mastery = weight_mastery
        self.w_time = weight_time
        self.w_diversity = weight_diversity
        self.w_difficulty = weight_difficulty
        
    def generate_path(self,
                     user_id: str,
                     target_concepts: List[str],
                     available_resources: Dict[str, List[Resource]],
                     current_mastery: Dict[str, float],
                     max_time: float = 180.0,  # minutes
                     mastery_threshold: float = 0.7) -> LearningPath:
        """
        Generate optimal learning path to target concepts
        
        Args:
            user_id: Learner ID
            target_concepts: Concepts to master
            available_resources: Map of concept_id -> list of resources
            current_mastery: Current mastery levels
            max_time: Maximum time budget (minutes)
            mastery_threshold: Mastery threshold for completion
            
        Returns:
            Optimized learning path
        """
        # Update knowledge graph with current mastery
        for concept_id, mastery in current_mastery.items():
            self.kg.update_mastery(concept_id, mastery)
            
        # Get optimal sequence respecting dependencies
        sequence = self.kg.get_optimal_learning_sequence(
            target_concepts, 
            mastery_threshold
        )
        
        # Build path steps with resource selection
        steps = []
        cumulative_time = 0.0
        used_resource_types = set()
        
        for concept_id in sequence:
            if cumulative_time >= max_time:
                break
                
            # Get resources for this concept
            concept_resources = available_resources.get(concept_id, [])
            if not concept_resources:
                continue
                
            # Select best resources for this concept
            selected_resources = self._select_resources_for_concept(
                concept_id,
                concept_resources,
                current_mastery.get(concept_id, 0.0),
                max_time - cumulative_time,
                used_resource_types
            )
            
            if not selected_resources:
                continue
                
            # Calculate step metadata
            step_time = sum(r.avg_time_minutes for r in selected_resources)
            step_difficulty = self.kg.graph.nodes[concept_id].get('difficulty', 0.5)
            mastery_gain = self.kg.compute_learning_gain_potential(concept_id)
            
            # Check prerequisites
            prereqs = self.kg.get_prerequisites(concept_id)
            prereqs_met = all(
                current_mastery.get(p, 0.0) >= mastery_threshold 
                for p in prereqs
            )
            
            step = PathStep(
                concept_id=concept_id,
                concept_name=self.kg.graph.nodes[concept_id].get('name', concept_id),
                resources=selected_resources,
                estimated_time=step_time,
                difficulty=step_difficulty,
                mastery_gain_potential=mastery_gain,
                prerequisites_met=prereqs_met
            )
            
            steps.append(step)
            cumulative_time += step_time
            used_resource_types.update(r.type for r in selected_resources)
            
        # Calculate path metadata
        path = LearningPath(
            path_id=f"path_{user_id}_{len(target_concepts)}",
            user_id=user_id,
            steps=steps,
            total_time=cumulative_time,
            estimated_mastery_gain=sum(s.mastery_gain_potential for s in steps),
            diversity_score=len(used_resource_types) / 4.0,  # Normalized by 4 types
            difficulty_progression=[s.difficulty for s in steps]
        )
        
        return path
        
    def _select_resources_for_concept(self,
                                     concept_id: str,
                                     resources: List[Resource],
                                     current_mastery: float,
                                     time_remaining: float,
                                     used_types: Set[str]) -> List[Resource]:
        """
        Select best 1-3 resources for a concept considering:
        - Difficulty match
        - Time constraints
        - Diversity
        """
        if not resources:
            return []
            
        # Score each resource
        scored_resources = []
        for resource in resources:
            score = self._score_resource(
                resource, 
                current_mastery, 
                time_remaining,
                used_types
            )
            scored_resources.append((score, resource))
            
        # Sort by score descending
        scored_resources.sort(reverse=True, key=lambda x: x[0])
        
        # Select top resources within time budget
        selected = []
        total_time = 0.0
        
        for score, resource in scored_resources:
            if total_time + resource.avg_time_minutes > time_remaining:
                continue
                
            selected.append(resource)
            total_time += resource.avg_time_minutes
            
            # Limit to 3 resources per concept
            if len(selected) >= 3:
                break
                
        return selected
        
    def _score_resource(self,
                       resource: Resource,
                       current_mastery: float,
                       time_remaining: float,
                       used_types: Set[str]) -> float:
        """Score a resource for selection"""
        # Difficulty match: prefer resources slightly harder than current mastery
        optimal_difficulty = current_mastery + 0.15
        difficulty_score = 1.0 - abs(resource.difficulty - optimal_difficulty)
        difficulty_score = max(0, difficulty_score)
        
        # Time efficiency
        time_score = min(1.0, time_remaining / resource.avg_time_minutes)
        
        # Diversity bonus
        diversity_bonus = 0.2 if resource.type not in used_types else 0.0
        
        # Engagement and completion
        engagement_score = 0.5 * resource.engagement_score + 0.5 * resource.completion_rate
        
        # Combined score
        score = (
            0.35 * difficulty_score +
            0.25 * time_score +
            0.20 * engagement_score +
            0.20 * diversity_bonus
        )
        
        return score
        
    def optimize_difficulty_progression(self, path: LearningPath) -> LearningPath:
        """
        Reorder path steps for smoother difficulty progression
        while respecting prerequisites
        """
        if len(path.steps) <= 1:
            return path
            
        # Build dependency graph for steps
        step_deps = {}
        for step in path.steps:
            prereqs = self.kg.get_prerequisites(step.concept_id)
            step_concept_ids = {s.concept_id for s in path.steps}
            step_deps[step.concept_id] = [p for p in prereqs if p in step_concept_ids]
            
        # Try to sort by difficulty while respecting dependencies
        optimized_steps = []
        remaining = path.steps.copy()
        
        while remaining:
            # Find steps with all dependencies satisfied
            available = [
                step for step in remaining
                if all(dep not in [s.concept_id for s in remaining] for dep in step_deps[step.concept_id])
            ]
            
            if not available:
                # No valid next step, keep remaining in order
                optimized_steps.extend(remaining)
                break
                
            # Among available, pick one with closest difficulty to last step
            if optimized_steps:
                last_difficulty = optimized_steps[-1].difficulty
                next_step = min(available, key=lambda s: abs(s.difficulty - last_difficulty - 0.1))
            else:
                # Start with easiest
                next_step = min(available, key=lambda s: s.difficulty)
                
            optimized_steps.append(next_step)
            remaining.remove(next_step)
            
        # Create new path with optimized order
        path.steps = optimized_steps
        path.difficulty_progression = [s.difficulty for s in optimized_steps]
        
        return path
        
    def dynamic_programming_path(self,
                                target_concepts: List[str],
                                available_resources: Dict[str, List[Resource]],
                                current_mastery: Dict[str, float],
                                max_time: float) -> List[str]:
        """
        Use dynamic programming to find optimal concept sequence
        maximizing mastery gain under time constraint
        
        This is similar to 0/1 Knapsack problem
        """
        # Get all concepts needed (including prerequisites)
        all_concepts = set(target_concepts)
        for concept in target_concepts:
            prereqs = self.kg.get_prerequisites(concept)
            all_concepts.update(prereqs)
            
        concepts_list = list(all_concepts)
        n = len(concepts_list)
        
        # Estimate time and value for each concept
        concept_times = {}
        concept_values = {}
        
        for concept_id in concepts_list:
            resources = available_resources.get(concept_id, [])
            if resources:
                concept_times[concept_id] = min(r.avg_time_minutes for r in resources)
            else:
                concept_times[concept_id] = 15.0  # Default
                
            mastery_gain = self.kg.compute_learning_gain_potential(concept_id)
            concept_values[concept_id] = mastery_gain
            
        # DP table: dp[i][t] = max value using first i concepts with time t
        time_slots = int(max_time) + 1
        dp = [[0.0 for _ in range(time_slots)] for _ in range(n + 1)]
        
        # Fill DP table
        for i in range(1, n + 1):
            concept = concepts_list[i - 1]
            time_needed = int(concept_times[concept])
            value = concept_values[concept]
            
            for t in range(time_slots):
                # Don't take this concept
                dp[i][t] = dp[i - 1][t]
                
                # Take this concept if time allows
                if t >= time_needed:
                    dp[i][t] = max(dp[i][t], dp[i - 1][t - time_needed] + value)
                    
        # Backtrack to find selected concepts
        selected = []
        t = time_slots - 1
        for i in range(n, 0, -1):
            if dp[i][t] != dp[i - 1][t]:
                concept = concepts_list[i - 1]
                selected.append(concept)
                t -= int(concept_times[concept])
                
        selected.reverse()
        
        # Reorder selected concepts by dependencies
        ordered = self.kg.get_optimal_learning_sequence(selected, mastery_threshold=0.0)
        
        return ordered
        
    def calculate_path_quality(self, path: LearningPath) -> Dict[str, float]:
        """
        Calculate quality metrics for a learning path
        
        Returns:
            Dictionary of quality metrics
        """
        if not path.steps:
            return {
                'overall_quality': 0.0,
                'mastery_score': 0.0,
                'time_efficiency': 0.0,
                'diversity_score': 0.0,
                'difficulty_smoothness': 0.0
            }
            
        # Mastery score (higher is better)
        mastery_score = min(1.0, path.estimated_mastery_gain / len(path.steps))
        
        # Time efficiency (lower time per mastery gain is better)
        time_efficiency = 1.0 / (1.0 + path.total_time / max(path.estimated_mastery_gain, 0.1))
        
        # Diversity score (already calculated)
        diversity_score = path.diversity_score
        
        # Difficulty smoothness (lower variance is better)
        if len(path.difficulty_progression) > 1:
            diffs = np.diff(path.difficulty_progression)
            smoothness = 1.0 / (1.0 + np.var(diffs))
        else:
            smoothness = 1.0
            
        # Overall quality (weighted combination)
        overall = (
            self.w_mastery * mastery_score +
            self.w_time * time_efficiency +
            self.w_diversity * diversity_score +
            self.w_difficulty * smoothness
        )
        
        return {
            'overall_quality': overall,
            'mastery_score': mastery_score,
            'time_efficiency': time_efficiency,
            'diversity_score': diversity_score,
            'difficulty_smoothness': smoothness
        }


class AdaptivePathOptimizer(PathOptimizer):
    """
    Adaptive path optimizer that adjusts in real-time based on learner performance
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.performance_history: Dict[str, List[Tuple[float, bool]]] = {}
        
    def update_performance(self, 
                          user_id: str, 
                          concept_id: str, 
                          mastery_gain: float,
                          completed: bool):
        """Track learner performance for adaptation"""
        if user_id not in self.performance_history:
            self.performance_history[user_id] = []
            
        self.performance_history[user_id].append((mastery_gain, completed))
        
    def adapt_path(self,
                  current_path: LearningPath,
                  current_step_index: int,
                  recent_performance: List[Tuple[float, bool]]) -> LearningPath:
        """
        Adapt remaining path based on recent performance
        
        Args:
            current_path: Current learning path
            current_step_index: Index of current step
            recent_performance: List of (mastery_gain, completed) tuples
            
        Returns:
            Adapted path
        """
        if current_step_index >= len(current_path.steps) - 1:
            return current_path
            
        # Analyze recent performance
        avg_mastery_gain = np.mean([p[0] for p in recent_performance]) if recent_performance else 0.5
        completion_rate = np.mean([p[1] for p in recent_performance]) if recent_performance else 0.5
        
        # Adjust difficulty based on performance
        if avg_mastery_gain < 0.3 or completion_rate < 0.5:
            # Struggling: reduce difficulty, add support resources
            return self._simplify_path(current_path, current_step_index)
        elif avg_mastery_gain > 0.7 and completion_rate > 0.8:
            # Excelling: increase difficulty, skip redundant steps
            return self._accelerate_path(current_path, current_step_index)
        else:
            # On track: continue as planned
            return current_path
            
    def _simplify_path(self, path: LearningPath, from_index: int) -> LearningPath:
        """Simplify path for struggling learners"""
        # Reduce difficulty of remaining steps
        for i in range(from_index + 1, len(path.steps)):
            step = path.steps[i]
            # Prefer easier, more engaging resources
            step.resources = [r for r in step.resources if r.difficulty < 0.6]
            
        return path
        
    def _accelerate_path(self, path: LearningPath, from_index: int) -> LearningPath:
        """Accelerate path for high-performing learners"""
        # Remove redundant steps, increase difficulty
        accelerated_steps = path.steps[:from_index + 1]
        
        for i in range(from_index + 1, len(path.steps)):
            step = path.steps[i]
            # Skip if learner likely already knows this
            if step.mastery_gain_potential < 0.3:
                continue
            # Prefer challenging resources
            step.resources = [r for r in step.resources if r.difficulty > 0.5]
            accelerated_steps.append(step)
            
        path.steps = accelerated_steps
        return path


if __name__ == "__main__":
    from knowledge_graph import create_sample_cs_knowledge_graph
    from bandit_optimizer import Resource
    
    print("=== Path Optimizer Test ===\n")
    
    # Create knowledge graph
    kg = create_sample_cs_knowledge_graph()
    kg.update_mastery("variables", 0.8)
    kg.update_mastery("operators", 0.7)
    
    # Create optimizer
    optimizer = PathOptimizer(kg)
    
    # Mock resources
    resources = {
        "conditionals": [
            Resource("cond1", "If Statements Video", "video", "conditionals", 0.3, 
                    engagement_score=0.8, avg_time_minutes=15),
            Resource("cond2", "Conditionals Quiz", "quiz", "conditionals", 0.4,
                    engagement_score=0.7, avg_time_minutes=10),
        ],
        "loops": [
            Resource("loop1", "Loops Tutorial", "video", "loops", 0.4,
                    engagement_score=0.8, avg_time_minutes=20),
        ],
        "functions": [
            Resource("func1", "Functions Guide", "article", "functions", 0.5,
                    engagement_score=0.7, avg_time_minutes=25),
        ]
    }
    
    # Generate path
    path = optimizer.generate_path(
        user_id="test_user",
        target_concepts=["functions"],
        available_resources=resources,
        current_mastery={"variables": 0.8, "operators": 0.7},
        max_time=60.0
    )
    
    print(f"Generated path with {len(path.steps)} steps:")
    print(f"Total time: {path.total_time:.1f} minutes")
    print(f"Estimated mastery gain: {path.estimated_mastery_gain:.2f}")
    print(f"Diversity score: {path.diversity_score:.2f}\n")
    
    for i, step in enumerate(path.steps, 1):
        print(f"{i}. {step.concept_name} (difficulty: {step.difficulty:.2f})")
        print(f"   Resources: {[r.title for r in step.resources]}")
        print(f"   Time: {step.estimated_time:.1f} min\n")
        
    # Quality metrics
    quality = optimizer.calculate_path_quality(path)
    print("Path Quality Metrics:")
    for metric, value in quality.items():
        print(f"  {metric}: {value:.3f}")

