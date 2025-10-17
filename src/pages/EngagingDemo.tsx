import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MicroChallenge from '@/components/micro/MicroChallenge';
import XPBar from '@/components/gamify/XPBar';
import BadgeDisplay from '@/components/gamify/BadgeDisplay';
import { 
  Sparkles, 
  Trophy, 
  Target, 
  Zap, 
  Brain,
  Rocket,
  Star,
  TrendingUp
} from 'lucide-react';

const EngagingDemo: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<string>('for-loops');
  const [showChallenge, setShowChallenge] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const concepts = [
    { id: 'for-loops', name: 'For Loops', icon: '🔄', color: 'bg-blue-100 text-blue-700' },
    { id: 'functions', name: 'Functions', icon: '⚡', color: 'bg-purple-100 text-purple-700' },
    { id: 'variables', name: 'Variables', icon: '📦', color: 'bg-green-100 text-green-700' },
    { id: 'arrays', name: 'Arrays', icon: '📊', color: 'bg-orange-100 text-orange-700' },
  ];

  const handleChallengeComplete = (results: any) => {
    console.log('Challenge completed!', results);
    setRefreshKey(prev => prev + 1);
    
    // Show success message
    setTimeout(() => {
      setShowChallenge(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Engaging Education Demo
            </h1>
            <p className="text-gray-600 mt-1">
              Experience gamified, interactive learning with micro-challenges and rewards!
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="border-2 border-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-sm">Micro-Challenges</h3>
                  <p className="text-xs text-gray-500">2-5 minute tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-sm">XP & Leveling</h3>
                  <p className="text-xs text-gray-500">Track your growth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-sm">Badges</h3>
                  <p className="text-xs text-gray-500">Earn achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-sm">Instant Feedback</h3>
                  <p className="text-xs text-gray-500">Learn as you go</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="challenge" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenge" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Micro-Challenge
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Badges
          </TabsTrigger>
        </TabsList>

        {/* Micro-Challenge Tab */}
        <TabsContent value="challenge" className="space-y-6">
          {!showChallenge ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-purple-600" />
                  Choose a Concept to Master
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Select a concept below to start a quick 2-5 minute micro-challenge.
                    Complete it to earn XP, level up, and unlock badges!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {concepts.map((concept) => (
                      <button
                        key={concept.id}
                        onClick={() => setSelectedConcept(concept.id)}
                        className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                          selectedConcept === concept.id
                            ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{concept.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {concept.name}
                            </h3>
                            <Badge className={`${concept.color} mt-1`}>
                              3 Challenges
                            </Badge>
                          </div>
                          {selectedConcept === concept.id && (
                            <div className="text-purple-600">
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => setShowChallenge(true)}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8"
                    >
                      Start Challenge 🚀
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Challenge: {concepts.find(c => c.id === selectedConcept)?.name}
                </h2>
                <Button
                  onClick={() => setShowChallenge(false)}
                  variant="outline"
                >
                  Back to Concepts
                </Button>
              </div>

              <MicroChallenge
                key={selectedConcept}
                concept={selectedConcept}
                level="beginner"
                onComplete={handleChallengeComplete}
              />
            </div>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <XPBar key={refreshKey} userId="demo-user" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Challenges Completed</span>
                    <span className="text-lg font-bold text-purple-600">0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Average Score</span>
                    <span className="text-lg font-bold text-blue-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total XP Earned</span>
                    <span className="text-lg font-bold text-green-600">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Complete micro-challenges to unlock more concepts and advance your skills!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {concepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors"
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{concept.icon}</div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                          {concept.name}
                        </h4>
                        <div className="text-xs text-gray-500">Not started</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <BadgeDisplay key={refreshKey} userId="demo-user" />

          {/* Badge Info */}
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Perfect Score
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Answer all questions correctly in a challenge
                  </p>
                  <Badge className="mt-2 bg-yellow-600">Legendary</Badge>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Speed Demon
                  </h4>
                  <p className="text-sm text-blue-800">
                    Complete a challenge in record time
                  </p>
                  <Badge className="mt-2 bg-blue-600">Rare</Badge>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Dedicated Learner
                  </h4>
                  <p className="text-sm text-purple-800">
                    Complete 10 challenges
                  </p>
                  <Badge className="mt-2 bg-purple-600">Epic</Badge>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    First Steps
                  </h4>
                  <p className="text-sm text-green-800">
                    Complete your first challenge
                  </p>
                  <Badge className="mt-2 bg-green-600">Common</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo Instructions */}
      <Card className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Demo Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Select a concept from the available options</li>
            <li>Click "Start Challenge" to begin a micro-challenge</li>
            <li>Answer 3 quick questions (2-5 minutes total)</li>
            <li>Complete the challenge to earn XP and badges</li>
            <li>Watch your level increase and unlock achievements!</li>
            <li>Check the Progress tab to see your XP bar and stats</li>
            <li>Visit the Badges tab to view your collection</li>
          </ol>

          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">Pro Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Answer quickly to earn the "Speed Demon" badge</li>
              <li>Get perfect scores for legendary badges</li>
              <li>Complete multiple challenges to build your streak</li>
              <li>Level up to unlock bonus XP and rewards</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagingDemo;


