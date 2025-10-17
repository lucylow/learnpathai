/**
 * KTModelToggle Component
 * 
 * Toggle between Beta, DKT, and Ensemble knowledge tracing models
 * Shows side-by-side predictions with explanations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  GitBranch, 
  BarChart3, 
  Info,
  TrendingUp,
  Shield,
  Zap,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface ModelPrediction {
  concept: string;
  mastery: number;
}

export interface EnsembleData {
  beta_prediction: Record<string, number>;
  dkt_prediction: Record<string, number> | null;
  blended_prediction: Record<string, number>;
  models_used: {
    beta: boolean;
    dkt: boolean;
  };
  weights: {
    beta: number;
    dkt: number;
  };
}

interface KTModelToggleProps {
  ensembleData?: EnsembleData;
  isLoading?: boolean;
  onRequestPrediction?: () => void;
  className?: string;
}

export const KTModelToggle: React.FC<KTModelToggleProps> = ({
  ensembleData,
  isLoading = false,
  onRequestPrediction,
  className
}) => {
  const [activeModel, setActiveModel] = useState<'beta' | 'dkt' | 'ensemble'>('ensemble');
  const [showExplanation, setShowExplanation] = useState(true);

  const getModelExplanation = (model: 'beta' | 'dkt' | 'ensemble') => {
    switch (model) {
      case 'beta':
        return {
          title: 'Beta-Bernoulli Model',
          icon: <Shield className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Explainable statistical model using Bayesian inference',
          strengths: [
            'Highly transparent and explainable',
            'Mathematically grounded',
            'Fast computation',
            'Clear success/failure tracking'
          ],
          limitations: [
            'Does not capture temporal patterns',
            'Limited to simple skill models'
          ],
          useCase: 'Best for: Transparency, auditing, simple skill tracking'
        };
      case 'dkt':
        return {
          title: 'Deep Knowledge Tracing (DKT)',
          icon: <Zap className="h-5 w-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          description: 'Neural network model capturing complex temporal patterns',
          strengths: [
            'Captures complex dependencies',
            'Learns temporal patterns',
            'High predictive accuracy',
            'Handles skill interactions'
          ],
          limitations: [
            'Less explainable',
            'Requires more training data',
            'Computationally intensive'
          ],
          useCase: 'Best for: Predictive accuracy, complex learning patterns'
        };
      case 'ensemble':
        return {
          title: 'Ensemble Model (Beta + DKT)',
          icon: <Scale className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'Blended approach combining explainability with predictive power',
          strengths: [
            'Best of both worlds',
            'Balanced accuracy and transparency',
            'Robust to different scenarios',
            'Configurable weighting'
          ],
          limitations: [
            'Slightly more complex',
            'Requires both models available'
          ],
          useCase: 'Best for: Production systems requiring both accuracy and explainability'
        };
    }
  };

  const getPredictionData = () => {
    if (!ensembleData) return [];

    const predictions: ModelPrediction[] = [];
    const sourceData = 
      activeModel === 'beta' ? ensembleData.beta_prediction :
      activeModel === 'dkt' ? (ensembleData.dkt_prediction || {}) :
      ensembleData.blended_prediction;

    Object.entries(sourceData).forEach(([concept, mastery]) => {
      predictions.push({ concept, mastery });
    });

    return predictions.sort((a, b) => b.mastery - a.mastery);
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 0.7) return 'text-green-600 bg-green-100';
    if (mastery >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const explanation = getModelExplanation(activeModel);
  const predictions = getPredictionData();

  return (
    <Card className={cn('border-2', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Knowledge Tracing Models
            </CardTitle>
            <CardDescription className="mt-1">
              Compare predictions across different AI models
            </CardDescription>
          </div>
          {onRequestPrediction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestPrediction}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeModel} onValueChange={(val) => setActiveModel(val as 'beta' | 'dkt' | 'bkt_irt')}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="beta" className="text-sm">
              <Shield className="h-4 w-4 mr-1" />
              Beta
            </TabsTrigger>
            <TabsTrigger 
              value="dkt" 
              className="text-sm"
              disabled={!ensembleData?.models_used.dkt}
            >
              <Zap className="h-4 w-4 mr-1" />
              DKT
            </TabsTrigger>
            <TabsTrigger value="ensemble" className="text-sm">
              <Scale className="h-4 w-4 mr-1" />
              Ensemble
            </TabsTrigger>
          </TabsList>

          {/* Model Explanation Card */}
          {showExplanation && (
            <motion.div
              key={activeModel}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-4 rounded-lg border-2 mb-4',
                explanation.bgColor,
                explanation.borderColor
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={explanation.color}>
                    {explanation.icon}
                  </div>
                  <h3 className="font-semibold text-sm">{explanation.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplanation(false)}
                  className="h-6 text-xs"
                >
                  Hide
                </Button>
              </div>

              <p className="text-sm text-gray-700 mb-3">
                {explanation.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-medium text-gray-900 mb-1">Strengths</div>
                  <ul className="space-y-1 text-gray-600">
                    {explanation.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-600 mt-0.5">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Limitations</div>
                  <ul className="space-y-1 text-gray-600">
                    {explanation.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-orange-600 mt-0.5">•</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-300">
                <div className="text-xs font-medium text-gray-900">
                  {explanation.useCase}
                </div>
              </div>
            </motion.div>
          )}

          {!showExplanation && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanation(true)}
              className="w-full mb-4"
            >
              <Info className="h-4 w-4 mr-2" />
              Show Model Info
            </Button>
          )}

          {/* Predictions Display */}
          {ensembleData && predictions.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">
                  Mastery Predictions
                </div>
                {activeModel === 'ensemble' && (
                  <Badge variant="outline" className="text-xs">
                    Weights: {(ensembleData.weights.beta * 100).toFixed(0)}% Beta,{' '}
                    {(ensembleData.weights.dkt * 100).toFixed(0)}% DKT
                  </Badge>
                )}
              </div>

              {predictions.map((pred, idx) => (
                <motion.div
                  key={`${pred.concept}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {pred.concept}
                    </div>
                  </div>

                  {/* Mastery Bar */}
                  <div className="w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pred.mastery * 100}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className={cn(
                            'h-full rounded-full',
                            pred.mastery >= 0.7 ? 'bg-green-500' :
                            pred.mastery >= 0.4 ? 'bg-yellow-500' :
                            'bg-red-500'
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Badge 
                    variant="outline"
                    className={cn('w-16 justify-center', getMasteryColor(pred.mastery))}
                  >
                    {(pred.mastery * 100).toFixed(0)}%
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No predictions available</p>
              {onRequestPrediction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestPrediction}
                  className="mt-4"
                >
                  Generate Predictions
                </Button>
              )}
            </div>
          )}

          {/* Comparison View (Ensemble Only) */}
          {activeModel === 'ensemble' && ensembleData && ensembleData.models_used.dkt && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Model Comparison
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <div className="font-medium text-gray-900">Beta Model</div>
                  <div className="text-green-600 mt-1">Explainable</div>
                </div>
                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                  <div className="font-medium text-gray-900">DKT Model</div>
                  <div className="text-purple-600 mt-1">Predictive</div>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="font-medium text-gray-900">Ensemble</div>
                  <div className="text-blue-600 mt-1">Balanced</div>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KTModelToggle;

