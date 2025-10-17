/**
 * Screen Reader Support and Keyboard Navigation Utilities
 * WCAG 2.1 AA Compliance utilities
 */

/**
 * Screen Reader Support Class
 * Provides utilities for announcing content to screen readers
 */
export class ScreenReaderSupport {
  /**
   * Announce a message to screen readers using ARIA live regions
   * @param message - The message to announce
   * @param priority - 'polite' waits for current speech, 'assertive' interrupts
   */
  static announce(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement (screen readers will have read it)
    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Make an element focusable for keyboard navigation
   */
  static makeFocusable(element: HTMLElement, tabIndex: number = 0): void {
    element.setAttribute('tabindex', tabIndex.toString());
  }

  /**
   * Add accessible descriptions to elements
   */
  static addDescriptions(elements: NodeListOf<Element>): void {
    elements.forEach(element => {
      const description = element.getAttribute('data-sr-description');
      if (description) {
        const descId = `desc-${Math.random().toString(36).substr(2, 9)}`;
        const descElement = document.createElement('span');
        descElement.id = descId;
        descElement.className = 'sr-only';
        descElement.textContent = description;
        element.appendChild(descElement);
        element.setAttribute('aria-describedby', descId);
      }
    });
  }

  /**
   * Create a skip link for keyboard navigation
   */
  static createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLAnchorElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = text;
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    return skipLink;
  }

  /**
   * Add ARIA labels to form fields
   */
  static labelFormFields(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && input.getAttribute('placeholder')) {
        input.setAttribute('aria-label', input.getAttribute('placeholder') || '');
      }
    });
  }

  /**
   * Ensure proper heading hierarchy
   */
  static validateHeadingHierarchy(): boolean {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let isValid = true;

    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.substring(1));
      if (currentLevel - previousLevel > 1) {
        console.warn(`Heading hierarchy skip detected: ${heading.tagName} after h${previousLevel}`);
        isValid = false;
      }
      previousLevel = currentLevel;
    });

    return isValid;
  }
}

/**
 * Keyboard Navigation Handler
 * Manages keyboard interactions and focus management
 */
export class KeyboardNavigation {
  private focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ].join(',');

  /**
   * Setup keyboard focus trapping within a container
   * Useful for modals and dialogs
   */
  setupKeyboardTrapping(container: HTMLElement): () => void {
    const focusableElements = Array.from(
      container.querySelectorAll(this.focusableSelectors)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      } else if (e.key === 'Escape') {
        // Allow escape to close dialogs
        container.dispatchEvent(new CustomEvent('escape-key-pressed'));
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element when trap is set up
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Navigate to next focusable element
   */
  focusNext(container: HTMLElement = document.body): void {
    const focusable = this.getFocusableElements(container);
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusable.length;
    focusable[nextIndex]?.focus();
  }

  /**
   * Navigate to previous focusable element
   */
  focusPrevious(container: HTMLElement = document.body): void {
    const focusable = this.getFocusableElements(container);
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
    focusable[prevIndex]?.focus();
  }

  /**
   * Setup arrow key navigation for list items
   */
  setupArrowKeyNavigation(
    container: HTMLElement,
    itemSelector: string = '[role="listitem"]'
  ): () => void {
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          items[(currentIndex + 1) % items.length]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          items[prevIndex]?.focus();
          break;
        case 'Home':
          e.preventDefault();
          items[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Make items focusable
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Add keyboard shortcuts
   */
  setupKeyboardShortcuts(shortcuts: Record<string, () => void>): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'Ctrl',
        e.altKey && 'Alt',
        e.shiftKey && 'Shift',
        e.key
      ]
        .filter(Boolean)
        .join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * Focus Management Utilities
 */
export class FocusManager {
  private focusHistory: HTMLElement[] = [];

  /**
   * Save current focus and focus new element
   */
  saveFocusAndMove(newFocusElement: HTMLElement): void {
    if (document.activeElement instanceof HTMLElement) {
      this.focusHistory.push(document.activeElement);
    }
    newFocusElement.focus();
  }

  /**
   * Restore previous focus
   */
  restoreFocus(): void {
    const previousElement = this.focusHistory.pop();
    previousElement?.focus();
  }

  /**
   * Create a focus trap for modal dialogs
   */
  createFocusTrap(element: HTMLElement): () => void {
    const keyboardNav = new KeyboardNavigation();
    return keyboardNav.setupKeyboardTrapping(element);
  }
}

/**
 * ARIA Utilities
 */
export class ARIAUtilities {
  /**
   * Announce loading state
   */
  static announceLoading(message: string = 'Loading...'): () => void {
    const loadingDiv = document.createElement('div');
    loadingDiv.setAttribute('role', 'status');
    loadingDiv.setAttribute('aria-live', 'polite');
    loadingDiv.setAttribute('aria-busy', 'true');
    loadingDiv.className = 'sr-only';
    loadingDiv.textContent = message;
    document.body.appendChild(loadingDiv);

    return () => {
      if (loadingDiv.parentNode) {
        document.body.removeChild(loadingDiv);
      }
    };
  }

  /**
   * Announce errors
   */
  static announceError(message: string): void {
    ScreenReaderSupport.announce(`Error: ${message}`, 'assertive');
  }

  /**
   * Announce success
   */
  static announceSuccess(message: string): void {
    ScreenReaderSupport.announce(`Success: ${message}`, 'polite');
  }

  /**
   * Update progress for screen readers
   */
  static updateProgress(current: number, total: number, label: string = 'Progress'): void {
    const percentage = Math.round((current / total) * 100);
    ScreenReaderSupport.announce(
      `${label}: ${percentage}% complete. ${current} of ${total} items.`,
      'polite'
    );
  }
}

export default {
  ScreenReaderSupport,
  KeyboardNavigation,
  FocusManager,
  ARIAUtilities
};

