# DEI Accessibility Implementation Guide

## 🌟 Overview

LearnPath AI now includes comprehensive DEI (Diversity, Equity, Inclusion) accessibility features, inspired by the **High Five AI** project. This implementation ensures that blind, deaf, mute, and differently-abled students can access and benefit from personalized AI-powered education.

## 🎯 Key Features

### 1. Multi-Modal Content Delivery

Built on High Five AI's foundation, LearnPath AI provides learning materials in multiple formats:

- **Text**: Standard text-based content with adjustable sizing
- **Speech**: Text-to-speech with customizable rate, pitch, and volume
- **ASL**: American Sign Language video translations
- **Braille**: Unicode braille character conversion
- **Captions**: Real-time auto-generated captions for video/audio
- **Transcripts**: Full text transcripts for all audio content

### 2. Adaptive Learning Paths

- Content automatically tagged with accessibility metadata
- AI prioritizes accessible content formats based on user preferences
- Dynamic difficulty adjustment based on engagement patterns
- Real-time assistance triggers for struggling learners

### 3. AI-Powered Communication

- **Voice Commands**: Hands-free navigation and interaction
- **ASL Recognition**: Computer vision for sign language input (planned)
- **Speech-to-Text**: Real-time transcription of spoken input
- **Text-to-Speech**: Natural voice output for text content

### 4. Visual & UI Accessibility

All interfaces comply with **WCAG 2.1 AA** standards:

- ✅ High contrast mode
- ✅ Scalable fonts (small, medium, large, x-large)
- ✅ Color blind modes (protanopia, deuteranopia, tritanopia)
- ✅ Screen reader compatibility with ARIA labels
- ✅ Reduced motion support
- ✅ Keyboard-only navigation
- ✅ Extended click areas for motor impairments

### 5. Cognitive Accessibility

- Simplified layouts with reduced visual complexity
- Reading assistance with text-to-speech
- Simplified language with reduced reading level
- Extra time multipliers (1x - 3x) for timed activities
- Visual spacing and chunking for better comprehension

### 6. Real-Time Adaptive Assistance

AI monitors user behavior to detect:
- **Frustration**: Rapid clicks, repeated errors → Easier content, hints
- **Confusion**: Long pauses, multiple attempts → Simplified explanations
- **Engagement**: Optimal interaction patterns → Advanced challenges

## 🏗️ Architecture

### Core Components

```
src/
├── types/
│   └── accessibility.ts          # TypeScript interfaces
├── contexts/
│   └── AccessibilityContext.tsx  # Global state management
├── services/
│   ├── multiModalService.ts      # TTS, STT, Braille, ASL
│   └── aiAccessibilityService.ts # AI-powered features
├── utils/
│   └── screenReaderUtils.ts      # WCAG utilities
├── components/
│   └── accessibility/
│       ├── AccessibilitySettings.tsx
│       ├── AccessibleLearningPath.tsx
│       └── AccessibilityToolbar.tsx
├── pages/
│   └── AccessibilitySettings.tsx
└── styles/
    └── accessibility.css         # WCAG-compliant styles
```

### Service Layer

#### MultiModalService

Provides cross-modal content transformation:

```typescript
const service = new MultiModalService();

// Text-to-Speech
await service.speakText("Hello world", { rate: 0.9, pitch: 1 });

// Speech-to-Text
service.startSpeechRecognition((transcript) => {
  console.log(transcript);
});

// Braille Conversion
const braille = service.convertToBraille("Hello");
// Output: { brailleText: "⠓⠑⠇⠇⠕", originalText: "Hello" }

// Voice Commands
const command = await service.processVoiceCommand("next page");
// Output: { command: "next", action: "navigate_next" }
```

#### AIAccessibilityService

Intelligent accessibility features:

```typescript
const aiService = new AIAccessibilityService();

// Auto-generate alt text
const altText = await aiService.generateAltText(imageUrl);

// Simplify content
const simplified = aiService.simplifyText(complexText, 6); // Grade 6 level

// Detect engagement
const state = aiService.analyzeEngagementPatterns();
// Returns: 'frustrated' | 'engaged' | 'confused' | 'neutral'

// Get adaptive recommendations
const recommendations = aiService.getAdaptiveRecommendations(state, resource);
```

## 🚀 Usage

### 1. Using the Accessibility Context

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';

function MyComponent() {
  const { 
    profile, 
    updatePreference, 
    isFeatureEnabled,
    multiModalService 
  } = useAccessibility();

  const handleReadAloud = async () => {
    if (isFeatureEnabled('readingAssistance')) {
      await multiModalService.speakText(content);
    }
  };

  return (
    <div>
      {profile.communication.primaryMethod === 'braille' && (
        <BrailleDisplay text={content} />
      )}
    </div>
  );
}
```

### 2. Creating Accessible Resources

```tsx
const resource: AccessibleResource = {
  id: 'lesson-1',
  title: 'Introduction to AI',
  baseContent: 'This lesson covers...',
  contentType: 'text',
  alternatives: {
    captions: '/captions/lesson-1.vtt',
    transcript: 'Full transcript...',
    aslVideo: '/videos/lesson-1-asl.mp4',
    braille: '⠞⠓⠊⠎ ⠇⠑⠎⠎⠕⠝...',
    audioDescription: 'Audio description...'
  },
  accessibilityMetadata: {
    hasCaptions: true,
    hasTranscript: true,
    hasASL: true,
    hasBraille: true,
    hasAudioDescription: true,
    readingLevel: 8,
    cognitiveLoad: 'medium',
    estimatedTime: 10,
    wcagCompliance: 'AA'
  }
};
```

### 3. Using Accessible Learning Path

```tsx
import { AccessibleLearningPath } from '@/components/accessibility/AccessibleLearningPath';

