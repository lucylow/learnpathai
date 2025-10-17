import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import './MicroChallenge.css';

interface Challenge {
  id: string;
  type: 'multiple_choice' | 'code_fill';
  question: string;
  options?: string[];
  correct?: number;
  correctAnswer?: string;
  explanation?: string;
  timeEstimate: number;
}

interface ChallengeResult {
  challengeId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface MicroChallengeProps {
  concept: string;
  level?: string;
  onComplete?: (results: any) => void;
}

const MicroChallenge: React.FC<MicroChallengeProps> = ({ 
  concept, 
  level = 'beginner', 
  onComplete 
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, [concept, level]);

  useEffect(() => {
    if (!showResults && challenges.length > 0) {
      const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, challenges]);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/challenges/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, level, count: 3 })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch challenges');
      }
      
      const data = await response.json();
      setChallenges(data.challenges);
      setCurrentChallenge(0);
      setAnswers({});
      setTimeSpent(0);
      setShowResults(false);
    } catch (error: any) {
      console.error('Failed to fetch challenges:', error);
      setError(error.message || 'Failed to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (challengeId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [challengeId]: answer }));
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
    }
  };

  const previousChallenge = () => {
    if (currentChallenge > 0) {
      setCurrentChallenge(prev => prev - 1);
    }
  };

  const submitAnswers = async () => {
    const answerArray = Object.entries(answers).map(([challengeId, answer]) => ({
      challengeId,
      answer
    }));

    try {
      const response = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          challenges,
          answers: answerArray, 
          timeSpent 
        })
      });
      
      const resultData = await response.json();
      setResults(resultData);
      setShowResults(true);
      
      if (resultData.passed) {
        triggerConfetti();
      }
      
      // Award XP
      if (resultData.xpEarned > 0) {
        await fetch('/api/gamify/award-xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'demo-user',
            xp: resultData.xpEarned,
            source: 'micro_challenge',
            metadata: { concept, score: resultData.score }
          })
        });
      }

      // Award badges
      if (resultData.badges && resultData.badges.length > 0) {
        for (const badge of resultData.badges) {
          await fetch('/api/gamify/award-badge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'demo-user',
              badgeId: badge.id,
              badgeName: badge.name,
              description: badge.description,
              rarity: badge.rarity
            })
          });
        }
      }
      
      if (onComplete) {
        onComplete(resultData);
      }
    } catch (error) {
      console.error('Failed to submit answers:', error);
      setError('Failed to submit answers. Please try again.');
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600">Loading challenges...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-red-200">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-red-600 text-center">{error}</p>
            <Button onClick={fetchChallenges} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults && results) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center justify-between">
            <span>Challenge Results</span>
            <Trophy className="h-6 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-purple-600">
                {results.score}%
              </div>
              <p className="text-xl text-gray-700">{results.feedback}</p>
              
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{results.correct} / {results.total} Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>{formatTime(results.timeSpent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span>+{results.xpEarned} XP</span>
                </div>
              </div>
            </div>

            {/* Badges Earned */}
            {results.badges && results.badges.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Badges Earned! 🏆</h3>
                <div className="space-y-2">
                  {results.badges.map((badge: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className={`badge-${badge.rarity}`}>
                        {badge.name}
                      </Badge>
                      <span className="text-sm text-gray-600">{badge.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Detailed Results</h3>
              {results.detailedResults.map((result: ChallengeResult, index: number) => (
                <div 
                  key={result.challengeId}
                  className={`p-4 rounded-lg border-2 ${
                    result.correct 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        Question {index + 1}
                      </p>
                      {!result.correct && (
                        <>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Your answer:</span> {result.userAnswer}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Correct answer:</span> {result.correctAnswer}
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            {result.explanation}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={fetchChallenges} className="flex-1" variant="outline">
            Try Another Challenge
          </Button>
          {onComplete && (
            <Button onClick={() => onComplete(results)} className="flex-1">
              Continue Learning
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  const challenge = challenges[currentChallenge];
  const progress = ((currentChallenge + 1) / challenges.length) * 100;
  const allAnswered = challenges.every(c => answers[c.id]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Micro Challenge: {concept}</CardTitle>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {formatTime(timeSpent)}
            </Badge>
          </div>
          <Progress value={progress} className="bg-white/20" />
          <div className="flex justify-between text-sm opacity-90">
            <span>Question {currentChallenge + 1} of {challenges.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-relaxed whitespace-pre-wrap">
              {challenge?.question}
            </h3>
          </div>

          {challenge?.type === 'multiple_choice' && (
            <div className="space-y-3">
              {challenge.options?.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    answers[challenge.id] === option
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                  onClick={() => handleAnswer(challenge.id, option)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[challenge.id] === option
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}>
                      {answers[challenge.id] === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {challenge?.type === 'code_fill' && (
            <div className="space-y-3">
              <textarea
                className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg font-mono text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none resize-vertical"
                placeholder="Enter your answer..."
                value={answers[challenge.id] || ''}
                onChange={(e) => handleAnswer(challenge.id, e.target.value)}
              />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-3 bg-gray-50 p-6">
        <Button 
          onClick={previousChallenge}
          disabled={currentChallenge === 0}
          variant="outline"
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {challenges.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                answers[challenges[index].id] 
                  ? 'bg-purple-600' 
                  : index === currentChallenge
                  ? 'bg-purple-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {currentChallenge < challenges.length - 1 ? (
          <Button 
            onClick={nextChallenge}
            disabled={!answers[challenge.id]}
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={submitAnswers}
            disabled={!allAnswered}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Complete Challenge 🚀
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MicroChallenge;


