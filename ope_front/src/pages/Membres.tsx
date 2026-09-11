import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { membreService, type MembreEquipe } from "../services";

// ── Palette dynamique des badges de section ─────────────────────────────────
const getSectionBadgeClass = (section: string) => {
  const BADGE_PALETTES = [
    "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]",
    "bg-[#EBF2F7] text-[#193549] border-[#C5D8E8]",
    "bg-[#F0ECE8] text-[#6B4533] border-[#D9C4B8]",
    "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]",
    "bg-[#FEF6E9] text-[#9A6700] border-[#FCE1B4]",
  ];
  if (!section) return BADGE_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < section.length; i++) {
    hash = section.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BADGE_PALETTES.length;
  return BADGE_PALETTES[index];
};

const MemberAvatar = ({ photo, name }: { photo?: string | null; name: string }) => {
  const [imgError, setImgError] = useState(false);

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF5EE] to-[#EFECE6] text-[#A89A88]">
      <div className="w-16 h-16 rounded-full bg-[#E8DEC8]/50 flex items-center justify-center mb-1">
        <svg
          className="w-9 h-9 text-[#8C7B6B]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <span className="text-[11px] font-semibold text-ope-text-muted">Photo non renseignée</span>
    </div>
  );
};

export default function Membres() {
  const { t } = useTranslation();
  const [membres, setMembres] = useState<MembreEquipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMembres = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await membreService.getMembres({ actif: true });
      setMembres(data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des membres :", err);
      setError("Impossible de charger la liste des membres pour le moment.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembres();
  }, []);

  // ── Sections disponibles calculées dynamiquement à partir des membres réels ──
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    membres.forEach((m) => {
      if (m.section && m.section.trim()) {
        set.add(m.section.trim());
      }
    });
    return Array.from(set).sort();
  }, [membres]);

  const filteredMembres = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return membres.filter((m) => {
      const matchesSection =
        selectedSection === "all" ||
        (m.section && m.section.trim().toLowerCase() === selectedSection.trim().toLowerCase());
      const matchesSearch =
        !q ||
        m.nom.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.section && m.section.toLowerCase().includes(q));
      return matchesSection && matchesSearch;
    });
  }, [membres, selectedSection, searchQuery]);

  return (
    <div className="pt-16 bg-ope-bg min-h-screen">
      <section id="membres" className="pt-8 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* ── En-tête de la page ─────────────────────────────────── */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text tracking-tight mb-4">
              {t("membres.title", "L'Équipe OPE")}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed">
              {t("membres.subtitle", "Découvrez les femmes et les hommes engagés pour l'excellence et le rayonnement de la jeunesse.")}
            </p>
          </div>

          {/* ── Filtres et Recherche ────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            {/* Onglets Sections disponibles uniquement */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedSection("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSection === "all"
                    ? "bg-[#B85028] text-white shadow-xs"
                    : "bg-white text-ope-text border border-ope-border hover:bg-[#FAF5EE]"
                }`}
              >
                Tous ({membres.length})
              </button>
              {availableSections.map((sec) => {
                const count = membres.filter(
                  (m) => m.section && m.section.trim().toLowerCase() === sec.toLowerCase()
                ).length;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedSection.toLowerCase() === sec.toLowerCase()
                        ? "bg-[#B85028] text-white shadow-xs"
                        : "bg-white text-ope-text border border-ope-border hover:bg-[#FAF5EE]"
                    }`}
                  >
                    {sec} ({count})
                  </button>
                );
              })}
            </div>

            {/* Recherche */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un membre..."
                className="w-full bg-white border border-ope-border text-ope-text text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-ope-primary placeholder-[#A89A88] transition-colors"
              />
              <svg
                className="w-4 h-4 text-ope-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* ── État d'erreur ──────────────────────────────────────── */}
          {error && (
            <div className="mb-8 p-6 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-center max-w-xl mx-auto">
              <p className="text-xs text-[#B91C1C] mb-3">{error}</p>
              <button
                type="button"
                onClick={fetchMembres}
                className="px-4 py-2 rounded-xl bg-[#B85028] text-white text-xs font-bold hover:bg-[#a0431f] transition-colors cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* ── Squelettes de chargement ───────────────────────────── */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden border border-ope-border h-[420px] flex flex-col animate-pulse"
                >
                  <div className="h-1/2 w-full bg-slate-200" />
                  <div className="h-1/2 p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-12 bg-slate-100 rounded w-full" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── État Vide (Clean generic empty state) ──────────────── */}
          {!isLoading && !error && filteredMembres.length === 0 && (
            <div className="text-center py-16 bg-ope-white rounded-3xl border border-ope-border">
              <div className="w-14 h-14 rounded-full bg-orange-50 text-ope-primary flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-ope-text mb-1">Aucun membre répertorié</h3>
              <p className="text-xs text-ope-text-muted max-w-sm mx-auto">
                Les membres de l'organisation apparaîtront ici dès leur publication officielle.
              </p>
            </div>
          )}

          {/* ── Grille des Cartes Membres (50% image / empty state) ── */}
          {!isLoading && !error && filteredMembres.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMembres.map((member) => {
                return (
                  <div
                    key={member.id}
                    className="bg-ope-white rounded-2xl overflow-hidden border border-ope-border shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group hover:-translate-y-1 h-[420px]"
                  >
                    {/* ── Image ou Empty state : exactement 50% de hauteur ── */}
                    <div className="relative h-1/2 w-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                      <MemberAvatar photo={member.photo} name={member.nom} />
                      {member.section && (
                        <span
                          className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs border ${getSectionBadgeClass(member.section)}`}
                        >
                          {member.section}
                        </span>
                      )}
                    </div>

                    {/* ── Informations : exactement 50% de hauteur ──────── */}
                    <div className="h-1/2 p-5 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-ope-text mb-0.5 tracking-tight group-hover:text-ope-orange transition-colors truncate">
                          {member.nom}
                        </h3>
                        <p className="text-[11px] font-extrabold text-ope-orange uppercase tracking-wider mb-2 truncate">
                          {member.role}
                        </p>
                        {member.description && (
                          <p className="text-xs text-ope-text-muted line-clamp-3 leading-relaxed">
                            {member.description}
                          </p>
                        )}
                      </div>

                      {/* Liens de contact / Réseaux */}
                      <div className="pt-3 border-t border-ope-border/60 flex items-center gap-2.5">
                        {member.linkedin ? (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-[#E8DEC8] flex items-center justify-center text-ope-text hover:bg-ope-primary hover:text-white hover:border-ope-primary transition-colors"
                            aria-label={`LinkedIn de ${member.nom}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                        ) : null}

                        {member.email ? (
                          <a
                            href={member.email.startsWith("mailto:") ? member.email : `mailto:${member.email}`}
                            className="w-8 h-8 rounded-lg bg-[#FAF5EE] border border-[#E8DEC8] flex items-center justify-center text-ope-text hover:bg-ope-orange hover:text-white hover:border-ope-orange transition-colors"
                            aria-label={`Email de ${member.nom}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </a>
                        ) : null}

                        {!member.linkedin && !member.email && (
                          <span className="text-[10px] text-ope-text-muted italic">
                            Contact via le formulaire
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
