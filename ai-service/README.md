# LearnPath AI - AI Service

**Advanced Knowledge Tracing & Recommendation System**

This service provides intelligent, adaptive learning path recommendations powered by:
- 🧠 **Deep Knowledge Tracing (DKT)** - LSTM-based student modeling
- 📊 **Beta-Bernoulli KT** - Fast, explainable baseline
- 🎯 **Hybrid Resource Ranking** - Multi-signal recommendation
- 💬 **RAG Explanations** - LLM-powered explanations with retrieval
- 🎬 **Content Intelligence** - Whisper ASR + concept extraction
- 📈 **Evaluation & Monitoring** - Production-ready metrics

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

**Optional dependencies:**
- Whisper ASR: `pip install openai-whisper ffmpeg-python`
- OpenAI API: `pip install openai` (set `OPENAI_API_KEY` env var)
- GPU support: Replace `faiss-cpu` with `faiss-gpu` and use `torch` GPU version

### 2. Train DKT Model (Optional)

Train on synthetic data:
```bash
jupyter notebook notebooks/dkt_training.ipynb
```

Or use the CLI:
```bash
python -c "from models.dkt import create_synthetic_data, train_dkt; \
  data = create_synthetic_data(200, 25); \
  train_dkt(data, 25, epochs=20, save_path='models/dkt_model.pt')"
```

### 3. Run the Service

```bash
python app.py
```

Service will be available at: **http://localhost:8001**

API docs: **http://localhost:8001/docs**

---

## 📡 API Endpoints

### 1. **Predict Mastery** - `/predict_mastery`

Predict per-concept mastery using DKT or Beta fallback.

**Request:**
```json
{
  "user_id": "student_123",
  "recent_attempts": [
    {"concept": "loops", "correct": true, "question_id": 5},
    {"concept": "loops", "correct": false, "question_id": 6}
  ],
  "prior_mastery": {"variables": 0.8},
  "use_dkt": true
}
```

**Response:**
```json
{
  "mastery": {
    "loops": 0.65,
    "variables": 0.8
  },
  "model_used": "DKT",
  "confidence": 0.85
}
```

---

### 2. **Recommend Resources** - `/recommend`

Get ranked, personalized resource recommendations.

**Request:**
```json
{
  "user_id": "student_123",
  "concept": "loops",
  "mastery": {"variables": 0.8, "loops": 0.3},
  "preferred_modality": "video",
  "n_recommendations": 5,
  "explain": true
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "res_loops_1",
      "title": "Python For Loops Tutorial",
      "modality": "video",
      "difficulty": "beginner",
      "score": 0.87,
      "score_breakdown": {
        "content_sim": 0.92,
        "modality": 1.0,
        "difficulty": 0.85,
        "success": 0.88
      }
    }
  ],
  "explanations": [
    {
      "explanation": "This resource teaches loops from basics, perfect for your current level (0.30 mastery).",
      "action": "Complete the video, then attempt 2-3 practice problems on loops.",
      "provenance": ["kg_prereq_loops", "outcome_res_loops_1"]
    }
  ]
}
```

---

### 3. **Explain Resource** - `/explain`

Generate detailed explanation for a recommendation.

**Request:**
```json
{
  "resource_id": "res_loops_1",
  "concept": "loops",
  "student_mastery": {"loops": 0.3, "variables": 0.8}
}
```

---

### 4. **Analyze Content** - `/analyze_content`

Extract concepts and difficulty from text or video.

**Request:**
```json
{
  "text": "In this tutorial we'll learn about for loops in Python..."
}
```

**Response:**
```json
{
  "concepts": [
    {"name": "loops", "score": 0.85},
    {"name": "variables", "score": 0.62}
  ],
  "difficulty": {
    "level": "beginner",
    "score": 0.28,
    "metrics": {
      "flesch_kincaid": 6.2,
      "avg_sentence_length": 12.5
    }
  }
}
```

---

## 🏗️ Architecture

```
ai-service/
├── app.py                    # FastAPI application (main entry)
├── models/
│   ├── dkt.py               # Deep Knowledge Tracing (LSTM)
│   ├── beta_kt.py           # Beta-Bernoulli baseline
│   └── dkt_model.pt         # Trained DKT weights (after training)
├── rag_explainer.py         # RAG explanation system (FAISS + LLM)
├── resource_ranker.py       # Hybrid resource ranking
├── content_intelligence.py  # ASR + concept extraction + difficulty
├── evaluation.py            # Metrics (AUC, Brier, NDCG, etc.)
├── monitoring.py            # Drift detection & performance tracking
├── notebooks/
│   └── dkt_training.ipynb   # Training notebook
└── requirements.txt         # Dependencies
```

---

## 🧪 Evaluation Metrics

### Knowledge Tracing
- **AUC**: Next-question correctness prediction (goal: >0.75)
- **Brier Score**: Calibration (lower is better, goal: <0.20)
- **Accuracy**: Binary prediction accuracy
- **ECE**: Expected calibration error (goal: <0.10)

**Run evaluation:**
```bash
python evaluation.py test_data.json
```

