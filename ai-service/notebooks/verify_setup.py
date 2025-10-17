#!/usr/bin/env python3
"""
Quick verification script to check if the DKT training notebook environment is ready.
Run this before executing the notebook to catch any issues early.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append('..')

def check_imports():
    """Verify all required imports work."""
    print("1. Checking imports...")
    try:
        import numpy as np
        import torch
        import matplotlib.pyplot as plt
        from models.dkt import DKT, DKTPredictor, create_synthetic_data, train_dkt
        from models.beta_kt import BetaKT
        from evaluation import KTEvaluator
        from stem_path_generator import STEMPathGenerator, LearningStyle
        print("   ✅ All imports successful")
        return True
    except ImportError as e:
        print(f"   ❌ Import error: {e}")
        return False

def check_directories():
    """Verify required directories exist."""
    print("\n2. Checking directories...")
    dirs_to_check = [
        Path('../models'),
        Path('../output')
    ]
    all_exist = True
    for dir_path in dirs_to_check:
        if dir_path.exists():
            print(f"   ✅ {dir_path} exists")
        else:
            print(f"   ❌ {dir_path} missing")
            all_exist = False
    return all_exist

def check_knowledge_graph():
    """Verify knowledge graph loads correctly."""
    print("\n3. Checking knowledge graph...")
    try:
        from stem_path_generator import STEMPathGenerator
        generator = STEMPathGenerator()
        n_concepts = len(generator.knowledge_graph)
        if n_concepts > 0:
            print(f"   ✅ Loaded {n_concepts} concepts")
            return True
        else:
            print(f"   ⚠️  No concepts loaded (graph may be empty)")
            return True  # Not an error, just a warning
    except Exception as e:
        print(f"   ❌ Error loading knowledge graph: {e}")
        return False

def check_pytorch():
    """Verify PyTorch is working."""
    print("\n4. Checking PyTorch...")
    try:
        import torch
        print(f"   ✅ PyTorch version: {torch.__version__}")
        print(f"   ✅ Device: {'cuda' if torch.cuda.is_available() else 'cpu'}")
        # Test basic operations
        x = torch.randn(2, 3)
        y = x * 2
        print(f"   ✅ Basic tensor operations working")
        return True
    except Exception as e:
        print(f"   ❌ PyTorch error: {e}")
        return False

def check_synthetic_data():
    """Test synthetic data generation."""
    print("\n5. Testing synthetic data generation...")
    try:
        from models.dkt import create_synthetic_data
        data = create_synthetic_data(n_students=3, n_questions=5, seq_len_range=(5, 10), seed=42)
        print(f"   ✅ Generated {len(data)} test sequences")
        return True
    except Exception as e:
        print(f"   ❌ Synthetic data error: {e}")
        return False

def main():
    """Run all verification checks."""
    print("=" * 60)
    print("DKT TRAINING NOTEBOOK - ENVIRONMENT VERIFICATION")
    print("=" * 60)
    
    checks = [
        check_imports(),
        check_directories(),
        check_knowledge_graph(),
        check_pytorch(),
        check_synthetic_data()
    ]
    
    print("\n" + "=" * 60)
    if all(checks):
        print("✅ ALL CHECKS PASSED!")
        print("The notebook is ready to run.")
        print("\nTo start the notebook, run:")
        print("  jupyter notebook dkt_training.ipynb")
    else:
        print("❌ SOME CHECKS FAILED")
        print("Please fix the issues above before running the notebook.")
    print("=" * 60)

if __name__ == "__main__":
    main()

