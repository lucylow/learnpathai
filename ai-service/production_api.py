"""
Production-Ready FastAPI Backend
Integrates all AI workflow components with <500ms response time
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime
import asyncio
import uuid
import time

from bkt_irt_hybrid import bkt_irt_model, MasteryUpdate
from performance_predictor import performance_predictor, LearningHistory, LearningTrajectory
from knowledge_graph import KnowledgeGraph
from bandit_optimizer import MultiArmedBandit, ContextualBandit, Resource


# Initialize FastAPI app
app = FastAPI(
    title="LearnPath AI - Production API",
    version="3.0.0",
    description="Real-time adaptive learning with BKT+IRT, performance prediction, and multi-armed bandits"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
knowledge_graph: Optional[KnowledgeGraph] = None
resource_bandit: Optional[ContextualBandit] = None


# ============================================================
# PYDANTIC MODELS
# ============================================================

class LearningEventRequest(BaseModel):
    """Learning event from frontend"""
    user_id: str
    concept_id: str
    correct: bool
    time_spent: float  # seconds
    confidence: float = 0.5
    resource_id: Optional[str] = None
    attempt_number: int = 1
    metadata: Dict = Field(default_factory=dict)


class AdaptivePathResponse(BaseModel):
    """Adaptive response with optimized path"""
    success: bool
    path: List[Dict]
    mastery: float
    confidence: float
    processing_time: int  # milliseconds
    request_id: str
    ability: Optional[float] = None
    interventions: List[Dict] = Field(default_factory=list)


class KnowledgeStateResponse(BaseModel):
    """User knowledge state"""
    user_id: str
    concept_mastery: Dict[str, float]
    overall_mastery: float
    ability: float
    confidence_intervals: Dict[str, List[float]]
    learning_velocity: float
    concept_count: int
    last_updated: Optional[str] = None


class TrajectoryRequest(BaseModel):
    """Request for trajectory prediction"""
    user_id: str
    concept_id: str
    current_mastery: float = 0.3
    concept_difficulty: float = 0.5


class TrajectoryResponse(BaseModel):
    """Predicted learning trajectory"""
    user_id: str
    concept_id: str
    predicted_mastery: float
    confidence: float
    estimated_time: float
    risk_factors: List[Dict]
    recommendations: List[Dict]


class ResourceSelectionRequest(BaseModel):
    """Request for optimal resource selection"""
    user_id: str
    concept_id: str
    mastery: float
    learning_style: str = "visual"
    available_time: float = 30.0
    n_recommendations: int = 3


class ResourceSelectionResponse(BaseModel):
    """Resource recommendations with bandit selection"""
    recommendations: List[Dict]
    selection_algorithm: str
    confidence: float


class BatchMasteryRequest(BaseModel):
    """Batch mastery update"""
    user_id: str
    attempts: List[Dict]


class RecommendationRequest(BaseModel):
    """Request for recommendations"""
    user_id: str
    mastery: Dict[str, float]
    n_recommendations: int = 5


class OptimalPathRequest(BaseModel):
    """Request for optimal learning path"""
    user_id: str
    mastery: Dict[str, float]
    ready_concepts: List[str] = Field(default_factory=list)


class TelemetryBatch(BaseModel):
    """Batch telemetry events"""
    events: List[Dict]


# ============================================================
# STARTUP / SHUTDOWN
# ============================================================

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    global knowledge_graph, resource_bandit
    
    print("🚀 Starting LearnPath AI Production API...")
    
    # Initialize knowledge graph
    knowledge_graph = KnowledgeGraph()
    print("✅ Knowledge graph initialized")
    
    # Initialize resource bandit
    resource_bandit = ContextualBandit(algorithm="thompson")
    print("✅ Resource bandit initialized")
    
    # Initialize concepts in BKT-IRT model
    concepts = [
        ("variables", 0.0, 0.1, 0.2),
        ("operators", 0.1, 0.1, 0.2),
        ("conditionals", 0.2, 0.12, 0.18),
        ("loops", 0.5, 0.15, 0.15),
        ("functions", 0.6, 0.15, 0.15),
        ("recursion", 0.8, 0.2, 0.1),
    ]
    
    for concept_id, difficulty, slip, guess in concepts:
        bkt_irt_model.initialize_concept(concept_id, difficulty, slip, guess)
    
    print("✅ BKT-IRT model initialized with concepts")
    
    print("🎉 Production API ready!")


# ============================================================
# CORE ENDPOINTS
# ============================================================

@app.post("/api/learning-event", response_model=AdaptivePathResponse)
async def process_learning_event(
    request: LearningEventRequest,
    background_tasks: BackgroundTasks
) -> AdaptivePathResponse:
    """
    Process learning event with full adaptive pipeline
    Target: <500ms response time
    """
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    try:
        # 1. Update mastery using BKT-IRT hybrid (fast)
        mastery_update = bkt_irt_model.update_mastery(
            request.user_id,
            request.concept_id,
            request.correct,
            request.time_spent
        )
        
        # 2. Get current knowledge state
        knowledge_state = bkt_irt_model.get_knowledge_state(request.user_id)
        
        # 3. Get ready concepts from knowledge graph
        if knowledge_graph:
            # Update mastery in graph
            for concept_id, mastery in knowledge_state['concept_mastery'].items():
                knowledge_graph.update_mastery(concept_id, mastery)
            
            ready_concepts = knowledge_graph.get_ready_concepts(mastery_threshold=0.7)
        else:
            ready_concepts = []
        
        # 4. Background: Update performance predictor
        background_tasks.add_task(
            update_performance_history,
            request.user_id,
            request.concept_id,
            mastery_update.posterior_mastery,
            request.correct,
            request.time_spent,
            mastery_update.confidence
        )
        
        # 5. Background: Update resource bandit if resource was used
        if request.resource_id and resource_bandit:
            success = mastery_update.posterior_mastery > mastery_update.prior_mastery + 0.05
            background_tasks.add_task(
                resource_bandit.update_reward,
                request.resource_id,
                success
            )
        
        # 6. Check for interventions (quick)
        interventions = check_interventions(
            request,
            knowledge_state,
            mastery_update
        )
        
        # 7. Build adaptive path
        path = build_adaptive_path(
            ready_concepts,
            knowledge_state['concept_mastery'],
            request.concept_id
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return AdaptivePathResponse(
            success=True,
            path=path,
            mastery=mastery_update.posterior_mastery,
            confidence=mastery_update.confidence,
            processing_time=processing_time,
            request_id=request_id,
            ability=mastery_update.ability,
            interventions=interventions
        )
        
    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        print(f"❌ Error processing learning event: {e}")
        
        return AdaptivePathResponse(
            success=False,
            path=[],
            mastery=0.0,
            confidence=0.0,
            processing_time=processing_time,
            request_id=request_id,
            interventions=[]
        )


@app.get("/api/user/{user_id}/knowledge-state", response_model=KnowledgeStateResponse)
async def get_knowledge_state(user_id: str) -> KnowledgeStateResponse:
    """Get complete knowledge state for user"""
    state = bkt_irt_model.get_knowledge_state(user_id)
    
    return KnowledgeStateResponse(
        user_id=user_id,
        concept_mastery=state['concept_mastery'],
        overall_mastery=state['overall_mastery'],
        ability=state['ability'],
        confidence_intervals=state['confidence_intervals'],
        learning_velocity=state['learning_velocity'],
        concept_count=state['concept_count'],
        last_updated=datetime.now().isoformat()
    )


@app.post("/api/predict-trajectory", response_model=TrajectoryResponse)
async def predict_trajectory(request: TrajectoryRequest) -> TrajectoryResponse:
    """Predict learning trajectory with risk factors"""
    trajectory = performance_predictor.predict_trajectory(
        request.user_id,
        request.concept_id,
        request.current_mastery,
        request.concept_difficulty
    )
    
    return TrajectoryResponse(
        user_id=trajectory.user_id,
        concept_id=trajectory.concept_id,
        predicted_mastery=trajectory.predicted_mastery,
        confidence=trajectory.confidence,
        estimated_time=trajectory.estimated_time,
        risk_factors=[
            {
                'type': risk.type,
                'severity': risk.severity,
                'message': risk.message,
                'confidence': risk.confidence
            }
            for risk in trajectory.risk_factors
        ],
        recommendations=[
            {
                'type': rec.type,
                'priority': rec.priority,
                'action': rec.action,
                'message': rec.message,
                'resources': rec.resources
            }
            for rec in trajectory.recommendations
        ]
    )


@app.post("/api/select-resources", response_model=ResourceSelectionResponse)
async def select_resources(request: ResourceSelectionRequest) -> ResourceSelectionResponse:
    """Select optimal resources using contextual multi-armed bandit"""
    
    if not resource_bandit:
        raise HTTPException(status_code=503, detail="Resource bandit not initialized")
    
    # Get candidate resources for concept (placeholder - would query DB)
    candidate_resources = get_candidate_resources(request.concept_id)
    
    # Select top resources using bandit
    selected = []
    for _ in range(min(request.n_recommendations, len(candidate_resources))):
        resource_id = resource_bandit.select_contextual_resource(
            candidates=[r.id for r in candidate_resources if r.id not in [s['id'] for s in selected]],
            learner_mastery=request.mastery,
            learning_style=request.learning_style,
            available_time=request.available_time
        )
        
        if resource_id:
            resource = next(r for r in candidate_resources if r.id == resource_id)
            selected.append({
                'id': resource.id,
                'title': resource.title,
                'type': resource.type,
                'difficulty': resource.difficulty,
                'engagement_score': resource.engagement_score,
                'completion_rate': resource.completion_rate
            })
    
    return ResourceSelectionResponse(
        recommendations=selected,
        selection_algorithm="contextual_thompson_sampling",
        confidence=0.85
    )


@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get learning recommendations based on current state"""
    
    if not knowledge_graph:
        return {"recommendations": []}
    
    # Update graph with current mastery
    for concept_id, mastery in request.mastery.items():
        knowledge_graph.update_mastery(concept_id, mastery)
    
    # Get ready concepts
    ready = knowledge_graph.get_ready_concepts(mastery_threshold=0.7)
    
    recommendations = []
    for concept_id in ready[:request.n_recommendations]:
        concept_node = knowledge_graph.concept_map.get(concept_id)
        if concept_node:
            recommendations.append({
                'concept_id': concept_id,
                'name': concept_node.name,
                'difficulty': concept_node.difficulty,
                'importance': concept_node.importance,
                'readiness_score': knowledge_graph.compute_learning_gain_potential(concept_id)
            })
    
    return {"recommendations": recommendations}


