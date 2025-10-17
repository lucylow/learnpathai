/**
 * TTSPlayer Component
 * Text-to-Speech player with accessibility controls
 */

import React, { useEffect } from 'react';
import { Volume2, Play, Pause, Square, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

interface TTSPlayerProps {
  text: string;
  voice?: string;
  speed?: number;
  autoPlay?: boolean;
  title?: string;
}

export const TTSPlayer: React.FC<TTSPlayerProps> = ({
  text,
  voice = 'en-US',
  speed = 1.0,
  autoPlay = false,
  title = 'Text-to-Speech',
}) => {
  const { audio, playing, loading, error, synthesize, play, pause, stop, reset } =
    useTextToSpeech();

  useEffect(() => {
    if (text) {
      synthesize({ text, voice, speed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    if (audio && autoPlay) {
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio, autoPlay]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>
          Listen to the content with AI-powered text-to-speech
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Synthesizing audio...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {audio && !loading && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {voice}
                </Badge>
                {audio.duration_ms && (
                  <span className="text-sm text-gray-600">
                    {formatDuration(audio.duration_ms)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!playing ? (
                  <Button
                    onClick={play}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Play
                  </Button>
                ) : (
                  <Button
                    onClick={pause}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                )}

                <Button onClick={stop} variant="outline" size="lg">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>

                <Button
                  onClick={() => synthesize({ text, voice, speed })}
                  variant="ghost"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-900 font-medium mb-1">
                Text Preview
              </p>
              <p className="text-sm text-blue-700 line-clamp-3">
                {text}
              </p>
            </div>
          </div>
        )}

        {!audio && !loading && !error && (
          <div className="text-center py-6 text-gray-500">
            <Volume2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Audio will be generated automatically</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TTSPlayer;


