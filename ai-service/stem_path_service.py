"""
STEM Path Service API - FastAPI endpoints for generating personalized STEM learning paths
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from stem_path_generator import (
    STEMPathGenerator, 
    LearningStyle,
    ResourceType
)
import json
from datetime import datetime

app = FastAPI(
    title="STEM Path Service - LearnPath AI",
    description="Generate personalized STEM learning pathways with adaptive sequencing",
    version="1.2.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize generator
path_generator = STEMPathGenerator()


# Pydantic models
class Attempt(BaseModel):
    concept: str
    correct: bool
    timestamp: Optional[str] = None
    duration_seconds: Optional[int] = None


class GeneratePathRequest(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    subject: str = Field(..., description="STEM subject: programming, math, physics, etc.")
    user_attempts: List[Attempt] = Field(default=[], description="User's recent attempts")
    learning_goal: Optional[str] = Field(None, description="Specific learning goal")
    learning_style: Optional[str] = Field("visual", description="Learning style: visual, reading, kinesthetic, auditory")
    prior_mastery: Optional[Dict[str, float]] = Field(default={}, description="Prior mastery scores per concept")


class ResourceResponse(BaseModel):
    id: str
    title: str
    type: str
    difficulty: float
    duration_minutes: int
    url: str
    engagement_score: float
    modality: str


class ConceptNodeResponse(BaseModel):
    concept_id: str
    name: str
    current_mastery: float
    target_mastery: float
    status: str
    prerequisites: List[str]
    resources: List[ResourceResponse]
    estimated_time_minutes: int


class PathResponse(BaseModel):
    path_id: str
    user_id: str
    subject: str
    overall_mastery: float
    concepts: List[ConceptNodeResponse]
    metadata: Dict


class UpdatePathRequest(BaseModel):
    path_id: str
    user_id: str
    subject: str
    new_attempts: List[Attempt]


class NextConceptResponse(BaseModel):
    concept_id: Optional[str]
    concept_name: Optional[str]
    current_mastery: float
    recommended_resources: List[ResourceResponse]


# Endpoints
@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "STEM Path Service",
        "version": "1.2.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/generate_path", response_model=PathResponse)
def generate_path(request: GeneratePathRequest):
    """
    Generate a personalized STEM learning path based on user data.
    
    This endpoint uses:
    - Bayesian Knowledge Tracing for mastery estimation
    - Topological sorting for prerequisite-aware sequencing
    - Adaptive resource selection based on learning style
    """
    try:
        # Convert learning style string to enum
        try:
            learning_style_enum = LearningStyle[request.learning_style.upper()]
        except KeyError:
            learning_style_enum = LearningStyle.VISUAL
        
        # Convert attempts to dict format
        attempts_dict = [
            {
                "concept": att.concept,
                "correct": att.correct
            }
            for att in request.user_attempts
        ]
        
        # Generate path
        path = path_generator.generate_path(
            user_id=request.user_id,
            subject=request.subject,
            user_attempts=attempts_dict,
            learning_goal=request.learning_goal,
            learning_style=learning_style_enum,
            prior_mastery=request.prior_mastery
        )
        
        # Convert to response format
        return PathResponse(**path.to_dict())
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating path: {str(e)}"
        )


@app.post("/update_path", response_model=PathResponse)
def update_path(request: UpdatePathRequest):
    """
    Update an existing learning path with new user attempts.
    Recalculates mastery and adjusts recommendations.
    """
    try:
        # Convert new attempts
        attempts_dict = [
            {
                "concept": att.concept,
                "correct": att.correct
            }
            for att in request.new_attempts
        ]
        
        # First generate original path (in production, load from database)
        original_path = path_generator.generate_path(
            user_id=request.user_id,
            subject=request.subject,
            user_attempts=[]
        )
        
        # Update with new attempts
        updated_path = path_generator.update_path_with_new_attempts(
            path=original_path,
            new_attempts=attempts_dict
        )
        
        return PathResponse(**updated_path.to_dict())
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating path: {str(e)}"
        )


@app.get("/next_concept/{user_id}/{subject}", response_model=NextConceptResponse)
def get_next_concept(user_id: str, subject: str):
    """
    Get the next recommended concept for the user to work on.
    """
    try:
        # Generate current path
        path = path_generator.generate_path(
            user_id=user_id,
            subject=subject,
            user_attempts=[],  # In production, load from database
            learning_style=LearningStyle.VISUAL
        )
        
        # Get next concept
        next_concept = path_generator.get_next_recommended_concept(path)
        
        if next_concept is None:
            return NextConceptResponse(
                concept_id=None,
                concept_name="All concepts completed!",
                current_mastery=1.0,
                recommended_resources=[]
            )
        
        # Find the node for this concept
        node = next(n for n in path.nodes if n.concept.id == next_concept.id)
        
        return NextConceptResponse(
            concept_id=next_concept.id,
            concept_name=next_concept.name,
            current_mastery=node.current_mastery,
            recommended_resources=[
                ResourceResponse(**r.to_dict()) for r in node.recommended_resources
            ]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting next concept: {str(e)}"
        )


@app.get("/subjects")
def get_available_subjects():
    """Get list of available STEM subjects"""
    subjects = set()
    for concept in path_generator.knowledge_graph.values():
        subjects.add(concept.subject)
    
    return {
        "subjects": sorted(list(subjects)),
        "total_concepts": len(path_generator.knowledge_graph)
    }


@app.get("/concepts/{subject}")
def get_concepts_by_subject(subject: str):
    """Get all concepts for a specific subject"""
    concepts = [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "prerequisites": c.prerequisites,
            "mastery_threshold": c.mastery_threshold,
            "resource_count": len(c.resources)
        }
        for c in path_generator.knowledge_graph.values()
        if c.subject == subject
    ]
    
    if not concepts:
        raise HTTPException(
            status_code=404,
            detail=f"No concepts found for subject: {subject}"
        )
    
    return {
        "subject": subject,
        "concepts": concepts,
        "total": len(concepts)
    }


@app.get("/mastery/{user_id}/{concept_id}")
def get_concept_mastery(user_id: str, concept_id: str):
    """Get mastery level for a specific concept (demo endpoint)"""
    # In production, load from database
    return {
        "user_id": user_id,
        "concept_id": concept_id,
        "mastery": 0.5,
        "attempts": 5,
        "last_updated": datetime.now().isoformat()
    }


# Demo endpoint for testing
@app.get("/demo/path")
def get_demo_path():
    """Generate a demo learning path for testing"""
    demo_attempts = [
        {"concept": "variables", "correct": True},
        {"concept": "variables", "correct": True},
        {"concept": "variables", "correct": False},
        {"concept": "control_structures", "correct": True},
        {"concept": "control_structures", "correct": False},
    ]
    
    path = path_generator.generate_path(
        user_id="demo_user",
        subject="programming",
        user_attempts=demo_attempts,
        learning_style=LearningStyle.VISUAL
    )
    
    return PathResponse(**path.to_dict())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "stem_path_service:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    )

