"""
Knowledge Graph Construction & Traversal
Implements DAG-based concept representation with weighted edges
"""
import networkx as nx
import numpy as np
from typing import Dict, List, Set, Tuple, Optional
from pydantic import BaseModel
from dataclasses import dataclass
import json


@dataclass
class ConceptNode:
    """Represents a concept in the knowledge graph"""
    id: str
    name: str
    difficulty: float  # 0.0-1.0
    mastery: float = 0.0  # Current learner mastery 0.0-1.0
    importance: float = 1.0
    category: str = "general"
    

class Edge(BaseModel):
    """Weighted edge between concepts"""
    source: str
    target: str
    prerequisite_strength: float = 0.5  # How strongly source is prerequisite for target
    semantic_similarity: float = 0.0  # Semantic similarity between concepts
    temporal_correlation: float = 0.0  # Historical co-learning correlation
    

class KnowledgeGraph:
    """
    Directed Acyclic Graph of concepts with weighted edges.
    Supports traversal, dependency analysis, and optimal path finding.
    """
    
    def __init__(self, alpha: float = 0.5, beta: float = 0.3, gamma: float = 0.2):
        """
        Args:
            alpha: Weight for prerequisite strength
            beta: Weight for semantic similarity  
            gamma: Weight for temporal correlation
        """
        self.graph = nx.DiGraph()
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        self.concept_map: Dict[str, ConceptNode] = {}
        
    def add_concept(self, concept: ConceptNode):
        """Add a concept node to the graph"""
        self.concept_map[concept.id] = concept
        self.graph.add_node(
            concept.id,
            name=concept.name,
            difficulty=concept.difficulty,
            mastery=concept.mastery,
            importance=concept.importance,
            category=concept.category
        )
        
    def add_edge(self, edge: Edge):
        """Add a weighted edge between concepts"""
        if not self.graph.has_node(edge.source) or not self.graph.has_node(edge.target):
            raise ValueError(f"Nodes {edge.source} or {edge.target} not in graph")
            
        # Composite weight calculation
        weight = (
            self.alpha * edge.prerequisite_strength +
            self.beta * edge.semantic_similarity +
            self.gamma * edge.temporal_correlation
        )
        
        self.graph.add_edge(
            edge.source,
            edge.target,
            weight=weight,
            prerequisite_strength=edge.prerequisite_strength,
            semantic_similarity=edge.semantic_similarity,
            temporal_correlation=edge.temporal_correlation
        )
        
    def update_mastery(self, concept_id: str, mastery: float):
        """Update mastery level for a concept"""
        if concept_id in self.concept_map:
            self.concept_map[concept_id].mastery = mastery
            self.graph.nodes[concept_id]['mastery'] = mastery
            
    def get_prerequisites(self, concept_id: str, threshold: float = 0.3) -> List[str]:
        """Get all prerequisites for a concept (edges above threshold weight)"""
        if not self.graph.has_node(concept_id):
            return []
            
        predecessors = []
        for pred in self.graph.predecessors(concept_id):
            edge_data = self.graph.get_edge_data(pred, concept_id)
            if edge_data and edge_data.get('weight', 0) >= threshold:
                predecessors.append(pred)
                
        return predecessors
        
    def get_dependent_concepts(self, concept_id: str) -> List[str]:
        """Get concepts that depend on this concept"""
        if not self.graph.has_node(concept_id):
            return []
        return list(self.graph.successors(concept_id))
        
    def get_ready_concepts(self, mastery_threshold: float = 0.7) -> List[str]:
        """
        Find concepts ready for learning:
        - Prerequisites are mastered above threshold
        - Concept itself is below mastery threshold
        """
        ready = []
        
        for node_id in self.graph.nodes():
            node_mastery = self.graph.nodes[node_id].get('mastery', 0.0)
            
            # Already mastered, skip
            if node_mastery >= mastery_threshold:
                continue
                
            # Check if all prerequisites are met
            prerequisites = self.get_prerequisites(node_id)
            if not prerequisites:
                # No prerequisites, always ready
                ready.append(node_id)
                continue
                
            prereqs_met = all(
                self.graph.nodes[prereq].get('mastery', 0.0) >= mastery_threshold
                for prereq in prerequisites
            )
            
            if prereqs_met:
                ready.append(node_id)
                
        return ready
        
    def get_gap_concepts(self, mastery_threshold: float = 0.7) -> List[Tuple[str, float, int]]:
        """
        Identify knowledge gaps prioritized by:
        1. Number of unmet prerequisites
        2. Mastery gap size
        3. Concept importance
        
        Returns:
            List of (concept_id, mastery, unmet_prereqs_count) tuples
        """
        gaps = []
        
        for node_id in self.graph.nodes():
            node_mastery = self.graph.nodes[node_id].get('mastery', 0.0)
            
            if node_mastery >= mastery_threshold:
                continue
                
            # Count unmet prerequisites
            prerequisites = self.get_prerequisites(node_id)
            unmet = sum(
                1 for prereq in prerequisites
                if self.graph.nodes[prereq].get('mastery', 0.0) < mastery_threshold
            )
            
            gaps.append((node_id, node_mastery, unmet))
            
        # Sort by: unmet prereqs (desc), then mastery (asc), then importance (desc)
        gaps.sort(key=lambda x: (
            -x[2],  # More unmet prereqs = higher priority
            x[1],   # Lower mastery = higher priority
            -self.graph.nodes[x[0]].get('importance', 1.0)
        ))
        
        return gaps
        
    def get_learning_path_dfs(self, start_concept: str, 
                               max_depth: int = 10) -> List[str]:
        """
        Generate learning path using depth-first search
        considering dependencies
        """
        if not self.graph.has_node(start_concept):
            return []
            
        visited = set()
        path = []
        
        def dfs(node_id: str, depth: int):
            if depth > max_depth or node_id in visited:
                return
                
            visited.add(node_id)
            
            # Visit prerequisites first
            for prereq in self.get_prerequisites(node_id):
                if prereq not in visited:
                    dfs(prereq, depth + 1)
                    
            path.append(node_id)
            
        dfs(start_concept, 0)
        return path
        
    def get_optimal_learning_sequence(self, 
                                       target_concepts: List[str],
                                       mastery_threshold: float = 0.7) -> List[str]:
        """
        Generate optimal learning sequence using topological sort
        considering current mastery levels
        """
        # Create subgraph with target concepts and their prerequisites
        subgraph_nodes = set(target_concepts)
        for concept in target_concepts:
            # Add all prerequisites recursively
            prereqs = nx.ancestors(self.graph, concept)
            subgraph_nodes.update(prereqs)
            
        subgraph = self.graph.subgraph(subgraph_nodes).copy()
        
        # Filter out already mastered concepts
        to_remove = [
            node for node in subgraph.nodes()
            if subgraph.nodes[node].get('mastery', 0.0) >= mastery_threshold
        ]
        subgraph.remove_nodes_from(to_remove)
        
        # Topological sort for optimal ordering
        try:
            sequence = list(nx.topological_sort(subgraph))
            return sequence
        except nx.NetworkXError:
            # Graph has cycles, return best-effort ordering
            return list(subgraph.nodes())
            
    def compute_learning_gain_potential(self, concept_id: str) -> float:
        """
        Estimate potential learning gain from mastering this concept
        considering downstream dependent concepts
        """
        if not self.graph.has_node(concept_id):
            return 0.0
            
        # Get all concepts that depend on this one
        descendants = nx.descendants(self.graph, concept_id)
        
        # Weight by importance and number of descendants
        base_gain = 1.0 - self.graph.nodes[concept_id].get('mastery', 0.0)
        importance = self.graph.nodes[concept_id].get('importance', 1.0)
        descendant_factor = 1.0 + 0.1 * len(descendants)
        
        return base_gain * importance * descendant_factor
        
    def get_concept_centrality(self, concept_id: str) -> float:
        """
        Compute centrality of concept in knowledge graph
        High centrality = foundational concept
        """
        if not self.graph.has_node(concept_id):
            return 0.0
            
        # Use betweenness centrality
        centrality = nx.betweenness_centrality(self.graph)
        return centrality.get(concept_id, 0.0)
        
    def export_graph(self) -> Dict:
        """Export graph to JSON-serializable format"""
        return {
            'nodes': [
                {
                    'id': node,
                    **self.graph.nodes[node]
                }
                for node in self.graph.nodes()
            ],
            'edges': [
                {
                    'source': u,
                    'target': v,
                    **self.graph.edges[u, v]
                }
                for u, v in self.graph.edges()
            ],
            'weights': {
                'alpha': self.alpha,
                'beta': self.beta,
                'gamma': self.gamma
            }
        }
        
    @classmethod
    def from_json(cls, data: Dict) -> 'KnowledgeGraph':
        """Load graph from JSON format"""
        weights = data.get('weights', {})
        graph = cls(
            alpha=weights.get('alpha', 0.5),
            beta=weights.get('beta', 0.3),
            gamma=weights.get('gamma', 0.2)
        )
        
        # Add nodes
        for node_data in data.get('nodes', []):
            concept = ConceptNode(
                id=node_data['id'],
                name=node_data.get('name', node_data['id']),
                difficulty=node_data.get('difficulty', 0.5),
                mastery=node_data.get('mastery', 0.0),
                importance=node_data.get('importance', 1.0),
                category=node_data.get('category', 'general')
            )
            graph.add_concept(concept)
            
        # Add edges
        for edge_data in data.get('edges', []):
            edge = Edge(
                source=edge_data['source'],
                target=edge_data['target'],
                prerequisite_strength=edge_data.get('prerequisite_strength', 0.5),
                semantic_similarity=edge_data.get('semantic_similarity', 0.0),
                temporal_correlation=edge_data.get('temporal_correlation', 0.0)
            )
            graph.add_edge(edge)
            
        return graph
        
    def visualize_subgraph(self, concept_ids: List[str]) -> Dict:
        """Generate visualization data for frontend"""
        subgraph = self.graph.subgraph(concept_ids)
        
        return {
            'nodes': [
                {
                    'id': node,
                    'label': self.graph.nodes[node].get('name', node),
                    'mastery': self.graph.nodes[node].get('mastery', 0.0),
                    'difficulty': self.graph.nodes[node].get('difficulty', 0.5),
                    'category': self.graph.nodes[node].get('category', 'general')
                }
                for node in subgraph.nodes()
            ],
            'links': [
                {
                    'source': u,
                    'target': v,
                    'weight': self.graph.edges[u, v].get('weight', 0.5)
                }
                for u, v in subgraph.edges()
            ]
        }


