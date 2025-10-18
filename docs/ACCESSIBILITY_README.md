# ♿ LearnPath AI - Accessibility Features

## Overview

LearnPath AI includes comprehensive DEI (Diversity, Equity, Inclusion) accessibility features, inspired by the [High Five AI project](https://devpost.com/software/high-five-ai). These features ensure that blind, deaf, mute, and differently-abled students can access and benefit from personalized AI-powered education.

> "Blindness cut me off from things and deafness from people." — Helen Keller

LearnPath AI ensures that no learner is cut off from education.

## 🎯 Quick Start

1. **Access Accessibility Settings**: Click the floating accessibility button (♿) in the bottom-right corner
2. **Choose Your Profile**: Select from pre-configured profiles or customize your own
3. **Start Learning**: All content automatically adapts to your preferences

**For detailed instructions**, see [ACCESSIBILITY_QUICKSTART.md](./ACCESSIBILITY_QUICKSTART.md)

## 🌟 Key Features

### For Blind/Low Vision Users 👁️
- ✅ Screen reader optimization (NVDA, JAWS, VoiceOver compatible)
- ✅ Text-to-speech with adjustable speed/pitch
- ✅ Braille output (Unicode braille characters)
- ✅ High contrast mode
- ✅ Scalable fonts (4 size levels)
- ✅ Audio descriptions for visual content
- ✅ Keyboard-only navigation

### For Deaf/Hard of Hearing Users 👂
- ✅ Real-time auto-generated captions
- ✅ ASL (American Sign Language) video translations
- ✅ Full text transcripts for all audio
- ✅ Visual alerts instead of sounds
- ✅ Sign language recognition (planned)

### For Blind-Deaf Users (Like Helen Keller) 🤝
- ✅ Braille output via screen reader or refreshable display
- ✅ Tactile feedback support
- ✅ Switch control navigation
- ✅ Multi-modal communication options

### For Motor Impairments ✋
- ✅ Voice control for hands-free navigation
- ✅ Extended click areas (44x44px minimum)
- ✅ Keyboard-only navigation with shortcuts
- ✅ Switch control support
- ✅ Reduced motion option

### For Cognitive/Learning Disabilities 🧠
- ✅ Simplified layouts
- ✅ Reading assistance with text-to-speech
- ✅ Simplified language (auto-reduced complexity)
- ✅ Extra time for timed activities (1x - 3x)
- ✅ Visual spacing and chunking
- ✅ Progressive disclosure

### AI-Powered Adaptive Learning 🤖
- ✅ Real-time engagement monitoring
- ✅ Automatic difficulty adjustment
- ✅ Frustration detection → Easier content + hints
- ✅ Confusion detection → Simplified explanations
- ✅ Success detection → Advanced challenges

## 📊 Accessibility Statistics

- **15% of world population** (1 billion people) experience some form of disability
- **WCAG 2.1 AA Compliant** throughout the platform
- **100% keyboard navigable** - no mouse required
- **Multi-modal** - Text, Speech, ASL, Braille, Video

## 🏗️ Technical Implementation

### Architecture
```
LearnPath AI
├── AccessibilityProvider (Global Context)
├── MultiModalService (TTS, STT, Braille, ASL)
├── AIAccessibilityService (Engagement tracking, adaptive features)
├── Screen Reader Utils (WCAG compliance)
└── Accessible Components (Settings, Toolbar, Learning Paths)
```

### Browser Support
- ✅ Chrome/Edge (Full support)
- ✅ Firefox (Full support)
- ✅ Safari (Full support)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### API Requirements
- Speech Synthesis API (Text-to-Speech) - Built-in
- Speech Recognition API (Speech-to-Text) - Built-in
- Media Capture API (ASL video) - Built-in

**No external dependencies** for core accessibility features!

## 📚 Documentation

- **[DEI_ACCESSIBILITY_GUIDE.md](./DEI_ACCESSIBILITY_GUIDE.md)** - Comprehensive technical guide
- **[ACCESSIBILITY_QUICKSTART.md](./ACCESSIBILITY_QUICKSTART.md)** - Get started in 5 minutes
- **[ACCESSIBILITY_INTEGRATION.md](./ACCESSIBILITY_INTEGRATION.md)** - Developer integration guide

## 🎓 High Five AI Integration

LearnPath AI builds directly on **High Five AI**, which provides:

1. **Computer Vision** - Automatic image recognition and description
2. **Text-to-Speech** - Multi-language voice output
3. **Speech-to-Text** - Real-time voice transcription
4. **Braille Translation** - Unicode braille conversion
5. **ASL Support** - Sign language detection (planned)

**High Five AI Project**: https://devpost.com/software/high-five-ai  
**GitHub**: https://github.com/lucylow/High_Five

### Inspiration

High Five AI was created to help people like Helen Keller who are deaf, blind, and mute communicate more effectively. The project won recognition for:
- Accessible and inclusive AI solutions
- Multi-modal communication platform
- Reducing barriers for 15% of world's population

LearnPath AI extends these innovations specifically for education.

## 🚀 Usage Examples

### Text-to-Speech
```typescript
import { useAccessibility } from '@/contexts/AccessibilityContext';

function MyComponent() {
  const { multiModalService } = useAccessibility();
  
  const readContent = async () => {
    await multiModalService.speakText("Hello world", {
      rate: 0.9,    // Speaking rate
      pitch: 1,     // Voice pitch
      volume: 1     // Volume level
    });
  };
}
```

### Braille Conversion
```typescript
const { multiModalService } = useAccessibility();
const braille = multiModalService.convertToBraille("Hello");
console.log(braille.brailleText); // ⠓⠑⠇⠇⠕
```

### Engagement Tracking
```typescript
import AIAccessibilityService from '@/services/aiAccessibilityService';

const aiService = new AIAccessibilityService();
const state = aiService.analyzeEngagementPatterns();
// Returns: 'frustrated' | 'engaged' | 'confused' | 'neutral'
```

## 🎨 Visual Examples

### High Contrast Mode
- Background: Pure black (#000000)
- Text: Pure white (#FFFFFF)
- Links: Cyan (#00FFFF) with underline
- Borders: White, increased width

### Font Sizes
- **Small**: 0.875x (14px base)
- **Medium**: 1x (16px base) - Default
- **Large**: 1.25x (20px base)
- **X-Large**: 1.5x (24px base)

### Color Blind Modes
- **Protanopia** (Red-blind) - Filter applied
- **Deuteranopia** (Green-blind) - Filter applied
- **Tritanopia** (Blue-blind) - Filter applied

## ⚙️ Configuration Options

| Category | Options |
|----------|---------|
| **Visual** | High Contrast, Font Size, Color Blind Mode, Screen Reader, Reduce Motion |
| **Auditory** | Captions, Transcripts, Visual Alerts, Audio Descriptions |
| **Motor** | Voice Control, Keyboard Navigation, Switch Control, Extended Clicks |
| **Cognitive** | Simplified Layout, Reading Help, Simple Language, Extra Time |
| **Communication** | Text, Speech, ASL, Braille, Multi-Modal |

## 🧪 Testing

### Manual Testing
1. **Keyboard**: Tab through entire page
2. **Screen Reader**: Enable VoiceOver/NVDA
3. **High Contrast**: Toggle in settings
4. **Text Size**: Test all 4 size levels
5. **Voice Control**: Try voice commands

### Automated Testing
```bash
npm run test:accessibility
```

Tools used:
- axe DevTools
- Lighthouse
- WAVE

## 🤝 Contributing

We welcome accessibility improvements! See [ACCESSIBILITY_INTEGRATION.md](./ACCESSIBILITY_INTEGRATION.md) for integration guidelines.

### Reporting Issues
If you encounter accessibility issues:
1. Describe the issue clearly
2. Specify your assistive technology (if any)
3. Include browser and OS details
4. Suggest improvements

## 📞 Support

- **Documentation**: See files above
- **Issues**: GitHub Issues
- **Email**: Contact project maintainers
- **Community**: Join our accessibility discussion

## 🏆 Standards Compliance

- ✅ **WCAG 2.1 Level AA** - Full compliance
- ✅ **Section 508** - US Government standard
- ✅ **EN 301 549** - European standard
- ✅ **ARIA 1.2** - Screen reader compatibility

### WCAG 2.1 Compliance

| Guideline | Level | Status |
|-----------|-------|--------|
| Perceivable | AA | ✅ Pass |
| Operable | AA | ✅ Pass |
| Understandable | AA | ✅ Pass |
| Robust | AA | ✅ Pass |

## 📈 Impact

### By the Numbers
- **1 billion** people worldwide have disabilities
- **15%** of global population
- **285 million** visually impaired
- **466 million** with hearing loss
- **200 million** with cognitive disabilities

### Our Commitment
Every student deserves equal access to quality education. LearnPath AI's accessibility features ensure:
- Equal learning opportunities
- Inclusive educational experiences
- Barrier-free knowledge access
- Personalized accommodation
- Dignity and independence

## 🎯 Roadmap

### Current (v1.0)
- ✅ Multi-modal content delivery
- ✅ WCAG 2.1 AA compliance
- ✅ Screen reader support
- ✅ Keyboard navigation
- ✅ High contrast mode
- ✅ Text-to-speech
- ✅ Braille output

### Coming Soon (v1.1)
- 🔄 ASL sign language recognition (camera input)
- 🔄 Enhanced voice commands
- 🔄 More language support
- 🔄 Haptic feedback
- 🔄 Eye tracking support

### Future (v2.0)
- 📋 Brain-computer interface (BCI) support
- 📋 Advanced AI personalization
- 📋 Collaborative accessibility features
- 📋 Real-time peer support

## 📖 Citations

1. **World Health Organization**: Disability statistics
2. **WCAG 2.1**: Web accessibility guidelines
3. **High Five AI**: Original implementation (DevPost)
4. **Helen Keller**: Inspiration and quotes

## 📄 License

Same as LearnPath AI main project.

---

**Built with ❤️ for inclusive education**  
**Inspired by High Five AI and Helen Keller's legacy**

*"The only thing worse than being blind is having sight but no vision." — Helen Keller*

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Accessibility Level**: WCAG 2.1 AA

