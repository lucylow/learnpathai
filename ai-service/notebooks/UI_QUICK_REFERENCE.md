# 🎨 UI Improvements Quick Reference

## 🚀 Quick Start

```python
# 1. Import UI functions (already in notebook)
from ui_improvements import *

# 2. Display metrics dashboard
create_metrics_dashboard(metrics_dict, "Model Name")

# 3. Create comparison visualization
plot_model_comparison_advanced(dkt_metrics, beta_metrics)

# 4. Show ROC curves
plot_roc_curves(y_true, y_pred_dkt, y_pred_beta)

# 5. Visualize learning path
create_learning_path_visualization(path)
```

---

## 🎨 Color Palette

| Purpose | Color | Hex Code |
|---------|-------|----------|
| Primary | 🟣 Purple | `#667eea` |
| Accent | 🟪 Violet | `#764ba2` |
| Success | 🟢 Green | `#10b981` |
| Info | 🔵 Blue | `#4facfe` |
| Warning | 🟡 Orange | `#f59e0b` |
| Error | 🔴 Red | `#ef4444` |

---

## 📊 Dashboard Components

### Metrics Dashboard
```python
create_metrics_dashboard(metrics, "Model Name")
```
**Displays**: AUC, Brier Score, Accuracy with color-coded performance

### Comparison Chart
```python
fig = plot_model_comparison_advanced(dkt_metrics, beta_metrics)
plt.show()
```
**Displays**: 6-panel comprehensive comparison

### Learning Path Dashboard
```python
fig = create_learning_path_visualization(path)
plt.show()
```
**Displays**: 4-panel progress visualization

---

## 🎯 HTML Banner Templates

### Success Banner
```python
display(HTML("""
<div style='background: #f0fdf4; border: 2px solid #86efac; 
            padding: 15px; border-radius: 8px; color: #15803d;'>
    <strong>✅ Success!</strong> Your message here
</div>
"""))
```

### Info Banner
```python
display(HTML("""
<div style='background: #e0f2fe; border-left: 5px solid #0284c7; 
            padding: 15px; border-radius: 5px; color: #0369a1;'>
    <strong>ℹ️ Info:</strong> Your message here
</div>
"""))
```

### Gradient Header
```python
display(HTML("""
<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 20px; border-radius: 12px; color: white; text-align: center;'>
    <h2 style='margin: 0;'>🎯 Your Title</h2>
    <p style='margin: 10px 0 0 0;'>Subtitle text</p>
</div>
"""))
```

---

## 📈 Chart Styling Quick Tips

### Bar Charts
```python
ax.bar(x, y, color='#667eea', alpha=0.8, edgecolor='white', linewidth=2)
ax.set_ylim([0, max_value * 1.2])  # Add 20% padding
ax.grid(axis='y', alpha=0.3)
```

### Line Charts
```python
ax.plot(x, y, color='#667eea', linewidth=3, label='Data')
ax.fill_between(x, y, alpha=0.3, color='#667eea')
ax.legend(frameon=True, shadow=True)
```

### Pie Charts
```python
colors = ['#667eea', '#f093fb', '#10b981']
plt.pie(values, labels=labels, colors=colors, autopct='%1.1f%%', 
        startangle=90, textprops={'fontsize': 10, 'weight': 'bold'})
```

---

## 🎨 Styled Tables

```python
styled_df = df.style.set_properties(**{
    'background-color': '#f8f9fa',
    'text-align': 'center',
    'font-size': '11px'
}).set_table_styles([
    {'selector': 'th', 'props': [
        ('background-color', '#667eea'),
        ('color', 'white'),
        ('font-weight', 'bold')
    ]}
]).background_gradient(subset=['NumericColumn'], cmap='Blues')

display(styled_df)
```

---

## 🔧 Matplotlib Settings

```python
# Set at the beginning of notebook
plt.style.use('seaborn-v0_8-darkgrid')
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = '#f8f9fa'
plt.rcParams['font.size'] = 11
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['axes.titlesize'] = 14
```

---

## 🎯 Performance Thresholds

| Metric | Excellent | Good | Fair |
|--------|-----------|------|------|
| AUC | > 0.80 | 0.70-0.80 | 0.60-0.70 |
| Brier | < 0.15 | 0.15-0.20 | 0.20-0.25 |
| Accuracy | > 0.80 | 0.70-0.80 | 0.60-0.70 |

---

## 📦 Essential Imports

```python
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from IPython.display import display, HTML, Markdown
from ui_improvements import (
    create_metrics_dashboard,
    plot_model_comparison_advanced,
    plot_roc_curves,
    create_learning_path_visualization,
    create_data_summary_table
)
```

---

## 🎬 Common Patterns

### Progress Indicator
```python
def show_progress(current, total, message):
    bar_length = 30
    filled = int(bar_length * current / total)
    bar = '█' * filled + '░' * (bar_length - filled)
    percent = 100 * current / total
    print(f"\r[{bar}] {percent:.0f}% - {message}", end='')
    if current == total:
        print()
```

### Metric Card Grid
```python
display(HTML(f"""
<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 15px; margin: 20px 0;'>
    <div style='background: white; padding: 20px; border-radius: 10px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
        <h4>Metric 1</h4>
        <p style='font-size: 24px; font-weight: bold;'>{value1}</p>
    </div>
    <!-- More cards -->
</div>
"""))
```

---

## 🐛 Quick Fixes

### Issue: Plots not showing
```python
%matplotlib inline
plt.show()
```

### Issue: HTML not rendering
```python
from IPython.display import display, HTML
display(HTML("..."))  # Use display(), not just HTML()
```

### Issue: Colors look different
```python
# Use exact hex codes with #
color='#667eea'  # ✅ Correct
color='667eea'   # ❌ Wrong
```

---

## 📐 Standard Figure Sizes

| Type | Size (width, height) | Use Case |
|------|---------------------|----------|
| Small | (10, 5) | Single chart |
| Medium | (14, 6) | Two charts side-by-side |
| Large | (16, 10) | Multi-panel dashboard |
| Wide | (18, 5) | Timeline or sequence |

---

## 🎨 Emoji Reference

| Category | Emojis |
|----------|--------|
| Status | ✅ ⚠️ ❌ 🔄 ⏸️ |
| Metrics | 📊 📈 📉 🎯 📐 |
| Learning | 🎓 📚 ✏️ 🧠 💡 |
| Tech | 🔧 ⚙️ 🖥️ 🚀 💻 |
| Success | 🎉 ⭐ 🏆 💎 ✨ |

---

## 🔗 Quick Links

- [Full Guide](./UI_IMPROVEMENTS_GUIDE.md)
- [ui_improvements.py](./ui_improvements.py)
- [Main Notebook](./dkt_training.ipynb)

---

**Pro Tip**: Keep this reference open in a split screen while working on the notebook!

---

*Last Updated: Oct 17, 2025*

