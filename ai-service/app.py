# ai-service/app.py
"""
Enhanced FastAPI microservice for LearnPath AI.
Integrates:
- DKT model (with Beta fallback)
- RAG explainability
- Resource ranking
- Content intelligence
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import json
from pathlib import Path
import os

from models.dkt import DKTPredictor
from models.beta_kt import BetaKT
from rag_explainer import RAGExplainer
from resource_ranker import ResourceRanker, UserProfile, Resource
from explainer_service import ExplanationGenerator
from evidence_tracker import EvidenceTracker
from collaboration_service import (
    add_collaboration_routes,
    GroupQuizRequest, FacilitationRequest,
    RoleAssignmentRequest, SummaryRequest
)

# Initialize FastAPI app
app = FastAPI(
    title="LearnPath AI - Knowledge Tracing & Recommendation Service",
    version="2.0.0",
    description="Advanced AI service with DKT, RAG explanations, and hybrid ranking"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state (loaded on startup)
dkt_predictor: Optional[DKTPredictor] = None
beta_kt: BetaKT = BetaKT()
rag_explainer: Optional[RAGExplainer] = None
resource_ranker: Optional[ResourceRanker] = None
explainer: ExplanationGenerator = ExplanationGenerator(use_llm=False)
evidence_tracker: EvidenceTracker = EvidenceTracker()
knowledge_graph: Dict = {}
resources_db: List[Dict] = []


# Pydantic models
class Attempt(BaseModel):
    """Single attempt record."""
    concept: str
    correct: bool
    question_id: Optional[int] = None
    timestamp: Optional[str] = None


class MasteryRequest(BaseModel):
    """Request for mastery prediction."""
    user_id: str
    recent_attempts: List[Attempt] = Field(default_factory=list)
    prior_mastery: Dict[str, float] = Field(default_factory=dict)
    use_dkt: bool = True  # If False, force Beta fallback


class MasteryResponse(BaseModel):
    """Response with mastery predictions."""
    mastery: Dict[str, float]
    model_used: str
    confidence: Optional[float] = None


class RecommendationRequest(BaseModel):
    """Request for resource recommendations."""
    user_id: str
    concept: str
    mastery: Dict[str, float]
    preferred_modality: str = 'video'
    n_recommendations: int = 5
    explain: bool = True


class RecommendationResponse(BaseModel):
    """Response with ranked recommendations."""
    recommendations: List[Dict]
    explanations: Optional[List[Dict]] = None


class ExplanationRequest(BaseModel):
    """Request for single resource explanation."""
    resource_id: str
    concept: str
    student_mastery: Dict[str, float]


class ContentAnalysisRequest(BaseModel):
    """Request for content analysis."""
    text: Optional[str] = None
    video_path: Optional[str] = None


class WhyThisRequest(BaseModel):
    """Request for 'Why this?' explanation."""
    resource_id: str
    resource_title: str
    concept: str
    mastery_level: float
    recent_attempts: List[Attempt] = Field(default_factory=list)
    transcript_excerpt: Optional[str] = None


class PathDecisionRequest(BaseModel):
    """Request for path decision explanation."""
    current_concept: str
    next_concept: str
    mastery_map: Dict[str, float]
    path_algorithm: str = "optimal"


class KTPredictionExplanationRequest(BaseModel):
    """Request for KT prediction explanation."""
    concept: str
    prior: float
    posterior: float
    recent_attempts: List[Attempt]
    model_type: str = "beta"


class EvidencePanelRequest(BaseModel):
    """Request for evidence panel."""
    decision_id: str


class EnsemblePredictionRequest(BaseModel):
    """Request for ensemble KT prediction."""
    user_id: str
    recent_attempts: List[Attempt]
    prior_mastery: Dict[str, float] = Field(default_factory=dict)


# Startup: load models and data
@app.on_event("startup")
async def load_models():
    """Load models and data on startup."""
    global dkt_predictor, rag_explainer, resource_ranker, knowledge_graph, resources_db
    
    print("Loading models and data...")
    
    # Load knowledge graph
    kg_path = Path(__file__).parent.parent / "backend" / "data" / "knowledge_graph.json"
    if kg_path.exists():
        with open(kg_path) as f:
            knowledge_graph = json.load(f)
        print(f"Loaded knowledge graph with {len(knowledge_graph)} concepts")
    
    # Load DKT model (if available)
    dkt_model_path = Path(__file__).parent / "models" / "dkt_model.pt"
    if dkt_model_path.exists():
        try:
            # Build concept-to-questions mapping from KG
            concept_to_questions = {}
            for i, concept in enumerate(knowledge_graph.keys()):
                # Mock: assign question IDs (in real system, load from DB)
                concept_to_questions[concept] = list(range(i * 5, (i + 1) * 5))
            
            dkt_predictor = DKTPredictor(
                model_path=str(dkt_model_path),
                concept_to_questions=concept_to_questions
            )
            print("DKT model loaded successfully")
        except Exception as e:
            print(f"Failed to load DKT model: {e}")
            dkt_predictor = None
    else:
        print("DKT model not found, using Beta fallback only")
    
    # Load RAG explainer
    try:
        # Mock resources (in real system, load from DB)
        mock_resources = []
        for concept, data in knowledge_graph.items():
            for res_id in data.get('resources', []):
                mock_resources.append({
                    'id': res_id,
                    'title': f"Resource for {concept}",
                    'description': f"Learn {concept} step by step",
                    'concepts': [concept]
                })
        
        resources_db = mock_resources
        
        rag_explainer = RAGExplainer(
            knowledge_graph=knowledge_graph,
            resource_metadata=mock_resources,
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        print("RAG explainer initialized")
    except Exception as e:
        print(f"Failed to initialize RAG explainer: {e}")
        rag_explainer = None
    
    # Initialize resource ranker
    try:
        resource_ranker = ResourceRanker()
        print("Resource ranker initialized")
    except Exception as e:
        print(f"Failed to initialize resource ranker: {e}")
        resource_ranker = None
    
    print("Startup complete!")


# Endpoints
@app.get("/")
async def root():
    """Health check."""
    return {
        "service": "LearnPath AI",
        "version": "2.0.0",
        "status": "running",
        "models": {
            "dkt": dkt_predictor is not None,
            "beta_kt": True,
            "rag": rag_explainer is not None,
            "ranker": resource_ranker is not None
        }
    }


@app.post("/predict_mastery", response_model=MasteryResponse)
async def predict_mastery(req: MasteryRequest):
    """
    Predict per-concept mastery using DKT (with Beta fallback).
    """
    # Try DKT first if available and requested
    if req.use_dkt and dkt_predictor is not None and req.recent_attempts:
        try:
            # Convert attempts to DKT format
            dkt_attempts = []
            for att in req.recent_attempts:
                if att.question_id is not None:
                    dkt_attempts.append({
                        'question_id': att.question_id,
                        'correct': att.correct
                    })
            
            if dkt_attempts:
                mastery = dkt_predictor.predict_mastery(dkt_attempts)
                
                # Merge with prior mastery for concepts not in recent attempts
                for concept, prior in req.prior_mastery.items():
                    if concept not in mastery:
                        mastery[concept] = prior
                
                return MasteryResponse(
                    mastery=mastery,
                    model_used='DKT',
                    confidence=0.85  # DKT confidence (could compute from model uncertainty)
                )
        except Exception as e:
            print(f"DKT prediction failed: {e}, falling back to Beta")
    
    # Fallback to Beta-Bernoulli
    attempts_for_beta = [
        {'concept': att.concept, 'correct': att.correct}
        for att in req.recent_attempts
    ]
    
    mastery = beta_kt.predict_mastery(
        attempts=attempts_for_beta,
        prior_mastery=req.prior_mastery
    )
    
    return MasteryResponse(
        mastery=mastery,
        model_used='Beta-Bernoulli',
        confidence=0.70  # Lower confidence for simpler model
    )


@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_resources(req: RecommendationRequest):
    """
    Recommend and rank resources for a concept.
    """
    if not resource_ranker or not resources_db:
        raise HTTPException(status_code=503, detail="Resource ranker not available")
    
    # Filter resources by concept
    candidate_resources = [
        res for res in resources_db
        if req.concept in res.get('concepts', [])
    ]
    
    if not candidate_resources:
        return RecommendationResponse(
            recommendations=[],
            explanations=[]
        )
    
    # Convert to Resource objects
    resource_objs = []
    for res in candidate_resources:
        resource_objs.append(Resource(
            id=res['id'],
            title=res['title'],
            description=res.get('description', ''),
            concepts=res.get('concepts', []),
            modality=res.get('modality', 'video'),
            difficulty=res.get('difficulty', 'beginner')
        ))
    
    # Embed resources
    resource_ranker.embed_resources(resource_objs)
    
    # Create user profile
    user_profile = UserProfile(
        preferred_modality=req.preferred_modality,
        mastery=req.mastery
    )
    
    # Rank
    ranked = resource_ranker.rank_and_filter(
        user=user_profile,
        concept=req.concept,
        resources=resource_objs,
        top_k=req.n_recommendations
    )
    
    # Format response
    recommendations = []
    explanations = []
    
    for item in ranked:
        res = item['resource']
        recommendations.append({
            'id': res.id,
            'title': res.title,
            'description': res.description,
            'modality': res.modality,
            'difficulty': res.difficulty,
            'score': item['score'],
            'score_breakdown': item['score_breakdown']
        })
        
        # Generate explanation if requested
        if req.explain and rag_explainer:
            try:
                explanation = rag_explainer.explain(
                    resource={'id': res.id, 'title': res.title, 'description': res.description},
                    student_mastery=req.mastery,
                    concept=req.concept
                )
                explanations.append(explanation)
            except Exception as e:
                print(f"Explanation generation failed: {e}")
                explanations.append({
                    'explanation': 'Explanation not available',
                    'action': 'Complete the resource',
                    'provenance': []
                })
    
    return RecommendationResponse(
        recommendations=recommendations,
        explanations=explanations if req.explain else None
    )


@app.post("/explain")
async def explain_resource(req: ExplanationRequest):
    """
    Generate explanation for a specific resource recommendation.
    """
    if not rag_explainer:
        raise HTTPException(status_code=503, detail="RAG explainer not available")
    
    # Find resource
    resource = next((r for r in resources_db if r['id'] == req.resource_id), None)
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    try:
        explanation = rag_explainer.explain(
            resource=resource,
            student_mastery=req.student_mastery,
            concept=req.concept
        )
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")


@app.post("/analyze_content")
async def analyze_content(req: ContentAnalysisRequest):
    """
    Analyze content (text or video) for concepts and difficulty.
    """
    try:
        from content_intelligence import ContentIntelligencePipeline
        
        pipeline = ContentIntelligencePipeline()
        
        if req.text:
            result = pipeline.process_text(req.text)
        elif req.video_path:
            result = pipeline.process_video(req.video_path)
        else:
            raise HTTPException(status_code=400, detail="Provide either text or video_path")
        
        return result
    except ImportError as e:
        raise HTTPException(status_code=503, detail=f"Content intelligence not available: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/knowledge_graph")
async def get_knowledge_graph():
    """Get the knowledge graph."""
    return knowledge_graph


@app.get("/stats")
async def get_stats():
    """Get service statistics."""
    return {
        "n_concepts": len(knowledge_graph),
        "n_resources": len(resources_db),
        "models_loaded": {
            "dkt": dkt_predictor is not None,
            "beta_kt": True,
            "rag": rag_explainer is not None,
            "ranker": resource_ranker is not None,
            "explainer": True,
            "evidence_tracker": True
        }
    }


@app.post("/explain/why_this")
async def explain_why_this(req: WhyThisRequest):
    """
    Generate 'Why this?' explanation for a recommended resource.
    Returns explainable reasoning with evidence and citations.
    """
    # Convert attempts to evidence format
    evidence = {
        "recent_attempts": [
            {"correct": att.correct, "concept": att.concept, "timestamp": att.timestamp}
            for att in req.recent_attempts
        ]
    }
    
    # Generate explanation
    explanation = explainer.explain_recommendation(
        resource_title=req.resource_title,
        concept=req.concept,
        mastery_level=req.mastery_level,
        evidence=evidence,
        transcript_excerpt=req.transcript_excerpt
    )
    
    # Record decision for audit trail
    decision_id = f"rec_{req.resource_id}_{req.concept}"
    evidence_tracker.record_decision(
        decision_id=decision_id,
        decision_type="recommendation",
        learner_id=f"learner_{hash(req.resource_id) % 10000}",  # Demo anonymization
        inputs={
            "resource_id": req.resource_id,
            "concept": req.concept,
            "mastery_level": req.mastery_level
        },
        outputs=explanation,
        model_used="ExplanationGenerator",
        confidence=explanation.get("confidence", 0.8)
    )
    
    return {
        **explanation,
        "decision_id": decision_id
    }


@app.post("/explain/path_decision")
async def explain_path_decision(req: PathDecisionRequest):
    """
    Explain why the path algorithm chose the next concept.
    """
    explanation = explainer.explain_path_decision(
        current_concept=req.current_concept,
        next_concept=req.next_concept,
        kt_posterior=req.mastery_map,
        path_algorithm=req.path_algorithm
    )
    
    return explanation


@app.post("/explain/kt_prediction")
async def explain_kt_prediction(req: KTPredictionExplanationRequest):
    """
    Explain a knowledge tracing prediction update.
    """
    evidence = [
        {"correct": att.correct, "concept": att.concept, "timestamp": att.timestamp}
        for att in req.recent_attempts
    ]
    
    explanation = explainer.explain_kt_prediction(
        concept=req.concept,
        prior=req.prior,
        posterior=req.posterior,
        evidence=evidence,
        model_type=req.model_type
    )
    
    return explanation


@app.post("/evidence/panel")
async def get_evidence_panel(req: EvidencePanelRequest):
    """
    Get complete evidence panel for a decision (audit/traceability).
    """
    # Get decision from evidence tracker
    decision = evidence_tracker.get_evidence_for_decision(req.decision_id)
    
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    
    # Generate comprehensive evidence panel
    panel = explainer.generate_evidence_panel(
        decision_id=req.decision_id,
        decision_type=decision["decision_type"],
        events=evidence_tracker.get_relevant_events(
            learner_id=decision["learner_id"],
            limit=20
        ),
        model_outputs=decision["outputs"],
        resources_used=[
            {
                "id": decision["inputs"].get("resource_id", "unknown"),
                "title": decision["outputs"].get("reason", "Unknown resource")
            }
        ]
    )
    
    return panel


@app.post("/evidence/audit_report")
async def get_audit_report(req: EvidencePanelRequest):
    """
    Generate a comprehensive audit report for a decision.
    """
    report = evidence_tracker.generate_audit_report(
        decision_id=req.decision_id,
        include_raw_data=True
    )
    
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    
    return report


@app.post("/predict_mastery/ensemble")
async def predict_mastery_ensemble(req: EnsemblePredictionRequest):
    """
    Predict mastery using ensemble of Beta + DKT models.
    Returns predictions from both models and a blended score.
    """
    # Get Beta prediction
    beta_attempts = [
        {'concept': att.concept, 'correct': att.correct}
        for att in req.recent_attempts
    ]
    
    beta_mastery = beta_kt.predict_mastery(
        attempts=beta_attempts,
        prior_mastery=req.prior_mastery
    )
    
    # Get DKT prediction if available
    dkt_mastery = {}
    if dkt_predictor is not None and req.recent_attempts:
        try:
            dkt_attempts = []
            for att in req.recent_attempts:
                if att.question_id is not None:
                    dkt_attempts.append({
                        'question_id': att.question_id,
                        'correct': att.correct
                    })
            
            if dkt_attempts:
                dkt_mastery = dkt_predictor.predict_mastery(dkt_attempts)
        except Exception as e:
            print(f"DKT prediction failed: {e}")
    
    # Blend predictions (weighted average: 40% Beta, 60% DKT if available)
    blended_mastery = {}
    all_concepts = set(beta_mastery.keys()) | set(dkt_mastery.keys())
    
    for concept in all_concepts:
        beta_val = beta_mastery.get(concept, req.prior_mastery.get(concept, 0.5))
        dkt_val = dkt_mastery.get(concept, beta_val)
        
        if concept in dkt_mastery:
            # Both models available - blend
            blended_mastery[concept] = 0.4 * beta_val + 0.6 * dkt_val
        else:
            # Only Beta available
            blended_mastery[concept] = beta_val
    
    return {
        "beta_prediction": beta_mastery,
        "dkt_prediction": dkt_mastery if dkt_mastery else None,
        "blended_prediction": blended_mastery,
        "models_used": {
            "beta": True,
            "dkt": len(dkt_mastery) > 0
        },
        "ensemble_strategy": "weighted_average",
        "weights": {"beta": 0.4, "dkt": 0.6} if dkt_mastery else {"beta": 1.0}
    }


@app.get("/evidence/learner_history/{learner_id}")
async def get_learner_history(learner_id: str, limit: int = 20):
    """
    Get decision history for a specific learner.
    """
    history = evidence_tracker.get_learner_decision_history(learner_id, limit)
    return {"learner_id": learner_id, "history": history, "count": len(history)}


# ============================================================
# COLLABORATIVE LEARNING ENDPOINTS
# ============================================================

# Add collaboration routes for group learning features
add_collaboration_routes(app)


# Development server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )

