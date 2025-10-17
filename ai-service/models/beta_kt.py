# ai-service/models/beta_kt.py
"""
Beta-Bernoulli Knowledge Tracing (fallback/baseline model).
Simple, fast, and explainable.
"""
from typing import Dict, List


class BetaKT:
    """
    Beta-Bernoulli conjugate prior for knowledge tracing.
    Fast and explainable baseline model.
    """
    
    def __init__(self, alpha: float = 1.0, beta: float = 1.0, blend_weight: float = 2.0):
        """
        Args:
            alpha: prior successes (uninformative prior: alpha=1)
            beta: prior failures (uninformative prior: beta=1)
            blend_weight: weight for blending with prior mastery (higher = trust prior more)
        """
        self.alpha = alpha
        self.beta = beta
        self.blend_weight = blend_weight
    
    def predict_mastery(self, attempts: List[Dict], 
                       prior_mastery: Dict[str, float] = None) -> Dict[str, float]:
        """
        Compute per-concept mastery using Beta posterior.
        
        Args:
            attempts: list of dicts with 'concept' and 'correct' keys
            prior_mastery: optional prior mastery estimates
            
        Returns:
            dict mapping concept -> mastery probability
        """
        prior_mastery = prior_mastery or {}
        
        # Aggregate attempts per concept
        stats = {}
        for att in attempts:
            concept = att['concept']
            correct = int(att['correct'])
            
            if concept not in stats:
                stats[concept] = {'success': 0, 'trials': 0}
            
            stats[concept]['success'] += correct
            stats[concept]['trials'] += 1
        
        # Compute posterior mean for each concept
        mastery = {}
        for concept, vals in stats.items():
            s = vals['success']
            n = vals['trials']
            
            # Beta posterior mean
            post_mean = (s + self.alpha) / (n + self.alpha + self.beta)
            
            # Blend with prior if available
            prior = prior_mastery.get(concept)
            if prior is not None:
                # Weight observed data by n/(n+K)
                weight = n / (n + self.blend_weight)
                mastery[concept] = weight * post_mean + (1 - weight) * prior
            else:
                mastery[concept] = post_mean
        
        # Include prior concepts with no recent attempts
        for concept, prior in prior_mastery.items():
            if concept not in mastery:
                mastery[concept] = prior
        
        return mastery
    
    def get_explanation(self, concept: str, attempts: List[Dict]) -> str:
        """
        Generate human-readable explanation for mastery estimate.
        
        Args:
            concept: concept name
            attempts: list of attempts for this concept
            
        Returns:
            explanation string
        """
        concept_attempts = [a for a in attempts if a.get('concept') == concept]
        
        if not concept_attempts:
            return f"No attempts yet for {concept}. Starting with neutral prior."
        
        n = len(concept_attempts)
        s = sum(int(a['correct']) for a in concept_attempts)
        
        post_mean = (s + self.alpha) / (n + self.alpha + self.beta)
        
        return (
            f"Beta posterior for {concept}: {s}/{n} correct attempts. "
            f"With prior (α={self.alpha}, β={self.beta}), "
            f"posterior mean mastery = {post_mean:.3f}"
        )

