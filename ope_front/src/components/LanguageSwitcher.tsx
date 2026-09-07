import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
    { code: "fr", label: "Français", short: "FR" },
    { code: "en", label: "English", short: "EN" },
    { code: "ha", label: "Hausa", short: "HA" },
    { code: "dje", label: "Zarma", short: "DJE" },
];

export default function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const currentLang = LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) || LANGUAGES[0];

    const changeLang = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border border-ope-border/80 bg-white/90 hover:bg-white text-ope-text shadow-2xs hover:border-ope-orange cursor-pointer"
                aria-expanded={isOpen}
                aria-haspopup="true"
                title="Changer de langue / Change language"
            >
                <span className="text-[11px] font-extrabold uppercase tracking-wider">{currentLang.short}</span>
                <svg
                    className={`w-3.5 h-3.5 text-ope-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-ope-border py-1.5 z-50 animate-fade-up">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ope-text-muted border-b border-ope-border/50 mb-1 flex items-center justify-between">
                        <span>{t("languages.title", "Langue")}</span>
                        <span className="text-[9px] font-bold text-ope-orange tracking-widest">{currentLang.short}</span>
                    </div>
                    {LANGUAGES.map((lang) => {
                        const isSelected = currentLang.code === lang.code;
                        const translatedName = t(`languages.${lang.code}`, lang.label);

                        return (
                            <button
                                key={lang.code}
                                onClick={() => changeLang(lang.code)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer text-left ${
                                    isSelected
                                        ? "bg-ope-orange/10 text-ope-orange font-extrabold"
                                        : "text-ope-text hover:bg-slate-50"
                                }`}
                            >
                                <span className="flex flex-col">
                                    <span className="leading-tight">{translatedName}</span>
                                    {translatedName !== lang.label && (
                                        <span className="text-[10px] text-ope-text-muted font-medium">{lang.label}</span>
                                    )}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-ope-text-muted/70 uppercase">({lang.short})</span>
                                    {isSelected && <svg className="w-3 h-3 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

