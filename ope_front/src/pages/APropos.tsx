import { useTranslation } from "react-i18next";
import inspireImg from "../assets/apropos-inspire.jpg";

export default function APropos() {
    const { t } = useTranslation();

    // ── Données des Piliers / Valeurs ───────────────────────────────────────────
    const VALEURS = [
        {
            icon: (
                <svg className="w-6 h-6 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14v7" />
                </svg>
            ),
            label: "school",
            titre: t("apropos.pilier_1_title"),
            desc: t("apropos.pilier_1_desc"),
        },
        {
            icon: (
                <svg className="w-6 h-6 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            label: "lightbulb",
            titre: t("apropos.pilier_2_title"),
            desc: t("apropos.pilier_2_desc"),
        },
        {
            icon: (
                <svg className="w-6 h-6 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            label: "groups",
            titre: t("apropos.pilier_3_title"),
            desc: t("apropos.pilier_3_desc"),
        },
    ];

    // ── Données fixes de la Timeline ─────────────────────────────────────────────
    const TIMELINE = [
        {
            annee: "2021",
            titre: "Lancement",
            desc: "Création de l'initiative avec une première cohorte de 50 talents locaux axée sur le numérique.",
            offsetClass: "lg:translate-y-7",
            dotPosition: "top",
            isSpecial: false,
        },
        {
            annee: "2022",
            titre: "Expansion",
            desc: "Ouverture du premier hub d'innovation physique à Agadez. Partenariats stratégiques établis.",
            offsetClass: "lg:-translate-y-7",
            dotPosition: "bottom",
            isSpecial: false,
        },
        {
            annee: "2023",
            titre: "Les 1000 Talents",
            desc: "Lancement du programme ambitieux visant à former 1000 jeunes innovateurs sur 3 ans.",
            offsetClass: "lg:translate-y-7",
            dotPosition: "top",
            isSpecial: false,
        },
        {
            annee: "2024",
            titre: "Aujourd'hui",
            desc: "Reconnaissance nationale et déploiement de solutions tech locales impactant la région.",
            offsetClass: "lg:-translate-y-7",
            dotPosition: "bottom",
            isSpecial: true,
        },
    ];

    return (
        <div className="pt-14 bg-ope-bg min-h-screen">
            {/* ── Section Notre Vision ──────────────────────────────────── */}
            <section id="vision" className="py-8 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    {/* Titre Principal */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-ope-text leading-tight mb-4 tracking-tight">
                        {t("apropos.title")}
                    </h1>

                    {/* Description */}
                    <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
                        {t("apropos.description")}
                    </p>
                </div>
            </section>

            {/* ── Section Piliers & Photo d'Inspiration ────────────────── */}
            <section id="valeurs" className="px-4 sm:px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Carte 1 : Éducation de Pointe */}
                    <div className="bg-ope-white rounded-3xl p-8 shadow-sm border border-ope-border flex flex-col justify-start">
                        <div className="flex items-center gap-2 mb-3">
                            {VALEURS[0].icon}
                            <span className="text-sm font-semibold text-ope-orange lowercase tracking-wide font-mono">
                                {VALEURS[0].label}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-ope-text mb-2">
                            {VALEURS[0].titre}
                        </h3>
                        <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
                            {VALEURS[0].desc}
                        </p>
                    </div>

                    {/* Carte 2 : Innovation Technologique */}
                    <div className="bg-ope-white rounded-3xl p-8 shadow-sm border border-ope-border flex flex-col justify-start">
                        <div className="flex items-center gap-2 mb-3">
                            {VALEURS[1].icon}
                            <span className="text-sm font-semibold text-ope-orange lowercase tracking-wide font-mono">
                                {VALEURS[1].label}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-ope-text mb-2">
                            {VALEURS[1].titre}
                        </h3>
                        <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
                            {VALEURS[1].desc}
                        </p>
                    </div>

                    {/* Carte 3 : Réseau Solide */}
                    <div className="bg-ope-white rounded-3xl p-8 shadow-sm border border-ope-border flex flex-col justify-start">
                        <div className="flex items-center gap-2 mb-3">
                            {VALEURS[2].icon}
                            <span className="text-sm font-semibold text-ope-orange lowercase tracking-wide font-mono">
                                {VALEURS[2].label}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-ope-text mb-2">
                            {VALEURS[2].titre}
                        </h3>
                        <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
                            {VALEURS[2].desc}
                        </p>
                    </div>

                    {/* Carte 4 : Image d'Inspiration avec Overlay */}
                    <div className="relative rounded-3xl overflow-hidden shadow-sm border border-ope-border min-h-[220px] md:min-h-full group">
                        <img
                            src={inspireImg}
                            alt="Inspirer la prochaine génération"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                            <h3 className="text-ope-white font-extrabold text-xl sm:text-2xl leading-tight drop-shadow-md">
                                {t("apropos.inspiration_quote")}
                            </h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Section Citation ──────────────────────────────────────── */}
            <section id="citation" className="py-8 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <blockquote className="text-xl sm:text-2xl md:text-3xl font-extrabold text-ope-text leading-snug tracking-tight mb-6">
                        "{t("apropos.inspiration_quote")}"
                    </blockquote>
                    <div
                        className="w-16 h-1 rounded-full mx-auto bg-ope-primary"
                    />
                </div>
            </section>

            {/* ── Section Notre Parcours (Timeline) ────────────────────── */}
            <section id="parcours" className="pb-28 px-4 sm:px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    {/* Header Parcours */}
                    <div className="mb-14 text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-ope-text tracking-tight">
                            {t("apropos.timeline_title")}
                        </h2>
                        <p className="text-xs sm:text-sm text-ope-text-muted mt-1">
                            {t("apropos.timeline_subtitle")}
                        </p>
                    </div>

                    {/* Conteneur de la Timeline avec ligne d'axe et décalage */}
                    <div className="relative">
                        {/* Ligne horizontale d'axe en arrière-plan */}
                        <div className="hidden lg:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#eadfd2] z-0" />

                        {/* Grille des Cartes Timeline en zigzag (décalage alterné) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            {TIMELINE.map((item) => (
                                <div
                                    key={item.annee}
                                    className={`flex flex-col items-center transition-transform duration-300 ${item.offsetClass}`}
                                >
                                    {/* Point au-dessus (Cartes 1 et 3) */}
                                    <div className="h-7 flex items-center justify-center mb-2">
                                        {item.dotPosition === "top" ? (
                                            <span className="w-3.5 h-3.5 rounded-full bg-[#1c5d6f] shadow-sm ring-4 ring-ope-bg" />
                                        ) : (
                                            <span className="w-3.5 h-3.5 opacity-0" />
                                        )}
                                    </div>

                                    {/* Carte */}
                                    <div
                                        className={`w-full bg-ope-white rounded-2xl p-6 min-h-[220px] flex flex-col justify-start ${
                                            item.isSpecial
                                                ? "border-2 border-[#5ba7be] shadow-sm"
                                                : "border border-ope-border shadow-sm"
                                        }`}
                                    >
                                        {/* Badge Année */}
                                        <span
                                            className={`inline-block w-fit text-[11px] font-bold px-2 py-0.5 rounded mb-3 ${
                                                item.isSpecial
                                                    ? "bg-[#d7f1f7] text-[#1c647b]"
                                                    : "bg-[#fde9e2] text-[#d95d39]"
                                            }`}
                                        >
                                            {item.annee}
                                        </span>

                                        <h3 className="font-extrabold text-base text-ope-text mb-2 tracking-tight">
                                            {item.titre}
                                        </h3>
                                        <p className="text-xs text-ope-text-muted leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Point en-dessous (Cartes 2 et 4) */}
                                    <div className="h-7 flex items-center justify-center mt-2">
                                        {item.dotPosition === "bottom" ? (
                                            <span className="w-3.5 h-3.5 rounded-full bg-[#1c5d6f] shadow-sm ring-4 ring-ope-bg" />
                                        ) : (
                                            <span className="w-3.5 h-3.5 opacity-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
