import inspireImg from "../assets/apropos-inspire.jpg";
import coverImg from "../assets/apropos-inspire.jpg";

export default function APropos() {
    const SECTIONS_THEMATIQUES = [
        {
            icon: (
                <svg className="w-5 h-5 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14v7" />
                </svg>
            ),
            titre: "Éducation de pointe",
            sousTitre: "Apprendre autrement, pour mieux bâtir.",
            desc: "Ici, on apprend par l'action. Formations techniques, scientifiques et citoyennes, conférences, mentorat par des experts : accès à des programmes de formation intensifs, conçus pour répondre aux défis technologiques actuels et futurs.",
            span: "md:col-span-1",
        },
        {
            icon: (
                <svg className="w-5 h-5 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            titre: "Hub de technologie & d'innovation",
            sousTitre: "Quand la jeunesse invente l'avenir du Niger.",
            desc: "Intelligence artificielle, robotique, biotechnologie, art et mathématiques : les ateliers STEAM placent les jeunes au cœur de la création. Concours de pitch, expositions de projets locaux et solutions pensées pour les réalités du pays font d'Agadez un laboratoire d'idées à ciel ouvert.\n\nNous catalysons la création de startups et d'initiatives à fort impact social et économique.",
            span: "md:col-span-2",
        },
        {
            icon: (
                <svg className="w-5 h-5 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            titre: "Impact social & environnemental",
            sousTitre: "Un camp qui laisse des traces durables.",
            desc: "Plantation d'arbres, réhabilitation de salles de classe, consultations foraines, campagne « Back to School », « 7 Km de la paix », dons de kits solaires : les délégués passent de la parole aux actes.",
            span: "md:col-span-1",
        },
        {
            icon: (
                <svg className="w-5 h-5 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            titre: "Tourisme & culture",
            sousTitre: "Agadez, mémoire vivante du Sahel.",
            desc: "Cité de l'Aïr inscrite au patrimoine mondial de l'UNESCO, Agadez offre un cadre unique : visites guidées, valorisation des savoir-faire locaux et appui aux femmes et jeunes filles de la région.",
            span: "md:col-span-1",
        },
        {
            icon: (
                <svg className="w-5 h-5 text-ope-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            titre: "Réseautage & Leadership",
            sousTitre: "Des rencontres qui ouvrent des horizons.",
            desc: "Connecter les jeunes talents avec des mentors expérimentés pour forger des collaborations durables. Le camp réunit délégués régionaux, experts, entrepreneurs et partenaires.",
            span: "md:col-span-1",
        },
    ];


    return (
        <div className="pt-16 bg-ope-bg text-ope-text min-h-screen font-sans selection:bg-ope-orange selection:text-white">
            
            {/* ── HERO BANNER IMMERSIF (PLEINE LARGEUR) ────────────────── */}
            <section className="relative w-full h-[190px] sm:h-[250px] md:h-[290px] overflow-hidden shadow-sm border-b border-ope-border">
                <img
                    src={coverImg || inspireImg}
                    alt="Camp CNCEIZ Agadez"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                {/* Titre en incrustation */}
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <p className="text-ope-orange text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
                            Camp National Citoyen
                        </p>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                            L'Excellence & L'Innovation.
                        </h1>
                    </div>
                </div>
            </section>

            {/* ── INTRODUCTION ÉDITORIALE ─────────────────────────────── */}
            <section id="vision" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
                <div className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-ope-text leading-snug max-w-4xl">
                        Au cœur du massif de l'Aïr, Agadez réinvente le pôle d'excellence du Niger.
                    </h2>

                    <div className="prose prose-neutral text-ope-text-muted text-sm sm:text-base leading-relaxed space-y-4 max-w-4xl">
                        <p className="text-base sm:text-lg text-ope-text font-medium leading-relaxed border-l-2 border-ope-orange pl-4 italic">
                            Centre historique inscrit au patrimoine mondial de l'UNESCO, Agadez veille depuis des siècles sur les routes du savoir. C'est ici que l'OPE réunit la jeunesse pour le Camp National Citoyen de l'Excellence et de l'Innovation (CNCEIZ).
                        </p>
                        <p>
                            Héritier de la brillante participation du Niger au Camp Mondial du UNESCO Center for Peace en 2024 à Hood College, le camp poursuit une ambition claire : former une jeunesse compétente, engagée et fière.
                        </p>
                        <p>
                            Le parcours débute en novembre 2026 avec des Pré-Camps dans les huit régions et à Timia pour former 1 500 jeunes. En décembre, 1 000 délégués se retrouveront à Agadez pour sept jours de création intensive.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── RETOUR SUR EXCELLENCE (HOOD COLLEGE 2024 - REDESIGN) ── */}
            <section id="hood-college" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-ope-border shadow-xs">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        
                        {/* Texte & Titre */}
                        <div className="lg:col-span-7 space-y-4">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-ope-text tracking-tight leading-snug">
                                L'étincelle de Hood College <span className="text-ope-orange">(USA, 2024)</span>
                            </h2>

                            <p className="text-sm sm:text-base text-ope-text-muted leading-relaxed">
                                Été 2024. Huit jeunes ambassadeurs Nigériens portent haut les couleurs de la nation au Camp Mondial du UNESCO Center for Peace à Hood College. 
                            </p>

                            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
                                Victoires éclatantes à l'IMUN (Union Africaine), 1er Prix STEAM emmené par la Miss Mathématique Mariam, et 2 Awards prestigieux saluant l'engagement de l'OPE : cette flamme d'excellence revient aujourd'hui irriguer le territoire national, au pied de l'Aïr.
                            </p>
                        </div>

                        {/* Grille de Chiffres / Palmarès */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                            <div className="bg-ope-bg p-4 rounded-2xl border border-ope-border text-center">
                                <span className="block text-2xl font-black text-ope-primary">1er Prix</span>
                                <span className="text-xs font-bold text-ope-text mt-0.5 block">STEAM</span>
                                <span className="text-[10px] text-ope-text-muted">Projet de groupe</span>
                            </div>

                            <div className="bg-ope-bg p-4 rounded-2xl border border-ope-border text-center">
                                <span className="block text-2xl font-black text-[#3b7c35]">2 Awards</span>
                                <span className="text-xs font-bold text-ope-text mt-0.5 block">UNESCO</span>
                                <span className="text-[10px] text-ope-text-muted">Center for Peace</span>
                            </div>

                            <div className="bg-ope-bg p-4 rounded-2xl border border-ope-border text-center">
                                <span className="block text-2xl font-black text-ope-orange">Top 3</span>
                                <span className="text-xs font-bold text-ope-text mt-0.5 block">IMUN UA</span>
                                <span className="text-[10px] text-ope-text-muted">Modèle ONU</span>
                            </div>

                            <div className="bg-ope-bg p-4 rounded-2xl border border-ope-border text-center">
                                <span className="block text-2xl font-black text-ope-text">8</span>
                                <span className="text-xs font-bold text-ope-text mt-0.5 block">Délégués</span>
                                <span className="text-[10px] text-ope-text-muted">USA 2024</span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── LES PILIERS DU PROGRAMME (BENTO GRID) ──────────────── */}
            <section id="valeurs" className="py-6 md:py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
                        <div>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-ope-text tracking-tight mt-1">
                                Les piliers du programme
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-ope-text-muted max-w-md">
                            Une structure pensée pour déclencher des vocations et apporter des solutions concrètes au Sahel.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {SECTIONS_THEMATIQUES.map((sec, idx) => (
                            <div
                                key={idx}
                                className={`bg-white rounded-3xl p-6 border border-ope-border hover:border-ope-orange/50 transition-all duration-300 flex flex-col justify-between group ${sec.span}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-ope-bg border border-ope-border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                                            {sec.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-ope-text mb-1">
                                        {sec.titre}
                                    </h3>
                                    <h4 className="text-xs font-semibold text-ope-orange mb-3">
                                        {sec.sousTitre}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed whitespace-pre-line">
                                        {sec.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}