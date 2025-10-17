# ai-service/kt_service.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KT Service - LearnPath AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Attempt(BaseModel):
    concept: str
    correct: bool

class MasteryRequest(BaseModel):
    user_id: str
    recent_attempts: List[Attempt] = []  # last N attempts
    prior_mastery: Dict[str, float] = {}  # optional prior per concept

class MasteryResponse(BaseModel):
    mastery: Dict[str, float]

@app.post("/predict_mastery", response_model=MasteryResponse)
def predict_mastery(req: MasteryRequest):
    """
    Compute per-concept mastery using Beta-Bernoulli posterior:
      posterior_mean = (successes + alpha) / (trials + alpha + beta)
    We use alpha=1, beta=1 as an uninformative prior (Laplace smoothing).
    If prior_mastery provided, blend it with observed posterior.
    """
    alpha = 1.0
    beta = 1.0
    # aggregate attempts per concept
    stats = {}
    for att in req.recent_attempts:
        c = att.concept
        s = 1 if att.correct else 0
        if c not in stats:
            stats[c] = {"success": 0, "trials": 0}
        stats[c]["success"] += s
        stats[c]["trials"] += 1

    mastery = {}
    for concept, vals in stats.items():
        s = vals["success"]
        n = vals["trials"]
        post_mean = (s + alpha) / (n + alpha + beta)
        # optional: blend with prior_mastery if provided
        prior = req.prior_mastery.get(concept, None)
        if prior is not None:
            # simple linear blend, weight observed by n/(n+K)
            K = 2.0
            weight = n / (n + K)
            blended = weight * post_mean + (1 - weight) * prior
            mastery[concept] = round(float(blended), 4)
        else:
            mastery[concept] = round(float(post_mean), 4)

    # include any prior concepts that had no recent attempts
    for concept, prior in req.prior_mastery.items():
        if concept not in mastery:
            mastery[concept] = round(float(prior), 4)

    return MasteryResponse(mastery=mastery)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("kt_service:app", host="0.0.0.0", port=8001, reload=True)

