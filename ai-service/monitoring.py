# ai-service/monitoring.py
"""
Model monitoring and drift detection utilities.
- Input distribution monitoring
- Performance tracking
- Drift detection (KS test, PSI)
- Alert system
"""
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import json
from pathlib import Path
from scipy import stats


class DistributionMonitor:
    """
    Monitor input distributions and detect drift.
    """
    
    def __init__(self, reference_data: Optional[Dict] = None):
        """
        Args:
            reference_data: reference distribution statistics
        """
        self.reference_data = reference_data or {}
        self.history = []
    
    def update_reference(self, data: List[float], feature_name: str):
        """
        Update reference distribution for a feature.
        
        Args:
            data: sample data
            feature_name: feature identifier
        """
        self.reference_data[feature_name] = {
            'mean': float(np.mean(data)),
            'std': float(np.std(data)),
            'min': float(np.min(data)),
            'max': float(np.max(data)),
            'percentiles': {
                '25': float(np.percentile(data, 25)),
                '50': float(np.percentile(data, 50)),
                '75': float(np.percentile(data, 75))
            },
            'n_samples': len(data),
            'timestamp': datetime.now().isoformat()
        }
    
    def detect_drift_ks(self, current_data: List[float], 
                       feature_name: str,
                       alpha: float = 0.05) -> Dict:
        """
        Detect drift using Kolmogorov-Smirnov test.
        
        Args:
            current_data: current sample
            feature_name: feature name
            alpha: significance level
            
        Returns:
            dict with test results and drift detected flag
        """
        if feature_name not in self.reference_data:
            return {'error': 'No reference data for this feature'}
        
        # Generate reference sample from stored statistics
        ref_stats = self.reference_data[feature_name]
        ref_mean = ref_stats['mean']
        ref_std = ref_stats['std']
        
        # Use stored samples if available, otherwise generate synthetic
        # In practice, you'd store the actual reference data
        n_ref = ref_stats.get('n_samples', 1000)
        reference_sample = np.random.normal(ref_mean, ref_std, n_ref)
        
        # KS test
        statistic, p_value = stats.ks_2samp(reference_sample, current_data)
        
        drift_detected = p_value < alpha
        
        result = {
            'feature': feature_name,
            'test': 'kolmogorov-smirnov',
            'statistic': float(statistic),
            'p_value': float(p_value),
            'drift_detected': drift_detected,
            'alpha': alpha,
            'timestamp': datetime.now().isoformat()
        }
        
        self.history.append(result)
        
        return result
    
    def compute_psi(self, current_data: List[float],
                   feature_name: str,
                   n_bins: int = 10) -> Dict:
        """
        Compute Population Stability Index (PSI).
        
        PSI = sum((actual% - expected%) * ln(actual% / expected%))
        
        Interpretation:
        - PSI < 0.1: no significant change
        - 0.1 <= PSI < 0.2: moderate change
        - PSI >= 0.2: significant drift
        
        Args:
            current_data: current sample
            feature_name: feature name
            n_bins: number of bins for histogram
            
        Returns:
            dict with PSI score and interpretation
        """
        if feature_name not in self.reference_data:
            return {'error': 'No reference data'}
        
        ref_stats = self.reference_data[feature_name]
        
        # Create bins based on reference percentiles
        bin_edges = np.linspace(ref_stats['min'], ref_stats['max'], n_bins + 1)
        
        # Compute expected distribution (reference)
        # Use uniform for simplicity (in practice, store actual histogram)
        expected_pct = np.ones(n_bins) / n_bins
        
        # Compute actual distribution (current)
        actual_counts, _ = np.histogram(current_data, bins=bin_edges)
        actual_pct = actual_counts / (actual_counts.sum() + 1e-10)
        
        # PSI calculation
        psi = 0.0
        for exp, act in zip(expected_pct, actual_pct):
            if act > 0 and exp > 0:
                psi += (act - exp) * np.log(act / exp)
        
        # Interpretation
        if psi < 0.1:
            interpretation = 'no_change'
        elif psi < 0.2:
            interpretation = 'moderate_change'
        else:
            interpretation = 'significant_drift'
        
        return {
            'feature': feature_name,
            'psi': float(psi),
            'interpretation': interpretation,
            'timestamp': datetime.now().isoformat()
        }
    
    def save(self, path: str):
        """Save reference data and history."""
        with open(path, 'w') as f:
            json.dump({
                'reference_data': self.reference_data,
                'history': self.history
            }, f, indent=2)
    
    def load(self, path: str):
        """Load reference data and history."""
        with open(path) as f:
            data = json.load(f)
            self.reference_data = data['reference_data']
            self.history = data.get('history', [])


