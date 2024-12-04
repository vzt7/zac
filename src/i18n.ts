import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { useHeaderSettings } from './components/header.store';
import { defaultNS, resources } from './locales';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // bind react-i18next to the instance
  .init({
    supportedLngs: ['en', 'en-US', 'zh', 'zh-Hans'],
    detection: {
      convertDetectedLanguage: (lng) => {
        const lang = lng.replace(/-.+/, '');
        useHeaderSettings.setState(() => ({ lang: lang as 'zh' | 'en' }));
        return lang;
      },
    },

    lng: 'en',
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    defaultNS,
    resources,

    // react i18next special options (optional)
    // override if needed - omit if ok with defaults
    /*
    react: {
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
      useSuspense: true,
    }
    */
  });

export default i18n;
