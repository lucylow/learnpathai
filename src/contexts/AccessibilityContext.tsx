/**
 * Accessibility Context and Provider
 * Manages user accessibility preferences and provides accessible resource transformations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilityProfile, AccessibleResource, ColorBlindFilter, FontSizeScale } from '../types/accessibility';
import MultiModalService from '../services/multiModalService';

interface AccessibilityContextType {
  profile: AccessibilityProfile;
  updatePreference: (
    category: keyof AccessibilityProfile['preferences'],
    key: string,
    value: any
  ) => void;
  updateCommunication: (key: keyof AccessibilityProfile['communication'], value: any) => void;
  getAccessibleResource: (resource: any) => AccessibleResource;
  isFeatureEnabled: (feature: string) => boolean;
  multiModalService: MultiModalService;
  resetToDefaults: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const getDefaultProfile = (): AccessibilityProfile => ({
  userId: 'default',
  preferences: {
    visual: {
      highContrast: false,
      fontSize: 'medium',
      colorBlindMode: 'none',
      screenReader: false,
      reduceMotion: false
    },
    auditory: {
      requiresCaptions: false,
      requiresTranscripts: false,
      visualAlerts: false,
      audioDescription: false
    },
    motor: {
      voiceControl: false,
      keyboardOnly: false,
      switchControl: false,
      extendedClickArea: false
    },
    cognitive: {
      simplifiedLayout: false,
      readingAssistance: false,
      extraTime: 1,
      reducedComplexity: false
    }
  },
  communication: {
    primaryMethod: 'text',
    supportedMethods: ['text'],
    preferredLanguage: 'en'
  }
});

const getFontSizeScale = (size: FontSizeScale): string => {
  const scales = {
    small: '0.875',
    medium: '1',
    large: '1.25',
    'x-large': '1.5'
  };
  return scales[size];
};

const getColorBlindFilter = (mode: ColorBlindFilter): string => {
  const filters = {
    protanopia: 'url(#protanopia-filter)',
    deuteranopia: 'url(#deuteranopia-filter)',
    tritanopia: 'url(#tritanopia-filter)',
    none: 'none'
  };
  return filters[mode];
};

const getAccessibilityClasses = (profile: AccessibilityProfile): string => {
  const classes: string[] = [];
  
  if (profile.preferences.visual.highContrast) classes.push('high-contrast');
  if (profile.preferences.visual.reduceMotion) classes.push('reduce-motion');
  if (profile.preferences.cognitive.simplifiedLayout) classes.push('simplified-layout');
  if (profile.preferences.motor.keyboardOnly) classes.push('keyboard-navigation');
  if (profile.preferences.motor.extendedClickArea) classes.push('extended-click-area');
  
  return classes.join(' ');
};

const applyAccessibilityTransformations = (
  content: string,
  profile: AccessibilityProfile
): string => {
  let transformedContent = content;

  // Simplify content if cognitive assistance is enabled
  if (profile.preferences.cognitive.reducedComplexity) {
    // In production, this would use NLP to simplify text
    transformedContent = transformedContent.replace(/\b(\w+ly)\b/g, ''); // Remove some adverbs as example
  }

  return transformedContent;
};

interface AccessibilityProviderProps {
  children: ReactNode;
  initialProfile?: Partial<AccessibilityProfile>;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ 
  children,
  initialProfile 
}) => {
  const [profile, setProfile] = useState<AccessibilityProfile>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('accessibilityProfile');
    if (saved) {
      try {
        return { ...getDefaultProfile(), ...JSON.parse(saved) };
      } catch {
        return getDefaultProfile();
      }
    }
    return { ...getDefaultProfile(), ...initialProfile };
  });

  const [multiModalService] = useState(() => new MultiModalService());

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('accessibilityProfile', JSON.stringify(profile));
  }, [profile]);

  const updatePreference = (
    category: keyof AccessibilityProfile['preferences'],
    key: string,
    value: any
  ) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [key]: value
        }
      }
    }));
  };

  const updateCommunication = (
    key: keyof AccessibilityProfile['communication'],
    value: any
  ) => {
    setProfile(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        [key]: value
      }
    }));
  };

  const getAccessibleResource = (resource: any): AccessibleResource => {
    // Transform base resource based on user preferences
    const transformedContent = applyAccessibilityTransformations(
      resource.content || resource.description || '',
      profile
    );

    return {
      id: resource.id || '',
      title: resource.title || '',
      baseContent: transformedContent,
      contentType: resource.type || 'text',
      alternatives: resource.alternatives || {},
      accessibilityMetadata: resource.accessibilityMetadata || {
        hasCaptions: false,
        hasTranscript: false,
        hasASL: false,
        hasBraille: false,
        hasAudioDescription: false,
        readingLevel: 8,
        cognitiveLoad: 'medium',
        estimatedTime: 10,
        wcagCompliance: 'AA'
      }
    };
  };

  const isFeatureEnabled = (feature: string): boolean => {
    const featureMap: { [key: string]: boolean } = {
      highContrast: profile.preferences.visual.highContrast,
      captions: profile.preferences.auditory.requiresCaptions,
      transcripts: profile.preferences.auditory.requiresTranscripts,
      voiceControl: profile.preferences.motor.voiceControl,
      keyboardOnly: profile.preferences.motor.keyboardOnly,
      simplifiedLayout: profile.preferences.cognitive.simplifiedLayout,
      readingAssistance: profile.preferences.cognitive.readingAssistance,
      screenReader: profile.preferences.visual.screenReader,
      reduceMotion: profile.preferences.visual.reduceMotion,
      audioDescription: profile.preferences.auditory.audioDescription
    };
    return featureMap[feature] || false;
  };

  const resetToDefaults = () => {
    setProfile(getDefaultProfile());
    localStorage.removeItem('accessibilityProfile');
  };

  // Apply CSS variables for visual preferences
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty(
      '--font-size-scale',
      getFontSizeScale(profile.preferences.visual.fontSize)
    );
    
    // High contrast mode
    if (profile.preferences.visual.highContrast) {
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--text-primary', '#FFFFFF');
      root.style.setProperty('--border-color', '#FFFFFF');
    } else {
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--border-color');
    }
    
    // Color blind filters
    if (profile.preferences.visual.colorBlindMode !== 'none') {
      root.style.setProperty(
        '--color-filter',
        getColorBlindFilter(profile.preferences.visual.colorBlindMode)
      );
    } else {
      root.style.removeProperty('--color-filter');
    }

    // Reduced motion
    if (profile.preferences.visual.reduceMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
  }, [profile.preferences.visual]);

  // Apply ARIA attributes for screen readers
  useEffect(() => {
    if (profile.preferences.visual.screenReader) {
      document.body.setAttribute('aria-live', 'polite');
      document.body.setAttribute('aria-atomic', 'false');
    } else {
      document.body.removeAttribute('aria-live');
      document.body.removeAttribute('aria-atomic');
    }
  }, [profile.preferences.visual.screenReader]);

  return (
    <AccessibilityContext.Provider
      value={{
        profile,
        updatePreference,
        updateCommunication,
        getAccessibleResource,
        isFeatureEnabled,
        multiModalService,
        resetToDefaults
      }}
    >
      <div className={`accessibility-wrapper ${getAccessibilityClasses(profile)}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to use accessibility features
 */
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;