class PerformanceTracker:
    """
    Track model performance over time.
    """
    
    def __init__(self, metrics_file: Optional[str] = None):
        """
        Args:
            metrics_file: path to JSON file for storing metrics
        """
        self.metrics_file = metrics_file
        self.metrics_history = []
        
        if metrics_file and Path(metrics_file).exists():
            self.load()
    
    def log_metrics(self, metrics: Dict, model_name: str = 'default'):
        """
        Log performance metrics.
        
        Args:
            metrics: dict of metric_name -> value
            model_name: identifier for the model
        """
        entry = {
            'timestamp': datetime.now().isoformat(),
            'model': model_name,
            'metrics': metrics
        }
        
        self.metrics_history.append(entry)
        
        if self.metrics_file:
            self.save()
    
    def get_recent_metrics(self, n: int = 10, model_name: Optional[str] = None) -> List[Dict]:
        """
        Get recent metrics.
        
        Args:
            n: number of recent entries
            model_name: filter by model name
            
        Returns:
            list of metric entries
        """
        filtered = self.metrics_history
        
        if model_name:
            filtered = [m for m in filtered if m['model'] == model_name]
        
        return filtered[-n:]
    
    def detect_performance_drop(self, 
                               metric_name: str,
                               threshold: float,
                               window: int = 5,
                               model_name: Optional[str] = None) -> Dict:
        """
        Detect if performance has dropped below threshold.
        
        Args:
            metric_name: metric to monitor
            threshold: alert threshold
            window: number of recent evaluations to check
            model_name: filter by model
            
        Returns:
            dict with alert status
        """
        recent = self.get_recent_metrics(window, model_name)
        
        if not recent:
            return {'alert': False, 'reason': 'insufficient_data'}
        
        values = [
            m['metrics'].get(metric_name)
            for m in recent
            if metric_name in m['metrics']
        ]
        
        if not values:
            return {'alert': False, 'reason': 'metric_not_found'}
        
        recent_avg = np.mean(values)
        
        if recent_avg < threshold:
            return {
                'alert': True,
                'metric': metric_name,
                'recent_avg': float(recent_avg),
                'threshold': threshold,
                'message': f'{metric_name} dropped to {recent_avg:.4f} (threshold: {threshold})'
            }
        
        return {'alert': False}
    
    def save(self):
        """Save metrics history to file."""
        if self.metrics_file:
            Path(self.metrics_file).parent.mkdir(parents=True, exist_ok=True)
            with open(self.metrics_file, 'w') as f:
                json.dump(self.metrics_history, f, indent=2)
    
    def load(self):
        """Load metrics history from file."""
        if self.metrics_file and Path(self.metrics_file).exists():
            with open(self.metrics_file) as f:
                self.metrics_history = json.load(f)


