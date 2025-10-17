/**
 * Accessible Learning Path Component
 * Multi-modal learning path display with DEI accessibility features
 */

import React, { useEffect, useState, useRef } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Volume2, VolumeX, Camera, Type, BookOpen, CheckCircle2 } from 'lucide-react';
import { ScreenReaderSupport } from '../../utils/screenReaderUtils';

interface LearningStep {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  completed: boolean;
  alternatives?: {
    captions?: string;
    transcript?: string;
    aslVideo?: string;
    braille?: string;
    audioDescription?: string;
  };
  estimatedTime: number; // in minutes
}

interface AccessibleLearningPathProps {
  pathId: string;
  steps: LearningStep[];
  currentStepIndex: number;
  onStepComplete: (stepId: string) => void;
  onStepChange: (index: number) => void;
  progress: number;
}

export const AccessibleLearningPath: React.FC<AccessibleLearningPathProps> = ({
  pathId,
  steps,
  currentStepIndex,
  onStepComplete,
  onStepChange,
  progress
}) => {
  const { profile, getAccessibleResource, isFeatureEnabled, multiModalService } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBraille, setShowBraille] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const accessibleStep = currentStep ? getAccessibleResource(currentStep) : null;

  // Announce step changes to screen readers
  useEffect(() => {
    if (currentStep && isFeatureEnabled('screenReader')) {
      ScreenReaderSupport.announce(
        `Now on step ${currentStepIndex + 1} of ${steps.length}: ${currentStep.title}`,
        'polite'
      );
    }
  }, [currentStepIndex, currentStep, steps.length, isFeatureEnabled]);

  // Auto-read content if reading assistance is enabled
  useEffect(() => {
    if (currentStep && isFeatureEnabled('readingAssistance')) {
      handleTextToSpeech();
    }
    return () => {
      multiModalService.stopSpeaking();
    };
  }, [currentStepIndex]);

  const handleTextToSpeech = async () => {
    if (!currentStep) return;

    if (isSpeaking) {
      multiModalService.stopSpeaking();
      setIsSpeaking(false);
      ScreenReaderSupport.announce('Speech stopped', 'polite');
    } else {
      try {
        setIsSpeaking(true);
        ScreenReaderSupport.announce('Starting speech', 'polite');
        
        const textToRead = `${currentStep.title}. ${currentStep.description}. ${currentStep.content}`;
        await multiModalService.speakText(textToRead, {
          rate: 0.9,
          pitch: 1,
          volume: 1
        });
        
        setIsSpeaking(false);
      } catch (error) {
        console.error('Text-to-speech error:', error);
        setIsSpeaking(false);
        ScreenReaderSupport.announce('Speech failed', 'assertive');
      }
    }
  };

  const handleStepComplete = () => {
    if (!currentStep) return;

    onStepComplete(currentStep.id);
    ScreenReaderSupport.announce(
      `Step ${currentStepIndex + 1} completed! ${steps.length - currentStepIndex - 1} steps remaining.`,
      'polite'
    );

    // Move to next step if available
    if (currentStepIndex < steps.length - 1) {
      setTimeout(() => {
        onStepChange(currentStepIndex + 1);
      }, 500);
    } else {
      ScreenReaderSupport.announce('Congratulations! You have completed all steps.', 'assertive');
    }
  };

  const handleNavigateStep = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentStepIndex + 1, steps.length - 1)
      : Math.max(currentStepIndex - 1, 0);
    
    onStepChange(newIndex);
    ScreenReaderSupport.announce(
      `Navigated to step ${newIndex + 1}`,
      'polite'
    );
  };

  const toggleBrailleDisplay = () => {
    setShowBraille(!showBraille);
    ScreenReaderSupport.announce(
      showBraille ? 'Braille display hidden' : 'Braille display shown',
      'polite'
    );
  };

  const renderMultiModalContent = () => {
    if (!accessibleStep) return null;

    return (
      <div className="space-y-4">
        {/* Standard Content */}
        <div 
          ref={contentRef}
          className={`prose max-w-none ${profile.preferences.cognitive.simplifiedLayout ? 'prose-lg' : ''}`}
          style={{
            fontSize: `calc(1rem * var(--font-size-scale, 1))`
          }}
        >
          <p className="text-lg leading-relaxed">{accessibleStep.baseContent}</p>
        </div>

        {/* Braille Display (if enabled) */}
        {(profile.communication.primaryMethod === 'braille' || showBraille) && accessibleStep.alternatives?.braille && (
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="h-5 w-5" />
                Braille Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="font-mono text-2xl leading-loose tracking-wider"
                aria-label="Braille representation"
              >
                {multiModalService.convertToBraille(accessibleStep.baseContent).brailleText}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ASL Video (if available and enabled) */}
        {profile.communication.primaryMethod === 'asl' && accessibleStep.alternatives?.aslVideo && (
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                ASL Translation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <video
                src={accessibleStep.alternatives.aslVideo}
                controls
                className="w-full rounded-lg"
                aria-label="American Sign Language translation video"
              >
                <track kind="captions" srcLang="en" label="English" />
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>
        )}

        {/* Transcript (if captions enabled) */}
        {isFeatureEnabled('transcripts') && accessibleStep.alternatives?.transcript && (
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Full Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{accessibleStep.alternatives.transcript}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (!accessibleStep) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`accessible-learning-path ${profile.preferences.cognitive.simplifiedLayout ? 'simplified' : ''}`}
      role="main"
      aria-label="Learning path content"
    >
      {/* Progress Header */}
      <div className="mb-6" role="region" aria-label="Learning progress">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">
            Step {currentStepIndex + 1} of {steps.length}
          </h2>
          <Badge variant={currentStep.completed ? 'default' : 'secondary'}>
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress 
          value={progress} 
          className="h-2"
          aria-label={`Overall progress: ${Math.round(progress)}% complete`}
        />
      </div>

      {/* Main Content Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {accessibleStep.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentStep.description}
              </CardDescription>
            </div>
            {currentStep.completed && (
              <CheckCircle2 className="h-6 w-6 text-green-600" aria-label="Completed" />
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex gap-4 mt-4 flex-wrap">
            <Badge variant="outline">
              {currentStep.estimatedTime * (profile.preferences.cognitive.extraTime || 1)} min
            </Badge>
            <Badge variant="outline">{currentStep.type}</Badge>
            {accessibleStep.accessibilityMetadata.hasASL && (
              <Badge variant="outline">🤟 ASL Available</Badge>
            )}
            {accessibleStep.accessibilityMetadata.hasBraille && (
              <Badge variant="outline">⠃ Braille Available</Badge>
            )}
            {accessibleStep.accessibilityMetadata.hasCaptions && (
              <Badge variant="outline">📝 Captions Available</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {renderMultiModalContent()}

          {/* Accessibility Controls */}
          <div className="flex gap-2 mt-6 flex-wrap" role="toolbar" aria-label="Accessibility controls">
            {/* Text-to-Speech Toggle */}
            <Button
              variant="outline"
              onClick={handleTextToSpeech}
              aria-label={isSpeaking ? 'Stop reading aloud' : 'Read content aloud'}
              aria-pressed={isSpeaking}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Stop Reading
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Read Aloud
                </>
              )}
            </Button>

            {/* Braille Toggle */}
            {accessibleStep.alternatives?.braille && (
              <Button
                variant="outline"
                onClick={toggleBrailleDisplay}
                aria-label={showBraille ? 'Hide Braille' : 'Show Braille'}
                aria-pressed={showBraille}
              >
                <Type className="mr-2 h-4 w-4" />
                {showBraille ? 'Hide' : 'Show'} Braille
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div 
        className="flex gap-4 justify-between"
        role="navigation"
        aria-label="Step navigation"
      >
        <Button
          variant="outline"
          onClick={() => handleNavigateStep('prev')}
          disabled={currentStepIndex === 0}
          aria-label="Go to previous step"
          className={profile.preferences.motor.extendedClickArea ? 'px-8 py-6' : ''}
        >
          ← Previous Step
        </Button>

        <Button
          onClick={handleStepComplete}
          disabled={currentStep.completed}
          aria-label={currentStep.completed ? 'Step already completed' : 'Mark step as complete'}
          className={profile.preferences.motor.extendedClickArea ? 'px-8 py-6' : ''}
        >
          {currentStep.completed ? 'Completed ✓' : 'Complete Step'}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleNavigateStep('next')}
          disabled={currentStepIndex === steps.length - 1}
          aria-label="Go to next step"
          className={profile.preferences.motor.extendedClickArea ? 'px-8 py-6' : ''}
        >
          Next Step →
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      {profile.preferences.motor.keyboardOnly && (
        <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
          <strong>Keyboard Shortcuts:</strong>
          <ul className="mt-2 space-y-1">
            <li>• <kbd className="px-2 py-1 bg-background rounded">←</kbd> Previous step</li>
            <li>• <kbd className="px-2 py-1 bg-background rounded">→</kbd> Next step</li>
            <li>• <kbd className="px-2 py-1 bg-background rounded">Space</kbd> Complete step</li>
            <li>• <kbd className="px-2 py-1 bg-background rounded">R</kbd> Read aloud</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AccessibleLearningPath;

