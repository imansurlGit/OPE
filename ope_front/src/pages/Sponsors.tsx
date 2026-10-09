import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  partenaireService,
  type Partenaire,
  type PartenaireType,
  type PartenaireCategorie,
} from "../services";
import ApiErrorState from "../components/ApiErrorState";

/* =========================================================================
   Configuration Visuelle & Métadonnées des Paliers
   ========================================================================= */

interface CategorieConfig {
  id: PartenaireCategorie;
  label: string;
  accent: string;
  softAccent: string;
  borderAccent: string;
  logoHeight: string;
  gridClass: string;
}

const CATEGORIES_CONFIG: Record<PartenaireCategorie, CategorieConfig> = {
  platine: {
    id: "platine",
    label: "Platine",
    accent: "#3A6073",
    softAccent: "rgba(58, 96, 115, 0.08)",
    borderAccent: "rgba(58, 96, 115, 0.35)",
    logoHeight: "h-28 sm:h-32",
    gridClass: "grid-cols-1 md:grid-cols-2",
  },
  or: {
    id: "or",
    label: "Or",
    accent: "#C18A2B",
    softAccent: "rgba(193, 138, 43, 0.08)",
    borderAccent: "rgba(193, 138, 43, 0.35)",
    logoHeight: "h-24 sm:h-28",
    gridClass: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  },
  argent: {
    id: "argent",
    label: "Argent",
    accent: "#6B7C8E",
    softAccent: "rgba(107, 124, 142, 0.08)",
    borderAccent: "rgba(107, 124, 142, 0.30)",
    logoHeight: "h-20 sm:h-24",
    gridClass: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  },
  bronze: {
    id: "bronze",
    label: "Bronze",
    accent: "#B96C45",
    softAccent: "rgba(185, 108, 69, 0.08)",
    borderAccent: "rgba(185, 108, 69, 0.28)",
    logoHeight: "h-16 sm:h-20",
    gridClass: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  },
};

const CATEGORIE_ORDER: PartenaireCategorie[] = [
  "platine",
  "or",
  "argent",
  "bronze",
];

const TYPE_CONFIG: Record<
  PartenaireType,
  { label: string; className: string; iconSvg: string }
> = {
  pays: {
    label: "Pays",
    className: "bg-sky-50 text-[#193549] border-sky-200",
    iconSvg:
      "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  institution: {
    label: "Institution",
    className: "bg-[#FDF3EE] text-[#f15b29] border-[#F0C5AE]",
    iconSvg:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  ong: {
    label: "ONG",
    className: "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]",
    iconSvg:
      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  ambassade: {
    label: "Ambassade",
    className: "bg-[#FEF6E9] text-[#9A6700] border-[#FCE1B4]",
    iconSvg:
      "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
  },
};

const MONOGRAM_GRADIENTS: Record<PartenaireCategorie, string> = {
  platine: "from-[#3A6073] to-[#1E3A52]",
  or: "from-[#C18A2B] to-[#8C5D15]",
  argent: "from-[#6B7C8E] to-[#42505E]",
  bronze: "from-[#B96C45] to-[#7A3F22]",
};

/* =========================================================================
   Composants d'Icônes SVG Dédiés (Zéro emoji, Design Pro & Épuré)
   ========================================================================= */

function TierIcon({
  tier,
  className = "w-4 h-4",
}: {
  tier: PartenaireCategorie;
  className?: string;
}) {
  switch (tier) {
    case "platine":
      // Couronne d'excellence & prestige suprême
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
          <path d="M5 19h14" />
        </svg>
      );
    case "or":
      // Étoile / Trophée d'accomplissement majeur
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "argent":
      // Bouclier officiel de partenariat technique et opérationnel
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "bronze":
      // Boussole / Ancre de terrain & d'engagement solidaire
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
  }
}

function getInitials(nom: string): string {
  return nom
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

/* =========================================================================
   Carte Partenaire Individuelle (Aspirationnelle, Aérée et Valorisé)
   ========================================================================= */

function PartnerCard({ p }: { p: Partenaire }) {
  const category = (p.categorie || "bronze") as PartenaireCategorie;
  const config = CATEGORIES_CONFIG[category] ?? CATEGORIES_CONFIG.bronze;
  const typeConfig = TYPE_CONFIG[p.type] ?? TYPE_CONFIG.institution;
  const isPlatine = category === "platine";
  const isOr = category === "or";

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 ${
        isPlatine
          ? "p-6 shadow-md hover:shadow-xl hover:border-[#3A6073]"
          : isOr
            ? "p-5 shadow-sm hover:shadow-lg hover:border-[#C18A2B]"
            : "p-4 shadow-2xs hover:shadow-md"
      }`}
      style={{ borderColor: config.borderAccent }}
    >
      {/* Liseré supérieur subtil du palier */}
      <div
        className="absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5"
        style={{ backgroundColor: config.accent }}
        aria-hidden="true"
      />

      {/* En-tête de la carte : Badges de palier et de type */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
            style={{ backgroundColor: config.softAccent, color: config.accent }}
          >
            <TierIcon tier={category} className="h-3 w-3" />
            <span>{config.label}</span>
          </span>

          <span
            className={`inline-flex max-w-[55%] items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${typeConfig.className}`}
          >
            <svg
              className="h-2.5 w-2.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={typeConfig.iconSvg}
              />
            </svg>
            <span className="truncate">{typeConfig.label}</span>
          </span>
        </div>

        {/* Zone Logo : Propre, blanche, aérée */}
        <div
          className={`flex ${config.logoHeight} w-full items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-transform duration-300 group-hover:scale-[1.01]`}
        >
          {p.logo ? (
            <img
              src={p.logo}
              alt={`Logo de ${p.nom}`}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${MONOGRAM_GRADIENTS[category]} text-lg font-black tracking-tight text-white shadow-sm`}
              aria-label={`Initiales de ${p.nom}`}
            >
              {getInitials(p.nom)}
            </div>
          )}
        </div>

        {/* Nom du sponsor */}
        <div className="mt-3.5 text-center">
          <h3
            className={`line-clamp-2 font-extrabold leading-tight text-ope-text ${
              isPlatine ? "text-base sm:text-lg" : isOr ? "text-sm sm:text-base" : "text-xs sm:text-sm"
            }`}
          >
            {p.nom}
          </h3>
        </div>
      </div>
    </article>
  );
}



