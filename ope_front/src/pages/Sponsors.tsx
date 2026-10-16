import { useState, useEffect, useMemo, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  partenaireService,
  type Partenaire,
  type PartenaireCategorie,
} from "../services";
import ApiErrorState from "../components/ApiErrorState";

/* =========================================================================
   Configuration Visuelle des Paliers
   ========================================================================= */

interface CategorieConfig {
  id: PartenaireCategorie;
  label: string;
  accent: string;
  softAccent: string;
  borderAccent: string;
  logoHeight: string;
  cardWidth: string;
}

const CATEGORIES_CONFIG: Record<PartenaireCategorie, CategorieConfig> = {
  platine: {
    id: "platine",
    label: "Platine",
    accent: "#1E3A52",
    softAccent: "#EEF4F8",
    borderAccent: "#C5D8E8",
    logoHeight: "h-28 sm:h-32",
    cardWidth: "w-[280px] sm:w-[320px] md:w-[360px]",
  },
  or: {
    id: "or",
    label: "Or",
    accent: "#9E6B15",
    softAccent: "#FEF7EA",
    borderAccent: "#F2D8A7",
    logoHeight: "h-24 sm:h-28",
    cardWidth: "w-[240px] sm:w-[280px] md:w-[300px]",
  },
  argent: {
    id: "argent",
    label: "Argent",
    accent: "#475569",
    softAccent: "#F1F5F9",
    borderAccent: "#CBD5E1",
    logoHeight: "h-20 sm:h-24",
    cardWidth: "w-[210px] sm:w-[240px] md:w-[260px]",
  },
  bronze: {
    id: "bronze",
    label: "Bronze",
    accent: "#A3522C",
    softAccent: "#FDF3EE",
    borderAccent: "#F3D0C1",
    logoHeight: "h-16 sm:h-20",
    cardWidth: "w-[180px] sm:w-[210px] md:w-[230px]",
  },
};

const CATEGORIE_ORDER: PartenaireCategorie[] = [
  "platine",
  "or",
  "argent",
  "bronze",
];

const MONOGRAM_GRADIENTS: Record<PartenaireCategorie, string> = {
  platine: "from-[#1E3A52] to-[#3A6073]",
  or: "from-[#9E6B15] to-[#C18A2B]",
  argent: "from-[#475569] to-[#64748B]",
  bronze: "from-[#A3522C] to-[#C25E38]",
};

/* =========================================================================
   Icônes SVG Dédiées par Palier (Zéro emoji)
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
   Carte Partenaire Individuelle (Design Moderne, Épuré & Premium)
   ========================================================================= */

