import { useState } from "react";

interface Acteur {
    id: number;
    badge: string;
    titre: string;
    sousTitre: string;
    nom: string;
    photo: string | null;
    initiales: string;
    couleur: string;
    couleurLight: string;
    exergue: string;
    mot: string;
}

export default function Acteurs() {
    const [expanded, setExpanded] = useState<number | null>(null);

    const acteurs: Acteur[] = [
        {
            id: 1,
            badge: "MESSAGE OFFICIEL",
            titre: "Ministre de la Télécommunication",
            sousTitre: "Gouvernement du Niger",
            nom: "Son Excellence, le Ministre de la Télécommunication",
            photo: null,
            initiales: "MC",
            couleur: "#193549",
            couleurLight: "#EEF3F7",
            exergue: "Notre jeunesse doit être non seulement consommatrice des technologies, mais surtout actrice et innovatrice.",
            mot: `Le Camp National Citoyen de l'Excellence et de l'Innovation à Agadez est une initiative qui incarne parfaitement la vision du Niger pour sa jeunesse. Dans un monde où les technologies de l'information et de la communication redéfinissent chaque secteur de notre économie et de notre société, il est impératif que notre jeunesse soit non seulement consommatrice, mais surtout actrice et innovatrice.

Ce camp représente un tournant décisif. Il réunit sous un même ciel saharien les esprits les plus brillants de notre nation, les outille des compétences du XXIe siècle, et leur offre une plateforme unique pour transformer leurs idées en solutions concrètes pour nos communautés.

Le Gouvernement du Niger soutient pleinement cette démarche et s'engage à accompagner tous les efforts visant à faire de notre jeunesse le moteur de notre développement technologique et citoyen. Ensemble, bâtissons le Niger de demain.`,
        },
        {
            id: 2,
            badge: "MESSAGE PARTENAIRE",
            titre: "Directeur Exécutif",
            sousTitre: "UNESCO Center for Peace",
            nom: "Dr. Hakim Jamal El-Din",
            photo: null,
            initiales: "HJ",
            couleur: "#0A7B8E",
            couleurLight: "#EBF7F9",
            exergue: "La jeunesse africaine, lorsqu'elle est soutenue et valorisée, peut rivaliser et briller sur la scène internationale.",
            mot: `C'est avec une grande fierté et un enthousiasme sincère que l'UNESCO Center for Peace salue et soutient l'Organisation pour la Promotion de l'Excellence du Niger dans cette initiative remarquable qu'est le CNCEIZ Agadez 2026.

Nous avons eu le privilège de témoigner, lors du Camp Mondial 2024 à Hood College, de l'excellence extraordinaire des délégués nigériens. Leur victoire au Prix STEAM, leur engagement à l'IMUN et les Awards décernés à l'OPE ne sont pas de simples récompenses : ils sont la preuve vivante que la jeunesse africaine, lorsqu'elle est soutenue et valorisée, peut rivaliser et briller sur la scène internationale.

Le CNCEIZ perpétue et amplifie cet élan. Il crée un écosystème d'excellence ancré dans les réalités culturelles et géographiques du Sahel, tout en connectant la jeunesse nigérienne aux standards mondiaux de l'innovation. Nous croyons fermement que des partenariats comme celui-ci sont le fondement d'une paix durable, construite sur la science, la créativité et la citoyenneté active.

Notre institution demeure un partenaire engagé et fier à vos côtés.`,
        },
        {
            id: 3,
            badge: "MOT DE LA PRÉSIDENTE",
            titre: "Présidente Fondatrice",
            sousTitre: "Organisation pour la Promotion de l'Excellence (OPE)",
            nom: "Mme la Présidente de l'OPE",
            photo: null,
            initiales: "PO",
            couleur: "#F15B29",
            couleurLight: "#FFF3EE",
            exergue: "Chaque jeune Nigérien porte en lui une étincelle d'excellence qui n'attend que les bonnes conditions pour s'embraser.",
            mot: `Le CNCEIZ Agadez 2026, c'est bien plus qu'un camp. C'est un rêve collectif que nous transformons ensemble en réalité, pierre par pierre, talent par talent, depuis des années.

L'OPE a été fondée sur une conviction profonde : chaque jeune Nigérien porte en lui une étincelle d'excellence qui n'attend que les bonnes conditions pour s'embraser. Notre mission, depuis le premier jour, a été de créer ces conditions — un espace sûr, stimulant, inclusif — où la curiosité est récompensée, où l'erreur est une étape d'apprentissage, et où l'ambition n'a pas de frontières.

Le CNCEIZ est l'expression la plus aboutie de cette vision. Il réunit des Junior passionnés qui imaginent la mascotte de demain, et des Senior innovateurs qui construisent les solutions d'aujourd'hui. Il fait dialoguer Agadez, l'Aïr, Niamey, Diffa et Tillabéri. Il inscrit le Niger sur la carte mondiale de l'excellence jeunesse.

À tous les participants, parents, partenaires et membres de l'équipe : vous êtes le cœur de cette aventure. Ensemble, nous prouvons que l'excellence est nigérienne.`,
        },
    ];

    return (
        <div className="pt-8 bg-ope-bg min-h-screen">

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="py-16 px-4 sm:px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-ope-text leading-tight mb-5 tracking-tight">
                        Ils portent<br />
                        <span style={{ color: "#F15B29" }}>la vision du camp</span>
                    </h1>
                    <p className="text-sm sm:text-base text-ope-text-muted leading-relaxed">
                        Personnalités institutionnelles et partenaires — découvrez les mots de ceux qui font du CNCEIZ une réalité.
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

                                    {/* Colonne photo */}
                                    <div
                                        className="lg:w-72 shrink-0 flex flex-col items-center justify-center gap-5 p-8 lg:p-10"
                                        style={{ backgroundColor: acteur.couleurLight }}
                                    >
                                        {/* Photo ou avatar */}
                                        {acteur.photo ? (
                                            <img
                                                src={acteur.photo}
                                                alt={acteur.nom}
                                                className="w-32 h-32 rounded-full object-cover shadow-md ring-4 ring-white"
                                            />
                                        ) : (
                                            <div
                                                className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-md ring-4 ring-white"
                                                style={{ backgroundColor: acteur.couleur }}
                                            >
                                                {acteur.initiales}
                                            </div>
                                        )}

                                        {/* Identité */}
                                        <div className="text-center">
                                            <span
                                                className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white mb-2"
                                                style={{ backgroundColor: acteur.couleur }}
                                            >
                                                {acteur.badge}
                                            </span>
                                            <p className="text-sm font-extrabold text-ope-text leading-snug">{acteur.titre}</p>
                                            <p className="text-xs text-ope-text-muted mt-0.5">{acteur.sousTitre}</p>
                                        </div>
                                    </div>

                                    {/* Colonne texte */}
                                    <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between">
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
                                        <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-[800px]" : "max-h-0"}`}>
                                            <div className="space-y-3 pb-5">
                                                {acteur.mot.split("\n\n").map((para, i) => (
                                                    <p key={i} className="text-sm text-ope-text leading-relaxed">
                                                        {para}
                                                    </p>
                                                ))}
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
                                                {isOpen ? "Réduire" : "Lire le message complet"}
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
