#!/usr/bin/env python3
"""
QuickStart Script for LearnPath AI Service
Generates synthetic data, trains DKT model, and starts the service.
"""
import sys
from pathlib import Path

def main():
    print("=" * 60)
    print("LearnPath AI - QuickStart Setup")
    print("=" * 60)
    
    # Step 1: Check dependencies
    print("\n[1/4] Checking dependencies...")
    try:
        import torch
        import fastapi
        import sentence_transformers
        print("✓ Core dependencies installed")
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)
    
    # Step 2: Generate synthetic data
    print("\n[2/4] Generating synthetic training data...")
    from models.dkt import create_synthetic_data, train_dkt
    
    data = create_synthetic_data(
        n_students=150,
        n_questions=25,
        seq_len_range=(15, 50),
        seed=42
    )
    print(f"✓ Generated {len(data)} student sequences")
    
    # Step 3: Train DKT model
    print("\n[3/4] Training DKT model (this may take a few minutes)...")
    model_path = Path(__file__).parent / "models" / "dkt_model.pt"
    model_path.parent.mkdir(exist_ok=True)
    
    train_data = data[:120]
    
    model = train_dkt(
        data=train_data,
        n_questions=25,
        epochs=15,
        batch_size=32,
        lr=0.001,
        device='cpu',
        save_path=str(model_path)
    )
    print(f"✓ Model trained and saved to {model_path}")
    
    # Step 4: Test the model
    print("\n[4/4] Testing model...")
    from models.dkt import DKTPredictor
    from evaluation import KTEvaluator
    
    predictor = DKTPredictor(model_path=str(model_path), device='cpu')
    
    # Quick test
    test_data = data[120:130]
    y_true = []
    y_pred = []
    
    for student in test_data:
        attempts = student['attempts']
        if len(attempts) >= 10:
            history = attempts[:8]
            next_att = attempts[8]
            prob = predictor.predict_next_question(history, next_att['question_id'])
            y_true.append(int(next_att['correct']))
            y_pred.append(prob)
    
    if y_true:
        auc = KTEvaluator.compute_auc(y_true, y_pred)
        print(f"✓ Test AUC: {auc:.4f}")
    
    print("\n" + "=" * 60)
    print("Setup Complete! 🎉")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Start the service: python app.py")
    print("2. Open API docs: http://localhost:8001/docs")
    print("3. Try the demo notebook: jupyter notebook notebooks/dkt_training.ipynb")
    print("\n" + "=" * 60)


if __name__ == '__main__':
    main()

