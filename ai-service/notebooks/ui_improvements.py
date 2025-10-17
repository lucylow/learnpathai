# UI Improvement Helper Functions for DKT Training Notebook
# This file contains reusable visualization and formatting functions

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import roc_curve, confusion_matrix, precision_recall_curve

# Optional imports with fallbacks
try:
    import seaborn as sns
    HAS_SEABORN = True
except ImportError:
    HAS_SEABORN = False
    print("⚠️  seaborn not available - using matplotlib defaults")

try:
    from IPython.display import HTML, display
    HAS_IPYTHON = True
except ImportError:
    HAS_IPYTHON = False
    print("⚠️  IPython.display not available - HTML output disabled")
    # Fallback display function
    def display(obj):
        print(obj)
    def HTML(text):
        return text

def create_metrics_dashboard(metrics_dict, model_name="Model"):
    """Create a beautiful HTML dashboard for model metrics"""
    auc = metrics_dict['auc']
    brier = metrics_dict['brier_score']
    acc = metrics_dict['accuracy']
    
    # Choose colors based on performance
    auc_color = '#10b981' if auc > 0.75 else '#f59e0b' if auc > 0.65 else '#ef4444'
    brier_color = '#10b981' if brier < 0.20 else '#f59e0b' if brier < 0.25 else '#ef4444'
    acc_color = '#10b981' if acc > 0.75 else '#f59e0b' if acc > 0.65 else '#ef4444'
    
    html = f"""
    <div style='display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap;'>
        <div style='flex: 1; min-width: 200px; background: linear-gradient(135deg, {auc_color} 0%, {auc_color}dd 100%); 
                    padding: 25px; border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
            <div style='font-size: 14px; opacity: 0.9; margin-bottom: 8px;'>📊 AUC Score</div>
            <div style='font-size: 36px; font-weight: bold;'>{auc:.4f}</div>
            <div style='font-size: 12px; opacity: 0.8; margin-top: 8px;'>
                {'🌟 Excellent' if auc > 0.80 else '✨ Good' if auc > 0.70 else '📚 Fair'}
            </div>
        </div>
        
        <div style='flex: 1; min-width: 200px; background: linear-gradient(135deg, {brier_color} 0%, {brier_color}dd 100%); 
                    padding: 25px; border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
            <div style='font-size: 14px; opacity: 0.9; margin-bottom: 8px;'>🎯 Brier Score</div>
            <div style='font-size: 36px; font-weight: bold;'>{brier:.4f}</div>
            <div style='font-size: 12px; opacity: 0.8; margin-top: 8px;'>Lower is better</div>
        </div>
        
        <div style='flex: 1; min-width: 200px; background: linear-gradient(135deg, {acc_color} 0%, {acc_color}dd 100%); 
                    padding: 25px; border-radius: 12px; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
            <div style='font-size: 14px; opacity: 0.9; margin-bottom: 8px;'>✓ Accuracy</div>
            <div style='font-size: 36px; font-weight: bold;'>{acc*100:.1f}%</div>
            <div style='font-size: 12px; opacity: 0.8; margin-top: 8px;'>{int(acc*100)}/100 correct</div>
        </div>
    </div>
    """
    display(HTML(html))


