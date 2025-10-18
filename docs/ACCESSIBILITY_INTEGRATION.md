# Accessibility Integration Documentation

## 🔌 Integrating Accessibility into Your Components

This guide shows how to make your LearnPath AI components accessible.

## Basic Integration

### 1. Wrap Your Component with Accessibility Context

The `AccessibilityProvider` is already set up in `App.tsx`, so all components have access to it.

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';

function MyComponent() {
  const { profile, isFeatureEnabled, multiModalService } = useAccessibility();
  
  // Your component logic
}
```

### 2. Add Screen Reader Support

```tsx
import { ScreenReaderSupport } from '@/utils/screenReaderUtils';

function MyComponent() {
  const handleAction = () => {
    // Announce to screen readers
    ScreenReaderSupport.announce('Action completed successfully');
    
    // Perform action
    doSomething();
  };

  return (
    <button 
      onClick={handleAction}
      aria-label="Descriptive button label"
    >
      Click Me
    </button>
  );
}
```

### 3. Add Keyboard Navigation

```tsx
import { useEffect, useRef } from 'react';
import { KeyboardNavigation } from '@/utils/screenReaderUtils';

function MyList() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const nav = new KeyboardNavigation();
      const cleanup = nav.setupArrowKeyNavigation(
        containerRef.current,
        '[role="listitem"]'
      );
      return cleanup;
    }
  }, []);

  return (
    <div ref={containerRef} role="list">
      <div role="listitem" tabIndex={0}>Item 1</div>
      <div role="listitem" tabIndex={-1}>Item 2</div>
      <div role="listitem" tabIndex={-1}>Item 3</div>
    </div>
  );
}
```

### 4. Add Text-to-Speech

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';

function ReadableContent({ text }: { text: string }) {
  const { multiModalService, isFeatureEnabled } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleRead = async () => {
    if (isSpeaking) {
      multiModalService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await multiModalService.speakText(text);
      setIsSpeaking(false);
    }
  };

  if (!isFeatureEnabled('readingAssistance')) {
    return <p>{text}</p>;
  }

  return (
    <div>
      <p>{text}</p>
      <button onClick={handleRead}>
        {isSpeaking ? '🔇 Stop' : '🔊 Read Aloud'}
      </button>
    </div>
  );
}
```

### 5. Add Braille Support

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';

function BrailleContent({ text }: { text: string }) {
  const { profile, multiModalService } = useAccessibility();

  if (profile.communication.primaryMethod !== 'braille') {
    return <p>{text}</p>;
  }

  const brailleOutput = multiModalService.convertToBraille(text);

  return (
    <div>
      <p className="text-base">{text}</p>
      <div className="braille-display" aria-label="Braille version">
        {brailleOutput.brailleText}
      </div>
    </div>
  );
}
```

## Advanced Integration

### Custom Accessible Component

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { ScreenReaderSupport, KeyboardNavigation } from '@/utils/screenReaderUtils';
import { useEffect, useRef } from 'react';

interface AccessibleCardProps {
  title: string;
  content: string;
  onComplete: () => void;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  title,
  content,
  onComplete
}) => {
  const { 
    profile, 
    multiModalService, 
    isFeatureEnabled 
  } = useAccessibility();
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Setup keyboard navigation
  useEffect(() => {
    if (cardRef.current && profile.preferences.motor.keyboardOnly) {
      const nav = new KeyboardNavigation();
      const cleanup = nav.setupKeyboardTrapping(cardRef.current);
      return cleanup;
    }
  }, [profile.preferences.motor.keyboardOnly]);

  // Auto-read if reading assistance is enabled
  useEffect(() => {
    if (isFeatureEnabled('readingAssistance')) {
      const fullText = `${title}. ${content}`;
      multiModalService.speakText(fullText);
    }
  }, [title, content]);

  const handleComplete = () => {
    ScreenReaderSupport.announce('Card completed', 'polite');
    onComplete();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleComplete();
    }
  };

  // Adjust styles based on preferences
  const cardStyles = {
    fontSize: profile.preferences.visual.fontSize === 'large' ? '1.25rem' : '1rem',
    padding: profile.preferences.motor.extendedClickArea ? '2rem' : '1rem',
  };

  return (
    <div
      ref={cardRef}
      role="article"
      aria-labelledby="card-title"
      aria-describedby="card-content"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={cardStyles}
      className={`
        rounded-lg border p-4
        ${profile.preferences.visual.highContrast ? 'border-white' : 'border-gray-200'}
        ${profile.preferences.cognitive.simplifiedLayout ? 'max-w-2xl' : ''}
      `}
    >
      <h3 id="card-title" className="text-2xl font-bold mb-2">
        {title}
      </h3>
      
      <div id="card-content" className="mb-4">
        {profile.communication.primaryMethod === 'braille' ? (
          <div className="braille-display">
            {multiModalService.convertToBraille(content).brailleText}
          </div>
        ) : (
          <p>{content}</p>
        )}
      </div>

      <button
        onClick={handleComplete}
        aria-label="Mark as complete"
        className={`
          px-4 py-2 bg-primary text-white rounded
          ${profile.preferences.motor.extendedClickArea ? 'min-w-[44px] min-h-[44px]' : ''}
        `}
      >
        Complete
      </button>
    </div>
  );
};
```

