import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "tr"],
    fallbackLng: "en",
    detection: {
      order: ["navigator", "localStorage", "querystring", "cookie", "htmlTag"],
      caches: ["localStorage", "cookie"],
      lookupQuerystring: "lang",
      lookupCookie: "lang",
      lookupLocalStorage: "lang",
    },
    interpolation: {
      escapeValue: false
    },
  });

export default i18n;