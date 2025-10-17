# ai-service/emotion_detector.py
"""
Emotion Detection and Adaptive Difficulty System.
Detects student frustration, confusion, and engagement from behavioral signals.
"""
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import numpy as np


class EmotionData(BaseModel):
    """Student behavior data for emotion detection."""
    user_id: str
    time_spent: int  # seconds on current resource
    attempt_count: int  # number of attempts on quiz
    avg_response_time: int  # milliseconds
    click_pattern: str  # "erratic", "steady", "slow", "rapid"
    scroll_behavior: Optional[str] = "normal"  # "rapid", "normal", "minimal"
    return_count: Optional[int] = 0  # times returned to same content
    
 class EmotionState(BaseModel):
    """Detected emotional state and recommendations."""
    emotion: str  # engaged, confused, frustrated, disengaged, overwhelmed
    confidence: float  # 0-1
    frustration_score: float  # 0-1
    engagement_score: float  # 0-1
    recommendation: str
    suggested_actions: List[str]


class EmotionDetector:
    """
    Heuristic-based emotion detection from user behavior.
    Future: can be upgraded to ML model with training data.
    """
    
    def __init__(self):
        # Thresholds calibrated for typical learning sessions
        self.FRUSTRATION_TIME_THRESHOLD = 600  # 10 minutes
        self.CONFUSION_ATTEMPTS_THRESHOLD = 3
        self.DISENGAGEMENT_RESPONSE_TIME = 5000  # 5 seconds
        self.RAPID_CLICK_THRESHOLD = 50  # ms
        
    def detect_emotion(self, data: EmotionData) -> EmotionState:
        """
        Analyze behavior and infer emotional state.
        
        Returns:
            EmotionState with detected emotion and recommendations
        """
        frustration_score = 0.0
        engagement_score = 1.0  # start optimistic
        signals = []
        
        # Signal 1: Time spent vs attempts (frustration indicator)
        if data.time_spent > self.FRUSTRATION_TIME_THRESHOLD and data.attempt_count > self.CONFUSION_ATTEMPTS_THRESHOLD:
            frustration_score += 0.4
            signals.append("prolonged_struggle")
        
        # Signal 2: Click patterns (confusion/frustration)
        if data.click_pattern == "erratic":
            frustration_score += 0.3
            signals.append("erratic_behavior")
        elif data.click_pattern == "slow":
            engagement_score -= 0.3
            signals.append("slow_interaction")
        elif data.click_pattern == "rapid":
            frustration_score += 0.2
            signals.append("rushing")
        
        # Signal 3: Response time (engagement indicator)
        if data.avg_response_time > self.DISENGAGEMENT_RESPONSE_TIME:
            engagement_score -= 0.4
            signals.append("slow_responses")
        
        # Signal 4: Scroll behavior (attention)
        if data.scroll_behavior == "rapid":
            engagement_score -= 0.3
            signals.append("skimming")
        elif data.scroll_behavior == "minimal":
            engagement_score -= 0.2
            signals.append("limited_engagement")
        
        # Signal 5: Return count (confusion/difficulty)
        if data.return_count and data.return_count > 2:
            frustration_score += 0.2
            signals.append("repeated_returns")
        
        # Clip scores
        frustration_score = min(1.0, frustration_score)
        engagement_score = max(0.0, engagement_score)
        
        # Determine emotion and confidence
        emotion, confidence, recommendation, actions = self._classify_emotion(
            frustration_score, 
            engagement_score,
            signals
        )
        
        return EmotionState(
            emotion=emotion,
            confidence=confidence,
            frustration_score=frustration_score,
            engagement_score=engagement_score,
            recommendation=recommendation,
            suggested_actions=actions
        )
    
    def _classify_emotion(self, frustration: float, engagement: float, 
                         signals: List[str]) -> tuple:
        """
        Classify emotion based on scores and return recommendations.
        
        Returns:
            (emotion, confidence, recommendation, actions)
        """
        # Frustrated: high frustration, any engagement
        if frustration > 0.6:
            return (
                "frustrated",
                0.8,
                "simplify_content",
                [
                    "Provide step-by-step hints",
                    "Offer simpler alternative resource",
                    "Show worked example",
                    "Suggest taking a short break"
                ]
            )
        
        # Confused: moderate frustration, struggling but engaged
        if frustration > 0.4 and engagement > 0.5:
            return (
                "confused",
                0.7,
                "add_hints",
                [
                    "Add contextual hints",
                    "Provide prerequisite review",
                    "Show related examples",
                    "Enable AI tutor chat"
                ]
            )
        
        # Disengaged: low engagement, low frustration
        if engagement < 0.4 and frustration < 0.4:
            return (
                "disengaged",
                0.75,
                "increase_engagement",
                [
                    "Gamify next section",
                    "Switch to preferred modality (video/interactive)",
                    "Show progress visualization",
                    "Set achievable micro-goals"
                ]
            )
        
        # Overwhelmed: high frustration + erratic behavior
        if frustration > 0.5 and "erratic_behavior" in signals:
            return (
                "overwhelmed",
                0.85,
                "reduce_complexity",
                [
                    "Break into smaller chunks",
                    "Provide clearer structure",
                    "Reduce information density",
                    "Offer guided tour"
                ]
            )
        
        # Engaged: good engagement, low frustration
        if engagement >= 0.6 and frustration < 0.3:
            return (
                "engaged",
                0.9,
                "continue",
                [
                    "Maintain current difficulty",
                    "Provide optional challenges",
                    "Continue current path"
                ]
            )
        
        # Default: neutral state
        return (
            "neutral",
            0.6,
            "monitor",
            ["Continue observing", "No immediate intervention needed"]
        )


