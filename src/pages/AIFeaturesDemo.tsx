/**
 * AI Features Demo Page
 * Showcases all AI-powered features including explanations, quizzes, TTS, and semantic search
 */

import React, { useState } from 'react';
import { Brain, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  WhyCard,
  QuizGenerator,
  TTSPlayer,
  SemanticSearchWidget,
} from '../components/ai';

const AIFeaturesDemo: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('explanation');

  // Mock data for demonstration
  const mockUserId = 'demo-user-123';
  const mockNodeId = 'node-recursion';
  const mockResourceId = 'resource-video-recursion';
  const mockRecentAttempts = [
    {
      node_id: 'node-loops',
      score_pct: 65,
      hints_used: 2,
    },
  ];

  const demoText = `Recursion is a powerful programming technique where a function calls itself to solve a problem. 
  It's particularly useful for problems that can be broken down into smaller, similar sub-problems. 
  Every recursive function needs a base case to prevent infinite recursion and a recursive case that moves towards the base case.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      AI Features Demo
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Explore key-free AI integrations
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">
                Powered by Mock APIs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Interactive AI Features
          </h2>
          <p className="text-gray-600">
            Test all AI-powered features with mock APIs that can be replaced with real services
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="explanation">Explanations</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Generator</TabsTrigger>
            <TabsTrigger value="tts">Text-to-Speech</TabsTrigger>
            <TabsTrigger value="search">Semantic Search</TabsTrigger>
          </TabsList>

          <TabsContent value="explanation" className="space-y-4">
            <div className="bg-white rounded-lg p-6 border shadow-sm mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                AI Explanations ("Why This?")
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Generate personalized explanations for why a resource is recommended based on
                the user's learning history and performance.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Context-aware recommendations</li>
                <li>Evidence-based reasoning</li>
                <li>Next step suggestions</li>
                <li>Confidence scoring</li>
              </ul>
            </div>
            
            <WhyCard
              userId={mockUserId}
              nodeId={mockNodeId}
              resourceId={mockResourceId}
              recentAttempts={mockRecentAttempts}
            />
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <div className="bg-white rounded-lg p-6 border shadow-sm mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                AI Quiz Generator
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Generate adaptive quizzes on any topic with multiple difficulty levels.
                Perfect for knowledge checks and remediation.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Topic-based generation</li>
                <li>Multiple difficulty levels</li>
                <li>Instant feedback with explanations</li>
                <li>Score tracking</li>
              </ul>
            </div>

            <QuizGenerator
              defaultTopic="Recursion in Python"
              defaultDifficulty="medium"
              onComplete={(score) => console.log('Quiz completed with score:', score)}
            />
          </TabsContent>

          <TabsContent value="tts" className="space-y-4">
            <div className="bg-white rounded-lg p-6 border shadow-sm mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Text-to-Speech Player
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Convert any text content to speech for improved accessibility and
                multi-modal learning.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Accessibility support</li>
                <li>Multiple voices and languages</li>
                <li>Adjustable speed</li>
                <li>Playback controls</li>
              </ul>
            </div>

            <TTSPlayer
              text={demoText}
              voice="en-US"
              speed={1.0}
              title="Recursion Concept"
            />
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="bg-white rounded-lg p-6 border shadow-sm mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Semantic Search
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Find resources by meaning, not just keywords. Uses embeddings for
                intelligent resource discovery.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Meaning-based search</li>
                <li>Relevance scoring</li>
                <li>Context-aware results</li>
                <li>Fast similarity matching</li>
              </ul>
            </div>

            <SemanticSearchWidget
              onResourceSelect={(resourceId) => 
                console.log('Selected resource:', resourceId)
              }
            />

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Try searching:</strong> "recursion tutorial", "loops python", 
                "variables", or any programming concept
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Implementation Notes */}
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Implementation Notes
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">Backend Mock APIs</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Quiz generation endpoint</li>
                <li>Explanation generation endpoint</li>
                <li>TTS synthesis endpoint</li>
                <li>Semantic search endpoint</li>
                <li>Embeddings generation endpoint</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Supabase Edge Functions</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>explain - Generate explanations</li>
                <li>generateQuiz - Create quizzes</li>
                <li>embedResource - Generate embeddings</li>
                <li>querySimilar - Semantic search</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-900">
              <strong>Note:</strong> All features are currently using mock APIs with simulated responses. 
              These can be easily replaced with real AI services (OpenAI, Hugging Face, etc.) by 
              updating the service layer without changing any UI code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesDemo;


