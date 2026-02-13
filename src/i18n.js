import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import traduzioni
import commonIT from './locales/it/common.json';
import dashboardIT from './locales/it/dashboard.json';
import uscitaIT from './locales/it/uscita.json';
import stockIT from './locales/it/stock.json';
import ricevimentoIT from './locales/it/ricevimento.json';

import commonEN from './locales/en/common.json';
import dashboardEN from './locales/en/dashboard.json';
import uscitaEN from './locales/en/uscita.json';
import stockEN from './locales/en/stock.json';
import ricevimentoEN from './locales/en/ricevimento.json';

// Risorse traduzioni
const resources = {
  it: {
    common: commonIT,
    dashboard: dashboardIT,
    uscita: uscitaIT,
    stock: stockIT,
    ricevimento: ricevimentoIT,
  },
  en: {
    common: commonEN,
    dashboard: dashboardEN,
    uscita: uscitaEN,
    stock: stockEN,
    ricevimento: ricevimentoEN,
  },
};

i18n
  // Rileva lingua browser
  .use(LanguageDetector)
  // Passa i18n a react-i18next
  .use(initReactI18next)
  // Inizializza i18next
  .init({
    resources,
    fallbackLng: 'it', // Lingua di default
    defaultNS: 'common', // Namespace di default
    
    // Salva la lingua scelta in localStorage
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React già fa escape
    },
    
    // Supporto plurali
    pluralSeparator: '_',
    
    // Debug (disabilita in produzione)
    debug: false,
  });

export default i18n;