class AdaptiveDifficultyManager:
    """
    Adjust content difficulty based on emotional state and performance.
    """
    
    def __init__(self):
        self.difficulty_levels = ["beginner", "intermediate", "advanced"]
        
    def adjust_difficulty(self, 
                         current_difficulty: str,
                         emotion_state: EmotionState,
                         recent_performance: float) -> Dict:
        """
        Recommend difficulty adjustment.
        
        Args:
            current_difficulty: current content difficulty level
            emotion_state: detected emotional state
            recent_performance: mastery score (0-1)
            
        Returns:
            dict with new difficulty and reasoning
        """
        current_idx = self.difficulty_levels.index(current_difficulty)
        new_idx = current_idx
        reasoning = []
        
        # Decrease difficulty if frustrated/overwhelmed
        if emotion_state.emotion in ["frustrated", "overwhelmed"]:
            if current_idx > 0:
                new_idx = max(0, current_idx - 1)
                reasoning.append(f"Detected {emotion_state.emotion} state")
                reasoning.append("Reducing difficulty to build confidence")
        
        # Decrease if confused and low performance
        elif emotion_state.emotion == "confused" and recent_performance < 0.4:
            if current_idx > 0:
                new_idx = current_idx - 1
                reasoning.append("Confusion + low mastery")
                reasoning.append("Providing easier scaffolding")
        
        # Increase if engaged and high performance
        elif emotion_state.emotion == "engaged" and recent_performance > 0.75:
            if current_idx < len(self.difficulty_levels) - 1:
                new_idx = current_idx + 1
                reasoning.append("High engagement + strong mastery")
                reasoning.append("Ready for increased challenge")
        
        # Maintain if disengaged (don't make harder or easier suddenly)
        elif emotion_state.emotion == "disengaged":
            reasoning.append("Low engagement detected")
            reasoning.append("Maintaining difficulty, increasing engagement")
        
        # No change
        else:
            reasoning.append("Current difficulty appropriate")
        
        return {
            "current_difficulty": current_difficulty,
            "recommended_difficulty": self.difficulty_levels[new_idx],
            "change": "increase" if new_idx > current_idx else "decrease" if new_idx < current_idx else "none",
            "reasoning": reasoning,
            "confidence": emotion_state.confidence
        }


# FastAPI integration (add to app.py)
"""
# Add to ai-service/app.py:

from emotion_detector import EmotionDetector, EmotionData, AdaptiveDifficultyManager

emotion_detector = EmotionDetector()
difficulty_manager = AdaptiveDifficultyManager()

@app.post("/detect_emotion")
async def detect_emotion(data: EmotionData):
    emotion_state = emotion_detector.detect_emotion(data)
    return emotion_state

@app.post("/adjust_difficulty")
async def adjust_difficulty(
    current_difficulty: str,
    emotion_data: EmotionData,
    recent_performance: float
):
    emotion_state = emotion_detector.detect_emotion(emotion_data)
    adjustment = difficulty_manager.adjust_difficulty(
        current_difficulty,
        emotion_state,
        recent_performance
    )
    return {
        "emotion_state": emotion_state,
        "difficulty_adjustment": adjustment
    }
"""

