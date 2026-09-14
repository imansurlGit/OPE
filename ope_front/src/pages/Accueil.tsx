import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import heroImg from "../assets/agadez_drone.jpeg";
import campNationalCitoyen from "../assets/camp_natio.png";

const ORANGE = "#F15B29";
const CARD_BG = "#E9EFF4";
const CARD_TITLE = "#132433";
const CARD_SUBTITLE = "#5C6B76";

interface CategoryMeta {
    id: "steam" | "lp" | "mcc";
    icon: React.ReactNode;
}

const CATEGORY_METAS: CategoryMeta[] = [
    {
        id: "steam",
        icon: (
            <path d="M9 3h6M10 3v6l-4.5 8a2 2 0 001.7 3h9.6a2 2 0 001.7-3L14 9V3M8.5 14h7" />
        ),
    },
    {
        id: "lp",
        icon: (
            <path d="M3 11l9-7 9 7M5 10v10h14V10M9 20v-6h6v6" />
        ),
    },
    {
        id: "mcc",
        icon: (
            <path d="M17 20v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M13 7a4 4 0 11-8 0 4 4 0 018 0zM21 20v-2a4 4 0 00-3-3.85M16 3.13a4 4 0 010 7.75" />
        ),
    },
];

export default function Accueil() {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleCardClick = (id: string) => {
        setActiveId(activeId === id ? null : id);
    };

    const categories = CATEGORY_METAS.map((meta) => {
        const title = t(`hero.categories.${meta.id}.title`);
        const subtitle = t(`hero.categories.${meta.id}.subtitle`);
        const rawItems = t(`hero.categories.${meta.id}.items`, { returnObjects: true });
        const items = Array.isArray(rawItems) ? (rawItems as string[]) : [];

        return {
            id: meta.id,
            title,
            subtitle,
            items,
            icon: meta.icon,
        };
    });

    const dateBlocks = [
        { value: t("countdown.day_val"), label: t("countdown.day") },
        { value: t("countdown.month_val"), label: t("countdown.month") },
        { value: t("countdown.year_val"), label: t("countdown.year") },
    ];

    return (
        <main>
            {/* Hero Section */}
            <section
                id="accueil"
                className="relative overflow-hidden flex flex-col min-h-[100svh] justify-between pt-16 sm:pt-20 pb-3 sm:pb-4 px-3 sm:px-4 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImg})` }}
            >
                {/* Dégradé fond */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `linear-gradient(to bottom,
                            rgba(48,96,132,0.92) 0%,
                            rgba(48,96,132,0.70) 25%,
                            rgba(20,45,64,0.40) 50%,
                            rgba(14,35,52,0.80) 80%,
                            rgba(10,26,39,0.95) 100%)`,
                    }}
                />

                {/* Overlay pour flouter l'arrière-plan et fermer au clic à l'extérieur (z-30 : derrière les cartes z-40) */}
                {activeId && (
                    <div
                        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 cursor-pointer"
                        onClick={() => setActiveId(null)}
                    />
                )}

                {/* ── BLOC CENTRAL : Logo + Cartes des 3 catégories (z-40 quand actif pour être au-dessus du blur z-30) ── */}
                <div
                    className={`relative flex flex-col items-center justify-center gap-5 sm:gap-8 my-auto -translate-y-2 sm:-translate-y-6 w-full max-w-5xl mx-auto ${
                        activeId ? "z-40" : "z-10"
                    }`}
                >
                    {/* Logo principal */}
                    <div className="flex justify-center items-center w-full">
                        <img
                            id="hero-logo"
                            src={campNationalCitoyen}
                            alt="Camp National Citoyen"
                            className="animate-fade-up-d1 h-auto w-auto max-h-[30svh] sm:max-h-[38svh] md:max-h-[42svh] max-w-[85vw] sm:max-w-md md:max-w-lg object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* Cartes des 3 catégories */}
                    <div
                        id="talents"
                        className="relative w-full max-w-xs sm:max-w-none mx-auto px-2"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setActiveId(null);
                            }
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                            {categories.map((cat) => {
                                const isFlipped = activeId === cat.id;

                                return (
                                    <div
                                        key={cat.id}
                                        className={`flip-card-scene relative h-[42px] sm:h-[62px] ${
                                            isFlipped ? "z-50" : "z-10"
                                        }`}
                                    >
                                        {/* Conteneur rotatif — flip 3D fluide */}
                                        <div
                                            className={`flip-card-inner cursor-pointer${isFlipped ? " is-flipped" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(cat.id);
                                            }}
                                        >
                                            {/* ── FACE AVANT ── */}
                                            <div
                                                className="flip-card-front flex items-center justify-center gap-2 sm:gap-1.5 shadow-md hover:shadow-xl transition-shadow border border-white/20 p-2 sm:p-3"
                                                style={{ backgroundColor: CARD_BG }}
                                            >
                                                <span
                                                    className="inline-flex w-4 h-4 sm:w-5 sm:h-5 shrink-0 items-center justify-center"
                                                    style={{ color: ORANGE }}
                                                >
                                                    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {cat.icon}
                                                    </svg>
                                                </span>
                                                <h3
                                                    className="text-xs sm:text-xs font-extrabold uppercase leading-tight text-center"
                                                    style={{ color: CARD_TITLE }}
                                                >
                                                    {cat.title}
                                                </h3>
                                            </div>

                                            {/* ── FACE ARRIÈRE (Desktop : s'élargit en superposition z-index sans déplacer le reste) ── */}
                                            <div
                                                className="flip-card-back-desktop p-4 sm:p-5 flex-col justify-start shadow-2xl border border-white/40 hidden sm:flex"
                                                style={{ backgroundColor: CARD_BG }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex w-5 h-5 shrink-0 items-center justify-center" style={{ color: ORANGE }}>
                                                            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">{cat.icon}</svg>
                                                        </span>
                                                        <h3 className="text-xs sm:text-sm font-extrabold uppercase leading-tight" style={{ color: CARD_TITLE }}>
                                                            {cat.title}
                                                        </h3>
                                                    </div>
                                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </span>
                                                </div>

                                                <p className="text-[11px] font-medium leading-snug mb-2" style={{ color: CARD_SUBTITLE }}>
                                                    {cat.subtitle}
                                                </p>

                                                <div className="h-[2px] w-full rounded-full mb-2.5" style={{ backgroundColor: ORANGE }} />

                                                <ul className="flex flex-col gap-1.5">
                                                    {cat.items.map((item) => (
                                                        <li key={item} className="text-[11px] font-semibold flex items-start gap-2 leading-snug" style={{ color: CARD_TITLE }}>
                                                            <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ORANGE }} />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── MODAL MOBILE AU CENTRE : Affichage plein écran sans déformation de la grille ── */}
                {activeId && (
                    <div
                        className="sm:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                        onClick={() => setActiveId(null)}
                    >
                        {(() => {
                            const activeCat = categories.find((c) => c.id === activeId);
                            if (!activeCat) return null;

                            return (
                                <div
                                    className="w-full max-w-sm rounded-2xl shadow-2xl border border-white/40 p-5 flex flex-col gap-3 animate-pop-modal"
                                    style={{ backgroundColor: CARD_BG }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="inline-flex w-6 h-6 shrink-0 items-center justify-center" style={{ color: ORANGE }}>
                                                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
                                                    {activeCat.icon}
                                                </svg>
                                            </span>
                                            <h3 className="text-sm font-extrabold uppercase leading-tight" style={{ color: CARD_TITLE }}>
                                                {activeCat.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setActiveId(null)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 text-slate-600 transition-colors text-sm font-bold cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="h-[2px] w-full rounded-full" style={{ backgroundColor: ORANGE }} />

                                    <p className="text-xs font-semibold leading-relaxed" style={{ color: CARD_SUBTITLE }}>
                                        {activeCat.subtitle}
                                    </p>

                                    <div className="bg-white/50 rounded-xl p-3 border border-white/60">
                                        <h4 className="text-[11px] font-extrabold uppercase mb-2 tracking-wider text-slate-500">
                                            {t("hero.cards_activities_title")}
                                        </h4>
                                        <ul className="flex flex-col gap-2">
                                            {activeCat.items.map((item) => (
                                                <li key={item} className="text-xs font-bold flex items-start gap-2 leading-snug" style={{ color: CARD_TITLE }}>
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ORANGE }} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* CTA + Description + Badges Pied de page */}
                <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-3 w-full max-w-5xl mx-auto mt-1 sm:mt-auto pt-1 sm:pt-2">
                    <p
                        className="sm:block animate-fade-up-d2 text-[11px] sm:text-sm leading-snug sm:leading-relaxed max-w-xs sm:max-w-lg text-center text-white/90 font-medium"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                    >
                        {t("hero.tagline")}
                    </p>

                    <div
                        id="hero-cta"
                        className="animate-fade-up-d3 flex flex-row gap-2 sm:gap-4 justify-center w-full max-w-xs sm:max-w-none"
                    >
                        <Link
                            to="/formulaire"
                            className="flex-1 w-1/4 sm:flex-none inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 active:scale-95 text-center"
                            style={{ backgroundColor: ORANGE, boxShadow: "0 4px 16px rgba(241,91,41,0.40)" }}
                        >
                            {t("hero.cta_register")}
                        </Link>
                    </div>

                    <div className="w-full flex items-center justify-between mt-1 sm:mt-2 text-white font-extrabold uppercase text-[10px] sm:text-lg tracking-tight">
                        <span id="badge-edition" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                            {t("hero.edition")}
                        </span>
                        <span id="badge-lieu" className="inline-flex items-center gap-1" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" fill={ORANGE}>
                                    <path fillRule="evenodd" d="M10 18s6-5.686 6-10A6 6 0 0 0 4 8c0 4.314 6 10 6 10Zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                                </svg>
                                {t("hero.location")}
                        </span>
                    </div>
                </div>
            </section>

            {/* Section Date de l'événement */}
            <section id="countdown" className="py-12 px-4 bg-ope-bg">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-ope-bg-card rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-ope-border">
                        <div className="text-center md:text-left max-w-md">
                            <h2
                                id="countdown-title"
                                className="text-xl sm:text-3xl font-extrabold text-ope-text mb-2 tracking-tight"
                            >
                                {t("countdown.title")}
                            </h2>
                            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
                                {t("countdown.description")}
                            </p>
                        </div>

                        {/* Blocs de Date (Jour / Mois / Année) */}
                        <div id="countdown-blocks" className="flex gap-2 sm:gap-3 shrink-0">
                            {dateBlocks.map(({ value, label }) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-center justify-center rounded-2xl px-4 sm:px-5 py-3 sm:py-4 w-20 sm:w-24"
                                    style={{
                                        backgroundColor: "var(--color-count-bg)",
                                        border: "1px solid var(--color-count-border)",
                                    }}
                                >
                                    <span
                                        className={`text-xl sm:text-3xl font-extrabold tracking-tight leading-none ${label === t("countdown.month") ? "text-ope-orange" : "text-ope-primary"}`}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}