function LearningPage() {
  const steps = [
    {
      id: 'step-1',
      title: 'Getting Started',
      description: 'Learn the basics',
      content: 'Content here...',
      type: 'text',
      completed: false,
      alternatives: {
        braille: '⠛⠑⠞⠞⠊⠝⠛ ⠎⠞⠁⠗⠞⠑⠙'
      },
      estimatedTime: 5
    }
  ];

  return (
    <AccessibleLearningPath
      pathId="intro-path"
      steps={steps}
      currentStepIndex={0}
      onStepComplete={(id) => console.log('Completed:', id)}
      onStepChange={(index) => console.log('Changed to:', index)}
      progress={25}
    />
  );
}
```

## ⚙️ Configuration

### User Preference Profiles

Users can configure their accessibility needs through `/accessibility-settings`:

1. **Visual Preferences**
   - High Contrast Mode
   - Font Size (4 levels)
   - Color Blind Modes (3 types)
   - Screen Reader Support
   - Reduce Motion

2. **Auditory Preferences**
   - Always Show Captions
   - Require Transcripts
   - Visual Alerts
   - Audio Descriptions

3. **Motor Preferences**
   - Voice Control
   - Keyboard-Only Navigation
   - Switch Control
   - Extended Click Areas

4. **Cognitive Preferences**
   - Simplified Layout
   - Reading Assistance
   - Simplified Language
   - Extra Time (1x - 3x)

5. **Communication Method**
   - Text (default)
   - Speech (TTS)
   - ASL
   - Braille
   - Multi-Modal (all methods)

### Persistence

User preferences are automatically saved to `localStorage` and persist across sessions:

```typescript
// Preferences are saved automatically
localStorage.getItem('accessibilityProfile');

// Manual reset
resetToDefaults();
```

## 🎨 Styling & CSS

### High Contrast Mode

```css
.high-contrast {
  --bg-primary: #000000;
  --text-primary: #FFFFFF;
  --border-color: #FFFFFF;
}
```

### Font Scaling

```css
.accessibility-wrapper {
  font-size: calc(16px * var(--font-size-scale, 1));
}
```

### Reduced Motion

```css
.reduce-motion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

### Focus Visible (WCAG 2.4.7)

```css
*:focus-visible {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}
```

## 🧪 Testing Accessibility

### Screen Reader Testing

- **macOS**: VoiceOver (Cmd + F5)
- **Windows**: NVDA or JAWS
- **Linux**: Orca

### Keyboard Navigation Testing

Test all functionality without a mouse:
- `Tab` - Navigate forward
- `Shift + Tab` - Navigate backward
- `Enter` / `Space` - Activate elements
- `Arrow Keys` - Navigate lists
- `Esc` - Close dialogs

### Color Blind Testing

Enable color blind modes in settings to test:
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)

### Automated Testing Tools

- **axe DevTools**: Browser extension for accessibility testing
- **Lighthouse**: Built into Chrome DevTools
- **WAVE**: Web accessibility evaluation tool

## 🔧 Browser Support

### Required Browser APIs

✅ **Speech Synthesis API** (Text-to-Speech)
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support

✅ **Speech Recognition API** (Speech-to-Text)
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: WebKit support

✅ **Media Capture API** (ASL video)
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support

### Feature Detection

```typescript
const support = MultiModalService.checkBrowserSupport();
console.log(support);
// {
//   speechSynthesis: true,
//   speechRecognition: true,
//   mediaCapture: true
// }
```

## 📚 Resources & References

### High Five AI Project
- **DevPost**: https://devpost.com/software/high-five-ai
- **GitHub**: https://github.com/lucylow/High_Five
- **Features**: Computer vision, TTS, STT, Braille, ASL

### Standards & Guidelines
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **Section 508**: https://www.section508.gov/

### Accessibility Tools
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **NVDA Screen Reader**: https://www.nvaccess.org/
- **ChromeVox**: https://chrome.google.com/webstore/detail/chromevox

## 🤝 Contributing

### Adding New Accessibility Features

1. Update type definitions in `src/types/accessibility.ts`
2. Implement service logic in appropriate service file
3. Add UI controls in `AccessibilitySettings.tsx`
4. Update context provider to handle new preferences
5. Add CSS styles in `accessibility.css`
6. Update this documentation

### Testing Checklist

- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] High contrast mode displays properly
- [ ] Focus indicators are visible
- [ ] ARIA attributes are correct
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Touch targets are min 44x44px
- [ ] No keyboard traps exist
- [ ] Error messages are descriptive

## 🎓 Educational Impact

### Helen Keller Inspiration

> "Blindness cut me off from things and deafness from people."
> — Helen Keller

LearnPath AI, building on High Five AI, ensures that no learner is cut off from education. Our platform provides:

- **For Blind Students**: Screen reader support, braille output, audio descriptions
- **For Deaf Students**: Real-time captions, ASL translations, visual alerts
- **For Mute Students**: Text-based communication, ASL input
- **For Students with Motor Impairments**: Voice control, keyboard navigation, extended click areas
- **For Students with Cognitive Disabilities**: Simplified layouts, reading assistance, extra time

### Statistics

- **15% of world population** (1 billion people) experience some form of disability
- Our features support learners with:
  - Visual impairments
  - Hearing impairments
  - Motor impairments
  - Cognitive disabilities
  - Speech impairments

## 📞 Support

For accessibility issues or feature requests:
- Open an issue on GitHub
- Contact the development team
- Review WCAG 2.1 guidelines for reference

## 📄 License

This accessibility implementation is open source and available under the same license as LearnPath AI.

---

**Built with ❤️ and inspired by High Five AI's mission to make technology accessible to everyone.**

*Last Updated: October 2025*

