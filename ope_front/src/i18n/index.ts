import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ha from "./locales/ha.json";
import dje from "./locales/dje.json";

const resources = {
    fr: { translation: fr },
    en: { translation: en },
    ha: { translation: ha },
    dje: { translation: dje },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "fr",
        supportedLngs: ["fr", "en", "ha", "dje"],
        interpolation: {
            escapeValue: false, // React gère déjà l'échappement XSS
        },
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
    });

export default i18n;
