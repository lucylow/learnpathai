/**
 * QuizGenerator Component
 * Generates and displays AI-powered quizzes
 */

import React, { useState } from 'react';
import { Brain, CheckCircle2, XCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { useQuizGenerator } from '../../hooks/useQuizGenerator';

interface QuizGeneratorProps {
  defaultTopic?: string;
  defaultDifficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (score: number) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  defaultTopic = '',
  defaultDifficulty = 'medium',
  onComplete,
}) => {
  const [topic, setTopic] = useState(defaultTopic);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(defaultDifficulty);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { quiz, questions, loading, error, generateQuiz, reset } = useQuizGenerator();

  const handleGenerate = () => {
    if (!topic.trim()) return;
    
    reset();
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    
    generateQuiz({
      topic: topic.trim(),
      difficulty,
      num_questions: 3,
    });
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    const correctAnswers = questions.filter(
      (q, idx) => selectedAnswers[idx] === q.correct
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    if (onComplete) {
      onComplete(score);
    }
    return score;
  };

  const score = showResults ? calculateScore() : 0;

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <CardTitle>AI Quiz Generator</CardTitle>
        </div>
        <CardDescription>
          Generate personalized quizzes on any topic
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!quiz && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Recursion in Python"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <RadioGroup value={difficulty} onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="easy" id="easy" />
                  <Label htmlFor="easy">Easy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hard" id="hard" />
                  <Label htmlFor="hard">Hard</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {quiz && !showResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
              <Badge className="bg-indigo-600">
                {quiz.difficulty.toUpperCase()}
              </Badge>
            </div>

            <div className="bg-white rounded-lg p-4 border border-indigo-200">
              <h3 className="font-medium text-gray-900 mb-4">
                {questions[currentQuestion].question}
              </h3>

              <RadioGroup
                value={selectedAnswers[currentQuestion] || ''}
                onValueChange={handleAnswer}
              >
                {questions[currentQuestion].options.map((option, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-indigo-50 cursor-pointer"
                  >
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentQuestion]}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {showResults && (
          <div className="space-y-4">
            <div className={`text-center p-6 rounded-lg ${
              score >= 70 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            } border`}>
              <div className="text-4xl font-bold mb-2">
                {score}%
              </div>
              <p className="text-gray-600">
                {score >= 70 ? 'Great job!' : 'Keep practicing!'}
              </p>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correct;
                return (
                  <div
                    key={q.qid}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-1">{q.question}</p>
                        <p className="text-sm text-gray-600 mb-1">
                          Your answer: {selectedAnswers[idx]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700 mb-1">
                            Correct answer: {q.correct}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 italic">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => {
                reset();
                setCurrentQuestion(0);
                setSelectedAnswers([]);
                setShowResults(false);
              }}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              New Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizGenerator;