def create_sample_cs_knowledge_graph() -> KnowledgeGraph:
    """Create sample computer science knowledge graph"""
    kg = KnowledgeGraph()
    
    # Add foundational concepts
    concepts = [
        ConceptNode("variables", "Variables & Data Types", 0.2, importance=2.0),
        ConceptNode("operators", "Operators", 0.2, importance=1.5),
        ConceptNode("conditionals", "If-Else Statements", 0.3, importance=1.8),
        ConceptNode("loops", "Loops (For/While)", 0.4, importance=2.0),
        ConceptNode("functions", "Functions", 0.5, importance=2.5),
        ConceptNode("arrays", "Arrays & Lists", 0.5, importance=2.0),
        ConceptNode("strings", "String Manipulation", 0.4, importance=1.5),
        ConceptNode("recursion", "Recursion", 0.7, importance=2.0),
        ConceptNode("sorting", "Sorting Algorithms", 0.6, importance=1.5),
        ConceptNode("searching", "Searching Algorithms", 0.6, importance=1.5),
        ConceptNode("oop", "Object-Oriented Programming", 0.8, importance=3.0),
        ConceptNode("data_structures", "Advanced Data Structures", 0.9, importance=2.5),
    ]
    
    for concept in concepts:
        kg.add_concept(concept)
        
    # Add edges (prerequisites)
    edges = [
        Edge("variables", "operators", 0.9, 0.8, 0.9),
        Edge("variables", "conditionals", 0.8, 0.6, 0.8),
        Edge("operators", "conditionals", 0.7, 0.7, 0.7),
        Edge("conditionals", "loops", 0.9, 0.8, 0.9),
        Edge("variables", "functions", 0.7, 0.5, 0.6),
        Edge("loops", "functions", 0.6, 0.6, 0.7),
        Edge("variables", "arrays", 0.8, 0.6, 0.8),
        Edge("loops", "arrays", 0.7, 0.7, 0.8),
        Edge("variables", "strings", 0.6, 0.5, 0.6),
        Edge("functions", "recursion", 0.9, 0.7, 0.8),
        Edge("arrays", "sorting", 0.8, 0.7, 0.8),
        Edge("arrays", "searching", 0.8, 0.7, 0.8),
        Edge("loops", "sorting", 0.6, 0.5, 0.6),
        Edge("functions", "oop", 0.8, 0.6, 0.7),
        Edge("arrays", "data_structures", 0.9, 0.8, 0.9),
        Edge("oop", "data_structures", 0.7, 0.7, 0.8),
        Edge("recursion", "data_structures", 0.6, 0.6, 0.7),
    ]
    
    for edge in edges:
        kg.add_edge(edge)
        
    return kg


if __name__ == "__main__":
    # Test the knowledge graph
    kg = create_sample_cs_knowledge_graph()
    
    print("=== Knowledge Graph Test ===\n")
    
    # Simulate learner with some mastery
    kg.update_mastery("variables", 0.9)
    kg.update_mastery("operators", 0.85)
    kg.update_mastery("conditionals", 0.75)
    
    print("Ready concepts:", kg.get_ready_concepts())
    print("\nKnowledge gaps:", kg.get_gap_concepts())
    print("\nOptimal learning sequence to OOP:", 
          kg.get_optimal_learning_sequence(["oop"]))
    print("\nLearning path from loops:", kg.get_learning_path_dfs("loops"))

