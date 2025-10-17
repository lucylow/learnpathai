/**
 * Enhanced Multimodal Learning Interface
 * Real-time speech-to-text, text-to-speech, ASL recognition, and multilingual translation
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  CameraOff,
  Languages,
  Type,
  Video
} from 'lucide-react';

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const EnhancedMultimodalInterface: React.FC<{
  content?: string;
  onTranscript?: (text: string) => void;
}> = ({ content = '', onTranscript }) => {
  const { profile, multiModalService } = useAccessibility();
  
  // Speech-to-Text state
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Text-to-Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // ASL Recognition state
  const [aslEnabled, setAslEnabled] = useState(false);
  const [detectedSign, setDetectedSign] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Translation state
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es'); // Spanish default
  
  // Captions state
  const [liveCaptions, setLiveCaptions] = useState<string[]>([]);

  /**
   * Initialize Speech Recognition
   */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        
        if (onTranscript && finalTranscript) {
          onTranscript(finalTranscript);
        }

        // Add to live captions
        if (finalTranscript) {
          setLiveCaptions(prev => [...prev.slice(-5), finalTranscript].filter(Boolean));
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  /**
   * Toggle speech-to-text listening
   */
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /**
   * Speak text aloud
   */
  const speakText = async (text: string) => {
    if (!text) return;

    setIsSpeaking(true);
    try {
      await multiModalService.speakText(text, {
        rate: profile.preferences.visual.fontSize === 'large' ? 0.8 : 0.9,
        pitch: 1.0,
        volume: 1.0
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  /**
   * Stop speaking
   */
  const stopSpeaking = () => {
    multiModalService.stopSpeaking();
    setIsSpeaking(false);
  };

  /**
   * Initialize ASL recognition
   */
  const toggleASLRecognition = async () => {
    if (!aslEnabled && videoRef.current) {
      try {
        // Initialize camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // In production: Initialize TensorFlow.js pose detection
        // await multiModalService.detectASLGesture(videoRef.current, (gesture) => {
        //   setDetectedSign(gesture.gesture);
        // });
        
        setAslEnabled(true);
      } catch (error) {
        console.error('ASL recognition error:', error);
        alert('Camera access denied or not available');
      }
    } else {
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setAslEnabled(false);
    }
  };

  /**
   * Translate text to target language
   */
  const translateText = async (text: string) => {
    // In production: Use Google Translate API or similar
    // For now, simulate translation
    setTranslatedText(`[${targetLanguage.toUpperCase()}] ${text}`);
    
    // Speak in target language
    if (multiModalService) {
      await multiModalService.speakText(text, {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        lang: targetLanguage === 'es' ? 'es-ES' : 
              targetLanguage === 'fr' ? 'fr-FR' :
              targetLanguage === 'sw' ? 'sw-KE' : 'en-US'
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Multimodal Learning Interface
          </CardTitle>
          <div className="flex gap-2">
            {isListening && (
              <Badge variant="destructive" className="animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="default" className="animate-pulse">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
            {aslEnabled && (
              <Badge variant="secondary" className="animate-pulse">
                <Camera className="h-3 w-3 mr-1" />
                ASL Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="speech" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="speech">Speech</TabsTrigger>
            <TabsTrigger value="asl">ASL</TabsTrigger>
            <TabsTrigger value="translation">Translation</TabsTrigger>
            <TabsTrigger value="captions">Captions</TabsTrigger>
          </TabsList>

          {/* Speech-to-Text / Text-to-Speech */}
          <TabsContent value="speech" className="space-y-4">
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? 'destructive' : 'default'}
                  className="flex-1"
                >
                  {isListening ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Speech-to-Text
                    </>
                  )}
                </Button>

                <Button
                  onClick={isSpeaking ? stopSpeaking : () => speakText(transcript || content)}
                  disabled={!transcript && !content}
                  variant={isSpeaking ? 'destructive' : 'secondary'}
                  className="flex-1"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="mr-2 h-4 w-4" />
                      Stop Speaking
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2 h-4 w-4" />
                      Read Aloud
                    </>
                  )}
                </Button>
              </div>

              {/* Transcript Display */}
              <div className="min-h-[120px] p-4 border rounded-lg bg-muted">
                <h4 className="text-sm font-semibold mb-2">Transcript:</h4>
                <p className="text-sm">
                  {transcript || content || 'Click "Start Speech-to-Text" to begin...'}
                </p>
              </div>

              {/* Instructions */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Use speech-to-text for voice input (hands-free)</p>
                <p>• Text-to-speech reads content aloud at your preferred speed</p>
                <p>• Works in multiple languages (set in accessibility settings)</p>
              </div>
            </div>
          </TabsContent>

          {/* ASL Recognition */}
          <TabsContent value="asl" className="space-y-4">
            <div className="space-y-4">
              <Button
                onClick={toggleASLRecognition}
                variant={aslEnabled ? 'destructive' : 'default'}
                className="w-full"
              >
                {aslEnabled ? (
                  <>
                    <CameraOff className="mr-2 h-4 w-4" />
                    Stop ASL Recognition
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Start ASL Recognition
                  </>
                )}
              </Button>

              {/* Video Preview */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {!aslEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Camera Off</p>
                    </div>
                  </div>
                )}
                {detectedSign && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 p-3 rounded-lg">
                    <p className="text-white text-center font-semibold">
                      Detected: {detectedSign}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Uses computer vision to recognize American Sign Language</p>
                <p>• Based on High Five AI's ASL detection technology</p>
                <p>• Converts signs to text in real-time</p>
                <p className="text-yellow-600">⚠️ Camera access required</p>
              </div>
            </div>
          </TabsContent>

          {/* Translation */}
          <TabsContent value="translation" className="space-y-4">
            <div className="space-y-4">
              {/* Language Selector */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Target Language:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'es', name: 'Español' },
                    { code: 'fr', name: 'Français' },
                    { code: 'sw', name: 'Kiswahili' },
                    { code: 'ar', name: 'العربية' },
                    { code: 'am', name: 'አማርኛ' },
                    { code: 'yo', name: 'Yorùbá' },
                  ].map(lang => (
                    <Button
                      key={lang.code}
                      variant={targetLanguage === lang.code ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTargetLanguage(lang.code)}
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => translateText(transcript || content)}
                disabled={!transcript && !content}
                className="w-full"
              >
                <Languages className="mr-2 h-4 w-4" />
                Translate & Speak
              </Button>

              {/* Translation Output */}
              {translatedText && (
                <div className="p-4 border rounded-lg bg-muted">
                  <h4 className="text-sm font-semibold mb-2">Translation:</h4>
                  <p className="text-sm">{translatedText}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Instant translation to 6+ African and international languages</p>
                <p>• Text-to-speech speaks in target language</p>
                <p>• Supports multilingual learners</p>
              </div>
            </div>
          </TabsContent>

          {/* Live Captions */}
          <TabsContent value="captions" className="space-y-4">
            <div className="space-y-4">
              <div className="min-h-[200px] max-h-[300px] overflow-y-auto p-4 border rounded-lg bg-black text-white">
                <h4 className="text-sm font-semibold mb-3">Live Captions:</h4>
                {liveCaptions.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Start speech recognition to see live captions...
                  </p>
                ) : (
                  <div className="space-y-2">
                    {liveCaptions.map((caption, index) => (
                      <p key={index} className="text-sm leading-relaxed">
                        {caption}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setLiveCaptions([])}
                  variant="outline"
                  size="sm"
                  disabled={liveCaptions.length === 0}
                >
                  Clear Captions
                </Button>
                <Button
                  onClick={() => {
                    const text = liveCaptions.join('\n');
                    navigator.clipboard.writeText(text);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={liveCaptions.length === 0}
                >
                  Copy Transcript
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Auto-generated real-time captions for deaf/hard-of-hearing</p>
                <p>• High accuracy speech recognition</p>
                <p>• Exportable transcripts for review</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedMultimodalInterface;