def plot_model_comparison_advanced(dkt_metrics, beta_metrics):
    """Create an enhanced comparison visualization"""
    fig = plt.figure(figsize=(16, 10))
    gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
    
    # Color scheme
    dkt_color = '#667eea'
    beta_color = '#f093fb'
    
    # 1. Metrics Comparison (Top Row)
    ax1 = fig.add_subplot(gs[0, :])
    metrics = ['AUC', 'Accuracy', 'Precision', 'Recall', 'F1']
    dkt_vals = [
        dkt_metrics['auc'],
        dkt_metrics['accuracy'],
        dkt_metrics.get('precision', dkt_metrics['accuracy']),
        dkt_metrics.get('recall', dkt_metrics['accuracy']),
        dkt_metrics.get('f1', dkt_metrics['accuracy'])
    ]
    beta_vals = [
        beta_metrics['auc'],
        beta_metrics['accuracy'],
        beta_metrics.get('precision', beta_metrics['accuracy']),
        beta_metrics.get('recall', beta_metrics['accuracy']),
        beta_metrics.get('f1', beta_metrics['accuracy'])
    ]
    
    x = np.arange(len(metrics))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, dkt_vals, width, label='DKT (Neural)', 
                    color=dkt_color, edgecolor='white', linewidth=2)
    bars2 = ax1.bar(x + width/2, beta_vals, width, label='Beta-KT (Baseline)', 
                    color=beta_color, edgecolor='white', linewidth=2)
    
    ax1.set_ylabel('Score', fontsize=12, fontweight='bold')
    ax1.set_title('🏆 Comprehensive Model Comparison', fontsize=14, fontweight='bold', pad=20)
    ax1.set_xticks(x)
    ax1.set_xticklabels(metrics)
    ax1.legend(frameon=True, fancybox=True, shadow=True)
    ax1.set_ylim([0, 1.1])
    ax1.grid(axis='y', alpha=0.3, linestyle='--')
    ax1.axhline(y=0.7, color='green', linestyle='--', alpha=0.3, label='Good threshold')
    
    # Add value labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.3f}',
                    ha='center', va='bottom', fontsize=9)
    
    # 2. Improvement Percentage (Bottom Left)
    ax2 = fig.add_subplot(gs[1, 0])
    improvements = [(d - b) / b * 100 if b > 0 else 0 
                   for d, b in zip(dkt_vals, beta_vals)]
    colors = [dkt_color if imp > 0 else beta_color for imp in improvements]
    bars = ax2.barh(metrics, improvements, color=colors, alpha=0.7, edgecolor='white', linewidth=2)
    ax2.set_xlabel('Improvement (%)', fontsize=11, fontweight='bold')
    ax2.set_title('📈 DKT vs Baseline', fontsize=12, fontweight='bold')
    ax2.axvline(x=0, color='black', linestyle='-', linewidth=1)
    ax2.grid(axis='x', alpha=0.3)
    
    # Add value labels
    for i, (bar, val) in enumerate(zip(bars, improvements)):
        x_pos = val + (1 if val > 0 else -1)
        ax2.text(x_pos, i, f'{val:+.1f}%', va='center', 
                ha='left' if val > 0 else 'right', fontsize=9, fontweight='bold')
    
    # 3. Brier Score Comparison (Bottom Middle)
    ax3 = fig.add_subplot(gs[1, 1])
    brier_data = [dkt_metrics['brier_score'], beta_metrics['brier_score']]
    bars = ax3.bar(['DKT', 'Beta-KT'], brier_data, 
                   color=[dkt_color, beta_color], alpha=0.8, edgecolor='white', linewidth=2)
    ax3.set_ylabel('Brier Score', fontsize=11, fontweight='bold')
    ax3.set_title('🎯 Calibration (Lower is Better)', fontsize=12, fontweight='bold')
    ax3.set_ylim([0, max(brier_data) * 1.3])
    ax3.grid(axis='y', alpha=0.3)
    
    # Add value labels
    for bar in bars:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.4f}',
                ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    # 4. Performance Rating (Bottom Right)
    ax4 = fig.add_subplot(gs[1, 2])
    ax4.axis('off')
    
    # Calculate overall score
    dkt_score = np.mean([dkt_metrics['auc'], dkt_metrics['accuracy'], 1 - dkt_metrics['brier_score']])
    beta_score = np.mean([beta_metrics['auc'], beta_metrics['accuracy'], 1 - beta_metrics['brier_score']])
    
    rating_text = f"""
    Overall Performance Rating:
    
    🧠 DKT Neural Network
    Score: {dkt_score*100:.1f}/100
    {'⭐' * int(dkt_score * 5)} ({int(dkt_score * 5)}/5 stars)
    
    📊 Beta-KT Baseline
    Score: {beta_score*100:.1f}/100
    {'⭐' * int(beta_score * 5)} ({int(beta_score * 5)}/5 stars)
    
    Winner: {'🏆 DKT' if dkt_score > beta_score else '🏆 Beta-KT'}
    Margin: {abs(dkt_score - beta_score)*100:.1f} points
    """
    
    ax4.text(0.5, 0.5, rating_text, transform=ax4.transAxes,
            fontsize=11, verticalalignment='center', horizontalalignment='center',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3, pad=1))
    
    # 5. Summary Stats Table (Bottom)
    ax5 = fig.add_subplot(gs[2, :])
    ax5.axis('tight')
    ax5.axis('off')
    
    table_data = [
        ['Metric', 'DKT', 'Beta-KT', 'Difference', 'Winner'],
        ['AUC', f"{dkt_metrics['auc']:.4f}", f"{beta_metrics['auc']:.4f}", 
         f"{dkt_metrics['auc'] - beta_metrics['auc']:+.4f}", 
         '🥇 DKT' if dkt_metrics['auc'] > beta_metrics['auc'] else '🥇 Beta-KT'],
        ['Brier Score', f"{dkt_metrics['brier_score']:.4f}", f"{beta_metrics['brier_score']:.4f}", 
         f"{dkt_metrics['brier_score'] - beta_metrics['brier_score']:+.4f}",
         '🥇 DKT' if dkt_metrics['brier_score'] < beta_metrics['brier_score'] else '🥇 Beta-KT'],
        ['Accuracy', f"{dkt_metrics['accuracy']:.4f}", f"{beta_metrics['accuracy']:.4f}", 
         f"{dkt_metrics['accuracy'] - beta_metrics['accuracy']:+.4f}",
         '🥇 DKT' if dkt_metrics['accuracy'] > beta_metrics['accuracy'] else '🥇 Beta-KT'],
    ]
    
    table = ax5.table(cellText=table_data, cellLoc='center', loc='center',
                     colWidths=[0.2, 0.15, 0.15, 0.15, 0.15])
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2)
    
    # Style header row
    for i in range(5):
        table[(0, i)].set_facecolor('#667eea')
        table[(0, i)].set_text_props(weight='bold', color='white')
    
    # Style data rows
    for i in range(1, 4):
        for j in range(5):
            table[(i, j)].set_facecolor('#f8f9fa' if i % 2 == 0 else 'white')
    
    plt.suptitle('🎓 Deep Knowledge Tracing: Comprehensive Evaluation Dashboard', 
                fontsize=16, fontweight='bold', y=0.98)
    
    return fig


