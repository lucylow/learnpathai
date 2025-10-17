// src/components/ExplainabilityDashboard.tsx
/**
 * Explainable AI (XAI) Dashboard
 * Shows WHY the AI made recommendations with transparency and trust-building
 * Critical for ethical AI and educator buy-in
 */
import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  GitBranch, 
  TrendingUp, 
  Users, 
  Target,
  Info,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureImportance {
  feature: string;
  importance: number; // 0-1 (SHAP value)
  description: string;
}

interface RecommendationExplanation {
  resource_id: string;
  resource_title: string;
  confidence: number;
  feature_importances: FeatureImportance[];
  graph_path: string[]; // prerequisite chain
  success_rate: number; // historical data
  counterfactual?: string; // "If X, then Y"
}

interface ExplainabilityDashboardProps {
  recommendation: RecommendationExplanation;
  studentMastery: Record<string, number>;
  onOverride?: () => void;
}

export const ExplainabilityDashboard: React.FC<ExplainabilityDashboardProps> = ({
  recommendation,
  studentMastery,
  onOverride
}) => {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Why This Recommendation?</h3>
            <p className="text-sm text-gray-600">Transparent AI Decision-Making</p>
          </div>
        </div>
        
        {/* Confidence Badge */}
        <div className="text-right">
          <Badge 
            variant={recommendation.confidence > 0.8 ? 'default' : 'secondary'}
            className="text-lg px-4 py-2"
          >
            {Math.round(recommendation.confidence * 100)}% Confident
          </Badge>
        </div>
      </div>

      {/* Resource Info */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-1">
          📚 {recommendation.resource_title}
        </h4>
        <p className="text-sm text-gray-600">
          {Math.round(recommendation.success_rate * 100)}% of students who used this resource improved their mastery
        </p>
      </div>

      {/* Explanation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Factors
          </TabsTrigger>
          <TabsTrigger value="path" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Path
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="what-if" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            What If
          </TabsTrigger>
        </TabsList>

        {/* Feature Importance Tab */}
        <TabsContent value="features" className="space-y-4 mt-4">
          <p className="text-sm text-gray-700 mb-4">
            These factors influenced the AI's decision (SHAP values):
          </p>
          
          {recommendation.feature_importances
            .sort((a, b) => b.importance - a.importance)
            .map((feature, idx) => (
              <motion.div
                key={feature.feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      feature.importance > 0.7 ? 'bg-emerald-500' :
                      feature.importance > 0.4 ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900">{feature.feature}</span>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" title={feature.description} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {Math.round(feature.importance * 100)}%
                  </span>
                </div>
                <Progress value={feature.importance * 100} className="h-2" />
                <p className="text-xs text-gray-600 ml-4">{feature.description}</p>
              </motion.div>
            ))}
        </TabsContent>

        {/* Knowledge Graph Path Tab */}
        <TabsContent value="path" className="mt-4">
          <p className="text-sm text-gray-700 mb-4">
            Prerequisite learning path leading to this recommendation:
          </p>
          
          <div className="space-y-3">
            {recommendation.graph_path.map((concept, idx) => {
              const mastery = studentMastery[concept] || 0;
              const isComplete = mastery >= 0.7;
              const isCurrent = idx === recommendation.graph_path.length - 1;
              
              return (
                <motion.div
                  key={concept}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex items-center gap-3"
                >
                  {/* Step Number / Status */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    isComplete ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-5 h-5" /> :
                     isCurrent ? <Target className="w-5 h-5" /> :
                     idx + 1}
                  </div>

                  {/* Concept Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium capitalize ${
                        isCurrent ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {concept}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(mastery * 100)}% mastery
                      </span>
                    </div>
                    <Progress 
                      value={mastery * 100} 
                      className="h-1.5"
                    />
                  </div>

                  {/* Connector Arrow */}
                  {idx < recommendation.graph_path.length - 1 && (
                    <div className="ml-2 text-gray-400">
                      ↓
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Path Insight */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>💡 Insight:</strong> This recommendation follows your learning trajectory through{' '}
              {recommendation.graph_path.slice(0, -1).join(' → ')} to reach{' '}
              <strong>{recommendation.graph_path[recommendation.graph_path.length - 1]}</strong>.
            </p>
          </div>
        </TabsContent>

        {/* Historical Evidence Tab */}
        <TabsContent value="data" className="mt-4 space-y-4">
          <p className="text-sm text-gray-700 mb-4">
            Evidence from other learners with similar profiles:
          </p>

          {/* Success Rate */}
          <Card className="p-4 border-emerald-200 bg-emerald-50">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h5 className="font-semibold text-gray-900">Success Rate</h5>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mb-1">
              {Math.round(recommendation.success_rate * 100)}%
            </p>
            <p className="text-sm text-gray-600">
              of students improved their mastery after completing this resource
            </p>
          </Card>

          {/* Comparison to Alternatives */}
          <Card className="p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Compared to Alternatives</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">This resource (recommended)</span>
                <div className="flex items-center gap-2">
                  <Progress value={recommendation.success_rate * 100} className="w-24 h-2" />
                  <span className="font-semibold">{Math.round(recommendation.success_rate * 100)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Average alternative</span>
                <div className="flex items-center gap-2">
                  <Progress value={65} className="w-24 h-2" />
                  <span className="text-gray-600">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Random selection</span>
                <div className="flex items-center gap-2">
                  <Progress value={45} className="w-24 h-2" />
                  <span className="text-gray-600">45%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Learner Demographics */}
          <Card className="p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Similar Learners</h5>
            <p className="text-sm text-gray-700">
              This recommendation is based on data from <strong>247 learners</strong> with:
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
              <li>• Similar mastery levels (40-60% in prerequisite concepts)</li>
              <li>• Comparable learning pace</li>
              <li>• Same preferred modality (video)</li>
            </ul>
          </Card>
        </TabsContent>

        {/* Counterfactual "What If" Tab */}
        <TabsContent value="what-if" className="mt-4 space-y-4">
          <p className="text-sm text-gray-700 mb-4">
            Understanding alternative scenarios:
          </p>

          {recommendation.counterfactual && (
            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h5 className="font-semibold text-gray-900">Counterfactual Scenario</h5>
              </div>
              <p className="text-sm text-gray-700">{recommendation.counterfactual}</p>
            </Card>
          )}

          {/* What If Scenarios */}
          <div className="space-y-3">
            <WhatIfScenario
              condition="If your mastery in loops was 80% (instead of current level)"
              outcome="The AI would recommend advanced loop patterns instead"
              likelihood="high"
            />
            <WhatIfScenario
              condition="If you preferred text over video"
              outcome="The AI would suggest the documentation guide (confidence: 73%)"
              likelihood="medium"
            />
            <WhatIfScenario
              condition="If prerequisites were fully mastered (70%+)"
              outcome="The AI would skip this and suggest the next concept directly"
              likelihood="low"
            />
          </div>

          {/* Transparency Note */}
          <Card className="p-4 border-blue-200 bg-blue-50">
            <p className="text-sm text-gray-700">
              <strong>🔍 Transparency:</strong> These scenarios help you understand the AI's decision boundaries.
              You can always choose a different path—the AI is here to assist, not dictate.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Override Option (for educators) */}
      {onOverride && (
        <div className="pt-4 border-t">
          <button
            onClick={onOverride}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Override this recommendation (educator control)
          </button>
        </div>
      )}
    </Card>
  );
};

// Helper Component
const WhatIfScenario: React.FC<{
  condition: string;
  outcome: string;
  likelihood: 'high' | 'medium' | 'low';
}> = ({ condition, outcome, likelihood }) => {
  const colors = {
    high: 'border-emerald-200 bg-emerald-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-gray-200 bg-gray-50'
  };

  return (
    <Card className={`p-3 ${colors[likelihood]}`}>
      <p className="text-sm font-medium text-gray-900 mb-1">
        {condition}
      </p>
      <p className="text-xs text-gray-600">→ {outcome}</p>
    </Card>
  );
};

// Demo data generator for testing
export const generateDemoExplanation = (concept: string): RecommendationExplanation => {
  return {
    resource_id: 'res_123',
    resource_title: `Master ${concept} with Interactive Examples`,
    confidence: 0.87,
    feature_importances: [
      {
        feature: 'Content Similarity',
        importance: 0.92,
        description: 'Resource content closely matches your learning needs for this concept'
      },
      {
        feature: 'Modality Match',
        importance: 0.85,
        description: 'Video format matches your preferred learning style'
      },
      {
        feature: 'Difficulty Alignment',
        importance: 0.78,
        description: 'Difficulty level is appropriate for your current mastery (52%)'
      },
      {
        feature: 'Historical Success',
        importance: 0.73,
        description: 'High success rate with similar learners'
      },
      {
        feature: 'Prerequisite Readiness',
        importance: 0.65,
        description: 'You have mastered the required prerequisites'
      }
    ],
    graph_path: ['variables', 'conditionals', concept],
    success_rate: 0.84,
    counterfactual: `If you had scored 20% higher on the prerequisite quiz, the AI would have recommended the advanced ${concept} workshop instead.`
  };
};

