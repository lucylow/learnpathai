/**
 * Personalized Assistive Avatar
 * Virtual AI tutor that reads aloud, signs, or guides learners
 * with customized communication styles
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Volume2, VolumeX, MessageSquare, Hand, User } from 'lucide-react';

interface AvatarPersonality {
  name: string;
  style: 'encouraging' | 'professional' | 'friendly' | 'playful';
  voice: {
    rate: number;
    pitch: number;
    volume: number;
  };
}

interface AvatarMessage {
  text: string;
  type: 'instruction' | 'encouragement' | 'correction' | 'celebration';
  emotion?: 'happy' | 'thinking' | 'concerned' | 'excited';
}

export const AssistiveAvatar: React.FC = () => {
  const { profile, multiModalService } = useAccessibility();
  const [isActive, setIsActive] = useState(true);
  const [currentMessage, setCurrentMessage] = useState<AvatarMessage | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const [personality] = useState<AvatarPersonality>({
    name: 'Alex',
    style: 'encouraging',
    voice: {
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0
    }
  });

  /**
   * Speak message with avatar personality
   */
  const speak = async (message: string) => {
    if (!isActive || !multiModalService) return;

    setIsSpeaking(true);
    try {
      await multiModalService.speakText(message, personality.voice);
    } catch (error) {
      console.error('Avatar speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Show message and optionally speak it
   */
  const showMessage = async (message: AvatarMessage) => {
    setCurrentMessage(message);

    // Auto-speak if reading assistance enabled
    if (profile.preferences.cognitive.readingAssistance) {
      await speak(message.text);
    }

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setCurrentMessage(null);
    }, 10000);
  };

  /**
   * Provide contextual guidance based on user state
   */
  const provideGuidance = (context: {
    currentTopic: string;
    difficulty: number;
    progress: number;
    emotionState?: string;
  }) => {
    let message: AvatarMessage;

    if (context.emotionState === 'frustrated') {
      message = {
        text: `I can see this is challenging. Remember, ${context.currentTopic} takes practice. Would you like me to break it down into smaller steps?`,
        type: 'encouragement',
        emotion: 'concerned'
      };
    } else if (context.progress > 0.8) {
      message = {
        text: `Excellent work! You've mastered ${Math.round(context.progress * 100)}% of ${context.currentTopic}. You're doing amazing!`,
        type: 'celebration',
        emotion: 'excited'
      };
    } else if (context.difficulty > 0.7) {
      message = {
        text: `${context.currentTopic} is an advanced topic. Take your time, and don't hesitate to review earlier concepts if needed.`,
        type: 'instruction',
        emotion: 'thinking'
      };
    } else {
      message = {
        text: `Great progress on ${context.currentTopic}! You're ${Math.round(context.progress * 100)}% through. Keep going!`,
        type: 'encouragement',
        emotion: 'happy'
      };
    }

    showMessage(message);
  };

  /**
   * Provide step-by-step instructions
   */
  const provideInstructions = async (steps: string[]) => {
    for (let i = 0; i < steps.length; i++) {
      const message: AvatarMessage = {
        text: `Step ${i + 1}: ${steps[i]}`,
        type: 'instruction',
        emotion: 'thinking'
      };
      await showMessage(message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  /**
   * Get avatar animation class based on emotion
   */
  const getAvatarAnimation = () => {
    if (!currentMessage) return '';
    
    switch (currentMessage.emotion) {
      case 'excited':
        return 'animate-bounce';
      case 'happy':
        return 'animate-pulse';
      case 'thinking':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  /**
   * Render avatar based on communication method
   */
  const renderAvatar = () => {
    // If ASL preferred, show signing avatar animation
    if (profile.communication.primaryMethod === 'asl') {
      return (
        <div className="relative">
          <div className={`w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center ${getAvatarAnimation()}`}>
            <Hand className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
        </div>
      );
    }

    // Standard avatar
    return (
      <div className="relative">
        <div className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center ${getAvatarAnimation()}`}>
          <User className="w-12 h-12 text-white" />
        </div>
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'} rounded-full border-2 border-white`} />
      </div>
    );
  };

  return (
    <Card className={`fixed bottom-24 right-6 w-80 shadow-2xl transition-all ${isActive ? 'translate-x-0' : 'translate-x-96'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div ref={avatarRef}>
            {renderAvatar()}
          </div>

          {/* Message Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{personality.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsActive(!isActive)}
                aria-label={isActive ? 'Hide avatar' : 'Show avatar'}
              >
                {isActive ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            {currentMessage && (
              <div className={`p-3 rounded-lg ${
                currentMessage.type === 'celebration' ? 'bg-green-100 dark:bg-green-900' :
                currentMessage.type === 'correction' ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-blue-100 dark:bg-blue-900'
              }`}>
                <p className="text-sm">{currentMessage.text}</p>
              </div>
            )}

            {!currentMessage && (
              <div className="text-sm text-muted-foreground">
                <p>Hi! I'm {personality.name}, your learning assistant. I'm here to help!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showMessage({
              text: "Let me know if you need help understanding anything. I can explain concepts in different ways!",
              type: 'instruction',
              emotion: 'happy'
            })}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Need Help?
          </Button>

          {profile.communication.primaryMethod === 'asl' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => showMessage({
                text: "I can show you this in sign language!",
                type: 'instruction',
                emotion: 'happy'
              })}
            >
              <Hand className="h-3 w-3 mr-1" />
              ASL Mode
            </Button>
          )}
        </div>

        {/* Avatar Status */}
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          {isSpeaking ? 'Speaking...' : 'Ready to help'}
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for using avatar from anywhere in the app
export const useAssistiveAvatar = () => {
  const [avatarRef, setAvatarRef] = useState<{
    showMessage: (message: AvatarMessage) => void;
    provideGuidance: (context: any) => void;
    speak: (text: string) => Promise<void>;
  } | null>(null);

  return {
    avatar: avatarRef,
    showEncouragement: (text: string) => {
      avatarRef?.showMessage({
        text,
        type: 'encouragement',
        emotion: 'happy'
      });
    },
    celebrateSuccess: (text: string) => {
      avatarRef?.showMessage({
        text,
        type: 'celebration',
        emotion: 'excited'
      });
    },
    provideHelp: (text: string) => {
      avatarRef?.showMessage({
        text,
        type: 'instruction',
        emotion: 'thinking'
      });
    }
  };
};

export default AssistiveAvatar;

