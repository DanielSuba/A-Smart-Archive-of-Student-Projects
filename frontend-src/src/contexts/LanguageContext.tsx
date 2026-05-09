import React, { createContext, useContext, useState } from 'react';
import { translations, type Lang, type T } from '../locales/translations';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const LangContext = createContext<LangCtx | null>(null);

// Funkcja służy do dostarczania kontekstu języka aplikacji.
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'pl';
  });

  // Funkcja służy do zmiany języka i zapisania go w pamięci przeglądarki.
  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

// Funkcja służy do pobierania aktualnego kontekstu języka w komponentach.
export const useLanguage = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
