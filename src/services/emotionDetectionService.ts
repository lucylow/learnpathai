/**
 * Emotion & Engagement Detection Service
 * Uses facial expression, gaze tracking, and sentiment analysis
 * for real-time learner state detection
 */

import { AccessibilityEvent } from '../types/accessibility';

export type EmotionState = 
  | 'frustrated' 
  | 'confused' 
  | 'engaged' 
  | 'excited' 
  | 'bored' 
  | 'neutral';

export interface EmotionDetection {
  emotion: EmotionState;
  confidence: number;
  timestamp: number;
  facialFeatures?: {
    eyebrowRaise: number;
    smileIntensity: number;
    gazeDirection: { x: number; y: number };
  };
  contextualFactors?: {
    interactionFrequency: number;
    timeOnTask: number;
    errorRate: number;
  };
}

export interface InterventionRecommendation {
  trigger: EmotionState;
  action: 'offer_break' | 'simplify_content' | 'provide_encouragement' | 'increase_difficulty' | 'none';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export class EmotionDetectionService {
  private videoStream: MediaStream | null = null;
  private detectionInterval: number | null = null;
  private emotionHistory: EmotionDetection[] = [];
  private readonly HISTORY_SIZE = 50;
  
  /**
   * Initialize camera for facial detection
   */
  async initializeCamera(): Promise<boolean> {
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      return false;
    }
  }

  /**
   * Start real-time emotion detection
   */
  async startDetection(
    videoElement: HTMLVideoElement,
    onEmotionChange: (detection: EmotionDetection) => void
  ): Promise<void> {
    if (!this.videoStream) {
      const initialized = await this.initializeCamera();
      if (!initialized) {
        throw new Error('Camera initialization failed');
      }
    }

    videoElement.srcObject = this.videoStream;
    await videoElement.play();

    // Run detection every 2 seconds
    this.detectionInterval = window.setInterval(() => {
      this.detectEmotion(videoElement).then(detection => {
        if (detection) {
          this.emotionHistory.push(detection);
          if (this.emotionHistory.length > this.HISTORY_SIZE) {
            this.emotionHistory.shift();
          }
          onEmotionChange(detection);
        }
      });
    }, 2000);
  }

  /**
   * Detect emotion from video frame
   * In production, this would use TensorFlow.js or similar ML model
   */
  private async detectEmotion(videoElement: HTMLVideoElement): Promise<EmotionDetection | null> {
    // In production: Use TensorFlow.js face-api or similar
    // For now, we'll use behavioral patterns as proxy
    
    // Simulate facial analysis
    const emotion = this.inferEmotionFromBehavior();
    
    return {
      emotion: emotion.state,
      confidence: emotion.confidence,
      timestamp: Date.now(),
      facialFeatures: {
        eyebrowRaise: Math.random(),
        smileIntensity: emotion.state === 'engaged' || emotion.state === 'excited' ? 0.7 : 0.2,
        gazeDirection: { x: 0, y: 0 }
      }
    };
  }

  /**
   * Infer emotion from behavioral patterns
   * (Fallback when camera not available)
   */
  private inferEmotionFromBehavior(): { state: EmotionState; confidence: number } {
    // This would integrate with interaction tracking
    const recentInteractions = this.getRecentInteractionMetrics();
    
    // High error rate + rapid clicks = frustrated
    if (recentInteractions.errorRate > 0.5 && recentInteractions.clickFrequency > 10) {
      return { state: 'frustrated', confidence: 0.8 };
    }
    
    // Long pauses + low interaction = bored or confused
    if (recentInteractions.avgPauseDuration > 10000) {
      return { state: 'confused', confidence: 0.7 };
    }
    
    // Steady progress + moderate interaction = engaged
    if (recentInteractions.completionRate > 0.7) {
      return { state: 'engaged', confidence: 0.85 };
    }
    
    // Fast completion + high accuracy = excited
    if (recentInteractions.completionRate > 0.9 && recentInteractions.errorRate < 0.1) {
      return { state: 'excited', confidence: 0.75 };
    }
    
    return { state: 'neutral', confidence: 0.5 };
  }

  /**
   * Get recent interaction metrics
   */
  private getRecentInteractionMetrics() {
    // This would pull from actual interaction tracking
    return {
      errorRate: Math.random() * 0.5,
      clickFrequency: Math.random() * 20,
      avgPauseDuration: Math.random() * 15000,
      completionRate: Math.random(),
    };
  }