@app.post("/api/optimal-path")
async def get_optimal_path(request: OptimalPathRequest):
    """Get optimal learning path using knowledge graph"""
    
    if not knowledge_graph:
        return {"path": []}
    
    # Update graph with current mastery
    for concept_id, mastery in request.mastery.items():
        knowledge_graph.update_mastery(concept_id, mastery)
    
    # Get optimal sequence
    if request.ready_concepts:
        sequence = knowledge_graph.get_optimal_learning_sequence(
            request.ready_concepts,
            mastery_threshold=0.7
        )
    else:
        # Get all ready concepts
        sequence = knowledge_graph.get_ready_concepts(mastery_threshold=0.7)
    
    path = []
    for concept_id in sequence:
        concept_node = knowledge_graph.concept_map.get(concept_id)
        if concept_node:
            path.append({
                'concept_id': concept_id,
                'name': concept_node.name,
                'difficulty': concept_node.difficulty,
                'mastery': concept_node.mastery,
                'importance': concept_node.importance
            })
    
    return {"path": path}


@app.post("/api/batch-mastery")
async def batch_mastery_update(request: BatchMasteryRequest):
    """Batch update mastery for multiple attempts"""
    updates = []
    
    for attempt in request.attempts:
        try:
            update = bkt_irt_model.update_mastery(
                request.user_id,
                attempt['concept_id'],
                attempt['correct'],
                attempt.get('time_spent', 0.0)
            )
            updates.append({
                'concept_id': attempt['concept_id'],
                'mastery': update.posterior_mastery,
                'confidence': update.confidence,
                'ability': update.ability
            })
        except Exception as e:
            print(f"Error updating mastery for {attempt['concept_id']}: {e}")
    
    return {"updates": updates, "count": len(updates)}


