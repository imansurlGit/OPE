import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { talentService, type Candidature } from "../services";

interface DisplayTalent {
  id: string;
  reference: string;
  nom: string;
  region: string;
  ville?: string;
  categorie: "STEAM" | "LP" | "MCC";
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D2A26] via-[#201D1A] to-[#151312] text-[#E5DEC9]">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/80 shadow-md mb-2 backdrop-blur-xs">
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
          <span className="text-xs font-semibold text-white/60 tracking-wider">
            Photo d'identité non renseignée
          </span>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF5EE] via-[#F4EDE2] to-[#E9DFCF] text-gray-400 group-hover:from-[#F6EFE4] group-hover:to-[#E4D7C2] transition-colors duration-300">
        <div className="w-16 h-16 rounded-full bg-white/90 border border-[#E5DEC9] flex items-center justify-center text-[#B85028]/70 shadow-2xs group-hover:scale-105 transition-transform duration-300">
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
        <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">
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

const CATEGORIES = ["Toutes les catégories", "STEAM", "LP", "MCC"];

const BADGE_STYLES: Record<
  "STEAM" | "LP" | "MCC",
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
  MCC: {
    label: "House MCC",
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
    categorie: (c.domaine as "STEAM" | "LP" | "MCC") || "STEAM",
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
      <section className="py-8 sm:py-12 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-ope-text leading-tight mb-4 tracking-tight">
            {t("talents.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
            {t("talents.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Barre de Filtres & Recherche ─────────────────────────── */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Sélecteurs de Filtres */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Filtre Régions */}
            <div className="relative w-full sm:w-56">
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setDisplayCount(8);
                }}
                className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-ope-primary cursor-pointer pr-10 shadow-2xs transition-colors"
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
                className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-ope-primary cursor-pointer pr-10 shadow-2xs transition-colors"
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

          {/* Champ de Recherche */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(8);
              }}
              placeholder={t("talents.search_placeholder")}
              className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-ope-primary shadow-2xs placeholder:text-ope-text-muted transition-colors"
            />
            <svg
              className="w-4 h-4 text-ope-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ── État d'erreur éventuel ────────────────────────────────── */}
      {error && (
        <section className="px-4 sm:px-6 pb-8">
          <div className="max-w-2xl mx-auto bg-white border border-rose-200 rounded-2xl p-6 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-gray-900 text-sm mb-1">
              Erreur de chargement
            </h3>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => setRetryTrigger((r) => r + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B85028] text-white text-xs font-bold hover:bg-[#a0431f] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Réessayer</span>
            </button>
          </div>
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
                  className="bg-white rounded-2xl overflow-hidden border border-[#E8DEC8] h-[420px] flex flex-col animate-pulse"
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
              <div className="w-12 h-12 rounded-full bg-orange-50 text-ope-primary flex items-center justify-center mx-auto mb-3">
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
                        <div className="text-[11px] font-bold text-[#B85028] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-[#B85028] hover:bg-[#a0431f] active:scale-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
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
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-ope-text-muted hover:text-ope-primary bg-[#FAF5EE] border border-[#E8DEC8] hover:border-ope-primary/40 transition-all cursor-pointer"
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
                  <div className="bg-[#FAF5EE] rounded-xl p-3.5 border border-[#E8DEC8]">
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
              <div className="p-4 border-t border-ope-border bg-[#FAF7F2] flex items-center justify-end shrink-0">
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
