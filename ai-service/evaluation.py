# ai-service/evaluation.py
"""
Evaluation metrics and scripts for knowledge tracing and recommendation systems.
Includes:
- KT metrics: AUC, Brier score, accuracy, calibration
- Recommendation metrics: NDCG, MRR, precision@k
- Learning impact metrics: pre-post gains, time-to-mastery
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from sklearn.metrics import roc_auc_score, brier_score_loss, precision_score, recall_score
import json
from pathlib import Path


class KTEvaluator:
    """
    Evaluate knowledge tracing models.
    """
    
    @staticmethod
    def compute_auc(y_true: List[int], y_pred: List[float]) -> float:
        """
        Compute AUC for next-question correctness prediction.
        
        Args:
            y_true: ground truth labels (0 or 1)
            y_pred: predicted probabilities (0-1)
            
        Returns:
            AUC score
        """
        if len(set(y_true)) < 2:
            return 0.5  # undefined if only one class
        
        return roc_auc_score(y_true, y_pred)
    
    @staticmethod
    def compute_brier_score(y_true: List[int], y_pred: List[float]) -> float:
        """
        Compute Brier score (lower is better).
        
        Args:
            y_true: ground truth labels (0 or 1)
            y_pred: predicted probabilities (0-1)
            
        Returns:
            Brier score
        """
        return brier_score_loss(y_true, y_pred)
    
    @staticmethod
    def compute_accuracy(y_true: List[int], y_pred: List[float], threshold: float = 0.5) -> float:
        """
        Compute binary accuracy.
        
        Args:
            y_true: ground truth labels
            y_pred: predicted probabilities
            threshold: decision threshold
            
        Returns:
            accuracy
        """
        y_pred_binary = [1 if p >= threshold else 0 for p in y_pred]
        return np.mean(np.array(y_true) == np.array(y_pred_binary))
    
    @staticmethod
    def compute_calibration(y_true: List[int], y_pred: List[float], n_bins: int = 10) -> Dict:
        """
        Compute calibration metrics (reliability diagram data).
        
        Args:
            y_true: ground truth labels
            y_pred: predicted probabilities
            n_bins: number of probability bins
            
        Returns:
            dict with bin_means, bin_accuracies, and ECE (expected calibration error)
        """
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        
        bins = np.linspace(0, 1, n_bins + 1)
        bin_means = []
        bin_accuracies = []
        bin_counts = []
        
        for i in range(n_bins):
            mask = (y_pred >= bins[i]) & (y_pred < bins[i + 1])
            if mask.sum() > 0:
                bin_mean = y_pred[mask].mean()
                bin_accuracy = y_true[mask].mean()
                bin_means.append(float(bin_mean))
                bin_accuracies.append(float(bin_accuracy))
                bin_counts.append(int(mask.sum()))
        
        # Expected Calibration Error (ECE)
        total = len(y_true)
        ece = sum(
            (count / total) * abs(acc - mean)
            for mean, acc, count in zip(bin_means, bin_accuracies, bin_counts)
        )
        
        return {
            'bin_means': bin_means,
            'bin_accuracies': bin_accuracies,
            'bin_counts': bin_counts,
            'ece': float(ece)
        }
    
    @staticmethod
    def evaluate_model(y_true: List[int], y_pred: List[float]) -> Dict:
        """
        Compute all KT metrics.
        
        Returns:
            dict with all metrics
        """
        return {
            'auc': KTEvaluator.compute_auc(y_true, y_pred),
            'brier_score': KTEvaluator.compute_brier_score(y_true, y_pred),
            'accuracy': KTEvaluator.compute_accuracy(y_true, y_pred),
            'calibration': KTEvaluator.compute_calibration(y_true, y_pred)
        }


class RecommendationEvaluator:
    """
    Evaluate recommendation systems.
    """
    
    @staticmethod
    def compute_ndcg(ranked_items: List[str], 
                     relevant_items: List[str], 
                     k: Optional[int] = None) -> float:
        """
        Compute Normalized Discounted Cumulative Gain (NDCG@k).
        
        Args:
            ranked_items: list of item IDs in ranked order
            relevant_items: list of relevant item IDs
            k: cutoff (None = use all)
            
        Returns:
            NDCG score
        """
        if k:
            ranked_items = ranked_items[:k]
        
        if not ranked_items or not relevant_items:
            return 0.0
        
        # DCG
        dcg = 0.0
        for i, item in enumerate(ranked_items):
            if item in relevant_items:
                dcg += 1.0 / np.log2(i + 2)  # i+2 because position is 1-indexed
        
        # IDCG (ideal)
        idcg = sum(1.0 / np.log2(i + 2) for i in range(min(len(relevant_items), len(ranked_items))))
        
        return dcg / idcg if idcg > 0 else 0.0
    
    @staticmethod
    def compute_mrr(ranked_lists: List[List[str]], 
                    relevant_items: List[List[str]]) -> float:
        """
        Compute Mean Reciprocal Rank (MRR).
        
        Args:
            ranked_lists: list of ranked item lists (one per query)
            relevant_items: list of relevant item lists (one per query)
            
        Returns:
            MRR score
        """
        reciprocal_ranks = []
        
        for ranked, relevant in zip(ranked_lists, relevant_items):
            for i, item in enumerate(ranked):
                if item in relevant:
                    reciprocal_ranks.append(1.0 / (i + 1))
                    break
            else:
                reciprocal_ranks.append(0.0)
        
        return np.mean(reciprocal_ranks) if reciprocal_ranks else 0.0
    
    @staticmethod
    def compute_precision_at_k(ranked_items: List[str], 
                              relevant_items: List[str], 
                              k: int) -> float:
        """
        Compute Precision@k.
        
        Args:
            ranked_items: ranked list of items
            relevant_items: list of relevant items
            k: cutoff
            
        Returns:
            precision@k
        """
        top_k = ranked_items[:k]
        n_relevant = sum(1 for item in top_k if item in relevant_items)
        return n_relevant / k if k > 0 else 0.0
    
    @staticmethod
    def compute_recall_at_k(ranked_items: List[str],
                           relevant_items: List[str],
                           k: int) -> float:
        """
        Compute Recall@k.
        
        Args:
            ranked_items: ranked list of items
            relevant_items: list of relevant items
            k: cutoff
            
        Returns:
            recall@k
        """
        if not relevant_items:
            return 0.0
        
        top_k = ranked_items[:k]
        n_relevant = sum(1 for item in top_k if item in relevant_items)
        return n_relevant / len(relevant_items)


class LearningImpactEvaluator:
    """
    Evaluate learning impact (pre-post gains, time-to-mastery, etc.).
    """
    
    @staticmethod
    def compute_gain(pre_scores: List[float], post_scores: List[float]) -> Dict:
        """
        Compute learning gain metrics.
        
        Args:
            pre_scores: pre-test scores (0-1)
            post_scores: post-test scores (0-1)
            
        Returns:
            dict with absolute gain, normalized gain, effect size
        """
        pre = np.array(pre_scores)
        post = np.array(post_scores)
        
        # Absolute gain
        abs_gain = np.mean(post - pre)
        
        # Normalized gain (Hake's gain)
        # g = (post - pre) / (1 - pre)
        normalized_gains = []
        for p_pre, p_post in zip(pre, post):
            if p_pre < 1.0:
                g = (p_post - p_pre) / (1.0 - p_pre)
                normalized_gains.append(g)
        
        norm_gain = np.mean(normalized_gains) if normalized_gains else 0.0
        
        # Effect size (Cohen's d)
        if len(pre) > 1:
            pooled_std = np.sqrt((np.var(pre) + np.var(post)) / 2)
            effect_size = abs_gain / pooled_std if pooled_std > 0 else 0.0
        else:
            effect_size = 0.0
        
        return {
            'absolute_gain': float(abs_gain),
            'normalized_gain': float(norm_gain),
            'effect_size': float(effect_size),
            'n_students': len(pre)
        }
    
    @staticmethod
    def compute_time_to_mastery(attempts: List[Dict], 
                               mastery_threshold: float = 0.7) -> Optional[float]:
        """
        Compute time (or number of attempts) to reach mastery threshold.
        
        Args:
            attempts: list of attempts with 'timestamp' or index, and 'mastery' score
            mastery_threshold: threshold for mastery
            
        Returns:
            time/attempts to mastery, or None if not reached
        """
        for i, att in enumerate(attempts):
            if att.get('mastery', 0) >= mastery_threshold:
                return float(i + 1)  # return attempt number (1-indexed)
        
        return None  # mastery not reached
    
    @staticmethod
    def compute_retention_rate(students: List[Dict], 
                              retention_window_days: int = 7) -> float:
        """
        Compute retention rate (fraction of students who return).
        
        Args:
            students: list of student dicts with 'last_active_days_ago'
            retention_window_days: window to consider for retention
            
        Returns:
            retention rate (0-1)
        """
        if not students:
            return 0.0
        
        retained = sum(
            1 for s in students
            if s.get('last_active_days_ago', 999) <= retention_window_days
        )
        
        return retained / len(students)


class ExperimentRunner:
    """
    Run A/B experiments and statistical tests.
    """
    
    @staticmethod
    def compare_models(model_a_results: Dict, model_b_results: Dict) -> Dict:
        """
        Compare two models using multiple metrics.
        
        Args:
            model_a_results: dict with 'y_true' and 'y_pred'
            model_b_results: dict with 'y_true' and 'y_pred'
            
        Returns:
            comparison results
        """
        metrics_a = KTEvaluator.evaluate_model(
            model_a_results['y_true'],
            model_a_results['y_pred']
        )
        
        metrics_b = KTEvaluator.evaluate_model(
            model_b_results['y_true'],
            model_b_results['y_pred']
        )
        
        return {
            'model_a': metrics_a,
            'model_b': metrics_b,
            'improvement': {
                'auc': metrics_b['auc'] - metrics_a['auc'],
                'brier_score': metrics_a['brier_score'] - metrics_b['brier_score'],  # lower is better
                'accuracy': metrics_b['accuracy'] - metrics_a['accuracy']
            }
        }
    
    @staticmethod
    def bootstrap_ci(data: List[float], 
                    n_bootstrap: int = 1000, 
                    confidence: float = 0.95) -> Tuple[float, float]:
        """
        Compute bootstrap confidence interval.
        
        Args:
            data: sample data
            n_bootstrap: number of bootstrap samples
            confidence: confidence level
            
        Returns:
            (lower, upper) confidence interval
        """
        data = np.array(data)
        bootstrap_means = []
        
        for _ in range(n_bootstrap):
            sample = np.random.choice(data, size=len(data), replace=True)
            bootstrap_means.append(np.mean(sample))
        
        lower_percentile = (1 - confidence) / 2 * 100
        upper_percentile = (1 + confidence) / 2 * 100
        
        lower = np.percentile(bootstrap_means, lower_percentile)
        upper = np.percentile(bootstrap_means, upper_percentile)
        
        return float(lower), float(upper)


# CLI for running evaluations
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python evaluation.py <test_data.json>")
        print("Expected format: {'y_true': [...], 'y_pred': [...]}")
        sys.exit(1)
    
    # Load test data
    with open(sys.argv[1]) as f:
        data = json.load(f)
    
    y_true = data['y_true']
    y_pred = data['y_pred']
    
    # Evaluate
    results = KTEvaluator.evaluate_model(y_true, y_pred)
    
    print("=" * 50)
    print("Knowledge Tracing Evaluation Results")
    print("=" * 50)
    print(f"AUC: {results['auc']:.4f}")
    print(f"Brier Score: {results['brier_score']:.4f}")
    print(f"Accuracy: {results['accuracy']:.4f}")
    print(f"Expected Calibration Error: {results['calibration']['ece']:.4f}")
    print("=" * 50)

