import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import en from "@/locales/en.json";
import th from "@/locales/th.json";
import lao from "@/locales/lao.json";
import myanmar from "@/locales/myanmar.json";

type Language = "en" | "th" | "lao" | "myanmar";
type Translations = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const saved = localStorage.getItem("language") as Language;
        if (saved) setLanguageState(saved);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };
    const translations: Record<Language, Translations> = { en, th, lao, myanmar };
    const t = useMemo(() => {
        const current = translations[language];
        const makeProxy = (obj: any): any =>
            new Proxy(obj, {
                get(target, prop) {
                    if (prop in target) {
                        if (typeof target[prop] === "object" && target[prop] !== null) {
                            return makeProxy(target[prop]);
                        }
                        return target[prop];
                    }
                    return String(prop);
                }
            });

        return makeProxy(current);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
    return ctx;
};