  /**
   * Analyze emotion patterns over time
   */
  analyzeEmotionTrend(windowSize: number = 10): {
    predominantEmotion: EmotionState;
    volatility: number;
    trend: 'improving' | 'declining' | 'stable';
  } {
    const recent = this.emotionHistory.slice(-windowSize);
    
    if (recent.length === 0) {
      return {
        predominantEmotion: 'neutral',
        volatility: 0,
        trend: 'stable'
      };
    }

    // Count emotion frequencies
    const emotionCounts: Record<EmotionState, number> = {
      frustrated: 0,
      confused: 0,
      engaged: 0,
      excited: 0,
      bored: 0,
      neutral: 0
    };

    recent.forEach(detection => {
      emotionCounts[detection.emotion]++;
    });

    // Find predominant emotion
    const predominantEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      b[1] > a[1] ? b : a
    )[0] as EmotionState;

    // Calculate volatility (how much emotions change)
    let changes = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].emotion !== recent[i - 1].emotion) {
        changes++;
      }
    }
    const volatility = changes / recent.length;

    // Determine trend
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstHalfPositive = firstHalf.filter(d => 
      d.emotion === 'engaged' || d.emotion === 'excited'
    ).length / firstHalf.length;
    
    const secondHalfPositive = secondHalf.filter(d => 
      d.emotion === 'engaged' || d.emotion === 'excited'
    ).length / secondHalf.length;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondHalfPositive - firstHalfPositive > 0.2) {
      trend = 'improving';
    } else if (firstHalfPositive - secondHalfPositive > 0.2) {
      trend = 'declining';
    }

    return {
      predominantEmotion,
      volatility,
      trend
    };
  }

  /**
   * Generate intervention recommendation based on emotion
   */
  getInterventionRecommendation(currentEmotion: EmotionState): InterventionRecommendation {
    const recommendations: Record<EmotionState, InterventionRecommendation> = {
      frustrated: {
        trigger: 'frustrated',
        action: 'offer_break',
        message: "It looks like this is challenging. Would you like to take a short break or try a different approach?",
        priority: 'high'
      },
      confused: {
        trigger: 'confused',
        action: 'simplify_content',
        message: "Let me explain this in a simpler way. Would you like to see more examples?",
        priority: 'high'
      },
      bored: {
        trigger: 'bored',
        action: 'increase_difficulty',
        message: "Ready for something more challenging? Let's level up!",
        priority: 'medium'
      },
      engaged: {
        trigger: 'engaged',
        action: 'none',
        message: "You're doing great! Keep up the excellent work!",
        priority: 'low'
      },
      excited: {
        trigger: 'excited',
        action: 'none',
        message: "Wonderful! Your enthusiasm is amazing!",
        priority: 'low'
      },
      neutral: {
        trigger: 'neutral',
        action: 'none',
        message: "You're making steady progress!",
        priority: 'low'
      }
    };

    return recommendations[currentEmotion];
  }

  /**
   * Detect gaze patterns (requires eye tracking hardware or WebGazer.js)
   */
  async detectGazePattern(): Promise<{
    focusAreas: { x: number; y: number; duration: number }[];
    attentionScore: number;
  }> {
    // Placeholder for gaze tracking integration
    // In production: Use WebGazer.js or similar
    return {
      focusAreas: [],
      attentionScore: 0.7
    };
  }

  /**
   * Stop detection and cleanup
   */
  stopDetection(): void {
    if (this.detectionInterval !== null) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  /**
   * Get emotion history
   */
  getEmotionHistory(): EmotionDetection[] {
    return [...this.emotionHistory];
  }

  /**
   * Export detection data for analytics
   */
  exportData(): {
    totalDetections: number;
    emotionDistribution: Record<EmotionState, number>;
    averageConfidence: number;
    sessionDuration: number;
  } {
    if (this.emotionHistory.length === 0) {
      return {
        totalDetections: 0,
        emotionDistribution: {
          frustrated: 0,
          confused: 0,
          engaged: 0,
          excited: 0,
          bored: 0,
          neutral: 0
        },
        averageConfidence: 0,
        sessionDuration: 0
      };
    }

    const distribution: Record<EmotionState, number> = {
      frustrated: 0,
      confused: 0,
      engaged: 0,
      excited: 0,
      bored: 0,
      neutral: 0
    };

    let totalConfidence = 0;

    this.emotionHistory.forEach(detection => {
      distribution[detection.emotion]++;
      totalConfidence += detection.confidence;
    });

    const sessionDuration = 
      this.emotionHistory[this.emotionHistory.length - 1].timestamp - 
      this.emotionHistory[0].timestamp;

    return {
      totalDetections: this.emotionHistory.length,
      emotionDistribution: distribution,
      averageConfidence: totalConfidence / this.emotionHistory.length,
      sessionDuration
    };
  }
}

export default EmotionDetectionService;

