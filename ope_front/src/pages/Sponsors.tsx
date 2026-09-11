import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { partenaireService, type Partenaire, type PartenaireType } from "../services";

const TYPE_CONFIG: Record<
  PartenaireType,
  {
    label: string;
    pluralLabel: string;
    starColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconPath: string;
    duration: number; // durée en secondes du cycle
    direction: "left" | "right";
  }
> = {
  pays: {
    label: "Pays",
    pluralLabel: "Pays partenaires",
    starColor: "text-[#D97706]",
    badgeBg: "bg-amber-50",
    badgeText: "text-[#92400E]",
    badgeBorder: "border-amber-200",
    iconPath: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    duration: 35,
    direction: "left",
  },
  institution: {
    label: "Institution",
    pluralLabel: "Institutions partenaires",
    starColor: "text-[#2f6084]",
    badgeBg: "bg-sky-50",
    badgeText: "text-[#1b3a4f]",
    badgeBorder: "border-sky-200",
    iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    duration: 40,
    direction: "left",
  },
  ong: {
    label: "ONG",
    pluralLabel: "ONG partenaires",
    starColor: "text-[#1D6353]",
    badgeBg: "bg-emerald-50",
    badgeText: "text-[#1D6353]",
    badgeBorder: "border-emerald-200",
    iconPath: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    duration: 36,
    direction: "left",
  },
  ambassade: {
    label: "Ambassade",
    pluralLabel: "Ambassades partenaires",
    starColor: "text-[#9A3412]",
    badgeBg: "bg-orange-50",
    badgeText: "text-[#9A3412]",
    badgeBorder: "border-orange-200",
    iconPath: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
    duration: 38,
    direction: "left",
  },
};

const TYPE_ORDER: PartenaireType[] = ["pays", "institution", "ong", "ambassade"];

function getInitials(nom: string): string {
  return nom
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-amber-600 to-orange-500",
  "from-emerald-600 to-teal-500",
  "from-indigo-600 to-purple-500",
  "from-rose-500 to-red-500",
  "from-teal-600 to-cyan-500",
  "from-yellow-500 to-amber-600",
];