### Recommendation
- **NDCG@k**: Ranking quality
- **MRR**: Mean reciprocal rank
- **Precision@k / Recall@k**
- **Post-resource pass rate**: Learning impact

---

## 📊 Monitoring & Alerts

### Track Performance
```python
from monitoring import PerformanceTracker

tracker = PerformanceTracker('metrics.json')
tracker.log_metrics({'auc': 0.78, 'brier_score': 0.18}, model_name='dkt')

# Check for drops
alert = tracker.detect_performance_drop('auc', threshold=0.70, window=5)
if alert['alert']:
    print(alert['message'])
```

### Drift Detection
```python
from monitoring import DistributionMonitor

monitor = DistributionMonitor()
monitor.update_reference(reference_data, 'mastery_scores')

# Later, check for drift
drift = monitor.detect_drift_ks(current_data, 'mastery_scores')
if drift['drift_detected']:
    print(f"⚠️ Drift detected: p={drift['p_value']:.4f}")
```

### Run Dashboard
```bash
python monitoring.py
```

---

## 🔧 Configuration

### Environment Variables

```bash
# OpenAI API (optional, for RAG explanations)
export OPENAI_API_KEY="sk-..."

# Model paths
export DKT_MODEL_PATH="models/dkt_model.pt"

# Service config
export SERVICE_HOST="0.0.0.0"
export SERVICE_PORT="8001"
```

---

## 🎯 Training Your Own DKT Model

### Option 1: Jupyter Notebook (Recommended)
```bash
jupyter notebook notebooks/dkt_training.ipynb
```

### Option 2: Python Script
```python
from models.dkt import create_synthetic_data, train_dkt

# Generate data
data = create_synthetic_data(n_students=200, n_questions=25, seed=42)

# Train
model = train_dkt(
    data=data,
    n_questions=25,
    epochs=20,
    batch_size=32,
    lr=0.001,
    device='cpu',
    save_path='models/dkt_model.pt'
)
```

### Using Real Data (ASSISTments / EdNet)

1. Download dataset: [ASSISTments](https://sites.google.com/site/assistmentsdata/) or [EdNet](https://github.com/riiid/ednet)
2. Preprocess into format:
   ```python
   [
     {
       'student_id': int,
       'attempts': [
         {'question_id': int, 'correct': bool},
         ...
       ]
     },
     ...
   ]
   ```
3. Train: `train_dkt(real_data, n_questions=NUM_QUESTIONS, ...)`

---

## 🧩 Extending the System

### Add New KT Model (e.g., SAINT Transformer)

1. Create `models/saint.py`:
   ```python
   class SAINT(nn.Module):
       def __init__(self, n_questions, d_model=128, n_heads=8, n_layers=4):
           # Transformer encoder-decoder architecture
           ...
   ```

2. Add predictor wrapper:
   ```python
   class SAINTPredictor:
       def predict_mastery(self, attempts): ...
   ```

3. Update `app.py` to use SAINT when available.

### Add New Content Source

1. Extend `ContentIntelligencePipeline`:
   ```python
   def process_pdf(self, pdf_path):
       text = extract_text_from_pdf(pdf_path)
       return self.process_text(text)
   ```

2. Add endpoint in `app.py`:
   ```python
   @app.post("/analyze_pdf")
   async def analyze_pdf(file: UploadFile):
       ...
   ```

---

## 🐳 Docker Deployment

**Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["python", "app.py"]
```

**Build & Run:**
```bash
docker build -t learnpath-ai-service .
docker run -p 8001:8001 learnpath-ai-service
```

---

## 📚 References

1. **DKT**: Piech et al. (2015) - [Deep Knowledge Tracing](https://arxiv.org/abs/1506.05908)
2. **SAINT**: Choi et al. (2020) - [SAINT+](https://arxiv.org/abs/2010.12042)
3. **Sentence-BERT**: Reimers & Gurevych (2019) - [Sentence-BERT](https://arxiv.org/abs/1908.10084)
4. **Whisper**: Radford et al. (2022) - [Whisper](https://github.com/openai/whisper)

---

## 🤝 Contributing

See main repo README for contribution guidelines.

---

## 📄 License

MIT License - See main repo for details.

---

## 🎓 For Hackathon Judges

**Key Technical Achievements:**

1. ✅ **Production-grade KT**: DKT with Beta fallback, proper evaluation (AUC, Brier, calibration)
2. ✅ **Explainable AI**: RAG-based explanations with retrieval provenance
3. ✅ **Hybrid Ranking**: Multi-signal scoring (semantic + modality + difficulty + outcomes)
4. ✅ **Content Intelligence**: Automated concept extraction & difficulty scoring
5. ✅ **Monitoring**: Drift detection, performance tracking, alerting
6. ✅ **Extensible**: Modular design, easy to add new models/features
7. ✅ **Documented**: Comprehensive docs, training notebooks, examples

**Live Demo Endpoints:**
- Health: `GET /`
- Mastery: `POST /predict_mastery`
- Recommend: `POST /recommend`
- Docs: `GET /docs`

---

**Built with ❤️ for LearnPath AI**
