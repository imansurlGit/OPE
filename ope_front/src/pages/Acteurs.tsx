import { useState } from "react";
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
    mot: string;
}

export default function Acteurs() {
    const [expanded, setExpanded] = useState<number | null>(null);

    const acteurs: Acteur[] = [
        {
            id: 1,
            titre: "Présidente",
            sousTitre: "Organisation pour la Promotion de l'Excellence (OPE)",
            nom: "Mme la Présidente de l'OPE",
            photo: presiImg,
            couleur: "#111111",
            couleurLight: "#F5F5F5",
            exergue: `Le Niger est le pays le plus jeune du monde. Cette réalité démographique, souvent
citée comme un défi est en vérité notre ressource la plus précieuse et la plus
sous-exploitée.`,
            mot: `Il est des projets qui naissent d'un
constat, et d'autres qui naissent d'une
intime conviction. Le Camp National
Citoyen de l'Excellence et de l'Innovation
est de ceux-là. Il est né de la conviction,
profonde et irréductible, que la jeunesse
nigérienne n'a pas besoin qu'on lui
invente un avenir. Elle a besoin qu'on lui
offre un cadre à la hauteur de ce qu'elle
est déjà capable d'accomplir.
Le Niger est le pays le plus jeune du monde. Cette réalité démographique, souvent
citée comme un défi est en vérité notre ressource la plus précieuse et la plus
sous-exploitée. Dans les ateliers sans électricité, dans les cours de récréation
poussiéreuses, dans les chambres mal éclairées de Niamey, Zinder, Maradi,
Tahoua et Agadez, des milliers de jeunes construisent des prototypes, imaginent
des solutions, portent des projets d'une créativité et d'une pertinence
remarquables. Ce que ces jeunes n'ont pas encore, c'est une scène nationale.
C'est un moment où leur pays se retourne vers eux et leur dit:
nous vous voyons, nous vous reconnaissons, vous êtes l'avenir que nous
choisissons.
Le Camp National Citoyen de l'Excellence et de l'Innovation est cette scène. Ce
moment. Cette déclaration. Cette résolution.
En fixant son siège moral à Agadez, cité millénaire, carrefour des civilisations
sahariennes, Site du Patrimoine Mondial de l'UNESCO, le Camp envoie un signal
fort à la nation entière : l'excellence nigérienne n'est pas une aspiration. Elle est
une réalité historique à laquelle la génération d'aujourd'hui est appelée à renouer
avec fierté. Elle est l'actualité.
Nous vous invitons à rejoindre ce projet. Non pas comme donateurs, mais comme
bâtisseurs. Les partenaires fondateurs de cette première édition ne figureront pas
simplement sur une banderole. Ils seront inscrits, pour toujours, à la première
page de l'histoire d'un rendez-vous national annuel appelé à marquer
durablement le Niger et la jeunesse.
`,
        },
        {
            id: 2,
            titre: "Secrétaire Général",
            sousTitre: "Organisation pour la Promotion de l'Excellence (OPE)",
            nom: "Kader Assane Seydou",
            photo: kaderImg,
            couleur: "#0A7B8E",
            couleurLight: "#EBF7F9",
            exergue: `Ils demandent qu'on les écoute, qu'on les guide et qu'on leur donne une chance de montrer ce qu'ils valent.
Le Camp National Citoyen de l'Excellence et de l'Innovation est notre réponse.`,
            mot: `Certains engagements se décident dans une salle de réunion. D'autres se décident devant un jeune qui vous montre son projet, les yeux brillants, en s'excusant presque de ne pas avoir plus de moyens. Pour moi, tout a commencé là.

Depuis la création de l'OPE, j'ai rencontré des jeunes qui réparent, codent, cultivent, inventent et organisent, souvent seuls, avec ce qu'ils ont sous la main. Ils ne demandent pas des miracles. Ils demandent qu'on les écoute, qu'on les guide et qu'on leur donne une chance de montrer ce qu'ils valent.

Le Camp National Citoyen de l'Excellence et de l'Innovation est notre réponse. Il rassemble les jeunes de 12 à 35 ans, juniors et seniors, parce que le talent ne regarde pas l'âge. Chacun y trouve sa place : en STEAM, pour innover par la science, la technologie et les arts ; en Local Project, pour résoudre les problèmes de sa communauté avec les moyens de sa communauté ; en Modèle Communautaire Citoyen, pour faire de l'entraide et du civisme un mode de vie.

Le Niger est engagé dans sa refondation. Et une refondation, ce n'est pas seulement des textes et des institutions. C'est aussi une génération qui se lève, qui apprend, qui ose et qui se sent attendue. Si nous voulons un pays solide demain, c'est aujourd'hui que nous devons miser sur ceux qui le porteront.

Mon engagement personnel est simple : être aux côtés de ces jeunes, du premier jour jusqu'à la remise des projets, et faire en sorte que chaque idée sérieuse trouve une porte ouverte.

À vous, jeunes : inscrivez-vous, venez avec vos idées, même inachevées. Le camp est fait pour les faire grandir.

À vous, partenaires et soutiens : rejoignez-nous comme bâtisseurs de cette première édition. Votre appui permettra à des centaines de jeunes de passer de l'idée à l'action.

Le Niger n'a pas à chercher loin ses talents. Il suffit de leur ouvrir la porte.`,
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
                                            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-[800px]" : "max-h-0"}`}>
                                                <div className="space-y-3 pb-5">
                                                    {acteur.mot.split("\n\n").map((para, i) => (
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
