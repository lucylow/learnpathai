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
            "ranker": resource_ranker is not None
        }
    }


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