function PartnerCard({ p }: { p: Partenaire }) {
  const category = (p.categorie || "bronze") as PartenaireCategorie;
  const config = CATEGORIES_CONFIG[category] ?? CATEGORIES_CONFIG.bronze;
  const isPlatine = category === "platine";
  const isOr = category === "or";

  return (
    <article
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-white border transition-all duration-300 ease-out hover:-translate-y-1.5 ${
        isPlatine
          ? "p-5 sm:p-6 shadow-sm hover:shadow-xl"
          : isOr
            ? "p-4 sm:p-5 shadow-xs hover:shadow-lg"
            : "p-3.5 sm:p-4 shadow-xs hover:shadow-md"
      }`}
      style={{ borderColor: config.borderAccent }}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Header de la carte : Badge officiel & Symbole d'accréditation */}
        <div className="mb-3.5 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider border"
            style={{
              backgroundColor: config.softAccent,
              color: config.accent,
              borderColor: config.borderAccent,
            }}
          >
            <TierIcon tier={category} className="h-3 w-3 shrink-0" />
            <span>{config.label}</span>
          </span>

          <span
            className="flex h-5 w-5 items-center justify-center rounded-full transition-colors"
            style={{ color: config.accent }}
            title={`Partenaire Officiel ${config.label}`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {/* Zone Logo : Écrin épuré, centré et lumineux */}
        <div
          className={`flex ${config.logoHeight} w-full items-center justify-center rounded-xl border border-slate-100 bg-[#FAFCFD] p-3 sm:p-4 transition-all duration-300 group-hover:bg-white group-hover:border-slate-200`}
        >
          {p.logo ? (
            <img
              src={p.logo}
              alt={`Logo de ${p.nom}`}
              className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${MONOGRAM_GRADIENTS[category]} text-base sm:text-lg font-black tracking-tight text-white shadow-xs transition-transform duration-300 group-hover:scale-105`}
              aria-label={`Initiales de ${p.nom}`}
            >
              {getInitials(p.nom)}
            </div>
          )}
        </div>

        {/* Pied de la carte : Nom et sous-titre officiel */}
        <div className="mt-3.5 text-center">
          <h3
            className={`font-black leading-snug text-ope-text transition-colors group-hover:text-[#193549] line-clamp-2 ${
              isPlatine
                ? "text-sm sm:text-base"
                : isOr
                  ? "text-xs sm:text-sm"
                  : "text-xs font-bold"
            }`}
            title={p.nom}
          >
            {p.nom}
          </h3>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Partenaire Officiel
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================================
   Composant Carousel par Palier
   ========================================================================= */

const TIER_SPEEDS: Record<PartenaireCategorie, number> = {
  platine: 28,
  or: 32,
  argent: 36,
  bronze: 40,
};

function PartnerCarousel({
  config,
  items,
}: {
  config: CategorieConfig;
  items: Partenaire[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // ── Duplication harmonieuse pour une boucle infinie invisible ──
  const repeatedItems = useMemo(() => {
    if (items.length === 0) return [];
    const minCards = 10;
    const baseRepeats = Math.ceil(minCards / items.length);
    const repeats = baseRepeats % 2 === 0 ? baseRepeats : baseRepeats + 1;

    const result: (Partenaire & { uniqueKey: string })[] = [];
    for (let r = 0; r < repeats; r++) {
      items.forEach((item, idx) => {
        result.push({
          ...item,
          uniqueKey: `${r}-${item.id}-${idx}`,
        });
      });
    }
    return result;
  }, [items]);

  // ── Défilement Continu & Ultra-Fluide via requestAnimationFrame (60/120 fps) ──
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || items.length === 0 || isPaused) return;

    let animId: number;
    let lastTime: number | null = null;
    const speed = TIER_SPEEDS[config.id] || 32;

    const step = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (el) {
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > el.clientWidth) {
          let next = el.scrollLeft + speed * delta;
          if (next >= halfWidth) {
            next -= halfWidth;
          }
          el.scrollLeft = next;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPaused, items.length, config.id]);

  // ── Boucle transparente en cas de glissement manuel / tactile ──
  const handleScrollEvent = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    if (halfWidth > el.clientWidth) {
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      } else if (el.scrollLeft <= 0) {
        el.scrollLeft += halfWidth;
      }
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.6, 260);

    setIsPaused(true);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    setTimeout(() => {
      setIsPaused(false);
    }, 1000);
  };

  return (
    <section
      className="mb-10 sm:mb-14 last:mb-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* En-tête de catégorie avec boutons de contrôle */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg shadow-2xs"
            style={{ backgroundColor: config.softAccent, color: config.accent }}
          >
            <TierIcon tier={config.id} className="h-4 w-4" />
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-black text-ope-text sm:text-xl">
              Partenaires {config.label}
            </h2>
            <span className="text-xs font-semibold text-ope-text-muted">
              ({items.length})
            </span>
          </div>
        </div>

        {/* Flèches de défilement manuel */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label={`Précédent (${config.label})`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-ope-text shadow-2xs hover:bg-slate-50 hover:border-slate-400 active:scale-95 cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label={`Suivant (${config.label})`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-ope-text shadow-2xs hover:bg-slate-50 hover:border-slate-400 active:scale-95 cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rail défilant (Carousel fluide continu) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScrollEvent}
        className="flex gap-4 sm:gap-5 overflow-x-auto py-3 px-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {repeatedItems.map((partner) => (
          <div
            key={partner.uniqueKey}
            className={`shrink-0 ${config.cardWidth}`}
          >
            <PartnerCard p={partner} />
          </div>
        ))}
      </div>
    </section>
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
    if (!query) return partenaires;
    return partenaires.filter((partner) =>
      partner.nom.toLocaleLowerCase().includes(query)
    );
  }, [partenaires, searchQuery]);

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

  return (
    <div className="bg-ope-bg pt-20 sm:pt-24">
      {/* ── En-tête Principal : Titre & Mission ── */}
      <section className="px-4 pb-6 sm:px-6 sm:pb-8">
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
        </div>
      </section>

      {/* ── Recherche textuelle épurée ── */}
      <section className="px-4 pb-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative max-w-md">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
              placeholder="Rechercher un partenaire..."
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-ope-text placeholder-slate-400 shadow-2xs focus:border-ope-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-ope-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Effacer la recherche"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Contenu Principal : Carousels par Palier ── */}
      <main className="px-4 py-6 sm:px-6 sm:py-8">
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
              message="Une erreur de connexion s'est produite. Vérifiez votre connexion Internet et réessayez."
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
                Aucun partenaire ne correspond à votre recherche
              </h3>
              <p className="mt-1 text-xs text-ope-text-muted">
                Essayez d'ajuster vos mots-clés de recherche.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-full bg-ope-primary px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-ope-primary-dark cursor-pointer"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          )}

          {/* ── Itération par Paliers avec Carousels Dédiés ── */}
          {!isLoading &&
            !hasError &&
            groupedByCategorie.map(({ config, items }) => (
              <PartnerCarousel
                key={config.id}
                config={config}
                items={items}
              />
            ))}
        </div>
      </main>

      {/* ── Section CTA Finale : Adhésion & Appel à Sponsoriser ── */}
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