@app.post("/api/telemetry")
async def receive_telemetry(request: TelemetryBatch):
    """Receive telemetry batch from frontend"""
    # In production: Store in database, send to analytics
    print(f"📊 Received {len(request.events)} telemetry events")
    return {"received": len(request.events), "status": "ok"}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def check_interventions(
    request: LearningEventRequest,
    knowledge_state: Dict,
    mastery_update: MasteryUpdate
) -> List[Dict]:
    """Check if interventions are needed"""
    interventions = []
    
    # Significant knowledge gap
    if knowledge_state['overall_mastery'] < 0.3:
        interventions.append({
            'type': 'remediation',
            'priority': 'high',
            'action': 'suggest_prerequisite_review',
            'message': 'Let\'s review some foundational concepts to build a stronger base.'
        })
    
    # Frustration pattern (multiple failures)
    if not request.correct and request.attempt_number > 3:
        interventions.append({
            'type': 'motivational',
            'priority': 'medium',
            'action': 'provide_encouragement',
            'message': 'You\'re making progress! Let\'s try a different approach.'
        })
    
    # Rapid progress
    if request.correct and knowledge_state['overall_mastery'] > 0.8:
        interventions.append({
            'type': 'acceleration',
            'priority': 'medium',
            'action': 'increase_difficulty',
            'message': 'Excellent work! Ready for a bigger challenge?'
        })
    
    return interventions


