#!/usr/bin/env python3
"""
Test script for LearnPath AI Service.
Tests all major endpoints with example requests.
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8001"


def print_test(name: str, success: bool, details: str = ""):
    """Print test result."""
    status = "✓" if success else "✗"
    print(f"{status} {name}")
    if details:
        print(f"  {details}")


def test_health_check() -> bool:
    """Test root health check."""
    try:
        response = requests.get(f"{BASE_URL}/")
        success = response.status_code == 200 and response.json().get('status') == 'running'
        print_test("Health Check", success, 
                  f"Status: {response.json().get('status')}")
        return success
    except Exception as e:
        print_test("Health Check", False, str(e))
        return False


def test_predict_mastery() -> bool:
    """Test mastery prediction endpoint."""
    try:
        payload = {
            "user_id": "test_student_1",
            "recent_attempts": [
                {"concept": "variables", "correct": True, "question_id": 0},
                {"concept": "variables", "correct": True, "question_id": 1},
                {"concept": "loops", "correct": False, "question_id": 5},
                {"concept": "loops", "correct": True, "question_id": 6}
            ],
            "prior_mastery": {},
            "use_dkt": False  # Use Beta for simplicity
        }
        
        response = requests.post(f"{BASE_URL}/predict_mastery", json=payload)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            mastery = data.get('mastery', {})
            model = data.get('model_used')
            print_test("Predict Mastery", True,
                      f"Model: {model}, Variables: {mastery.get('variables', 0):.2f}, Loops: {mastery.get('loops', 0):.2f}")
        else:
            print_test("Predict Mastery", False, f"Status: {response.status_code}")
        
        return success
    except Exception as e:
        print_test("Predict Mastery", False, str(e))
        return False


def test_recommend_resources() -> bool:
    """Test resource recommendation endpoint."""
    try:
        payload = {
            "user_id": "test_student_1",
            "concept": "loops",
            "mastery": {"variables": 0.8, "loops": 0.3},
            "preferred_modality": "video",
            "n_recommendations": 3,
            "explain": False  # Skip explanations for speed
        }
        
        response = requests.post(f"{BASE_URL}/recommend", json=payload)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            recs = data.get('recommendations', [])
            print_test("Recommend Resources", True,
                      f"Got {len(recs)} recommendations")
        else:
            print_test("Recommend Resources", False, f"Status: {response.status_code}")
        
        return success
    except Exception as e:
        print_test("Recommend Resources", False, str(e))
        return False


def test_analyze_content() -> bool:
    """Test content analysis endpoint."""
    try:
        payload = {
            "text": "In this tutorial, we'll learn about for loops in Python. "
                   "Loops allow you to repeat code multiple times. "
                   "We'll start with basic syntax and then move to nested loops."
        }
        
        response = requests.post(f"{BASE_URL}/analyze_content", json=payload)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            concepts = data.get('concepts', [])
            difficulty = data.get('difficulty', {})
            print_test("Analyze Content", True,
                      f"Found {len(concepts)} concepts, Difficulty: {difficulty.get('level')}")
        else:
            print_test("Analyze Content", False, f"Status: {response.status_code}")
        
        return success
    except Exception as e:
        print_test("Analyze Content", False, str(e))
        return False


def test_knowledge_graph() -> bool:
    """Test knowledge graph endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/knowledge_graph")
        success = response.status_code == 200
        
        if success:
            data = response.json()
            print_test("Knowledge Graph", True,
                      f"Loaded {len(data)} concepts")
        else:
            print_test("Knowledge Graph", False, f"Status: {response.status_code}")
        
        return success
    except Exception as e:
        print_test("Knowledge Graph", False, str(e))
        return False


def test_stats() -> bool:
    """Test stats endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/stats")
        success = response.status_code == 200
        
        if success:
            data = response.json()
            models = data.get('models_loaded', {})
            print_test("Service Stats", True,
                      f"DKT: {models.get('dkt')}, RAG: {models.get('rag')}, Ranker: {models.get('ranker')}")
        else:
            print_test("Service Stats", False, f"Status: {response.status_code}")
        
        return success
    except Exception as e:
        print_test("Service Stats", False, str(e))
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("LearnPath AI Service - Test Suite")
    print("=" * 60)
    print(f"\nTesting service at: {BASE_URL}\n")
    
    tests = [
        ("Health Check", test_health_check),
        ("Predict Mastery", test_predict_mastery),
        ("Recommend Resources", test_recommend_resources),
        ("Analyze Content", test_analyze_content),
        ("Knowledge Graph", test_knowledge_graph),
        ("Service Stats", test_stats),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print_test(name, False, str(e))
            results.append((name, False))
        print()
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "PASS" if success else "FAIL"
        print(f"  {status:4s} - {name}")
    
    print(f"\nTotal: {passed}/{total} passed")
    print("=" * 60)
    
    return passed == total


if __name__ == '__main__':
    import sys
    success = main()
    sys.exit(0 if success else 1)

