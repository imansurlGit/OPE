import { useState } from "react";
import { useTranslation } from "react-i18next";
import presiImg from "../assets/presi.jpeg";
import kaderImg from "../assets/kader.jpeg";

interface Acteur {
    id: number;
    titre: string;
    sousTitre: string;
    nom: string;
    photo: string | null;
    couleur: string;
    couleurLight: string;
    exergue: string;
    motParagraphs: string[];
}

export default function Acteurs() {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState<number | null>(null);

    const acteurs: Acteur[] = [
        {
            id: 1,
            titre: t("acteurs.presi_title", "Présidente"),
            sousTitre: t("acteurs.presi_subtitle", "Organisation pour la Promotion de l'Excellence (OPE)"),
            nom: t("acteurs.presi_name", "Mme la Présidente de l'OPE"),
            photo: presiImg,
            couleur: "#111111",
            couleurLight: "#F5F5F5",
            exergue: t("acteurs.presi_quote"),
            motParagraphs: [
                t("acteurs.presi_p1"),
                t("acteurs.presi_p2"),
                t("acteurs.presi_p3"),
                t("acteurs.presi_p4"),
                t("acteurs.presi_p5"),
            ],
        },
        {
            id: 2,
            titre: t("acteurs.sg_title", "Secrétaire Général"),
            sousTitre: t("acteurs.sg_subtitle", "Organisation pour la Promotion de l'Excellence (OPE)"),
            nom: t("acteurs.sg_name", "Kader Assane Seydou"),
            photo: kaderImg,
            couleur: "#0A7B8E",
            couleurLight: "#EBF7F9",
            exergue: t("acteurs.sg_quote"),
            motParagraphs: [
                t("acteurs.sg_p1"),
                t("acteurs.sg_p2"),
                t("acteurs.sg_p3"),
                t("acteurs.sg_p4"),
                t("acteurs.sg_p5"),
                t("acteurs.sg_p6"),
                t("acteurs.sg_p7"),
                t("acteurs.sg_p8"),
            ],
        },
    ];

    return (
        <div className="pt-8 bg-ope-bg min-h-screen">

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-ope-text leading-tight mb-5 tracking-tight">
                        {t("acteurs.hero_title_1", "Ils portent")}<br />
                        <span style={{ color: "#F15B29" }}>{t("acteurs.hero_title_2", "la vision du camp")}</span>
                    </h1>
                    <p className="text-sm sm:text-base text-ope-text-muted leading-relaxed">
                        {t("acteurs.hero_subtitle", "Personnalités institutionnelles et partenaires — découvrez les mots de ceux qui font du CNCEIZ une réalité.")}
                    </p>
                </div>
            </section>

            {/* ── Cartes Acteurs ────────────────────────────── */}
            <section className="pb-24 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto space-y-10">
                    {acteurs.map((acteur, idx) => {
                        const isOpen = expanded === acteur.id;
                        const isEven = idx % 2 === 1;

                        return (
                            <article
                                key={acteur.id}
                                className="bg-white rounded-3xl border border-ope-border shadow-sm overflow-hidden"
                            >
                                {/* ── Layout : photo + citation ── */}
                                <div className={`flex flex-col ${isEven ? "lg:flex-row-reverse" : "lg:flex-row"}`}>

                                    {/* Colonne photo couvrant toute la section avec overlay coloré à opacité */}
                                    <div className="relative lg:w-80 shrink-0 min-h-[300px] lg:min-h-full overflow-hidden flex flex-col justify-end p-6 sm:p-8 bg-slate-900">
                                        {/* Photo pleine surface */}
                                        {acteur.photo && (
                                            <img
                                                src={acteur.photo}
                                                alt={acteur.nom}
                                                className="absolute inset-0 w-full h-full object-cover object-top"
                                            />
                                        )}

                                        {/* Voile coloré avec opacité */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                backgroundColor: acteur.couleur,
                                                opacity: 0.28,
                                            }}
                                        />

                                        {/* Dégradé pour lisibilité du titre */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                                        {/* Titre uniquement sur l'image */}
                                        <div className="relative z-10 text-white">
                                            <p className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-md">
                                                {acteur.titre}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Colonne texte */}
                                    <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
                                        <div>
                                            {/* Grand guillemet */}
                                            <svg
                                                className="w-12 h-12 mb-3"
                                                style={{ color: acteur.couleur, opacity: 0.12 }}
                                                fill="currentColor" viewBox="0 0 32 32"
                                            >
                                                <path d="M10 8C5.6 8 2 11.6 2 16v8h8v-8H6c0-2.2 1.8-4 4-4V8zm16 0c-4.4 0-8 3.6-8 8v8h8v-8h-4c0-2.2 1.8-4 4-4V8z" />
                                            </svg>

                                        {/* Phrase exergue */}
                                        <blockquote
                                            className="text-base sm:text-xl font-bold leading-snug mb-5"
                                            style={{ color: acteur.couleur }}
                                        >
                                            « {acteur.exergue} »
                                        </blockquote>

                                            {/* Texte complet (accordéon) */}
                                            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-[1400px]" : "max-h-0"}`}>
                                                <div className="space-y-3 pb-5">
                                                    {acteur.motParagraphs.map((para, i) => (
                                                        <p key={i} className="text-sm text-ope-text leading-relaxed">
                                                            {para}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pied : nom + bouton */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ope-border">
                                            <div>
                                                <p className="text-xs font-extrabold text-ope-text">{acteur.nom}</p>
                                                <p className="text-[11px] text-ope-text-muted">{acteur.sousTitre}</p>
                                            </div>
                                            <button
                                                onClick={() => setExpanded(isOpen ? null : acteur.id)}
                                                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer"
                                                style={{
                                                    borderColor: acteur.couleur,
                                                    color: acteur.couleur,
                                                    backgroundColor: isOpen ? acteur.couleur : "transparent",
                                                    ...(isOpen ? { color: "white" } : {}),
                                                }}
                                            >
                                                {isOpen ? t("acteurs.read_less", "Réduire") : t("acteurs.read_more", "Lire le message complet")}
                                                <svg
                                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Accent bas coloré */}
                                <div className="h-1 w-full" style={{ backgroundColor: acteur.couleur }} />
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
