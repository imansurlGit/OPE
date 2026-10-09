import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  talentService,
  documentService,
  type Candidature,
  type DocumentItem,
} from "../services";
import ApiErrorState from "../components/ApiErrorState";

const resolveFileUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://127.0.0.1:7777${url.startsWith("/") ? "" : "/"}${url}`;
};

interface DisplayTalent {
  id: string;
  reference: string;
  nom: string;
  region: string;
  ville?: string;
  categorie: "STEAM" | "LP" | "MC2";
  house?: string;
  statut_projet?: string;
  description: string;
  descriptionComplete: string;
  motivation?: string;
  photo: string | null;
  tags?: string[];
  etablissement?: string;
}

// ── Composant Avatar avec Empty State Icône User ──
function TalentAvatar({
  photo,
  name,
  size = "card",
}: {
  photo?: string | null;
  name: string;
  size?: "card" | "modal";
}) {
  const [imgError, setImgError] = useState(false);

  if (!photo || imgError) {
    if (size === "modal") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ope-primary via-[#245070] to-[#1b3a4f] text-white">
          <div className="w-20 h-20 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-md mb-2 backdrop-blur-xs">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white/80 tracking-wider">
            Photo d'identité non renseignée
          </span>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#edf4f9] via-[#e5f0f7] to-[#d6e8f4] text-ope-primary/60 group-hover:from-[#e4eff6] group-hover:to-[#cee2ef] transition-colors duration-300">
        <div className="w-16 h-16 rounded-full bg-white/95 border border-ope-border flex items-center justify-center text-ope-primary shadow-2xs group-hover:scale-105 transition-transform duration-300">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <span className="text-[10px] font-bold text-ope-text-muted mt-2 uppercase tracking-wider">
          Sans photo
        </span>
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={name}
      onError={() => setImgError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

const REGIONS = [
  "Toutes les régions",
  "Agadez",
  "Diffa",
  "Dosso",
  "Maradi",
  "Niamey",
  "Tahoua",
  "Tillabéri",
  "Zinder",
];

const CATEGORIES = ["Toutes les catégories", "STEAM", "LP", "MC2"];

const BADGE_STYLES: Record<
  "STEAM" | "LP" | "MC2",
  { label: string; bg: string; text: string; border: string }
> = {
  STEAM: {
    label: "STEAM",
    bg: "bg-[#0092B3] text-white",
    text: "text-[#0092B3]",
    border: "border-[#0092B3]",
  },
  LP: {
    label: "House LP",
    bg: "bg-[#BD5338] text-white",
    text: "text-[#BD5338]",
    border: "border-[#BD5338]",
  },
  MC2: {
    label: "House MC2",
    bg: "bg-[#8C4A27] text-white",
    text: "text-[#8C4A27]",
    border: "border-[#8C4A27]",
  },
};

function mapCandidatureToTalent(c: Candidature): DisplayTalent {
  const photoUrl =
    c.photo_identite && c.photo_identite.trim() !== ""
      ? c.photo_identite
      : null;

  const prenom = c.prenom || "";
  const nom = c.nom || "";
  const fullName = `${prenom} ${nom}`.trim() || `Talent ${c.reference || c.id}`;

  const desc =
    c.description_projet ||
    c.motivation ||
    c.biographie ||
    "Candidat sélectionné pour l'Opération 1000 Talents au Camp National Citoyen d'Agadez.";

  const fullDesc =
    c.description_projet ||
    c.biographie ||
    c.motivation ||
    "Dossier de candidature retenu au sein du camp.";

  const tags: string[] = [];
  if (c.house_visee) tags.push(c.house_visee);
  if (c.statut_projet) tags.push(c.statut_projet);
  if (c.domaine && !tags.includes(c.domaine)) tags.push(c.domaine);

  return {
    id: String(c.id),
    reference: c.reference || `CNCEIZ-${c.id}`,
    nom: fullName,
    region: c.region || "Non renseignée",
    ville: c.ville_village,
    categorie: (c.domaine as "STEAM" | "LP" | "MC2") || "STEAM",
    house: c.house_visee,
    statut_projet: c.statut_projet,
    description: desc,
    descriptionComplete: fullDesc,
    motivation: c.motivation,
    photo: photoUrl,
    tags: tags.length > 0 ? tags : [c.domaine || "STEAM"],
    etablissement: c.etablissement,
  };
}

// Mélange aléatoire (Fisher-Yates) pour sélectionner les talents au hasard
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Talents() {
  const { t } = useTranslation();
  const [talents, setTalents] = useState<DisplayTalent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [selectedRegion, setSelectedRegion] = useState("Toutes les régions");
  const [selectedCategory, setSelectedCategory] = useState("Toutes les catégories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalent, setSelectedTalent] = useState<DisplayTalent | null>(null);
  const [displayCount, setDisplayCount] = useState(8);

  // Gestion du menu déroulant des livrets
  const [isBookletsOpen, setIsBookletsOpen] = useState(false);
  const [booklets, setBooklets] = useState<DocumentItem[]>([]);
  const [isLoadingBooklets, setIsLoadingBooklets] = useState(false);
  const [downloadingBookletId, setDownloadingBookletId] = useState<number | string | null>(null);
  const bookletsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bookletsRef.current && !bookletsRef.current.contains(event.target as Node)) {
        setIsBookletsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsBookletsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Chargement des livrets depuis la table Document de la base de données
  useEffect(() => {
    let isMounted = true;
    setIsLoadingBooklets(true);
    documentService
      .getDocuments({ type: "talent" })
      .then((data) => {
        if (!isMounted) return;
        const list: DocumentItem[] = Array.isArray(data)
          ? data
          : (data as any)?.results || [];
        if (list.length === 0) {
          // Si aucun livret avec type="talent", récupérer tous les documents au cas où
          documentService.getDocuments().then((all) => {
            if (!isMounted) return;
            const allList: DocumentItem[] = Array.isArray(all) ? all : (all as any)?.results || [];
            const talentDocs = allList.filter((d) => d.type === "talent");
            setBooklets(talentDocs.length > 0 ? talentDocs : allList);
          }).catch(() => setBooklets([]));
        } else {
          setBooklets(list);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Erreur lors du chargement des livrets depuis la DB :", err);
        setBooklets([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBooklets(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Répartition des livrets entre édition en cours et années précédentes
  const { currentBooklets, pastBooklets } = useMemo(() => {
    if (booklets.length === 0) return { currentBooklets: [], pastBooklets: [] };
    const sorted = [...booklets].sort((a, b) => b.annee - a.annee);
    const maxYear = sorted[0].annee;
    return {
      currentBooklets: sorted.filter((b) => b.annee >= maxYear),
      pastBooklets: sorted.filter((b) => b.annee < maxYear),
    };
  }, [booklets]);

  const handleDownloadBooklet = (booklet: DocumentItem) => {
    if (!booklet.fichier) return;
    setDownloadingBookletId(booklet.id);
    const fileUrl = resolveFileUrl(booklet.fichier);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = booklet.titre ? `${booklet.titre}.pdf` : `Livret-Talents-${booklet.annee}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setDownloadingBookletId(null);
    }, 1200);
  };

  // Charger les vrais talents depuis le backend API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    talentService
      .getTalents()
      .then((data) => {
        if (!isMounted) return;
        const rawItems: Candidature[] = Array.isArray(data)
          ? data
          : (data as any)?.results || [];

        // On affiche en priorité les talents admis, ou tous les dossiers disponibles
        const admitted = rawItems.filter((c) => c.statut === "admis");
        const list = admitted.length > 0 ? admitted : rawItems;

        const mapped = list.map((c) => mapCandidatureToTalent(c));
        setTalents(shuffleArray(mapped));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Erreur lors du chargement des talents :", err);
        setError("Impossible de contacter le serveur. Veuillez vérifier votre connexion.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  // Filtrage dynamique en temps réel
  const filteredTalents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return talents.filter((talent) => {
      const matchesRegion =
        selectedRegion === "Toutes les régions" ||
        talent.region.toLowerCase() === selectedRegion.toLowerCase();
      const matchesCategory =
        selectedCategory === "Toutes les catégories" ||
        talent.categorie === selectedCategory;
      const matchesSearch =
        q === "" ||
        talent.nom.toLowerCase().includes(q) ||
        talent.region.toLowerCase().includes(q) ||
        (talent.ville && talent.ville.toLowerCase().includes(q)) ||
        (talent.house && talent.house.toLowerCase().includes(q)) ||
        talent.reference.toLowerCase().includes(q) ||
        talent.description.toLowerCase().includes(q);

      return matchesRegion && matchesCategory && matchesSearch;
    });
  }, [talents, selectedRegion, selectedCategory, searchQuery]);

  const visibleTalents = filteredTalents.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 8);
  };

  return (
    <div className="pt-16 bg-ope-bg min-h-screen">
      {/* ── Section En-Tête ──────────────────────────────────────── */}
      <section className="pt-6 pb-8 sm:pt-10 sm:pb-12 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 tracking-tight animate-bounce bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right, #e40303, #ff8c00, #ffed00, #008026, #004dff, #732982)",
            }}
          >
            {t("talents.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
            {t("talents.subtitle")}
          </p>
        </div>

        {/* Bouton Livrets — pleine largeur, collé à la marge droite de la page */}
        <div className="flex justify-end mt-4">
          <button
            id="btn-livrets-talents"
            type="button"
            onClick={() => setIsBookletsOpen(true)}
            className="inline-flex items-center gap-2 text-white text-xs font-semibold rounded-full px-4 py-2 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{ background: "#F15B29" }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t("talents.download_booklets", "Livrets des Talents")}</span>
          </button>
        </div>
      </section>

      {/* ── Modale Livrets ───────────────────────────────────────── */}
      {isBookletsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setIsBookletsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-ope-border w-full max-w-sm sm:max-w-md p-4 text-left max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modale */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-sm font-bold text-ope-text">
                {t("talents.booklets_dropdown_title", "Livrets des Talents OPE")}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-ope-text-muted font-medium">Format PDF</span>
                <button
                  type="button"
                  onClick={() => setIsBookletsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {isLoadingBooklets ? (
                <div className="py-8 text-center text-xs text-ope-text-muted flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-ope-orange" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Chargement des livrets...</span>
                </div>
              ) : booklets.length === 0 ? (
                <div className="py-8 text-center text-xs text-ope-text-muted">
                  Aucun livret disponible pour le moment.
                </div>
              ) : (
                <>
                  {/* 1. Édition en cours */}
                  {currentBooklets.length > 0 && (
                    <>
                      <div className="text-[10px] font-bold text-ope-text-muted uppercase tracking-wider px-1 pt-1 pb-0.5">
                        Édition en cours
                      </div>
                      {currentBooklets.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => handleDownloadBooklet(b)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f4f8fb] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-[#e8f3f9] text-ope-primary flex flex-col items-center justify-center shrink-0 group-hover:bg-ope-primary group-hover:text-white transition-colors">
                              <span className="text-[8px] font-black leading-none">PDF</span>
                              <span className="text-[9px] font-bold leading-none mt-0.5">{b.annee}</span>
                            </div>
                            <span className="text-xs font-bold text-ope-text group-hover:text-ope-primary transition-colors truncate">
                              {b.titre}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={downloadingBookletId === b.id}
                            className="shrink-0 p-1.5 rounded-lg text-slate-400 group-hover:text-ope-orange group-hover:bg-white transition-all shadow-2xs"
                            title={`Télécharger le livret ${b.annee}`}
                          >
                            {downloadingBookletId === b.id ? (
                              <svg className="w-4 h-4 animate-spin text-ope-orange" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            )}
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {/* 2. Années précédentes */}
                  {pastBooklets.length > 0 && (
                    <>
                      <div className="text-[10px] font-bold text-ope-text-muted uppercase tracking-wider px-1 pt-2 pb-0.5 border-t border-slate-100 mt-1">
                        Années précédentes
                      </div>
                      {pastBooklets.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => handleDownloadBooklet(b)}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f4f8fb] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-[#e8f3f9] text-ope-primary flex flex-col items-center justify-center shrink-0 group-hover:bg-ope-primary group-hover:text-white transition-colors">
                              <span className="text-[8px] font-black leading-none">PDF</span>
                              <span className="text-[9px] font-bold leading-none mt-0.5">{b.annee}</span>
                            </div>
                            <span className="text-xs font-bold text-ope-text group-hover:text-ope-primary transition-colors truncate">
                              {b.titre}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={downloadingBookletId === b.id}
                            className="shrink-0 p-1.5 rounded-lg text-slate-400 group-hover:text-ope-orange group-hover:bg-white transition-all shadow-2xs"
                            title={`Télécharger le livret ${b.annee}`}
                          >
                            {downloadingBookletId === b.id ? (
                              <svg className="w-4 h-4 animate-spin text-ope-orange" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            )}
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Barre de Filtres & Recherche & Livrets ────────────────── */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          {/* Sélecteurs de Filtres (Régions, Catégories) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Filtre Régions */}
            <div className="relative w-full sm:w-56">
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setDisplayCount(8);
                }}
                className="w-full bg-white border border-ope-border text-ope-text text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-ope-primary cursor-pointer pr-10 shadow-2xs transition-colors"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <svg
                className="w-4 h-4 text-ope-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Filtre Catégories */}
            <div className="relative w-full sm:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setDisplayCount(8);
                }}
                className="w-full bg-white border border-ope-border text-ope-text text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-ope-primary cursor-pointer pr-10 shadow-2xs transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "Toutes les catégories"
                      ? t("talents.all_domains")
                      : c}
                  </option>
                ))}
              </select>
              <svg
                className="w-4 h-4 text-ope-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Champ de Recherche uniquement */}
          <div className="relative w-full sm:w-64 md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(8);
              }}
              placeholder={t("talents.search_placeholder")}
              className="w-full bg-white border border-ope-border text-ope-text text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-ope-primary shadow-2xs placeholder:text-ope-text-muted transition-colors"
            />
            <svg
              className="w-4 h-4 text-ope-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── État d'erreur éventuel ────────────────────────────────── */}
      {error && (
        <section className="px-4 sm:px-6 pb-8">
          <ApiErrorState
            title="Impossible de charger les talents"
            message={error}
            onRetry={() => setRetryTrigger((r) => r + 1)}
          />
        </section>
      )}

      {/* ── Grille des Talents ───────────────────────────────────── */}
      <section id="talents-grid" className="px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Skeleton Loaders */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden border border-ope-border h-[420px] flex flex-col animate-pulse"
                >
                  <div className="h-1/2 w-full bg-slate-200" />
                  <div className="h-1/2 p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    <div className="h-10 bg-slate-100 rounded-md w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Aucun résultat */}
          {!isLoading && !error && visibleTalents.length === 0 && (
            <div className="text-center py-16 bg-ope-white rounded-3xl border border-ope-border">
              <div className="w-12 h-12 rounded-full bg-[#edf4f9] text-ope-primary flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-ope-text-muted">
                {t("talents.no_results")}
              </p>
            </div>
          )}

          {/* Grille avec vraies données */}
          {!isLoading && !error && visibleTalents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleTalents.map((talent) => {
                const badge = BADGE_STYLES[talent.categorie] || BADGE_STYLES.STEAM;
                return (
                  <div
                    key={talent.id}
                    onClick={() => setSelectedTalent(talent)}
                    className="bg-ope-white rounded-2xl overflow-hidden border border-ope-border shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1 h-[420px]"
                  >
                    {/* Photo : 50% en hauteur quoi qu'il arrive */}
                    <div className="relative h-1/2 w-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      <TalentAvatar
                        photo={talent.photo}
                        name={talent.nom}
                        size="card"
                      />
                      {/* Badge Catégorie */}
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Informations : 50% en hauteur */}
                    <div className="h-1/2 p-5 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-ope-text mb-1 tracking-tight group-hover:text-ope-orange transition-colors truncate">
                          {talent.nom}
                        </h3>

                        {/* Région & Ville avec Pin */}
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-ope-text-muted mb-2">
                          <svg
                            className="w-3.5 h-3.5 text-ope-orange shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="truncate">
                            {talent.ville ? `${talent.ville}, ${talent.region}` : talent.region}
                          </span>
                        </div>

                        {/* Description courte */}
                        <p className="text-xs text-ope-text-muted leading-relaxed line-clamp-3">
                          {talent.description}
                        </p>
                      </div>

                      {/* Footer de la carte */}
                      <div className="pt-2 border-t border-gray-100/80">
                        <div className="text-[11px] font-bold text-[#f15b29] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>{t("talents.view_profile")}</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Extende / Voir plus ─────────────────────────────────── */}
          {!isLoading && !error && filteredTalents.length > 8 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
              {displayCount < filteredTalents.length && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-[#f15b29] hover:bg-[#d44d1f] active:scale-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>{t("talents.view_more", "Voir plus")}</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}

              {displayCount > 8 && (
                <button
                  type="button"
                  onClick={() => {
                    setDisplayCount(8);
                    document
                      .getElementById("talents-grid")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-ope-text-muted hover:text-ope-primary bg-white border border-ope-border hover:border-ope-primary/40 transition-all cursor-pointer"
                >
                  <span>{t("talents.view_less", "Voir moins")}</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Modal Détails du Talent ──────────────────────────────── */}
      {selectedTalent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ope-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-ope-border animate-fadeIn relative h-[85vh] max-h-[700px] flex flex-col">
            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={() => setSelectedTalent(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
              aria-label={t("talents.close")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Photo d'en-tête du Modal : 50% en hauteur quoi qu'il arrive */}
            <div className="relative h-1/2 w-full shrink-0 bg-slate-900 overflow-hidden flex items-center justify-center">
              <TalentAvatar
                photo={selectedTalent.photo}
                name={selectedTalent.nom}
                size="modal"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              <span
                className={`absolute bottom-3 left-4 text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-md z-10 ${
                  (BADGE_STYLES[selectedTalent.categorie] || BADGE_STYLES.STEAM).bg
                }`}
              >
                {(BADGE_STYLES[selectedTalent.categorie] || BADGE_STYLES.STEAM).label}
              </span>
            </div>

            {/* Corps défilable du Modal : 50% en hauteur */}
            <div className="h-1/2 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-ope-text mb-1 tracking-tight">
                    {selectedTalent.nom}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ope-text-muted">
                    <div className="flex items-center gap-1 text-ope-orange">
                      <svg
                        className="w-4 h-4 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {selectedTalent.ville
                          ? `${selectedTalent.ville}, Région de ${selectedTalent.region}`
                          : `Région de ${selectedTalent.region}`}
                      </span>
                    </div>

                    {selectedTalent.etablissement && (
                      <>
                        <span>•</span>
                        <span>{selectedTalent.etablissement}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* House visée */}
                {selectedTalent.house && (
                  <div className="bg-ope-bg rounded-xl p-3.5 border border-ope-border">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-gray-500 block mb-0.5">
                      Filière d'Excellence / Spécialisation
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-gray-900">
                      {selectedTalent.house}
                    </p>
                  </div>
                )}

                {/* Description complète du projet */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1.5">
                    Projet & Réalisations
                  </h4>
                  <p className="text-xs sm:text-sm text-ope-text leading-relaxed whitespace-pre-line bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs">
                    {selectedTalent.descriptionComplete}
                  </p>
                </div>

                {/* Tags */}
                {selectedTalent.tags && selectedTalent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedTalent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-ope-bg text-ope-text border border-ope-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pied de modal */}
              <div className="p-4 border-t border-ope-border bg-white flex items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedTalent(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ope-primary hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  {t("talents.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