/* =========================================================================
   Composant Principal : Page Sponsors
   ========================================================================= */

export default function Sponsors() {
  const { t } = useTranslation();
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    partenaireService
      .getPartenaires()
      .then((data) => {
        if (isMounted) setPartenaires(data);
      })
      .catch(() => {
        if (isMounted) setHasError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPartenaires = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return partenaires.filter((partner) => {
      const category = partner.categorie || "bronze";
      const matchesCategory =
        activeCategoryFilter === "all" || category === activeCategoryFilter;
      const matchesType =
        activeTypeFilter === "all" || partner.type === activeTypeFilter;
      const matchesSearch =
        query === "" || partner.nom.toLocaleLowerCase().includes(query);
      return matchesCategory && matchesType && matchesSearch;
    });
  }, [partenaires, activeCategoryFilter, activeTypeFilter, searchQuery]);

  const groupedByCategorie = useMemo(
    () =>
      CATEGORIE_ORDER.map((id) => ({
        config: CATEGORIES_CONFIG[id],
        items: filteredPartenaires.filter(
          (partner) => (partner.categorie || "bronze") === id,
        ),
      })).filter(({ items }) => items.length > 0),
    [filteredPartenaires],
  );

  const stats = useMemo(
    () => ({
      total: partenaires.length,
      platine: partenaires.filter(
        (p) => (p.categorie || "bronze") === "platine",
      ).length,
      or: partenaires.filter((p) => (p.categorie || "bronze") === "or").length,
      argent: partenaires.filter((p) => (p.categorie || "bronze") === "argent")
        .length,
      bronze: partenaires.filter((p) => (p.categorie || "bronze") === "bronze")
        .length,
    }),
    [partenaires],
  );

  const resetFilters = () => {
    setActiveCategoryFilter("all");
    setActiveTypeFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="bg-ope-bg pt-20 sm:pt-24">
      {/* ── En-tête Principal : Titre, Mission & Statistiques ── */}
      <section className="px-4 pb-8 sm:px-6 sm:pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-ope-text sm:text-4xl md:text-5xl">
              {t("sponsors_page.title", "Nos Partenaires & Sponsors")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ope-text-muted sm:text-base">
              {t(
                "sponsors_page.subtitle",
                "Institutions, gouvernements, ONG et entreprises engagés pour faire émerger l'excellence et l'audace de la jeunesse d'Agadez.",
              )}
            </p>
          </div>

          {/* ── Compteurs de Partenaires & Statuts ── */}
          {!isLoading && !hasError && partenaires.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div
                onClick={() => setActiveCategoryFilter("all")}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  activeCategoryFilter === "all"
                    ? "border-ope-primary bg-white shadow-sm ring-1 ring-ope-primary"
                    : "border-ope-border bg-white shadow-2xs hover:border-slate-300"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-ope-text-muted">
                  Tous les Partenaires
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-ope-text">
                    {stats.total}
                  </span>
                  <span className="text-xs text-ope-text-muted">engagés</span>
                </div>
              </div>

              {CATEGORIE_ORDER.map((id) => {
                const config = CATEGORIES_CONFIG[id];
                const isSelected = activeCategoryFilter === id;
                return (
                  <button
                    key={id}
                    onClick={() =>
                      setActiveCategoryFilter(isSelected ? "all" : id)
                    }
                    className={`flex flex-col text-left rounded-2xl border p-4 transition ${
                      isSelected
                        ? "bg-white shadow-md ring-2"
                        : "bg-white shadow-2xs hover:border-slate-300"
                    }`}
                    style={{
                      borderColor: isSelected ? config.accent : config.borderAccent,
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider"
                      style={{ color: config.accent }}
                    >
                      <TierIcon tier={id} className="h-3.5 w-3.5" />
                      <span>{config.label}</span>
                    </div>
                    <div className="mt-1 text-2xl font-black text-ope-text">
                      {stats[id]}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Barre de Filtres & Recherche ── */}
      <section className="sticky top-16 z-30 border-y border-ope-border bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Recherche textuelle */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une organisation..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-xs text-ope-text placeholder-slate-400 focus:border-ope-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-ope-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Effacer la recherche"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtres par Type d'Organisation */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold text-ope-text-muted">
              Type :
            </span>
            <button
              onClick={() => setActiveTypeFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                activeTypeFilter === "all"
                  ? "bg-ope-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tous
            </button>
            {(["pays", "institution", "ong", "ambassade"] as PartenaireType[]).map(
              (typeKey) => (
                <button
                  key={typeKey}
                  onClick={() =>
                    setActiveTypeFilter(activeTypeFilter === typeKey ? "all" : typeKey)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeTypeFilter === typeKey
                      ? "bg-ope-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {TYPE_CONFIG[typeKey].label}
                </button>
              ),
            )}

            {(activeCategoryFilter !== "all" ||
              activeTypeFilter !== "all" ||
              searchQuery !== "") && (
              <button
                onClick={resetFilters}
                className="ml-2 text-xs font-bold text-ope-orange hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Contenu Principal : Affichage des Paliers & Sponsors ── */}
      <main className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-ope-border border-t-ope-primary" />
              <p className="mt-4 text-sm font-semibold text-ope-text-muted">
                Chargement des partenaires engagés...
              </p>
            </div>
          )}

          {hasError && (
            <ApiErrorState
              title="Impossible de charger les partenaires"
              message="Une erreur réseau est survenue. Veuillez vérifier votre connexion."
              onRetry={() => window.location.reload()}
            />
          )}

          {!isLoading && !hasError && groupedByCategorie.length === 0 && (
            <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-extrabold text-ope-text">
                Aucun partenaire ne correspond à vos filtres
              </h3>
              <p className="mt-1 text-xs text-ope-text-muted">
                Essayez d'ajuster votre recherche ou vos critères de sélection.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-full bg-ope-primary px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-ope-primary-dark"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* ── Itération par Paliers : Progression Visuelle & Aspirationnelle ── */}
          {!isLoading &&
            !hasError &&
            groupedByCategorie.map(({ config, items }) => (
              <section key={config.id} className="mb-12 sm:mb-16 last:mb-6">
                {/* En-tête de catégorie simple et épuré */}
                <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg shadow-2xs"
                      style={{ backgroundColor: config.softAccent, color: config.accent }}
                    >
                      <TierIcon tier={config.id} className="h-4 w-4" />
                    </span>
                    <h2 className="text-lg font-black text-ope-text sm:text-xl">
                      Partenaires {config.label}
                    </h2>
                  </div>
                </div>

                {/* Grille des Cartes Sponsors de ce Palier */}
                <div className={`grid gap-4 sm:gap-5 ${config.gridClass}`}>
                  {items.map((partner) => (
                    <PartnerCard key={partner.id} p={partner} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>



      {/* ── Section CTA Finale : Adhésion & Appel à Sponsoriser (Seamless avec le Footer) ── */}
      <section className="relative isolate overflow-hidden bg-[#C25E38] px-4 pb-14 pt-14 text-center text-white sm:px-6 sm:pb-16 sm:pt-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden leading-none"
          aria-hidden="true"
        >
          <svg
            className="relative block h-7 w-full text-ope-bg sm:h-12"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,0 L1200,0 L0,0 Z" />
          </svg>
        </div>

        <div className="relative z-20 mx-auto max-w-xl pt-2 sm:pt-4">
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight sm:mb-4 sm:text-3xl">
            {t("sponsors_page.become_sponsor", "Rejoignez les Partenaires d'Agadez")}
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-xs font-normal leading-relaxed text-white/90 sm:mb-8 sm:text-sm">
            {t(
              "sponsors_page.sponsor_cta_desc",
              "Associez l'image et l'expertise de votre organisation au rayonnement des 1000 Talents. Choisissez votre palier d'impact et construisons l'avenir numérique et entrepreneurial du Niger.",
            )}
          </p>
          <div className="flex justify-center">
            <NavLink
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-[#C25E38] shadow-md transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#C25E38] active:scale-95 sm:text-sm"
            >
              <span>{t("sponsors_page.cta_btn", "Devenir Partenaire Officiel")}</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14m-7-7 7 7-7 7"
                />
              </svg>
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}
