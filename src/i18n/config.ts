// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Supported languages with native names and text direction
export const languages = {
  en: { nativeName: 'English', dir: 'ltr', flag: '🇬🇧', region: 'Global' },
  sw: { nativeName: 'Kiswahili', dir: 'ltr', flag: '🇰🇪', region: 'East Africa' },
  ha: { nativeName: 'Hausa', dir: 'ltr', flag: '🇳🇬', region: 'West Africa' },
  yo: { nativeName: 'Yorùbá', dir: 'ltr', flag: '🇳🇬', region: 'West Africa' },
  zu: { nativeName: 'isiZulu', dir: 'ltr', flag: '🇿🇦', region: 'Southern Africa' },
  am: { nativeName: 'አማርኛ', dir: 'ltr', flag: '🇪🇹', region: 'Horn of Africa' },
  fr: { nativeName: 'Français', dir: 'ltr', flag: '🇫🇷', region: 'Francophone Africa & Global' },
  ar: { nativeName: 'العربية', dir: 'rtl', flag: '🇸🇦', region: 'North Africa & Middle East' },
  pt: { nativeName: 'Português', dir: 'ltr', flag: '🇧🇷', region: 'Lusophone Africa & Global' },
  es: { nativeName: 'Español', dir: 'ltr', flag: '🇪🇸', region: 'Global' },
  ig: { nativeName: 'Igbo', dir: 'ltr', flag: '🇳🇬', region: 'West Africa' },
  so: { nativeName: 'Soomaali', dir: 'ltr', flag: '🇸🇴', region: 'Horn of Africa' },
  tw: { nativeName: 'Twi', dir: 'ltr', flag: '🇬🇭', region: 'West Africa' },
  wo: { nativeName: 'Wolof', dir: 'ltr', flag: '🇸🇳', region: 'West Africa' },
  sn: { nativeName: 'chiShona', dir: 'ltr', flag: '🇿🇼', region: 'Southern Africa' },
} as const;

export type LanguageCode = keyof typeof languages;

i18n
  .use(Backend) // Load translations via HTTP
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    // Language detection order
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Backend configuration for loading translations
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'force-cache', // Use browser cache for offline support
      },
    },

    // Namespaces for organized translations
    ns: ['common', 'dashboard', 'learning', 'auth'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
      bindI18nStore: 'added',
    },

    // Load only current language + fallback
    load: 'currentOnly',
    preload: ['en'],

    // Support pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
  });

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  const language = languages[lng as LanguageCode];
  if (language) {
    document.documentElement.dir = language.dir;
    document.documentElement.lang = lng;
  }
});

export default i18n;

