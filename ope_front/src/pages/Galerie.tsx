import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { galerieService, type MediaGalerie } from "../services";

type MediaCategory = "all" | "steam" | "local" | "citoyen" | "ambiance";

const SHAPES = [
    "rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg",
    "rounded-tr-3xl rounded-bl-3xl rounded-tl-lg rounded-br-lg",
    "rounded-bl-3xl rounded-tr-3xl rounded-tl-lg rounded-br-lg",
    "rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg",
];

function getSpanClass(m: MediaGalerie, idx: number): string {
    if (m.mis_en_avant) return "col-span-2 row-span-2 min-h-[300px] sm:min-h-[420px]";
    if (idx % 5 === 0) return "col-span-2 row-span-1 min-h-[200px]";
    return "col-span-1 row-span-1 min-h-[190px] sm:min-h-[200px]";
}

export default function Galerie() {
    const { t } = useTranslation();
    const [activeCat, setActiveCat] = useState<MediaCategory>("all");
    const [selectedMedia, setSelectedMedia] = useState<MediaGalerie | null>(null);
    const [medias, setMedias] = useState<MediaGalerie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setHasError(false);

        galerieService
            .getMedias()
            .then((data) => {
                if (isMounted) {
                    const items = Array.isArray(data) ? data : (data as any)?.results || [];
                    setMedias(items);
                }
            })
            .catch(() => {
                if (isMounted) setHasError(true);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    const categories: { key: MediaCategory; label: string }[] = [
        { key: "all", label: t("galerie.all") },
        { key: "steam", label: t("galerie.workshops") },
        { key: "local", label: t("galerie.local") },
        { key: "citoyen", label: t("galerie.community") },
        { key: "ambiance", label: t("galerie.ceremonies") },
    ];

    const filteredMedias = useMemo(() => {
        if (activeCat === "all") return medias;
        return medias.filter((m) => m.categorie === activeCat);
    }, [activeCat, medias]);

    const currentIndex = selectedMedia
        ? filteredMedias.findIndex((m) => m.id === selectedMedia.id)
        : -1;

    const handlePrev = () => {
        if (currentIndex > 0) setSelectedMedia(filteredMedias[currentIndex - 1]);
        else setSelectedMedia(filteredMedias[filteredMedias.length - 1]);
    };

    const handleNext = () => {
        if (currentIndex < filteredMedias.length - 1) setSelectedMedia(filteredMedias[currentIndex + 1]);
        else setSelectedMedia(filteredMedias[0]);
    };

    return (
        <div className="pt-16 bg-[#FAF5EE] min-h-screen">
            {/* ── En-tête ──────────────────────────────────────────────── */}
            <section className="py-10 px-4 sm:px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-3 tracking-tight">
                        {t("galerie.title")}
                    </h1>
                    <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed max-w-xl mx-auto mb-6">
                        {t("galerie.subtitle")}
                    </p>

                    {/* Filtres */}
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

            {/* ── Contenu Principal ──────────────────────────────────── */}
            <section className="px-4 sm:px-6 pb-24">
                <div className="max-w-6xl mx-auto relative p-3 sm:p-5 rounded-[2.5rem] bg-white border border-[#EADFD2] shadow-sm">
                    {/* Motif de fond */}
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

                    {/* ── Chargement ── */}
                    {isLoading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10 animate-pulse">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`bg-slate-200 ${i === 0 ? "col-span-2 row-span-2 min-h-[300px]" : "col-span-1 row-span-1 min-h-[190px]"} rounded-2xl`}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Erreur réseau ── */}
                    {!isLoading && hasError && (
                        <div className="relative z-10 py-20 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-extrabold text-gray-800 text-base">Impossible de charger la galerie</h3>
                            <p className="text-xs text-gray-500 max-w-xs">
                                Une erreur de connexion s'est produite. Vérifiez votre connexion Internet et réessayez.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#BD5338] hover:bg-[#a0431f] transition-colors cursor-pointer"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {/* ── Galerie vide (API répond mais aucun média) ── */}
                    {!isLoading && !hasError && filteredMedias.length === 0 && (
                        <div className="relative z-10 py-20 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[#FDF3EE] flex items-center justify-center text-[#BD5338]">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-extrabold text-gray-800 text-base">
                                {activeCat === "all"
                                    ? "La galerie est encore vide"
                                    : "Aucune photo dans cette catégorie"}
                            </h3>
                            <p className="text-xs text-gray-500 max-w-xs">
                                {activeCat === "all"
                                    ? "Les photos et vidéos du camp seront ajoutées ici prochainement."
                                    : "Essayez une autre catégorie ou revenez plus tard."}
                            </p>
                            {activeCat !== "all" && (
                                <button
                                    onClick={() => setActiveCat("all")}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#BD5338] hover:bg-[#a0431f] transition-colors cursor-pointer"
                                >
                                    Voir toutes les photos
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Mosaïque ── */}
                    {!isLoading && !hasError && filteredMedias.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 relative z-10">
                            {filteredMedias.map((item, idx) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedMedia(item)}
                                    className={`group relative overflow-hidden cursor-pointer bg-slate-100 shadow-2xs hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 hover:z-20 ring-2 ring-transparent hover:ring-[#BD5338] ${getSpanClass(item, idx)} ${SHAPES[idx % SHAPES.length]}`}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.titre || "Photo OPE Agadez"}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-white/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-2 ring-[#BD5338]" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Lightbox ─────────────────────────────────────────────── */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
                    onClick={() => setSelectedMedia(null)}
                >
                    {/* Fermer */}
                    <button
                        onClick={() => setSelectedMedia(null)}
                        className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Fermer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Précédent */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-3 sm:left-6 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Image précédente"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Image */}
                    <div
                        className="max-w-5xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedMedia.image}
                            alt={selectedMedia.titre || "Vue agrandie"}
                            className="max-h-[85vh] max-w-full object-contain"
                        />
                    </div>

                    {/* Titre si disponible */}
                    {selectedMedia.titre && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-xs text-white text-xs font-semibold">
                            {selectedMedia.titre}
                        </div>
                    )}

                    {/* Suivant */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
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
