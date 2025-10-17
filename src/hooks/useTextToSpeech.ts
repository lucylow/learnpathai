/**
 * useTextToSpeech Hook
 * React hook for text-to-speech synthesis
 */

import { useState, useCallback, useRef } from 'react';
import AIExternalService from '../services/ai-external.service';
import type { TTSResponse } from '../services/ai-external.service';

interface UseTextToSpeechParams {
  text: string;
  voice?: string;
  speed?: number;
}

interface UseTextToSpeechReturn {
  audio: TTSResponse | null;
  playing: boolean;
  loading: boolean;
  error: string | null;
  synthesize: (params: UseTextToSpeechParams) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [audio, setAudio] = useState<TTSResponse | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const synthesize = useCallback(async (params: UseTextToSpeechParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await AIExternalService.synthesizeSpeech(params);
      setAudio(result);
      
      // Create audio element
      audioRef.current = new Audio(result.audio_url);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => {
        setError('Failed to load audio');
        setPlaying(false);
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TTS synthesis failed';
      setError(errorMessage);
      console.error('TTS error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudio(null);
    setPlaying(false);
    setError(null);
    setLoading(false);
  }, []);

  return {
    audio,
    playing,
    loading,
    error,
    synthesize,
    play,
    pause,
    stop,
    reset,
  };
}

export default useTextToSpeech;


