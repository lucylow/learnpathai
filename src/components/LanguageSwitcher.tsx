// src/components/LanguageSwitcher.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, Search, ChevronDown } from 'lucide-react';
import { languages, LanguageCode } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  region: string;
}

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get language options
  const languageOptions: LanguageOption[] = Object.entries(languages).map(
    ([code, { nativeName, dir, flag, region }]) => ({
      code: code as LanguageCode,
      nativeName,
      flag,
      dir,
      region,
    })
  );

  // Filter languages based on search
  const filteredLanguages = languageOptions.filter((lang) =>
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Change language
  const changeLanguage = async (langCode: string) => {
    await i18n.changeLanguage(langCode);

    // Update document direction for RTL languages
    const language = languages[langCode as LanguageCode];
    if (language) {
      document.documentElement.dir = language.dir;
      document.documentElement.lang = langCode;
    }

    setIsOpen(false);
    setSearchQuery('');

    // Track language change (if telemetry is enabled)
    if (typeof window !== 'undefined' && 'track' in window) {
      const trackFn = (window as unknown as { track: (event: string, data: Record<string, unknown>) => void }).track;
      trackFn('language_changed', {
        from: i18n.language,
        to: langCode,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const currentLanguage = languageOptions.find(
    (lang) => lang.code === i18n.language
  ) || languageOptions[0];

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:hover:bg-blue-900/20"
        aria-label={t('common.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="text-lg" role="img" aria-label={currentLanguage.nativeName}>
          {currentLanguage.flag}
        </span>
        <span className="font-medium text-gray-900 dark:text-gray-100 hidden sm:inline">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.searchLanguage')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                autoFocus
              />
            </div>
          </div>

          {/* Language List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              <>
                {/* Group by region */}
                {Array.from(new Set(filteredLanguages.map((lang) => lang.region))).map((region) => (
                  <div key={region}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-900/50">
                      {region}
                    </div>
                    {filteredLanguages
                      .filter((lang) => lang.region === region)
                      .map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors",
                            lang.code === i18n.language && "bg-blue-50 dark:bg-blue-900/30"
                          )}
                          role="option"
                          aria-selected={lang.code === i18n.language}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl" role="img" aria-label={lang.nativeName}>
                              {lang.flag}
                            </span>
                            <div className="text-left">
                              <span className="font-medium text-gray-900 dark:text-gray-100 block">
                                {lang.nativeName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {lang.code.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {lang.code === i18n.language && (
                            <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      ))}
                  </div>
                ))}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {t('common.noLanguagesFound')}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 text-center">
            {t('common.languageNote')}
          </div>
        </div>
      )}
    </div>
  );
};

