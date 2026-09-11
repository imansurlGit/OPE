import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { actualiteService, type Actualite, type ActualitePhase } from "../services";

// ── Config des phases (charte OPE) ─────────────────────────────────────────
const PHASES_CONFIG: Record<
  ActualitePhase,
  { label: string; badgeClass: string; textColor: string }
> = {
  avant: {
    label: "Avant le camp",
    badgeClass: "bg-[#EBF2F7] text-[#193549] border-[#C5D8E8]",
    textColor: "text-[#193549]",
  },
  pendant: {
    label: "Pendant le camp",
    badgeClass: "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]",
    textColor: "text-[#B85028]",
  },
  apres: {
    label: "Après le camp",
    badgeClass: "bg-[#F0ECE8] text-[#6B4533] border-[#D9C4B8]",
    textColor: "text-[#6B4533]",
  },
};

// ── Formate date "YYYY-MM-DD" → "DD Mois YYYY" ─────────────────────────────
const MOIS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
function formatDateFr(dStr: string): string {
  if (!dStr) return "—";
  const parts = dStr.split("-");
  if (parts.length === 3) {
    const m = parseInt(parts[1], 10);
    return `${parts[2]} ${MOIS[m - 1] || ""} ${parts[0]}`;
  }
  return dStr;
}

export default function Actualites() {
  const { t } = useTranslation();
  const [activePhase, setActivePhase] = useState<ActualitePhase>("avant");
  const [articles, setArticles] = useState<Actualite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Actualite | null>(null);

  // ── Charger les articles publiés depuis l'API ──────────────────────────
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await actualiteService.getArticles({ publie: true });
        const items = Array.isArray(data) ? data : (data as any)?.results || [];
        setArticles(items);
      } catch (err: any) {
        console.error("Erreur chargement actualités :", err);
        setError("Impossible de charger les actualités. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const currentArticles = articles.filter((a) => a.phase === activePhase);

  return (
    <div className="pt-16 bg-ope-bg min-h-screen">
      {/* ── En-Tête ─────────────────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-4 tracking-tight">
            {t("actualites.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
            {t("actualites.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Navigation par Phase (onglets) ──────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="border-b border-[#E8DEC8] mb-8">
            <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto no-scrollbar">
              {(["avant", "pendant", "apres"] as ActualitePhase[]).map((phase) => {
                const cfg = PHASES_CONFIG[phase];
                const isActive = activePhase === phase;
                return (
                  <button
                    key={phase}
                    onClick={() => setActivePhase(phase)}
                    className={`relative flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 cursor-pointer shrink-0 ${
                      isActive
                        ? "text-ope-orange"
                        : "text-ope-text-muted hover:text-ope-text"
                    }`}
                  >
                    <span>{cfg.label}</span>
                    {/* compteur */}
                    {!isLoading && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#FDF3EE] text-[#B85028]"
                            : "bg-[#EFECE6] text-gray-500"
                        }`}
                      >
                        {articles.filter((a) => a.phase === phase).length}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-ope-orange rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── États : Chargement / Erreur / Empty / Grille ─────────────── */}
          {isLoading ? (
            /* Skeleton loader */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-ope-white rounded-2xl border border-ope-border overflow-hidden animate-pulse h-[400px] flex flex-col"
                >
                  <div className="h-1/2 bg-[#EFECE6]" />
                  <div className="p-5 flex-1 space-y-3">
                    <div className="h-3 bg-[#EFECE6] rounded w-1/3" />
                    <div className="h-5 bg-[#EFECE6] rounded w-3/4" />
                    <div className="h-3 bg-[#EFECE6] rounded w-full" />
                    <div className="h-3 bg-[#EFECE6] rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* État d'erreur */
            <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-2">
                Une erreur est survenue
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : currentArticles.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16 bg-ope-white rounded-3xl border border-ope-border p-8">
              <div className="w-12 h-12 rounded-full bg-[#FDF3EE] text-[#B85028] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-base font-bold text-ope-text mb-1">
                Aucune actualité pour le moment
              </p>
              <p className="text-xs text-ope-text-muted">
                Les publications pour cette phase seront bientôt disponibles.
              </p>
            </div>
          ) : (
            /* Grille des articles */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              {currentArticles.map((article) => {
                const phaseInfo = PHASES_CONFIG[article.phase] || PHASES_CONFIG.avant;
                return (
                  <article
                    key={article.id}
                    className="bg-ope-white rounded-2xl overflow-hidden border border-ope-border shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col h-[400px] group"
                  >
                    {/* Image / Empty state — 50% fixe */}
                    <div className="relative h-1/2 w-full bg-[#F0ECE8] overflow-hidden shrink-0">
                      {article.image_principale ? (
                        <img
                          src={article.image_principale}
                          alt={article.titre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF7F2] to-[#ECE7DC] text-[#9C8578]">
                          <svg className="w-10 h-10 opacity-40 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Sans image</span>
                        </div>
                      )}

                      {/* Badges superposés */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-white/95 shadow-xs ${phaseInfo.textColor} ${phaseInfo.badgeClass}`}>
                          {phaseInfo.label}
                        </span>
                        {article.badge_label && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#193549]/80 text-white backdrop-blur-xs">
                            {article.badge_label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenu — remplit les 50% restants */}
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="p-4 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-ope-text-muted mb-1.5">
                          <span>{formatDateFr(article.date_publication)}</span>
                          {article.temps_lecture && (
                            <>
                              <span>•</span>
                              <span>{article.temps_lecture} min de lecture</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-extrabold text-sm text-ope-text mb-1.5 line-clamp-2 group-hover:text-ope-orange transition-colors">
                          {article.titre}
                        </h3>
                        <p className="text-xs text-ope-text-muted leading-relaxed line-clamp-2">
                          {article.resume}
                        </p>
                      </div>

                      <div className="px-4 py-3 border-t border-ope-border">
                        <button
                          onClick={() => setSelectedArticle(article)}
                          className="text-xs font-bold text-ope-orange hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          {t("actualites.read_more")}
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Modal Détail Article ─────────────────────────────────────────── */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ope-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-ope-border animate-fadeIn flex flex-col">
            {/* Image + gradient header */}
            <div className="relative h-52 sm:h-64 shrink-0 bg-[#193549]">
              {selectedArticle.image_principale ? (
                <img
                  src={selectedArticle.image_principale}
                  alt={selectedArticle.titre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#193549] to-[#0D1F2D] text-white/30">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-14">
                {selectedArticle.badge_label && (
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#B85028] text-white mb-2 inline-block">
                    {selectedArticle.badge_label}
                  </span>
                )}
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                  {selectedArticle.titre}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#193549]/70 text-white flex items-center justify-center hover:bg-[#193549] cursor-pointer transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Corps scrollable */}
            <div className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-400">
                <span>{formatDateFr(selectedArticle.date_publication)}</span>
                {selectedArticle.temps_lecture && (
                  <>
                    <span>•</span>
                    <span>{selectedArticle.temps_lecture} min de lecture</span>
                  </>
                )}
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFECE6]">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 italic leading-relaxed">
                  {selectedArticle.resume}
                </p>
              </div>

              <p className="text-sm text-ope-text leading-relaxed whitespace-pre-line">
                {selectedArticle.contenu}
              </p>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-ope-border bg-[#FAF7F2] flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#193549] hover:bg-[#12273A] transition-colors cursor-pointer"
              >
                {t("talents.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