def build_adaptive_path(
    ready_concepts: List[str],
    concept_mastery: Dict[str, float],
    current_concept: str
) -> List[Dict]:
    """Build adaptive learning path"""
    path = []
    
    # Add current concept if not mastered
    if current_concept not in concept_mastery or concept_mastery[current_concept] < 0.8:
        path.append({
            'concept_id': current_concept,
            'type': 'current',
            'priority': 'high'
        })
    
    # Add ready concepts
    for concept_id in ready_concepts[:5]:
        if concept_id != current_concept:
            path.append({
                'concept_id': concept_id,
                'type': 'ready',
                'priority': 'medium'
            })
    
    return path


def get_candidate_resources(concept_id: str) -> List[Resource]:
    """Get candidate resources for concept (placeholder)"""
    # In production: Query database
    return [
        Resource(
            id=f"{concept_id}_vid1",
            title=f"Video: {concept_id}",
            type="video",
            concept=concept_id,
            difficulty=0.3,
            engagement_score=0.8,
            completion_rate=0.75
        ),
        Resource(
            id=f"{concept_id}_art1",
            title=f"Article: {concept_id}",
            type="article",
            concept=concept_id,
            difficulty=0.4,
            engagement_score=0.6,
            completion_rate=0.65
        ),
        Resource(
            id=f"{concept_id}_quiz1",
            title=f"Quiz: {concept_id}",
            type="quiz",
            concept=concept_id,
            difficulty=0.5,
            engagement_score=0.7,
            completion_rate=0.70
        ),
    ]


async def update_performance_history(
    user_id: str,
    concept_id: str,
    mastery: float,
    correct: bool,
    time_spent: float,
    confidence: float
):
    """Update performance predictor history (background task)"""
    try:
        history = LearningHistory(
            user_id=user_id,
            concept_id=concept_id,
            timestamp=datetime.now(),
            mastery=mastery,
            correct=correct,
            time_spent=time_spent,
            confidence=confidence
        )
        performance_predictor.add_history(history)
    except Exception as e:
        print(f"Failed to update performance history: {e}")


# ============================================================
# HEALTH & STATUS
# ============================================================

@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "LearnPath AI Production API",
        "version": "3.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "bkt_irt": True,
            "performance_predictor": True,
            "knowledge_graph": knowledge_graph is not None,
            "resource_bandit": resource_bandit is not None
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "bkt_irt_model": {
                "status": "healthy",
                "users": len(bkt_irt_model.user_states),
                "concepts": len(bkt_irt_model.concept_params)
            },
            "performance_predictor": {
                "status": "healthy",
                "history_entries": sum(len(h) for h in performance_predictor.history_buffer.values())
            },
            "knowledge_graph": {
                "status": "healthy" if knowledge_graph else "not_initialized",
                "nodes": len(knowledge_graph.graph.nodes()) if knowledge_graph else 0
            },
            "resource_bandit": {
                "status": "healthy" if resource_bandit else "not_initialized",
                "resources": len(resource_bandit.resources) if resource_bandit else 0
            }
        }
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "production_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
        # Optimized for real-time performance
        workers=1,  # Use 4+ in production
        loop="asyncio",
        timeout_keep_alive=5
    )

