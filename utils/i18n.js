import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import pt from '../locales/pt.json';
import en from '../locales/en.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

import { Platform } from 'react-native';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: Localization.getLocales()[0].languageCode === 'en' ? 'en' : 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false, // expo-router doesn't handle suspense well in all layouts
    },
  });

// Handle browser auto-translation glitches by syncing HTML lang attribute
i18n.on('languageChanged', (lng) => {
  if (Platform.OS === 'web') {
    document.documentElement.lang = lng;
  }
});

// Set initial lang for web
if (Platform.OS === 'web') {
  document.documentElement.lang = i18n.language;
}

export default i18n;
