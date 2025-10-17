/**
 * Accessibility Type Definitions
 * Building on High Five AI for inclusive learning
 */

export interface AccessibilityProfile {
  userId: string;
  preferences: {
    visual: {
      highContrast: boolean;
      fontSize: 'small' | 'medium' | 'large' | 'x-large';
      colorBlindMode: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'none';
      screenReader: boolean;
      reduceMotion: boolean;
    };
    auditory: {
      requiresCaptions: boolean;
      requiresTranscripts: boolean;
      visualAlerts: boolean;
      audioDescription: boolean;
    };
    motor: {
      voiceControl: boolean;
      keyboardOnly: boolean;
      switchControl: boolean;
      extendedClickArea: boolean;
    };
    cognitive: {
      simplifiedLayout: boolean;
      readingAssistance: boolean;
      extraTime: number; // multiplier for timed activities
      reducedComplexity: boolean;
    };
  };
  communication: {
    primaryMethod: 'text' | 'asl' | 'braille' | 'speech' | 'multimodal';
    supportedMethods: string[];
    preferredLanguage: string;
  };
}

export interface AccessibleResource {
  id: string;
  title: string;
  baseContent: string;
  contentType: 'text' | 'video' | 'audio' | 'interactive' | 'mixed';
  alternatives: {
    captions?: string; // SRT/VTT files URL
    transcript?: string; // Full text transcript
    aslTranslation?: string; // ASL video URL
    braille?: string; // Braille formatted text
    audioDescription?: string; // Audio description URL for visual content
    simplified?: string; // Simplified language version
    audioNarration?: string; // Text-to-speech audio URL
  };
  accessibilityMetadata: {
    hasCaptions: boolean;
    hasTranscript: boolean;
    hasASL: boolean;
    hasBraille: boolean;
    hasAudioDescription: boolean;
    readingLevel: number; // Grade level
    cognitiveLoad: 'low' | 'medium' | 'high';
    estimatedTime: number; // in minutes
    wcagCompliance: 'A' | 'AA' | 'AAA';
  };
}

export interface AccessibilityEvent {
  type: 'click' | 'pause' | 'error' | 'scroll' | 'focus' | 'voice-command';
  timestamp: number;
  duration?: number;
  target?: string;
  count?: number;
  metadata?: Record<string, any>;
}

export interface ASLGesture {
  gesture: string;
  confidence: number;
  timestamp: number;
}

export interface BrailleOutput {
  originalText: string;
  brailleText: string;
  gradeLevel: 1 | 2; // Grade 1 or Grade 2 Braille
}

export interface SpeechCommand {
  command: string;
  action: string;
  parameters?: Record<string, any>;
}

export type ColorBlindFilter = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'none';
export type FontSizeScale = 'small' | 'medium' | 'large' | 'x-large';
export type EngagementState = 'frustrated' | 'engaged' | 'confused' | 'neutral';

