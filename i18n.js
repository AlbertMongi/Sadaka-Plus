// i18n.js (replace the old RNLocalize parts)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';  // ← new import

import en from './locale/en.json';
import sw from './locale/sw.json';

const resources = {
  en: { translation: en },
  sw: { translation: sw },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Improved initial language setup using expo-localization
const initLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem('appLanguage');
    if (saved && ['en', 'sw'].includes(saved)) {
      await i18n.changeLanguage(saved);
      return;
    }

    // expo-localization gives array of preferred locales
    const locales = Localization.getLocales();
    const preferred = locales[0]?.languageCode || 'en';  // e.g. 'en', 'sw'
    const lng = ['en', 'sw'].includes(preferred) ? preferred : 'en';

    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('appLanguage', lng);
  } catch (err) {
    console.warn('Language init failed — using fallback "en"', err);
    i18n.changeLanguage('en');
  }
};

initLanguage();

export default i18n;