'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from './translations';
import Cookies from 'js-cookie';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLang = Cookies.get('vms-lang') as Language;
    if (savedLang && ['en', 'am', 'or'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Cookies.set('vms-lang', lang, { expires: 365, path: '/' });
  };

  const t = (key: TranslationKey | string): string => {
    const defaultDict = translations.en;
    const currentDict = translations[language];

    // Check if key exists in the current dictionary
    if (key in currentDict) {
      return currentDict[key as TranslationKey];
    }
    
    // Fallback to English
    if (key in defaultDict) {
      return defaultDict[key as TranslationKey];
    }

    // Un-translated key
    return key;
  };

  // Prevent hydration errors by not rendering children immediately
  if (!isClient) {
    return <div className="min-h-screen bg-neutral-900" />;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
