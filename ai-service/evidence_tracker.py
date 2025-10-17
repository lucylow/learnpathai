"""
Evidence Tracking Service for LearnPath AI
Captures and organizes all evidence used in AI decisions for audit and transparency
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from collections import defaultdict
import json


class EvidenceTracker:
    """
    Tracks all evidence contributing to AI decisions.
    Maintains a provenance chain for auditing and explainability.
    """
    
    def __init__(self):
        self.evidence_store: Dict[str, Dict[str, Any]] = {}
        self.decision_history: List[Dict[str, Any]] = []
        self.event_buffer: List[Dict[str, Any]] = []
    
    def record_decision(
        self,
        decision_id: str,
        decision_type: str,
        learner_id: str,
        inputs: Dict[str, Any],
        outputs: Dict[str, Any],
        model_used: str,
        confidence: float
    ) -> str:
        """
        Record a decision made by the AI system.
        
        Args:
            decision_id: Unique identifier for this decision
            decision_type: Type of decision (recommendation, path, assessment, etc.)
            learner_id: Anonymized learner identifier
            inputs: Input data used for decision
            outputs: Decision outputs
            model_used: Model/algorithm used
            confidence: Confidence score (0-1)
            
        Returns:
            Decision ID for later reference
        """
        decision_record = {
            "decision_id": decision_id,
            "decision_type": decision_type,
            "learner_id": learner_id,
            "timestamp": datetime.now().isoformat(),
            "inputs": inputs,
            "outputs": outputs,
            "model_used": model_used,
            "confidence": confidence,
            "evidence_refs": []  # Will be populated by link_evidence
        }
        
        self.evidence_store[decision_id] = decision_record
        self.decision_history.append({
            "decision_id": decision_id,
            "timestamp": decision_record["timestamp"],
            "type": decision_type
        })
        
        return decision_id
    
    def link_evidence(
        self,
        decision_id: str,
        evidence_type: str,
        evidence_data: Dict[str, Any],
        relevance_score: float = 1.0
    ):
        """
        Link evidence to a decision.
        
        Args:
            decision_id: Decision to link evidence to
            evidence_type: Type of evidence (xapi_event, quiz_result, resource_interaction)
            evidence_data: The evidence data itself
            relevance_score: How relevant this evidence is (0-1)
        """
        if decision_id not in self.evidence_store:
            raise ValueError(f"Decision {decision_id} not found")
        
        evidence_entry = {
            "type": evidence_type,
            "data": evidence_data,
            "relevance": relevance_score,
            "timestamp": datetime.now().isoformat()
        }
        
        if "evidence_refs" not in self.evidence_store[decision_id]:
            self.evidence_store[decision_id]["evidence_refs"] = []
        
        self.evidence_store[decision_id]["evidence_refs"].append(evidence_entry)
    
    def record_xapi_event(self, event: Dict[str, Any]):
        """
        Record an xAPI event for potential use as evidence.
        
        Args:
            event: xAPI-formatted event
        """
        self.event_buffer.append({
            **event,
            "recorded_at": datetime.now().isoformat()
        })
        
        # Keep buffer manageable (last 1000 events)
        if len(self.event_buffer) > 1000:
            self.event_buffer = self.event_buffer[-1000:]
    
    def get_evidence_for_decision(self, decision_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve all evidence for a specific decision.
        
        Args:
            decision_id: Decision ID to look up
            
        Returns:
            Complete decision record with all linked evidence
        """
        return self.evidence_store.get(decision_id)
    
    def get_learner_decision_history(
        self,
        learner_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Get decision history for a specific learner.
        
        Args:
            learner_id: Anonymized learner ID
            limit: Maximum number of decisions to return
            
        Returns:
            List of decisions for this learner
        """
        learner_decisions = [
            self.evidence_store[d["decision_id"]]
            for d in self.decision_history
            if self.evidence_store.get(d["decision_id"], {}).get("learner_id") == learner_id
        ]
        
        return learner_decisions[-limit:]
    
    def get_relevant_events(
        self,
        learner_id: str,
        concept: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get relevant xAPI events for a learner and optionally a concept.
        
        Args:
            learner_id: Anonymized learner ID
            concept: Optional concept filter
            limit: Maximum events to return
            
        Returns:
            List of relevant events
        """
        filtered_events = [
            e for e in self.event_buffer
            if e.get("actor", {}).get("account", {}).get("name") == learner_id
        ]
        
        if concept:
            filtered_events = [
                e for e in filtered_events
                if concept in str(e.get("object", {}))
            ]
        
        return filtered_events[-limit:]
    
    def generate_audit_report(
        self,
        decision_id: str,
        include_raw_data: bool = False
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive audit report for a decision.
        
        Args:
            decision_id: Decision to audit
            include_raw_data: Whether to include raw event data
            
        Returns:
            Audit report with full provenance chain
        """
        decision = self.get_evidence_for_decision(decision_id)
        
        if not decision:
            return {"error": "Decision not found"}
        
        # Build provenance chain
        provenance = self._build_provenance_chain(decision)
        
        # Assess evidence quality
        evidence_quality = self._assess_evidence_quality(decision)
        
        # Generate summary statistics
        stats = self._generate_decision_stats(decision)
        
        report = {
            "decision_id": decision_id,
            "decision_type": decision["decision_type"],
            "timestamp": decision["timestamp"],
            "learner_id": decision["learner_id"],
            "model_used": decision["model_used"],
            "confidence": decision["confidence"],
            "provenance_chain": provenance,
            "evidence_quality": evidence_quality,
            "statistics": stats,
            "outputs": decision["outputs"]
        }
        
        if include_raw_data:
            report["raw_inputs"] = decision["inputs"]
            report["raw_evidence"] = decision.get("evidence_refs", [])
        
        return report
    
    def get_model_performance_stats(
        self,
        model_name: str,
        time_window_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Get performance statistics for a specific model.
        
        Args:
            model_name: Name of the model
            time_window_hours: Time window to analyze
            
        Returns:
            Performance statistics
        """
        # Filter decisions by model
        model_decisions = [
            d for d in self.evidence_store.values()
            if d.get("model_used") == model_name
        ]
        
        if not model_decisions:
            return {"error": "No decisions found for this model"}
        
        # Calculate statistics
        total_decisions = len(model_decisions)
        avg_confidence = sum(d["confidence"] for d in model_decisions) / total_decisions
        
        decisions_by_type = defaultdict(int)
        for d in model_decisions:
            decisions_by_type[d["decision_type"]] += 1
        
        return {
            "model_name": model_name,
            "total_decisions": total_decisions,
            "average_confidence": round(avg_confidence, 3),
            "decisions_by_type": dict(decisions_by_type),
            "time_window_hours": time_window_hours
        }
    
    def export_evidence_package(
        self,
        decision_id: str,
        format: str = "json"
    ) -> str:
        """
        Export a complete evidence package for external review.
        
        Args:
            decision_id: Decision to export
            format: Export format (json, html)
            
        Returns:
            Formatted evidence package
        """
        report = self.generate_audit_report(decision_id, include_raw_data=True)
        
        if format == "json":
            return json.dumps(report, indent=2)
        elif format == "html":
            return self._format_as_html(report)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    # Private helper methods
    
    def _build_provenance_chain(self, decision: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Build complete provenance chain for a decision."""
        chain = []
        
        # Step 1: Data collection
        evidence_refs = decision.get("evidence_refs", [])
        chain.append({
            "step": 1,
            "stage": "Data Collection",
            "description": f"Collected {len(evidence_refs)} pieces of evidence",
            "evidence_types": list(set(e["type"] for e in evidence_refs))
        })
        
        # Step 2: Model input preparation
        chain.append({
            "step": 2,
            "stage": "Input Preparation",
            "description": "Prepared inputs for model inference",
            "input_keys": list(decision["inputs"].keys())
        })
        
        # Step 3: Model inference
        chain.append({
            "step": 3,
            "stage": "Model Inference",
            "description": f"Executed {decision['model_used']} model",
            "model": decision["model_used"],
            "confidence": decision["confidence"]
        })
        
        # Step 4: Decision output
        chain.append({
            "step": 4,
            "stage": "Decision Output",
            "description": f"Generated {decision['decision_type']} decision",
            "output_keys": list(decision["outputs"].keys())
        })
        
        return chain
    
    def _assess_evidence_quality(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Assess the quality of evidence for a decision."""
        evidence_refs = decision.get("evidence_refs", [])
        
        if not evidence_refs:
            return {
                "quality_score": 0.0,
                "assessment": "No evidence available",
                "recommendations": ["Collect more learner interaction data"]
            }
        
        # Count evidence by type
        evidence_types = defaultdict(int)
        total_relevance = 0
        
        for evidence in evidence_refs:
            evidence_types[evidence["type"]] += 1
            total_relevance += evidence.get("relevance", 1.0)
        
        avg_relevance = total_relevance / len(evidence_refs)
        diversity_score = len(evidence_types) / 3  # Normalized by typical number of types
        
        quality_score = 0.5 * min(len(evidence_refs) / 10, 1.0) + \
                       0.3 * avg_relevance + \
                       0.2 * min(diversity_score, 1.0)
        
        if quality_score >= 0.8:
            assessment = "High quality evidence"
        elif quality_score >= 0.5:
            assessment = "Moderate quality evidence"
        else:
            assessment = "Limited evidence quality"
        
        return {
            "quality_score": round(quality_score, 3),
            "assessment": assessment,
            "evidence_count": len(evidence_refs),
            "evidence_diversity": len(evidence_types),
            "average_relevance": round(avg_relevance, 3)
        }
    
    def _generate_decision_stats(self, decision: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary statistics for a decision."""
        evidence_refs = decision.get("evidence_refs", [])
        
        return {
            "evidence_count": len(evidence_refs),
            "model_confidence": decision["confidence"],
            "decision_age_seconds": (
                datetime.now() - datetime.fromisoformat(decision["timestamp"])
            ).total_seconds()
        }
    
    def _format_as_html(self, report: Dict[str, Any]) -> str:
        """Format audit report as HTML."""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Evidence Report - {report['decision_id']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .section {{ margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }}
        .header {{ background-color: #f0f0f0; padding: 10px; }}
        .evidence {{ background-color: #f9f9f9; margin: 5px 0; padding: 10px; }}
        .chain-step {{ margin: 10px 0; padding: 10px; border-left: 3px solid #4CAF50; }}
    </style>
</head>
<body>
    <h1>Evidence Report</h1>
    <div class="section">
        <div class="header"><strong>Decision ID:</strong> {report['decision_id']}</div>
        <p><strong>Type:</strong> {report['decision_type']}</p>
        <p><strong>Timestamp:</strong> {report['timestamp']}</p>
        <p><strong>Model:</strong> {report['model_used']}</p>
        <p><strong>Confidence:</strong> {report['confidence']}</p>
    </div>
    
    <div class="section">
        <h2>Provenance Chain</h2>
        {''.join(f'''
        <div class="chain-step">
            <strong>Step {step['step']}: {step['stage']}</strong><br>
            {step['description']}
        </div>
        ''' for step in report['provenance_chain'])}
    </div>
    
    <div class="section">
        <h2>Evidence Quality</h2>
        <p><strong>Quality Score:</strong> {report['evidence_quality']['quality_score']}</p>
        <p><strong>Assessment:</strong> {report['evidence_quality']['assessment']}</p>
        <p><strong>Evidence Count:</strong> {report['evidence_quality']['evidence_count']}</p>
    </div>
</body>
</html>
"""
        return html


# Demo functions

def demo_evidence_tracking():
    """Demo the evidence tracking system."""
    tracker = EvidenceTracker()
    
    # Record a recommendation decision
    decision_id = tracker.record_decision(
        decision_id="rec_001",
        decision_type="recommendation",
        learner_id="learner_alex_123",
        inputs={
            "concept": "For Loops",
            "mastery_level": 0.35,
            "recent_performance": "2/5 correct"
        },
        outputs={
            "recommended_resource": "Python Loops Tutorial",
            "resource_id": "res_101",
            "explanation": "Building foundational knowledge"
        },
        model_used="ResourceRanker-v1",
        confidence=0.87
    )
    
    # Link evidence to the decision
    tracker.link_evidence(
        decision_id=decision_id,
        evidence_type="quiz_result",
        evidence_data={
            "quiz_id": "quiz_loops_1",
            "score": 0.4,
            "timestamp": "2025-10-17T10:00:00Z"
        },
        relevance_score=0.95
    )
    
    tracker.link_evidence(
        decision_id=decision_id,
        evidence_type="xapi_event",
        evidence_data={
            "verb": "attempted",
            "object": {"id": "concept:for_loops"},
            "result": {"success": False}
        },
        relevance_score=0.90
    )
    
    # Generate audit report
    report = tracker.generate_audit_report(decision_id)
    
    print("=== Evidence Tracking Demo ===")
    print(f"Decision ID: {report['decision_id']}")
    print(f"Confidence: {report['confidence']}")
    print(f"Evidence Quality Score: {report['evidence_quality']['quality_score']}")
    print(f"Evidence Quality Assessment: {report['evidence_quality']['assessment']}")
    print(f"\nProvenance Chain:")
    for step in report['provenance_chain']:
        print(f"  Step {step['step']}: {step['stage']} - {step['description']}")
    print()


if __name__ == "__main__":
    demo_evidence_tracking()

