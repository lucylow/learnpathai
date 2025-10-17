/**
 * Accessibility Settings Page
 * Full page for comprehensive accessibility configuration
 */

import React from 'react';
import { Layout } from '@/components/Layout';
import AccessibilitySettings from '@/components/accessibility/AccessibilitySettings';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AccessibilitySettingsPage: React.FC = () => {
  const { profile } = useAccessibility();

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Accessibility Settings
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Customize your learning experience to match your needs. 
            Inspired by High Five AI's commitment to inclusive education.
          </p>
        </div>

        {/* Current Profile Status */}
        <Card className="mb-8 max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Current Profile</Badge>
              {profile.preferences.visual.highContrast && (
                <Badge>High Contrast</Badge>
              )}
              {profile.preferences.auditory.requiresCaptions && (
                <Badge>Captions Enabled</Badge>
              )}
              {profile.preferences.motor.voiceControl && (
                <Badge>Voice Control</Badge>
              )}
              {profile.preferences.cognitive.simplifiedLayout && (
                <Badge>Simplified Layout</Badge>
              )}
              {profile.communication.primaryMethod !== 'text' && (
                <Badge>
                  {profile.communication.primaryMethod === 'asl' && '🤟 ASL'}
                  {profile.communication.primaryMethod === 'braille' && '⠃ Braille'}
                  {profile.communication.primaryMethod === 'speech' && '🔊 Speech'}
                  {profile.communication.primaryMethod === 'multimodal' && '🎯 Multi-Modal'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Settings Component */}
        <AccessibilitySettings />

        {/* Information Footer */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">
                Building on High Five AI
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  LearnPath AI's accessibility features are inspired by the High Five AI project, 
                  which pioneered accessible communication technologies for deaf, blind, and mute users.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">👁️ Visual Accessibility</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• High contrast modes</li>
                      <li>• Scalable fonts</li>
                      <li>• Color blind support</li>
                      <li>• Screen reader optimization</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">👂 Auditory Accessibility</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Real-time captions</li>
                      <li>• ASL translations</li>
                      <li>• Text transcripts</li>
                      <li>• Visual alerts</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">✋ Motor Accessibility</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Voice control</li>
                      <li>• Keyboard navigation</li>
                      <li>• Extended click areas</li>
                      <li>• Switch control support</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">🧠 Cognitive Accessibility</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Simplified layouts</li>
                      <li>• Reading assistance</li>
                      <li>• Extra time options</li>
                      <li>• Reduced complexity</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-xs">
                  <strong>WCAG 2.1 AA Compliant:</strong> All features meet or exceed 
                  Web Content Accessibility Guidelines Level AA standards.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilitySettingsPage;

