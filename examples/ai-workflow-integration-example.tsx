/**
 * LearnPath AI Workflows - Integration Example
 * Demonstrates how to use the production AI workflow system
 */

import React, { useState, useEffect } from 'react';
import { aiService } from '@/services/core/AIService';
import { adaptationEngine } from '@/services/core/AdaptationEngine';
import type { LearningEvent, AdaptiveResponse } from '@/types/ai-workflow.types';

interface KnowledgeState {
  conceptMastery: Record<string, number>;
  totalAttempts?: number;
  [key: string]: number | Record<string, number> | undefined;
}

export const AIWorkflowExample: React.FC = () => {
  const [userId] = useState('demo_user_001');
  const [currentConcept, setCurrentConcept] = useState('loops');
  const [response, setResponse] = useState<AdaptiveResponse | null>(null);
  const [knowledgeState, setKnowledgeState] = useState<KnowledgeState | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  // Subscribe to adaptation events
  useEffect(() => {
    adaptationEngine.subscribe({
      async onAdaptation(event, response) {
        console.log('🎯 Adaptation received:', {
          conceptId: event.conceptId,
          mastery: response.mastery,
          interventions: response.interventions?.length
        });
      }
    });
  }, []);

  // Load initial knowledge state
  useEffect(() => {
    loadKnowledgeState();
  }, [userId]);

  const loadKnowledgeState = async () => {
    try {
      const state = await aiService.getUserKnowledgeState(userId);
      setKnowledgeState(state);
    } catch (error) {
      console.error('Failed to load knowledge state:', error);
    }
  };

  const handleLearningEvent = async (correct: boolean) => {
    setLoading(true);
    const startTime = Date.now();

    try {
      // Create learning event
      const event: LearningEvent = {
        id: `event_${Date.now()}`,
        userId,
        conceptId: currentConcept,
        correct,
        timeSpent: Math.random() * 60000 + 15000, // 15-75 seconds
        confidence: correct ? 0.7 : 0.4,
        attemptNumber: 1,
        timestamp: new Date(),
        metadata: {
          source: 'example_component'
        }
      };

      // Process through adaptation engine
      const adaptiveResponse = await adaptationEngine.submitLearningEvent(event);
      
      setResponse(adaptiveResponse);
      setProcessingTime(Date.now() - startTime);

      // Reload knowledge state
      await loadKnowledgeState();

      // Check for interventions
      if (adaptiveResponse.interventions && adaptiveResponse.interventions.length > 0) {
        console.log('🚨 Interventions triggered:', adaptiveResponse.interventions);
      }

    } catch (error) {
      console.error('Error processing learning event:', error);
    } finally {
      setLoading(false);
    }
  };

  const predictTrajectory = async () => {
    try {
      const trajectory = await aiService.predictTrajectory(userId, currentConcept);
      console.log('📈 Learning trajectory:', trajectory);
      alert(`Predicted mastery: ${trajectory?.predictedMastery.toFixed(2)}\n` +
            `Time to mastery: ${trajectory?.estimatedTime.toFixed(1)} hours\n` +
            `Risk factors: ${trajectory?.riskFactors.length || 0}`);
    } catch (error) {
      console.error('Failed to predict trajectory:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        🧠 AI Workflow Integration Example
      </h1>

      {/* User Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-lg mb-2">Current Session</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">User ID:</span>
            <span className="ml-2 font-mono">{userId}</span>
          </div>
          <div>
            <span className="text-gray-600">Concept:</span>
            <span className="ml-2 font-semibold">{currentConcept}</span>
          </div>
        </div>
      </div>

      {/* Knowledge State */}
      {knowledgeState && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-lg mb-2">Knowledge State</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-gray-600 text-sm">Overall Mastery</div>
              <div className="text-2xl font-bold text-green-600">
                {(knowledgeState.overallMastery * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Ability (θ)</div>
              <div className="text-2xl font-bold text-blue-600">
                {knowledgeState.theta.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Concepts</div>
              <div className="text-2xl font-bold text-purple-600">
                {knowledgeState.conceptCount}
              </div>
            </div>
          </div>

          {Object.keys(knowledgeState.conceptMastery).length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Concept Mastery:</div>
              <div className="space-y-2">
                {Object.entries(knowledgeState.conceptMastery).map(([concept, mastery]: [string, number]) => (
                  <div key={concept} className="flex items-center">
                    <span className="w-32 text-sm">{concept}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all"
                        style={{ width: `${mastery * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm font-semibold w-12">
                      {(mastery * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Simulate Learning Event</h2>
        <div className="flex gap-4">
          <button
            onClick={() => handleLearningEvent(true)}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✅ Correct Answer
          </button>
          <button
            onClick={() => handleLearningEvent(false)}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ❌ Incorrect Answer
          </button>
        </div>
        <button
          onClick={predictTrajectory}
          disabled={loading}
          className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📈 Predict Learning Trajectory
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-gray-50 border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Adaptive Response</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              processingTime < 500 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              ⏱️ {processingTime}ms {processingTime < 500 ? '✓' : '⚠️'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-gray-600 text-sm">New Mastery</div>
              <div className="text-2xl font-bold text-blue-600">
                {(response.mastery * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Confidence</div>
              <div className="text-2xl font-bold text-green-600">
                {(response.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {response.path && response.path.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Recommended Path:</div>
              <div className="space-y-2">
                {response.path.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-white border rounded p-3 flex items-center justify-between"
                  >
                    <span className="font-medium">{step.concept_id || step.conceptId}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      step.type === 'current' || step.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {step.type || step.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {response.interventions && response.interventions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="text-sm font-semibold text-yellow-800 mb-2">
                🚨 Interventions Triggered
              </div>
              <div className="space-y-2">
                {response.interventions.map((intervention, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-semibold">{intervention.type}:</span>{' '}
                    {intervention.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Info */}
      <div className="bg-gray-800 text-white rounded-lg p-4">
        <h2 className="font-semibold mb-2">System Components</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            BKT-IRT Hybrid Model
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            Performance Predictor
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            Knowledge Graph
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            Adaptation Engine
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            Multi-Armed Bandit
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            Content Analyzer
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-400">
          Target Response Time: &lt;500ms | Backend: http://localhost:8001
        </div>
      </div>
    </div>
  );
};

export default AIWorkflowExample;

