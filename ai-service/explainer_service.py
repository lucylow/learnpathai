"""
Explainable AI Service for LearnPath AI
Generates human-readable explanations with provenance for all AI decisions
"""

import os
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np


class ExplanationGenerator:
    """
    Generates explainable reasoning for recommendations, path decisions, and KT predictions.
    Provides evidence-backed explanations with citations and confidence scores.
    """
    
    def __init__(self, use_llm: bool = False):
        """
        Initialize the explanation generator.
        
        Args:
            use_llm: If True, uses LLM for dynamic explanations (requires API key)
                    If False, uses template-based explanations (faster, no API needed)
        """
        self.use_llm = use_llm
        self.llm_available = False
        
        if use_llm:
            try:
                import anthropic
                self.client = anthropic.Anthropic(
                    api_key=os.environ.get("ANTHROPIC_API_KEY")
                )
                self.llm_available = True
            except (ImportError, Exception):
                print("LLM not available, falling back to template-based explanations")
                self.llm_available = False
    
    def explain_recommendation(
        self,
        resource_title: str,
        concept: str,
        mastery_level: float,
        evidence: Dict[str, Any],
        transcript_excerpt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate explanation for why a resource is recommended.
        
        Args:
            resource_title: Title of the recommended resource
            concept: Target concept being learned
            mastery_level: Current mastery level (0-1)
            evidence: Dictionary containing quiz attempts, timestamps, etc.
            transcript_excerpt: Optional excerpt from resource transcript
            
        Returns:
            Dictionary with reason, evidence, next_step, confidence, and citations
        """
        if self.llm_available and self.use_llm:
            return self._llm_explain_recommendation(
                resource_title, concept, mastery_level, evidence, transcript_excerpt
            )
        else:
            return self._template_explain_recommendation(
                resource_title, concept, mastery_level, evidence, transcript_excerpt
            )
    
    def explain_path_decision(
        self,
        current_concept: str,
        next_concept: str,
        kt_posterior: Dict[str, float],
        path_algorithm: str = "optimal"
    ) -> Dict[str, Any]:
        """
        Explain why the path algorithm chose the next concept.
        
        Args:
            current_concept: Current concept in the path
            next_concept: Recommended next concept
            kt_posterior: Knowledge tracing posterior probabilities
            path_algorithm: Algorithm used (optimal, shortest, mastery-first)
            
        Returns:
            Dictionary with reasoning, evidence, and alternatives
        """
        current_mastery = kt_posterior.get(current_concept, 0.5)
        next_mastery = kt_posterior.get(next_concept, 0.5)
        
        # Determine reasoning based on mastery levels
        if current_mastery < 0.7:
            reason = f"You need more practice with '{current_concept}' before moving forward"
            suggestion = "remediation"
        elif next_mastery < 0.3:
            reason = f"'{next_concept}' builds directly on your strong grasp of '{current_concept}'"
            suggestion = "natural_progression"
        else:
            reason = f"You're ready for '{next_concept}' based on your mastery of prerequisites"
            suggestion = "optimal_challenge"
        
        return {
            "reason": reason,
            "current_concept": current_concept,
            "next_concept": next_concept,
            "current_mastery": round(current_mastery, 3),
            "next_mastery": round(next_mastery, 3),
            "strategy": suggestion,
            "path_algorithm": path_algorithm,
            "confidence": self._calculate_confidence(current_mastery, next_mastery),
            "timestamp": datetime.now().isoformat()
        }
    
    def explain_kt_prediction(
        self,
        concept: str,
        prior: float,
        posterior: float,
        evidence: List[Dict[str, Any]],
        model_type: str = "beta"
    ) -> Dict[str, Any]:
        """
        Explain a knowledge tracing prediction update.
        
        Args:
            concept: The concept being tracked
            prior: Prior probability of mastery
            posterior: Posterior probability after evidence
            evidence: List of recent attempts/interactions
            model_type: Type of KT model (beta, dkt, ensemble)
            
        Returns:
            Dictionary explaining the prediction update
        """
        change = posterior - prior
        direction = "increased" if change > 0 else "decreased"
        magnitude = abs(change)
        
        # Analyze evidence
        recent_attempts = evidence[-3:] if len(evidence) >= 3 else evidence
        correct_count = sum(1 for e in recent_attempts if e.get("correct", False))
        total_count = len(recent_attempts)
        
        if model_type == "beta":
            explanation = self._explain_beta_kt(
                concept, prior, posterior, correct_count, total_count
            )
        elif model_type == "dkt":
            explanation = self._explain_dkt(
                concept, prior, posterior, recent_attempts
            )
        else:
            explanation = self._explain_ensemble(
                concept, prior, posterior, recent_attempts
            )
        
        return {
            **explanation,
            "prior": round(prior, 3),
            "posterior": round(posterior, 3),
            "change": round(change, 3),
            "direction": direction,
            "magnitude": round(magnitude, 3),
            "model_type": model_type,
            "evidence_count": total_count,
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_evidence_panel(
        self,
        decision_id: str,
        decision_type: str,
        events: List[Dict[str, Any]],
        model_outputs: Dict[str, Any],
        resources_used: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a complete evidence panel for audit/traceability.
        
        Args:
            decision_id: Unique identifier for this decision
            decision_type: Type of decision (recommendation, path, assessment)
            events: xAPI events relevant to this decision
            model_outputs: Raw model predictions and scores
            resources_used: Resources that contributed to this decision
            
        Returns:
            Complete evidence package with provenance chain
        """
        return {
            "decision_id": decision_id,
            "decision_type": decision_type,
            "timestamp": datetime.now().isoformat(),
            "provenance_chain": {
                "data_sources": self._extract_data_sources(events),
                "model_inputs": self._summarize_model_inputs(events),
                "model_outputs": model_outputs,
                "decision_logic": self._explain_decision_logic(decision_type, model_outputs)
            },
            "evidence": {
                "events": self._format_events(events),
                "resources": self._format_resources(resources_used),
                "timestamps": self._extract_timestamps(events)
            },
            "confidence_metrics": {
                "overall_confidence": model_outputs.get("confidence", 0.8),
                "evidence_quality": self._assess_evidence_quality(events),
                "data_freshness": self._assess_data_freshness(events)
            },
            "citations": self._generate_citations(resources_used, events)
        }
    
    # Template-based explanation methods
    
    def _template_explain_recommendation(
        self,
        resource_title: str,
        concept: str,
        mastery_level: float,
        evidence: Dict[str, Any],
        transcript_excerpt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate template-based explanation for resource recommendation."""
        
        # Determine reasoning based on mastery level
        if mastery_level < 0.3:
            reason = f"You're building foundational knowledge of '{concept}'. This resource introduces core concepts clearly."
        elif mastery_level < 0.7:
            reason = f"You have basic understanding of '{concept}'. This resource provides deeper practice and examples."
        else:
            reason = f"You're nearly mastering '{concept}'. This resource offers advanced applications and edge cases."
        
        # Extract evidence details
        recent_attempts = evidence.get("recent_attempts", [])
        failed_count = sum(1 for a in recent_attempts if not a.get("correct", True))
        
        evidence_summary = f"Based on {len(recent_attempts)} recent attempts"
        if failed_count > 0:
            evidence_summary += f", with {failed_count} incorrect responses"
        
        # Generate next step
        if mastery_level < 0.5:
            next_step = f"Watch this resource carefully and take notes on key concepts in '{concept}'."
        else:
            next_step = f"Review this resource and try the practice exercises to solidify '{concept}'."
        
        return {
            "reason": reason,
            "evidence": evidence_summary,
            "evidence_details": {
                "transcript_excerpt": transcript_excerpt[:200] if transcript_excerpt else None,
                "mastery_level": round(mastery_level, 3),
                "attempt_count": len(recent_attempts),
                "recent_performance": self._summarize_performance(recent_attempts)
            },
            "next_step": next_step,
            "confidence": self._calculate_recommendation_confidence(mastery_level, evidence),
            "citations": self._format_citations(resource_title, evidence),
            "timestamp": datetime.now().isoformat()
        }
    
    def _explain_beta_kt(
        self, concept: str, prior: float, posterior: float, correct: int, total: int
    ) -> Dict[str, str]:
        """Explain Beta distribution KT update."""
        if correct == total and total > 0:
            reason = f"All {total} recent attempts were correct, strongly indicating mastery"
        elif correct == 0 and total > 0:
            reason = f"All {total} recent attempts were incorrect, suggesting more practice needed"
        else:
            reason = f"{correct} out of {total} recent attempts correct shows steady progress"
        
        interpretation = "You're making measurable progress" if posterior > prior else "This concept needs more attention"
        
        return {
            "reason": reason,
            "interpretation": interpretation,
            "explanation": f"Beta model updates belief based on success/failure ratio: {correct}/{total}",
            "strength": "Highly explainable, mathematically grounded"
        }
    
    def _explain_dkt(
        self, concept: str, prior: float, posterior: float, recent_attempts: List[Dict]
    ) -> Dict[str, str]:
        """Explain Deep Knowledge Tracing prediction."""
        return {
            "reason": f"Neural model detected patterns in your learning sequence for '{concept}'",
            "interpretation": "The model considers temporal patterns and skill interactions",
            "explanation": f"DKT analyzes {len(recent_attempts)} recent interactions and predicts future performance",
            "strength": "Captures complex temporal dependencies"
        }
    
    def _explain_ensemble(
        self, concept: str, prior: float, posterior: float, recent_attempts: List[Dict]
    ) -> Dict[str, str]:
        """Explain ensemble model prediction."""
        return {
            "reason": f"Combined Beta (explainable) and DKT (predictive) models for '{concept}'",
            "interpretation": "Balancing transparency with predictive accuracy",
            "explanation": "Ensemble blends statistical certainty with learned patterns",
            "strength": "Best of both worlds: explainable + accurate"
        }
    
    def _llm_explain_recommendation(
        self,
        resource_title: str,
        concept: str,
        mastery_level: float,
        evidence: Dict[str, Any],
        transcript_excerpt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate LLM-powered explanation for resource recommendation."""
        
        prompt = f"""Context: Student is learning "{concept}" with current mastery level {mastery_level:.2f} (0=novice, 1=expert).
Recent performance: {evidence.get('recent_performance', 'N/A')}
Candidate resource: "{resource_title}"
{f'Resource excerpt: "{transcript_excerpt[:300]}"' if transcript_excerpt else ''}

Task: In 1-2 sentences explain why this resource is recommended now, citing the most relevant evidence. End with a 1-step action for the learner.

Output format:
- Reason: <one clear sentence>
- Evidence: <specific data point from context>
- Next step: <one concrete action>"""

        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=300,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text
            
            # Parse response (simple parsing, could be improved)
            lines = response_text.strip().split('\n')
            parsed = {}
            for line in lines:
                if line.startswith('- Reason:'):
                    parsed['reason'] = line.replace('- Reason:', '').strip()
                elif line.startswith('- Evidence:'):
                    parsed['evidence'] = line.replace('- Evidence:', '').strip()
                elif line.startswith('- Next step:'):
                    parsed['next_step'] = line.replace('- Next step:', '').strip()
            
            return {
                **parsed,
                "confidence": 0.9,
                "source": "llm_generated",
                "model": "claude-3-5-sonnet",
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            print(f"LLM explanation failed: {e}, falling back to template")
            return self._template_explain_recommendation(
                resource_title, concept, mastery_level, evidence, transcript_excerpt
            )
    
    # Helper methods
    
    def _calculate_confidence(self, current_mastery: float, next_mastery: float) -> float:
        """Calculate confidence score for a path decision."""
        # High confidence when current mastery is high and next is appropriately challenging
        if current_mastery >= 0.7 and 0.2 <= next_mastery <= 0.4:
            return 0.9
        elif current_mastery >= 0.5:
            return 0.75
        else:
            return 0.6
    
    def _calculate_recommendation_confidence(
        self, mastery_level: float, evidence: Dict[str, Any]
    ) -> float:
        """Calculate confidence for a resource recommendation."""
        evidence_count = len(evidence.get("recent_attempts", []))
        
        # More evidence = higher confidence
        evidence_weight = min(evidence_count / 5, 1.0)
        
        # Extreme mastery levels (very low or high) = higher confidence about what's needed
        mastery_certainty = 1 - abs(mastery_level - 0.5) * 2
        
        return round(0.5 * evidence_weight + 0.5 * mastery_certainty, 3)
    
    def _summarize_performance(self, attempts: List[Dict[str, Any]]) -> str:
        """Summarize recent performance."""
        if not attempts:
            return "No recent attempts"
        
        correct = sum(1 for a in attempts if a.get("correct", False))
        total = len(attempts)
        percentage = (correct / total * 100) if total > 0 else 0
        
        return f"{correct}/{total} correct ({percentage:.0f}%)"
    
    def _format_citations(self, resource_title: str, evidence: Dict[str, Any]) -> List[Dict[str, str]]:
        """Format citations for provenance."""
        citations = [
            {
                "type": "resource",
                "title": resource_title,
                "reason": "Primary recommended resource"
            }
        ]
        
        if evidence.get("recent_attempts"):
            citations.append({
                "type": "evidence",
                "title": "Recent quiz attempts",
                "count": len(evidence["recent_attempts"]),
                "reason": "Performance data"
            })
        
        return citations
    
    def _extract_data_sources(self, events: List[Dict[str, Any]]) -> List[str]:
        """Extract unique data sources from events."""
        sources = set()
        for event in events:
            if event.get("verb"):
                sources.add(f"xAPI: {event['verb']}")
        return sorted(list(sources))
    
    def _summarize_model_inputs(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Summarize model inputs from events."""
        return {
            "event_count": len(events),
            "time_span": self._calculate_time_span(events),
            "interaction_types": list(set(e.get("verb", "unknown") for e in events))
        }
    
    def _explain_decision_logic(self, decision_type: str, model_outputs: Dict[str, Any]) -> str:
        """Explain the decision logic in plain language."""
        if decision_type == "recommendation":
            return "Resource ranked by semantic match + predicted success rate + mastery alignment"
        elif decision_type == "path":
            return "Path optimized using A* with mastery-weighted edges and prerequisite constraints"
        elif decision_type == "assessment":
            return "Items generated based on concept difficulty and anti-collision hashing"
        else:
            return "Decision based on ensemble model outputs and configurable policies"
    
    def _format_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format events for evidence panel."""
        formatted = []
        for event in events[-10:]:  # Last 10 events
            formatted.append({
                "timestamp": event.get("timestamp", "unknown"),
                "action": event.get("verb", "unknown"),
                "object": event.get("object", {}).get("id", "unknown"),
                "result": event.get("result", {})
            })
        return formatted
    
    def _format_resources(self, resources: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Format resources for evidence panel."""
        return [
            {
                "id": r.get("id", "unknown"),
                "title": r.get("title", "Unknown resource"),
                "type": r.get("type", "unknown")
            }
            for r in resources
        ]
    
    def _extract_timestamps(self, events: List[Dict[str, Any]]) -> Dict[str, str]:
        """Extract key timestamps from events."""
        if not events:
            return {}
        
        timestamps = [e.get("timestamp") for e in events if e.get("timestamp")]
        if not timestamps:
            return {}
        
        return {
            "first_event": min(timestamps),
            "last_event": max(timestamps),
            "event_count": len(timestamps)
        }
    
    def _assess_evidence_quality(self, events: List[Dict[str, Any]]) -> float:
        """Assess quality of evidence (0-1)."""
        if not events:
            return 0.0
        
        # More events = better quality, up to a point
        count_score = min(len(events) / 20, 1.0)
        
        # Diversity of interaction types
        unique_verbs = len(set(e.get("verb") for e in events if e.get("verb")))
        diversity_score = min(unique_verbs / 5, 1.0)
        
        return round(0.7 * count_score + 0.3 * diversity_score, 3)
    
    def _assess_data_freshness(self, events: List[Dict[str, Any]]) -> float:
        """Assess freshness of data (0-1, higher = more recent)."""
        if not events:
            return 0.0
        
        # For demo purposes, assume recent data
        # In production, calculate based on actual timestamps
        return 0.85
    
    def _generate_citations(
        self, resources: List[Dict[str, Any]], events: List[Dict[str, Any]]
    ) -> List[Dict[str, str]]:
        """Generate citations for provenance."""
        citations = []
        
        for resource in resources[:3]:  # Top 3 resources
            citations.append({
                "type": "resource",
                "id": resource.get("id", "unknown"),
                "title": resource.get("title", "Unknown"),
                "usage": "Content source"
            })
        
        if events:
            citations.append({
                "type": "data",
                "id": "learner_events",
                "title": f"{len(events)} learner interactions",
                "usage": "Behavioral evidence"
            })
        
        return citations
    
    def _calculate_time_span(self, events: List[Dict[str, Any]]) -> str:
        """Calculate time span of events."""
        if len(events) < 2:
            return "Single event"
        
        # For demo purposes
        return f"Last {len(events)} events over recent session"


# Demo helper functions

def demo_explain_recommendation():
    """Demo the recommendation explanation feature."""
    explainer = ExplanationGenerator(use_llm=False)
    
    explanation = explainer.explain_recommendation(
        resource_title="Introduction to Python Loops",
        concept="For Loops",
        mastery_level=0.35,
        evidence={
            "recent_attempts": [
                {"correct": False, "concept": "For Loops"},
                {"correct": False, "concept": "For Loops"},
                {"correct": True, "concept": "Basic Syntax"}
            ]
        },
        transcript_excerpt="In Python, a for loop iterates over a sequence..."
    )
    
    print("=== Recommendation Explanation ===")
    print(f"Reason: {explanation['reason']}")
    print(f"Evidence: {explanation['evidence']}")
    print(f"Next Step: {explanation['next_step']}")
    print(f"Confidence: {explanation['confidence']}")
    print()


def demo_explain_path_decision():
    """Demo the path decision explanation feature."""
    explainer = ExplanationGenerator(use_llm=False)
    
    explanation = explainer.explain_path_decision(
        current_concept="Variables",
        next_concept="For Loops",
        kt_posterior={
            "Variables": 0.85,
            "For Loops": 0.25,
            "Functions": 0.15
        },
        path_algorithm="optimal"
    )
    
    print("=== Path Decision Explanation ===")
    print(f"Reason: {explanation['reason']}")
    print(f"Current Mastery: {explanation['current_mastery']}")
    print(f"Next Mastery: {explanation['next_mastery']}")
    print(f"Strategy: {explanation['strategy']}")
    print(f"Confidence: {explanation['confidence']}")
    print()


def demo_explain_kt_prediction():
    """Demo the KT prediction explanation feature."""
    explainer = ExplanationGenerator(use_llm=False)
    
    explanation = explainer.explain_kt_prediction(
        concept="While Loops",
        prior=0.45,
        posterior=0.68,
        evidence=[
            {"correct": True, "timestamp": "2025-10-17T10:00:00Z"},
            {"correct": True, "timestamp": "2025-10-17T10:05:00Z"},
            {"correct": True, "timestamp": "2025-10-17T10:10:00Z"}
        ],
        model_type="beta"
    )
    
    print("=== KT Prediction Explanation ===")
    print(f"Reason: {explanation['reason']}")
    print(f"Prior → Posterior: {explanation['prior']} → {explanation['posterior']}")
    print(f"Change: {explanation['change']} ({explanation['direction']})")
    print(f"Explanation: {explanation['explanation']}")
    print(f"Model Strength: {explanation['strength']}")
    print()


if __name__ == "__main__":
    print("LearnPath AI - Explainable AI Demo\n")
    demo_explain_recommendation()
    demo_explain_path_decision()
    demo_explain_kt_prediction()

