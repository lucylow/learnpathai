// src/hooks/useOfflineTranslations.ts
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useOfflineTranslations = () => {
  const { i18n } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [translationsAvailable, setTranslationsAvailable] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync missing translations when back online
      i18n.reloadResources().catch(console.error);
    };

    const handleOffline = () => {
      setIsOffline(true);
      // Check if current language is cached
      checkCachedLanguage();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkCachedLanguage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [i18n]);

  const checkCachedLanguage = async () => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('translations-v1');
        const currentLangUrl = `/locales/${i18n.language}/common.json`;
        const cached = await cache.match(currentLangUrl);
        setTranslationsAvailable(!!cached || navigator.onLine);
      } else {
        setTranslationsAvailable(true);
      }
    } catch (error) {
      console.warn('Failed to check cached translations:', error);
      setTranslationsAvailable(true);
    }
  };

  return { isOffline, translationsAvailable };
};