def plot_roc_curves(y_true, y_pred_dkt, y_pred_beta):
    """Plot ROC curves for both models"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # DKT ROC Curve
    fpr_dkt, tpr_dkt, _ = roc_curve(y_true, y_pred_dkt)
    ax1.plot(fpr_dkt, tpr_dkt, color='#667eea', linewidth=3, label='DKT')
    ax1.plot([0, 1], [0, 1], 'k--', linewidth=1, label='Random Guess')
    ax1.fill_between(fpr_dkt, tpr_dkt, alpha=0.3, color='#667eea')
    ax1.set_xlabel('False Positive Rate', fontsize=12, fontweight='bold')
    ax1.set_ylabel('True Positive Rate', fontsize=12, fontweight='bold')
    ax1.set_title('🧠 DKT ROC Curve', fontsize=13, fontweight='bold')
    ax1.legend(frameon=True, shadow=True)
    ax1.grid(alpha=0.3)
    ax1.set_xlim([0, 1])
    ax1.set_ylim([0, 1])
    
    # Beta-KT ROC Curve  
    fpr_beta, tpr_beta, _ = roc_curve(y_true, y_pred_beta)
    ax2.plot(fpr_beta, tpr_beta, color='#f093fb', linewidth=3, label='Beta-KT')
    ax2.plot([0, 1], [0, 1], 'k--', linewidth=1, label='Random Guess')
    ax2.fill_between(fpr_beta, tpr_beta, alpha=0.3, color='#f093fb')
    ax2.set_xlabel('False Positive Rate', fontsize=12, fontweight='bold')
    ax2.set_ylabel('True Positive Rate', fontsize=12, fontweight='bold')
    ax2.set_title('📊 Beta-KT ROC Curve', fontsize=13, fontweight='bold')
    ax2.legend(frameon=True, shadow=True)
    ax2.grid(alpha=0.3)
    ax2.set_xlim([0, 1])
    ax2.set_ylim([0, 1])
    
    plt.tight_layout()
    return fig


def create_learning_path_visualization(path):
    """Create an enhanced visualization for learning paths"""
    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    
    # Get data
    concepts = [node.concept.name for node in path.nodes[:8]]  # Top 8 concepts
    current = [node.current_mastery * 100 for node in path.nodes[:8]]
    target = [node.target_mastery * 100 for node in path.nodes[:8]]
    status_colors = {
        'completed': '#10b981',
        'in_progress': '#f59e0b', 
        'not_started': '#6b7280',
        'locked': '#ef4444'
    }
    colors = [status_colors.get(node.status, '#6b7280') for node in path.nodes[:8]]
    
    # 1. Mastery Progress (Top Left)
    ax1 = axes[0, 0]
    x = np.arange(len(concepts))
    width = 0.35
    
    bars1 = ax1.barh(x - width/2, current, width, label='Current', color=colors, alpha=0.8)
    bars2 = ax1.barh(x + width/2, target, width, label='Target', color='lightgray', alpha=0.5)
    
    ax1.set_xlabel('Mastery %', fontsize=11, fontweight='bold')
    ax1.set_title(f'📊 Concept Mastery Progress\nUser: {path.user_id}', 
                 fontsize=12, fontweight='bold')
    ax1.set_yticks(x)
    ax1.set_yticklabels(concepts, fontsize=9)
    ax1.legend()
    ax1.set_xlim([0, 100])
    ax1.grid(axis='x', alpha=0.3)
    
    # Add value labels
    for i, (bar, val) in enumerate(zip(bars1, current)):
        ax1.text(val + 2, bar.get_y() + bar.get_height()/2, f'{val:.0f}%',
                va='center', fontsize=8)
    
    # 2. Status Distribution (Top Right)
    ax2 = axes[0, 1]
    status_counts = {}
    for node in path.nodes:
        status_counts[node.status] = status_counts.get(node.status, 0) + 1
    
    wedges, texts, autotexts = ax2.pie(
        status_counts.values(), 
        labels=[s.replace('_', ' ').title() for s in status_counts.keys()],
        colors=[status_colors.get(s, '#6b7280') for s in status_counts.keys()],
        autopct='%1.1f%%',
        startangle=90,
        textprops={'fontsize': 10, 'weight': 'bold'}
    )
    ax2.set_title('📈 Learning Status Distribution', fontsize=12, fontweight='bold')
    
    # 3. Time Estimation (Bottom Left)
    ax3 = axes[1, 0]
    time_by_concept = []
    for node in path.nodes[:8]:
        total_time = sum(r.duration_minutes for r in node.recommended_resources[:3])
        time_by_concept.append(total_time)
    
    bars = ax3.bar(range(len(concepts)), time_by_concept, color=colors, alpha=0.8, 
                   edgecolor='white', linewidth=2)
    ax3.set_xlabel('Concepts', fontsize=11, fontweight='bold')
    ax3.set_ylabel('Estimated Time (minutes)', fontsize=11, fontweight='bold')
    ax3.set_title('⏱️  Time Investment per Concept', fontsize=12, fontweight='bold')
    ax3.set_xticks(range(len(concepts)))
    ax3.set_xticklabels([c[:15] for c in concepts], rotation=45, ha='right', fontsize=8)
    ax3.grid(axis='y', alpha=0.3)
    
    # Add value labels
    for bar in bars:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}m',
                ha='center', va='bottom', fontsize=8)
    
    # 4. Overall Progress Card (Bottom Right)
    ax4 = axes[1, 1]
    ax4.axis('off')
    
    # Calculate stats
    total_concepts = len(path.nodes)
    completed = sum(1 for n in path.nodes if n.status == 'completed')
    in_progress = sum(1 for n in path.nodes if n.status == 'in_progress')
    total_time = path.metadata.get('estimated_total_hours', 0)
    
    stats_text = f"""
    🎯 Learning Path Summary
    
    User: {path.user_id}
    Subject: {path.subject.title()}
    Goal: {path.metadata.get('learning_goal', 'Not specified')}
    
    Progress:
    • Total Concepts: {total_concepts}
    • Completed: {completed} ({completed/total_concepts*100:.0f}%)
    • In Progress: {in_progress}
    • Overall Mastery: {path.overall_mastery*100:.1f}%
    
    Time Investment:
    • Estimated Total: {total_time:.1f} hours
    • Learning Style: {path.metadata.get('learning_style', 'Not specified')}
    
    Status: {'🎉 Almost There!' if path.overall_mastery > 0.7 else '💪 Keep Going!' if path.overall_mastery > 0.4 else '🚀 Just Started!'}
    """
    
    ax4.text(0.5, 0.5, stats_text, transform=ax4.transAxes,
            fontsize=11, verticalalignment='center', horizontalalignment='center',
            family='monospace',
            bbox=dict(boxstyle='round,pad=1', facecolor='#f8f9fa', 
                     edgecolor='#667eea', linewidth=3, alpha=0.8))
    
    plt.suptitle(f'🎓 Personalized Learning Path Dashboard', 
                fontsize=16, fontweight='bold')
    plt.tight_layout()
    
    return fig


def create_data_summary_table(data):
    """Create a styled pandas table summarizing the dataset"""
    # Calculate statistics
    stats = []
    for i, student in enumerate(data[:5]):  # First 5 students
        attempts = student['attempts']
        correct = sum(1 for a in attempts if a['correct'])
        stats.append({
            'Student ID': f'Student {i+1}',
            'Total Attempts': len(attempts),
            'Correct': correct,
            'Incorrect': len(attempts) - correct,
            'Accuracy': f"{correct/len(attempts)*100:.1f}%",
            'Avg Question': f"{np.mean([a['question_id'] for a in attempts]):.1f}"
        })
    
    df = pd.DataFrame(stats)
    
    # Style the dataframe
    styled_df = df.style.set_properties(**{
        'background-color': '#f8f9fa',
        'color': '#1f2937',
        'border-color': 'white',
        'text-align': 'center',
        'font-size': '11px'
    }).set_table_styles([
        {'selector': 'th', 'props': [
            ('background-color', '#667eea'),
            ('color', 'white'),
            ('font-weight', 'bold'),
            ('text-align', 'center'),
            ('font-size', '12px'),
            ('padding', '10px')
        ]},
        {'selector': 'td', 'props': [
            ('padding', '8px')
        ]},
        {'selector': 'tr:hover', 'props': [
            ('background-color', '#e5e7eb')
        ]}
    ]).background_gradient(subset=['Total Attempts'], cmap='Blues', vmin=10, vmax=60)
    
    return styled_df

print("✅ UI improvement functions loaded successfully!")
print("📊 Available functions:")
print("  • create_metrics_dashboard()")
print("  • plot_model_comparison_advanced()")
print("  • plot_roc_curves()")
print("  • create_learning_path_visualization()")
print("  • create_data_summary_table()")

