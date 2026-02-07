import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 1. i18n Mock (Zaten vardı, kontrol et)
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { // i18n objesi, dil değiştirme gibi işlemleri simüle etmek için
      changeLanguage: vi.fn(() => Promise.resolve()), // Promise.resolve() döndürerek asenkron işlemin tamamlandığını simüle eder
      language: 'tr',
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// 2. matchMedia Mock (AppConfigProvider hatasını çözer)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});