class AlertManager:
    """
    Manage alerts and notifications.
    """
    
    def __init__(self, alert_log: str = 'alerts.json'):
        """
        Args:
            alert_log: path to alert log file
        """
        self.alert_log = alert_log
        self.alerts = []
        
        if Path(alert_log).exists():
            with open(alert_log) as f:
                self.alerts = json.load(f)
    
    def trigger_alert(self, alert_type: str, message: str, 
                     severity: str = 'warning', metadata: Optional[Dict] = None):
        """
        Trigger an alert.
        
        Args:
            alert_type: type of alert (drift, performance, etc.)
            message: alert message
            severity: 'info', 'warning', or 'critical'
            metadata: additional context
        """
        alert = {
            'timestamp': datetime.now().isoformat(),
            'type': alert_type,
            'severity': severity,
            'message': message,
            'metadata': metadata or {},
            'acknowledged': False
        }
        
        self.alerts.append(alert)
        self._save()
        
        # In production, send to Slack/email/PagerDuty
        print(f"[ALERT] [{severity.upper()}] {alert_type}: {message}")
    
    def acknowledge_alert(self, index: int):
        """Mark alert as acknowledged."""
        if 0 <= index < len(self.alerts):
            self.alerts[index]['acknowledged'] = True
            self.alerts[index]['acknowledged_at'] = datetime.now().isoformat()
            self._save()
    
    def get_unacknowledged(self) -> List[Dict]:
        """Get all unacknowledged alerts."""
        return [a for a in self.alerts if not a.get('acknowledged', False)]
    
    def _save(self):
        """Save alerts to file."""
        Path(self.alert_log).parent.mkdir(parents=True, exist_ok=True)
        with open(self.alert_log, 'w') as f:
            json.dump(self.alerts, f, indent=2)


class MonitoringDashboard:
    """
    Unified monitoring dashboard.
    """
    
    def __init__(self, 
                 dist_monitor: DistributionMonitor,
                 perf_tracker: PerformanceTracker,
                 alert_manager: AlertManager):
        self.dist_monitor = dist_monitor
        self.perf_tracker = perf_tracker
        self.alert_manager = alert_manager
    
    def run_health_check(self) -> Dict:
        """
        Run comprehensive health check.
        
        Returns:
            health status report
        """
        # Check performance
        recent_metrics = self.perf_tracker.get_recent_metrics(n=5)
        
        if recent_metrics:
            latest = recent_metrics[-1]['metrics']
            
            # Check for performance drops
            auc_drop = self.perf_tracker.detect_performance_drop(
                'auc', threshold=0.65, window=5
            )
            
            if auc_drop.get('alert'):
                self.alert_manager.trigger_alert(
                    'performance_drop',
                    auc_drop['message'],
                    severity='warning'
                )
        else:
            latest = {}
        
        # Check for unacknowledged alerts
        unack_alerts = self.alert_manager.get_unacknowledged()
        
        return {
            'status': 'healthy' if not unack_alerts else 'needs_attention',
            'latest_metrics': latest,
            'unacknowledged_alerts': len(unack_alerts),
            'alerts_summary': unack_alerts[:5],  # show top 5
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_report(self) -> str:
        """Generate text report."""
        health = self.run_health_check()
        
        report = "=" * 60 + "\n"
        report += "LEARNPATH AI - MONITORING REPORT\n"
        report += "=" * 60 + "\n"
        report += f"Status: {health['status'].upper()}\n"
        report += f"Timestamp: {health['timestamp']}\n"
        report += "\n"
        
        if health['latest_metrics']:
            report += "Latest Metrics:\n"
            for k, v in health['latest_metrics'].items():
                report += f"  {k}: {v:.4f}\n"
        
        report += "\n"
        report += f"Unacknowledged Alerts: {health['unacknowledged_alerts']}\n"
        
        if health['alerts_summary']:
            report += "\nRecent Alerts:\n"
            for alert in health['alerts_summary']:
                report += f"  [{alert['severity']}] {alert['type']}: {alert['message']}\n"
        
        report += "=" * 60 + "\n"
        
        return report


# CLI for monitoring
if __name__ == '__main__':
    # Example: initialize monitoring system
    dist_monitor = DistributionMonitor()
    perf_tracker = PerformanceTracker('metrics.json')
    alert_manager = AlertManager('alerts.json')
    
    dashboard = MonitoringDashboard(dist_monitor, perf_tracker, alert_manager)
    
    # Run health check
    report = dashboard.generate_report()
    print(report)