### Engagement Tracking

```tsx
import { useEffect } from 'react';
import AIAccessibilityService from '@/services/aiAccessibilityService';

function useEngagementTracking() {
  const aiService = useRef(new AIAccessibilityService());

  useEffect(() => {
    const trackClick = (e: MouseEvent) => {
      aiService.current.trackInteraction({
        type: 'click',
        timestamp: Date.now(),
        duration: 0,
        target: (e.target as HTMLElement).tagName
      });
    };

    const trackPause = () => {
      aiService.current.trackInteraction({
        type: 'pause',
        timestamp: Date.now(),
        duration: 0
      });
    };

    document.addEventListener('click', trackClick);
    document.addEventListener('visibilitychange', trackPause);

    // Check engagement every 30 seconds
    const interval = setInterval(() => {
      const state = aiService.current.analyzeEngagementPatterns();
      console.log('Engagement state:', state);
      
      if (state === 'frustrated') {
        // Show help or simplify content
        showHelpDialog();
      }
    }, 30000);

    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('visibilitychange', trackPause);
      clearInterval(interval);
    };
  }, []);

  return aiService.current;
}
```

### Form Accessibility

```tsx
import { ScreenReaderSupport } from '@/utils/screenReaderUtils';

function AccessibleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      ScreenReaderSupport.announce(
        `Form has ${Object.keys(newErrors).length} errors. Please correct them.`,
        'assertive'
      );
    } else {
      ScreenReaderSupport.announce('Form submitted successfully', 'polite');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="name" className="block mb-2">
          Name <span aria-label="required">*</span>
        </label>
        <input
          id="name"
          type="text"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <div id="name-error" className="error-message" role="alert">
            {errors.name}
          </div>
        )}
      </div>

      <button type="submit" className="mt-4">
        Submit
      </button>
    </form>
  );
}
```

### Video with Captions

```tsx
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useEffect, useRef } from 'react';

function AccessibleVideo({ videoUrl, captionsUrl }: {
  videoUrl: string;
  captionsUrl?: string;
}) {
  const { profile, multiModalService } = useAccessibility();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (profile.preferences.auditory.requiresCaptions && videoRef.current) {
      // Auto-generate captions if none provided
      if (!captionsUrl) {
        multiModalService.generateLiveCaptions(
          videoRef.current,
          (caption, timestamp) => {
            console.log(`[${timestamp}] ${caption}`);
            // Display caption overlay
          }
        );
      }
    }
  }, [profile, captionsUrl]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full"
      aria-label="Learning video with captions"
    >
      <source src={videoUrl} type="video/mp4" />
      
      {captionsUrl && (
        <track
          kind="captions"
          src={captionsUrl}
          srcLang="en"
          label="English"
          default={profile.preferences.auditory.requiresCaptions}
        />
      )}
      
      Your browser does not support the video tag.
    </video>
  );
}
```

## Testing Your Integration

### Checklist

- [ ] Component works with keyboard only
- [ ] Screen reader announces all actions
- [ ] Focus indicators are visible
- [ ] ARIA labels are descriptive
- [ ] High contrast mode works
- [ ] Text scales with font size settings
- [ ] Voice commands work (if applicable)
- [ ] Braille display works (if applicable)
- [ ] No layout shifts with different settings

### Test Script

```typescript
// test-accessibility.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import MyComponent from './MyComponent';

describe('Accessibility', () => {
  it('has proper ARIA labels', () => {
    render(
      <AccessibilityProvider>
        <MyComponent />
      </AccessibilityProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('is keyboard navigable', () => {
    const { container } = render(
      <AccessibilityProvider>
        <MyComponent />
      </AccessibilityProvider>
    );
    
    const focusableElements = container.querySelectorAll('[tabindex]');
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  it('works with high contrast', () => {
    render(
      <AccessibilityProvider initialProfile={{
        preferences: {
          visual: { highContrast: true }
        }
      }}>
        <MyComponent />
      </AccessibilityProvider>
    );
    
    // Assert high contrast styles are applied
  });
});
```

## Best Practices

### DO ✅

1. **Always provide alt text** for images
2. **Use semantic HTML** (nav, main, article, etc.)
3. **Test with actual screen readers**
4. **Support keyboard navigation**
5. **Provide text alternatives** for non-text content
6. **Use sufficient color contrast** (4.5:1)
7. **Make interactive elements focusable**
8. **Provide skip links** for long navigation
9. **Use ARIA labels** descriptively
10. **Test at different zoom levels**

### DON'T ❌

1. **Don't rely on color alone** to convey information
2. **Don't use fake buttons** (use actual `<button>` elements)
3. **Don't remove focus indicators**
4. **Don't autoplay videos** with sound
5. **Don't use small touch targets** (min 44x44px)
6. **Don't use tables for layout**
7. **Don't hide important content** from screen readers
8. **Don't forget keyboard traps** in modals
9. **Don't use low contrast text**
10. **Don't assume all users can use a mouse**

## Resources

- **WCAG 2.1 Quick Reference**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/
- **Testing Tools**: axe DevTools, Lighthouse, WAVE
- **Screen Readers**: NVDA, JAWS, VoiceOver, ChromeVox

---

*For more information, see `DEI_ACCESSIBILITY_GUIDE.md`*

