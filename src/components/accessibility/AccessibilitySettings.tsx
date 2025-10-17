/**
 * Accessibility Settings Panel
 * Comprehensive controls for all DEI accessibility features
 */

import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Eye, Ear, Hand, Brain, MessageSquare, RotateCcw } from 'lucide-react';

export const AccessibilitySettings: React.FC = () => {
  const { profile, updatePreference, updateCommunication, resetToDefaults } = useAccessibility();
  const [activeTab, setActiveTab] = useState('visual');

  return (
    <div 
      className="accessibility-settings max-w-4xl mx-auto p-6"
      role="region"
      aria-labelledby="accessibility-settings-title"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 id="accessibility-settings-title" className="text-3xl font-bold">
            Accessibility Settings
          </h2>
          <p className="text-muted-foreground mt-2">
            Customize your learning experience for your needs
          </p>
        </div>
        <Button
          variant="outline"
          onClick={resetToDefaults}
          aria-label="Reset all settings to defaults"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5" role="tablist">
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Visual</span>
          </TabsTrigger>
          <TabsTrigger value="auditory" className="flex items-center gap-2">
            <Ear className="h-4 w-4" />
            <span className="hidden sm:inline">Auditory</span>
          </TabsTrigger>
          <TabsTrigger value="motor" className="flex items-center gap-2">
            <Hand className="h-4 w-4" />
            <span className="hidden sm:inline">Motor</span>
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Cognitive</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Communication</span>
          </TabsTrigger>
        </TabsList>

        {/* Visual Preferences */}
        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Preferences</CardTitle>
              <CardDescription>
                Adjust display settings for better visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better readability
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={profile.preferences.visual.highContrast}
                  onCheckedChange={(checked) =>
                    updatePreference('visual', 'highContrast', checked)
                  }
                  aria-describedby="high-contrast-description"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="font-size">Font Size</Label>
                <Select
                  value={profile.preferences.visual.fontSize}
                  onValueChange={(value) => updatePreference('visual', 'fontSize', value)}
                >
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium (Default)</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="x-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="colorblind-mode">Color Blind Mode</Label>
                <Select
                  value={profile.preferences.visual.colorBlindMode}
                  onValueChange={(value) => updatePreference('visual', 'colorBlindMode', value)}
                >
                  <SelectTrigger id="colorblind-mode">
                    <SelectValue placeholder="Select color blind mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="screen-reader">Screen Reader Support</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize for screen reader users
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={profile.preferences.visual.screenReader}
                  onCheckedChange={(checked) =>
                    updatePreference('visual', 'screenReader', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  id="reduce-motion"
                  checked={profile.preferences.visual.reduceMotion}
                  onCheckedChange={(checked) =>
                    updatePreference('visual', 'reduceMotion', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auditory Preferences */}
        <TabsContent value="auditory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auditory Preferences</CardTitle>
              <CardDescription>
                Settings for deaf and hard-of-hearing users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="captions">Always Show Captions</Label>
                  <p className="text-sm text-muted-foreground">
                    Display captions for all video and audio content
                  </p>
                </div>
                <Switch
                  id="captions"
                  checked={profile.preferences.auditory.requiresCaptions}
                  onCheckedChange={(checked) =>
                    updatePreference('auditory', 'requiresCaptions', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transcripts">Require Transcripts</Label>
                  <p className="text-sm text-muted-foreground">
                    Show text transcripts for audio content
                  </p>
                </div>
                <Switch
                  id="transcripts"
                  checked={profile.preferences.auditory.requiresTranscripts}
                  onCheckedChange={(checked) =>
                    updatePreference('auditory', 'requiresTranscripts', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="visual-alerts">Visual Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Use visual notifications instead of sounds
                  </p>
                </div>
                <Switch
                  id="visual-alerts"
                  checked={profile.preferences.auditory.visualAlerts}
                  onCheckedChange={(checked) =>
                    updatePreference('auditory', 'visualAlerts', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="audio-description">Audio Descriptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Narrate visual content for blind users
                  </p>
                </div>
                <Switch
                  id="audio-description"
                  checked={profile.preferences.auditory.audioDescription}
                  onCheckedChange={(checked) =>
                    updatePreference('auditory', 'audioDescription', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motor Preferences */}
        <TabsContent value="motor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Motor Preferences</CardTitle>
              <CardDescription>
                Navigation and interaction settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-control">Voice Control</Label>
                  <p className="text-sm text-muted-foreground">
                    Navigate using voice commands
                  </p>
                </div>
                <Switch
                  id="voice-control"
                  checked={profile.preferences.motor.voiceControl}
                  onCheckedChange={(checked) =>
                    updatePreference('motor', 'voiceControl', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="keyboard-only">Keyboard-Only Navigation</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize for keyboard navigation
                  </p>
                </div>
                <Switch
                  id="keyboard-only"
                  checked={profile.preferences.motor.keyboardOnly}
                  onCheckedChange={(checked) =>
                    updatePreference('motor', 'keyboardOnly', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-control">Switch Control</Label>
                  <p className="text-sm text-muted-foreground">
                    Support for assistive switch devices
                  </p>
                </div>
                <Switch
                  id="switch-control"
                  checked={profile.preferences.motor.switchControl}
                  onCheckedChange={(checked) =>
                    updatePreference('motor', 'switchControl', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="extended-click">Extended Click Areas</Label>
                  <p className="text-sm text-muted-foreground">
                    Larger targets for easier interaction
                  </p>
                </div>
                <Switch
                  id="extended-click"
                  checked={profile.preferences.motor.extendedClickArea}
                  onCheckedChange={(checked) =>
                    updatePreference('motor', 'extendedClickArea', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognitive Preferences */}
        <TabsContent value="cognitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Preferences</CardTitle>
              <CardDescription>
                Settings for learning and comprehension support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="simplified-layout">Simplified Layout</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce visual complexity
                  </p>
                </div>
                <Switch
                  id="simplified-layout"
                  checked={profile.preferences.cognitive.simplifiedLayout}
                  onCheckedChange={(checked) =>
                    updatePreference('cognitive', 'simplifiedLayout', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reading-assistance">Reading Assistance</Label>
                  <p className="text-sm text-muted-foreground">
                    Text-to-speech and highlighting
                  </p>
                </div>
                <Switch
                  id="reading-assistance"
                  checked={profile.preferences.cognitive.readingAssistance}
                  onCheckedChange={(checked) =>
                    updatePreference('cognitive', 'readingAssistance', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-complexity">Simplified Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Use simpler words and sentences
                  </p>
                </div>
                <Switch
                  id="reduced-complexity"
                  checked={profile.preferences.cognitive.reducedComplexity}
                  onCheckedChange={(checked) =>
                    updatePreference('cognitive', 'reducedComplexity', checked)
                  }
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="extra-time">Extra Time Multiplier: {profile.preferences.cognitive.extraTime}x</Label>
                <p className="text-sm text-muted-foreground">
                  Additional time for timed activities
                </p>
                <Slider
                  id="extra-time"
                  min={1}
                  max={3}
                  step={0.5}
                  value={[profile.preferences.cognitive.extraTime]}
                  onValueChange={([value]) =>
                    updatePreference('cognitive', 'extraTime', value)
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Preferences */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Method</CardTitle>
              <CardDescription>
                Choose how you prefer to interact and learn (inspired by High Five AI)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="primary-method">Primary Communication Method</Label>
                <Select
                  value={profile.communication.primaryMethod}
                  onValueChange={(value) => updateCommunication('primaryMethod', value)}
                >
                  <SelectTrigger id="primary-method">
                    <SelectValue placeholder="Select communication method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="speech">Speech (Text-to-Speech)</SelectItem>
                    <SelectItem value="asl">American Sign Language (ASL)</SelectItem>
                    <SelectItem value="braille">Braille</SelectItem>
                    <SelectItem value="multimodal">Multi-Modal (All Methods)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {profile.communication.primaryMethod === 'asl' && 
                    '🤟 ASL video translations will be provided when available'}
                  {profile.communication.primaryMethod === 'braille' && 
                    '⠃ Content will be converted to Braille format'}
                  {profile.communication.primaryMethod === 'speech' && 
                    '🔊 Content will be read aloud automatically'}
                  {profile.communication.primaryMethod === 'multimodal' && 
                    '🎯 All communication methods will be available'}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">High Five AI Integration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Building on High Five AI's accessibility features:
                </p>
                <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                  <li>🖼️ Computer vision for image recognition</li>
                  <li>🗣️ Text-to-speech with multiple languages</li>
                  <li>🎤 Speech-to-text recognition</li>
                  <li>⠃ Braille translation support</li>
                  <li>🤟 ASL sign language detection</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> These settings are saved automatically and will persist across sessions.
          Your accessibility preferences help us create a more inclusive learning experience.
        </p>
      </div>
    </div>
  );
};

export default AccessibilitySettings;

