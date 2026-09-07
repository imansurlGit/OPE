import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import agadezDrone from "../assets/agadez_drone.jpeg";
import mosqueeImg from "../assets/Mosquée d'Agadez.png";
import aproposInspire from "../assets/apropos-inspire.jpg";
import talentFatimata from "../assets/talent-fatimata-oumarou.jpg";
import talentIbrahim from "../assets/talent-ibrahim-diallo.jpg";
import talentAmina from "../assets/talent-amina-sani.jpg";
import talentMoussa from "../assets/talent-moussa-ali.jpg";
import talentZara from "../assets/talent-zara-mamane.jpg";
import talentKader from "../assets/talent-kader-issoufou.jpg";
import talentHalima from "../assets/talent-halima-abdou.jpg";
import talentOusmane from "../assets/talent-ousmane-seydou.jpg";

type MediaCategory = "all" | "steam" | "local" | "citoyen" | "ambiance";

interface PuzzlePiece {
    id: string;
    image: string;
    categorie: "steam" | "local" | "citoyen" | "ambiance";
    spanClass: string;
    puzzleShape: string; // Forme découpée façon pièce de puzzle imbriquée
}

const PUZZLE_GALLERY: PuzzlePiece[] = [
    {
        id: "1",
        image: agadezDrone,
        categorie: "ambiance",
        spanClass: "col-span-2 row-span-2 min-h-[300px] sm:min-h-[420px]",
        puzzleShape: "rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg",
    },
    {
        id: "2",
        image: talentFatimata,
        categorie: "steam",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg",
    },
    {
        id: "3",
        image: talentAmina,
        categorie: "steam",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg",
    },
    {
        id: "4",
        image: aproposInspire,
        categorie: "citoyen",
        spanClass: "col-span-2 row-span-1 min-h-[200px]",
        puzzleShape: "rounded-bl-3xl rounded-tr-3xl rounded-tl-lg rounded-br-lg",
    },
    {
        id: "5",
        image: talentHalima,
        categorie: "steam",
        spanClass: "col-span-1 row-span-2 min-h-[300px] sm:min-h-[420px]",
        puzzleShape: "rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg",
    },
    {
        id: "6",
        image: mosqueeImg,
        categorie: "ambiance",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg",
    },
    {
        id: "7",
        image: talentZara,
        categorie: "local",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg",
    },
    {
        id: "8",
        image: talentIbrahim,
        categorie: "citoyen",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg",
    },
    {
        id: "9",
        image: talentMoussa,
        categorie: "steam",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-bl-3xl rounded-tr-3xl rounded-tl-lg rounded-br-lg",
    },
    {
        id: "10",
        image: talentKader,
        categorie: "citoyen",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg",
    },
    {
        id: "11",
        image: talentOusmane,
        categorie: "local",
        spanClass: "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]",
        puzzleShape: "rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg",
    },
];

export default function Galerie() {
    const { t } = useTranslation();
    const [activeCat, setActiveCat] = useState<MediaCategory>("all");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const categories: { key: MediaCategory; label: string }[] = [
        { key: "all", label: t("galerie.all") },
        { key: "steam", label: t("galerie.workshops") },
        { key: "local", label: t("galerie.local") },
        { key: "citoyen", label: t("galerie.community") },
        { key: "ambiance", label: t("galerie.ceremonies") },
    ];

    const filteredMedia = useMemo(() => {
        if (activeCat === "all") return PUZZLE_GALLERY;
        return PUZZLE_GALLERY.filter((item) => item.categorie === activeCat);
    }, [activeCat]);

    const currentIndex = selectedImage ? filteredMedia.findIndex((m) => m.image === selectedImage) : -1;

    const handlePrev = () => {
        if (currentIndex > 0) {
            setSelectedImage(filteredMedia[currentIndex - 1].image);
        } else {
            setSelectedImage(filteredMedia[filteredMedia.length - 1].image);
        }
    };

    const handleNext = () => {
        if (currentIndex < filteredMedia.length - 1) {
            setSelectedImage(filteredMedia[currentIndex + 1].image);
        } else {
            setSelectedImage(filteredMedia[0].image);
        }
    };

    return (
        <div className="pt-16 bg-[#FAF5EE] min-h-screen">
            {/* ── En-tête de la Galerie ──────────────────────────────── */}
            <section className="py-10 px-4 sm:px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    {/* Titre Principal */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-3 tracking-tight">
                        {t("galerie.title")}
                    </h1>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed max-w-xl mx-auto mb-6">
                        {t("galerie.subtitle")}
                    </p>

                    {/* Filtres Épurés */}
                    <div className="inline-flex items-center justify-center flex-wrap gap-2 p-1.5 rounded-full bg-white border border-[#E8DEC8] shadow-2xs">
                        {categories.map((cat) => {
                            const isActive = activeCat === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveCat(cat.key)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? "bg-[#BD5338] text-white shadow-xs"
                                            : "text-ope-text-muted hover:text-ope-text"
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Mosaïque Puzzle Connectée ──────────────────────────── */}
            <section className="px-4 sm:px-6 pb-24">
                <div className="max-w-6xl mx-auto relative p-3 sm:p-5 rounded-[2.5rem] bg-white border border-[#EADFD2] shadow-sm">
                    {/* Lignes de circuit / connecteurs de puzzle en arrière-plan */}
                    <div className="absolute inset-0 pointer-events-none opacity-25">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="puzzle-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C05621" strokeWidth="0.8" strokeDasharray="3,3" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#puzzle-grid)" />
                        </svg>
                    </div>

                    {/* Grille des pièces de puzzle imbriquées */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10">
                        {filteredMedia.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item.image)}
                                className={`group relative overflow-hidden cursor-pointer bg-slate-100 shadow-2xs hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 hover:z-20 ring-2 ring-transparent hover:ring-[#BD5338] ${item.spanClass} ${item.puzzleShape}`}
                            >
                                {/* Image pure sans aucun texte */}
                                <img
                                    src={item.image}
                                    alt="Moment OPE Agadez"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                />

                                {/* Lueur de connectivité au survol */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                {/* Connecteur visuel discret (Nœud de puzzle) */}
                                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-white/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-2 ring-[#BD5338]" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Lightbox Épurée (Sans texte parasite) ───────────────── */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Bouton Fermer */}
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer text-lg"
                        aria-label="Fermer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Flèche Précédent */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                        className="absolute left-3 sm:left-6 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Image précédente"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Image Agrandie */}
                    <div
                        className="max-w-5xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage}
                            alt="Vue agrandie"
                            className="max-h-[85vh] max-w-full object-contain"
                        />
                    </div>

                    {/* Flèche Suivant */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="absolute right-3 sm:right-6 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Image suivante"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
