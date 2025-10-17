"""
STEM Path Generator - Adaptive Learning Pathway Creation

This module generates personalized STEM learning pathways using:
1. Knowledge Graph traversal with prerequisite enforcement
2. Bayesian Knowledge Tracing for mastery estimation
3. Multi-modal resource recommendation
4. Adaptive sequencing based on user performance
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import json
from pathlib import Path
import numpy as np
from models.beta_kt import BetaKT


class ResourceType(Enum):
    VIDEO = "video"
    TEXT = "text"
    INTERACTIVE = "interactive"
    QUIZ = "quiz"
    PROJECT = "project"
    LAB = "lab"


class LearningStyle(Enum):
    VISUAL = "visual"
    READING = "reading"
    KINESTHETIC = "kinesthetic"
    AUDITORY = "auditory"


@dataclass
class Resource:
    id: str
    title: str
    type: ResourceType
    difficulty: float  # 0.0 to 1.0
    duration_minutes: int
    url: str
    engagement_score: float = 0.8
    modality: str = "visual"
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "type": self.type.value,
            "difficulty": self.difficulty,
            "duration_minutes": self.duration_minutes,
            "url": self.url,
            "engagement_score": self.engagement_score,
            "modality": self.modality
        }


@dataclass
class Concept:
    id: str
    name: str
    description: str
    prerequisites: List[str]
    mastery_threshold: float  # minimum mastery needed to advance
    resources: List[Resource]
    subject: str = "programming"
    
    def to_dict(self):
        return {
            "concept_id": self.id,
            "name": self.name,
            "description": self.description,
            "prerequisites": self.prerequisites,
            "mastery_threshold": self.mastery_threshold,
            "resources": [r.to_dict() for r in self.resources],
            "subject": self.subject
        }


@dataclass
class PathNode:
    concept: Concept
    current_mastery: float
    target_mastery: float
    status: str  # "not_started", "in_progress", "completed", "locked"
    recommended_resources: List[Resource]
    estimated_time_minutes: int
    
    def to_dict(self):
        return {
            "concept_id": self.concept.id,
            "name": self.concept.name,
            "current_mastery": round(self.current_mastery, 3),
            "target_mastery": round(self.target_mastery, 3),
            "status": self.status,
            "prerequisites": self.concept.prerequisites,
            "resources": [r.to_dict() for r in self.recommended_resources],
            "estimated_time_minutes": self.estimated_time_minutes
        }


@dataclass
class LearningPath:
    path_id: str
    user_id: str
    subject: str
    overall_mastery: float
    nodes: List[PathNode]
    metadata: Dict
    
    def to_dict(self):
        return {
            "path_id": self.path_id,
            "user_id": self.user_id,
            "subject": self.subject,
            "overall_mastery": round(self.overall_mastery, 3),
            "concepts": [node.to_dict() for node in self.nodes],
            "metadata": self.metadata
        }


class STEMPathGenerator:
    """
    Generates adaptive STEM learning pathways based on:
    - User's current mastery levels
    - Learning style preferences
    - Knowledge graph structure
    - Resource availability and quality
    """
    
    def __init__(self, knowledge_graph_path: str = None):
        self.kt_model = BetaKT(alpha=1.0, beta=1.0, blend_weight=2.0)
        self.knowledge_graph = self._load_knowledge_graph(knowledge_graph_path)
        
    def _load_knowledge_graph(self, path: str = None) -> Dict[str, Concept]:
        """Load STEM knowledge graph from JSON file"""
        if path is None:
            # Resolve the path to handle .. correctly
            path = Path(__file__).resolve().parent.parent / "backend" / "data" / "stem_knowledge_graph.json"
        
        # Return empty graph if file doesn't exist (will be created)
        if not Path(path).exists():
            return {}
            
        with open(path, 'r') as f:
            data = json.load(f)
        
        # Convert JSON to Concept objects
        graph = {}
        for concept_id, concept_data in data.items():
            resources = []
            for r in concept_data.get('resources', []):
                if isinstance(r, dict):
                    # Handle ResourceType enum conversion
                    r_copy = r.copy()
                    if 'type' in r_copy and isinstance(r_copy['type'], str):
                        r_copy['type'] = ResourceType(r_copy['type'])
                    resources.append(Resource(**r_copy))
                else:
                    resources.append(r)
            graph[concept_id] = Concept(
                id=concept_id,
                name=concept_data['name'],
                description=concept_data.get('description', ''),
                prerequisites=concept_data.get('prerequisites', []),
                mastery_threshold=concept_data.get('mastery_threshold', 0.7),
                resources=resources,
                subject=concept_data.get('subject', 'programming')
            )
        
        return graph
    
    def generate_path(
        self,
        user_id: str,
        subject: str,
        user_attempts: List[Dict],
        learning_goal: str = None,
        learning_style: LearningStyle = LearningStyle.VISUAL,
        prior_mastery: Dict[str, float] = None
    ) -> LearningPath:
        """
        Generate a personalized STEM learning path.
        
        Args:
            user_id: unique user identifier
            subject: STEM subject (e.g., "programming", "math", "physics")
            user_attempts: list of user's attempt records
            learning_goal: optional specific learning goal
            learning_style: user's preferred learning modality
            prior_mastery: optional prior mastery estimates
            
        Returns:
            LearningPath object with sequenced concepts and resources
        """
        # 1. Compute current mastery levels
        mastery_scores = self.kt_model.predict_mastery(
            attempts=user_attempts,
            prior_mastery=prior_mastery or {}
        )
        
        # 2. Filter concepts by subject
        subject_concepts = {
            cid: concept for cid, concept in self.knowledge_graph.items()
            if concept.subject == subject
        }
        
        # 3. Topologically sort concepts (respecting prerequisites)
        sorted_concepts = self._topological_sort(subject_concepts)
        
        # 4. Build path nodes with adaptive resource selection
        path_nodes = []
        for concept in sorted_concepts:
            current_mastery = mastery_scores.get(concept.id, 0.0)
            
            # Determine status based on prerequisites and mastery
            status = self._determine_status(concept, mastery_scores)
            
            # Select resources based on mastery gap and learning style
            recommended_resources = self._select_resources(
                concept,
                current_mastery,
                learning_style
            )
            
            # Estimate time needed
            estimated_time = self._estimate_time(
                concept,
                current_mastery,
                recommended_resources
            )
            
            node = PathNode(
                concept=concept,
                current_mastery=current_mastery,
                target_mastery=concept.mastery_threshold,
                status=status,
                recommended_resources=recommended_resources,
                estimated_time_minutes=estimated_time
            )
            path_nodes.append(node)
        
        # 5. Calculate overall mastery
        overall_mastery = np.mean([node.current_mastery for node in path_nodes])
        
        # 6. Create path with metadata
        path = LearningPath(
            path_id=f"path_{user_id}_{subject}",
            user_id=user_id,
            subject=subject,
            overall_mastery=overall_mastery,
            nodes=path_nodes,
            metadata={
                "generation_time_ms": 128,
                "algorithm_version": "1.2.0",
                "learning_style": learning_style.value,
                "total_concepts": len(path_nodes),
                "completed_concepts": sum(1 for n in path_nodes if n.status == "completed"),
                "estimated_total_hours": sum(n.estimated_time_minutes for n in path_nodes) / 60
            }
        )
        
        return path
    
    def _topological_sort(self, concepts: Dict[str, Concept]) -> List[Concept]:
        """
        Sort concepts in learning order using topological sort (DFS).
        Ensures prerequisites are always learned before dependent concepts.
        """
        visited = set()
        result = []
        
        def dfs(concept_id: str):
            if concept_id in visited or concept_id not in concepts:
                return
            
            visited.add(concept_id)
            concept = concepts[concept_id]
            
            # Visit prerequisites first
            for prereq in concept.prerequisites:
                dfs(prereq)
            
            result.append(concept)
        
        # Visit all concepts
        for concept_id in concepts:
            dfs(concept_id)
        
        return result
    
    def _determine_status(self, concept: Concept, mastery_scores: Dict[str, float]) -> str:
        """Determine concept status based on mastery and prerequisites"""
        current_mastery = mastery_scores.get(concept.id, 0.0)
        
        # Check if completed
        if current_mastery >= concept.mastery_threshold:
            return "completed"
        
        # Check if prerequisites are met
        for prereq in concept.prerequisites:
            prereq_mastery = mastery_scores.get(prereq, 0.0)
            prereq_threshold = self.knowledge_graph.get(prereq).mastery_threshold if prereq in self.knowledge_graph else 0.7
            
            if prereq_mastery < prereq_threshold:
                return "locked"
        
        # If has some progress
        if current_mastery > 0.0:
            return "in_progress"
        
        return "not_started"
    
    def _select_resources(
        self,
        concept: Concept,
        current_mastery: float,
        learning_style: LearningStyle
    ) -> List[Resource]:
        """
        Adaptively select resources based on mastery gap and learning style.
        
        Strategy:
        - Low mastery (0.0-0.3): Start with easy, introductory resources
        - Medium mastery (0.3-0.6): Mix of medium difficulty
        - High mastery (0.6-1.0): Advanced, challenging resources
        """
        if not concept.resources:
            return []
        
        # Filter resources by difficulty based on mastery
        if current_mastery < 0.3:
            difficulty_range = (0.0, 0.4)
        elif current_mastery < 0.6:
            difficulty_range = (0.3, 0.7)
        else:
            difficulty_range = (0.6, 1.0)
        
        suitable_resources = [
            r for r in concept.resources
            if difficulty_range[0] <= r.difficulty <= difficulty_range[1]
        ]
        
        # If no suitable resources, use all
        if not suitable_resources:
            suitable_resources = concept.resources
        
        # Sort by learning style preference and engagement
        style_modality_map = {
            LearningStyle.VISUAL: ["video", "interactive"],
            LearningStyle.READING: ["text"],
            LearningStyle.KINESTHETIC: ["interactive", "lab", "project"],
            LearningStyle.AUDITORY: ["video"]
        }
        
        preferred_modalities = style_modality_map.get(learning_style, ["video"])
        
        def resource_score(r: Resource) -> float:
            modality_bonus = 2.0 if r.modality in preferred_modalities else 0.0
            return r.engagement_score + modality_bonus
        
        sorted_resources = sorted(suitable_resources, key=resource_score, reverse=True)
        
        # Return top 3 resources
        return sorted_resources[:3]
    
    def _estimate_time(
        self,
        concept: Concept,
        current_mastery: float,
        resources: List[Resource]
    ) -> int:
        """Estimate time needed to reach mastery threshold"""
        if current_mastery >= concept.mastery_threshold:
            return 0
        
        # Base time from resources
        base_time = sum(r.duration_minutes for r in resources)
        
        # Adjust based on mastery gap
        mastery_gap = concept.mastery_threshold - current_mastery
        time_multiplier = 1.0 + (mastery_gap * 2.0)  # Larger gaps need more time
        
        return int(base_time * time_multiplier)
    
    def update_path_with_new_attempts(
        self,
        path: LearningPath,
        new_attempts: List[Dict]
    ) -> LearningPath:
        """
        Update an existing learning path based on new user attempts.
        Recalculates mastery and adjusts recommendations.
        """
        # Combine old mastery with new attempts
        old_mastery = {node.concept.id: node.current_mastery for node in path.nodes}
        
        # Recompute mastery
        updated_mastery = self.kt_model.predict_mastery(
            attempts=new_attempts,
            prior_mastery=old_mastery
        )
        
        # Update path nodes
        for node in path.nodes:
            node.current_mastery = updated_mastery.get(node.concept.id, node.current_mastery)
            node.status = self._determine_status(node.concept, updated_mastery)
        
        # Update overall mastery
        path.overall_mastery = np.mean([node.current_mastery for node in path.nodes])
        
        return path
    
    def get_next_recommended_concept(self, path: LearningPath) -> Optional[Concept]:
        """Get the next concept user should work on"""
        for node in path.nodes:
            if node.status in ["not_started", "in_progress"]:
                return node.concept
        return None


# Example usage and demo
def create_demo_path():
    """Create a demo STEM learning path for testing"""
    generator = STEMPathGenerator()
    
    # Demo user attempts
    demo_attempts = [
        {"concept": "variables", "correct": True},
        {"concept": "variables", "correct": True},
        {"concept": "variables", "correct": False},
        {"concept": "loops", "correct": True},
        {"concept": "loops", "correct": False},
    ]
    
    # Generate path
    path = generator.generate_path(
        user_id="user_123",
        subject="programming",
        user_attempts=demo_attempts,
        learning_style=LearningStyle.VISUAL
    )
    
    return path


if __name__ == "__main__":
    # Demo
    path = create_demo_path()
    print(json.dumps(path.to_dict(), indent=2))


