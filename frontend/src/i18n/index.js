import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Every file under locales/<lang>/*.json is merged into the default
// `translation` namespace, so components can simply call t('section.key').
const modules = import.meta.glob('./locales/*/*.json', {
  eager: true,
  import: 'default',
});

const resources = {};

for (const [filePath, data] of Object.entries(modules)) {
  const [, , lang] = filePath.split('/');
  if (!lang || !data) continue;
  resources[lang] ||= { translation: {} };
  Object.assign(resources[lang].translation, data);
}

const SUPPORTED = ['en', 'hi', 'mr'];
const stored = localStorage.getItem('insightloop_lang');
const initialLng = SUPPORTED.includes(stored) ? stored : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