function getGradient(nom: string): string {
  let hash = 0;
  for (let i = 0; i < nom.length; i++) {
    hash = nom.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

// Carte d'un partenaire
function PartnerCard({ p }: { p: Partenaire }) {
  const initials = getInitials(p.nom);
  const gradient = getGradient(p.nom);
  const typeInfo = TYPE_CONFIG[p.type] || TYPE_CONFIG.institution;

  return (
    <div className="w-56 sm:w-64 shrink-0 bg-ope-white rounded-2xl p-4 sm:p-5 border border-ope-border shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group select-none">
      {/* Conteneur Logo ou Initiales */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-gray-100 shadow-inner flex items-center justify-center p-2.5 mb-3 transition-transform duration-300 group-hover:scale-105">
        {p.logo ? (
          <img
            src={p.logo}
            alt={p.nom}
            className="max-w-full max-h-full object-contain pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-lg shadow-xs tracking-tight`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Nom du partenaire */}
      <h3 className="font-extrabold text-xs sm:text-sm text-ope-text line-clamp-2 leading-snug mb-2 min-h-[2.2rem] flex items-center justify-center">
        {p.nom}
      </h3>

      {/* Badge Catégorie */}
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeInfo.badgeBg} ${typeInfo.badgeText} ${typeInfo.badgeBorder} mt-auto`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {typeInfo.label}
      </span>
    </div>
  );
}

// ── COMPOSANT DÉFILANT ULTRA-FLUIDE PAR CATÉGORIE (Accélération GPU 60/120 FPS) ──
function CategoryMarqueeRow({
  type,
  items,
}: {
  type: PartenaireType;
  items: Partenaire[];
}) {
  const typeInfo = TYPE_CONFIG[type];
  const [isManualPaused, setIsManualPaused] = useState(false);

  // Duplication propre pour un défilement continu infini à 100% sans saut
  const { track1, track2 } = useMemo(() => {
    if (items.length === 0) return { track1: [], track2: [] };
    // Répéter si moins de 5 éléments pour garantir une bande continue plus large que l'écran
    let base = [...items];
    while (base.length < 5) {
      base = [...base, ...items];
    }
    return { track1: base, track2: base };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* En-tête de la ligne / catégorie */}
      <div className="flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border ${typeInfo.badgeBg} ${typeInfo.badgeText} ${typeInfo.badgeBorder}`}
          >
            <svg
              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={typeInfo.iconPath} />
            </svg>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-ope-text tracking-tight flex items-center gap-2">
              <span>{typeInfo.pluralLabel}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {items.length}
              </span>
            </h2>
          </div>
        </div>

        {/* Bouton pause/reprise de la ligne */}
        <button
          type="button"
          onClick={() => setIsManualPaused((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-2xs active:scale-95"
          title={isManualPaused ? "Reprendre le défilement" : "Mettre en pause"}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isManualPaused ? "bg-amber-400" : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span className="text-[11px]">{isManualPaused ? "Reprendre" : "Défilement fluide"}</span>
        </button>
      </div>

      {/* Track défilant ultra-fluide avec masques latéraux */}
      <div className="relative overflow-hidden rounded-2xl marquee-container py-2">
        {/* Masques de fondu à gauche et à droite pour une transition élégante */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-ope-bg to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-ope-bg to-transparent pointer-events-none z-10" />

        {/* Conteneur défilant animé en CSS (GPU Compositor - 60/120 FPS constant) */}
        <div
          className="animate-marquee-left flex gap-4 sm:gap-5"
          style={{
            animationDuration: `${typeInfo.duration}s`,
            animationPlayState: isManualPaused ? "paused" : undefined,
          }}
        >
          {/* Première moitié */}
          <div className="flex gap-4 sm:gap-5 shrink-0">
            {track1.map((p, idx) => (
              <PartnerCard key={`t1-${p.id}-${idx}`} p={p} />
            ))}
          </div>

          {/* Deuxième moitié (clone identique pour boucle infinie 100% invisible) */}
          <div className="flex gap-4 sm:gap-5 shrink-0">
            {track2.map((p, idx) => (
              <PartnerCard key={`t2-${p.id}-${idx}`} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const { t } = useTranslation();
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // ── Chargement API ──────────────────────────────────────────
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

  // Grouper par type selon l'ordre défini
  const grouped = useMemo(() => {
    return TYPE_ORDER.map((type) => ({
      type,
      items: partenaires.filter((p) => p.type === type),
    })).filter((g) => g.items.length > 0);
  }, [partenaires]);

  return (
    <div className="pt-20 sm:pt-24 bg-ope-bg min-h-screen">
      {/* ── En-tête ──────────────────────────────────────────────── */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-3 sm:mb-4 tracking-tight">
            {t("sponsors_page.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8">
            {t("sponsors_page.subtitle")}
          </p>

          {/* Stats dynamiques */}
          {!isLoading && !hasError && partenaires.length > 0 && (
            <div className="flex items-center justify-around gap-2 sm:gap-10 w-full max-w-sm sm:max-w-md mx-auto bg-ope-white px-4 sm:px-8 py-3.5 sm:py-5 rounded-2xl border border-ope-border shadow-xs">
              <div className="text-center flex-1">
                <p className="text-xl sm:text-3xl font-extrabold text-ope-primary tracking-tight">
                  {partenaires.length}
                </p>
                <p className="text-[9.5px] sm:text-[11px] font-bold text-ope-text-muted uppercase tracking-wider mt-0.5">
                  Partenaires
                </p>
              </div>
              <div className="h-7 w-px bg-ope-border" />
              <div className="text-center flex-1">
                <p className="text-xl sm:text-3xl font-extrabold text-ope-primary tracking-tight">
                  {grouped.length}
                </p>
                <p className="text-[9.5px] sm:text-[11px] font-bold text-ope-text-muted uppercase tracking-wider mt-0.5">
                  Catégories
                </p>
              </div>
              <div className="h-7 w-px bg-ope-border" />
              <div className="text-center flex-1">
                <p className="text-xl sm:text-3xl font-extrabold text-ope-primary tracking-tight">
                  {partenaires.filter((p) => p.type === "pays").length}
                </p>
                <p className="text-[9.5px] sm:text-[11px] font-bold text-ope-text-muted uppercase tracking-wider mt-0.5">
                  Pays
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Section des défilants fluides (Une ligne par catégorie) ────────── */}
      <section className="py-4 pb-16 sm:pb-24 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">

          {/* Squelette de chargement */}
          {isLoading && (
            <div className="space-y-10 animate-pulse">
              {[1, 2, 3].map((row) => (
                <div key={row} className="space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-48" />
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-56 sm:w-64 h-56 bg-slate-100 rounded-2xl shrink-0" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Erreur de connexion */}
          {!isLoading && hasError && (
            <div className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-gray-800 text-base">Impossible de charger les partenaires</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Une erreur de connexion s'est produite. Vérifiez votre connexion Internet et réessayez.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C25E38] hover:bg-[#a04a2a] transition-colors cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Page vide */}
          {!isLoading && !hasError && partenaires.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-400">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-gray-800 text-base">Aucun partenaire pour le moment</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Les partenaires et sponsors du CNCEIZ 2026 seront affichés ici prochainement.
              </p>
              <NavLink
                to="/contact"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C25E38] hover:bg-[#a04a2a] transition-colors cursor-pointer"
              >
                Devenir partenaire
              </NavLink>
            </div>
          )}

          {/* ── UNE LIGNE DÉFILANTE ULTRA-FLUIDE PAR CATÉGORIE ── */}
          {!isLoading && !hasError && grouped.map((group) => (
            <CategoryMarqueeRow
              key={group.type}
              type={group.type}
              items={group.items}
            />
          ))}

        </div>
      </section>

      {/* ── CTA Terracotta ───────────────────────────────────────── */}
      <section className="relative bg-[#C25E38] text-white pt-14 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none z-10 pointer-events-none">
          <svg className="relative block w-full h-7 sm:h-12 text-ope-bg" viewBox="0 0 1200 120" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,0 L1200,0 L0,0 Z" />
          </svg>
        </div>

        <div className="max-w-xl mx-auto relative z-20 pt-2 sm:pt-4">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-3 sm:mb-4 tracking-tight">
            {t("sponsors_page.become_sponsor", t("sponsors_page.cta_title", "Devenez acteur du changement"))}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mx-auto mb-6 sm:mb-8 font-normal max-w-lg">
            {t(
              "sponsors_page.sponsor_cta_desc",
              t(
                "sponsors_page.cta_desc",
                "Associez l'image de votre entreprise à un projet d'impact social et technologique majeur au Niger. Ensemble, propulsons la jeunesse d'Agadez vers l'excellence numérique et entrepreneuriale."
              )
            )}
          </p>

          <NavLink
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-[#C25E38] bg-white hover:bg-slate-50 active:scale-95 shadow-md transition-all cursor-pointer"
          >
            <span>{t("sponsors_page.cta_btn", t("nav.contact", "Nous contacter"))}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7z" />
            </svg>
          </NavLink>
        </div>
      </section>
    </div>
  );
}
