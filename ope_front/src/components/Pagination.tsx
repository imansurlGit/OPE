
export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  pageSizeOptions?: number[];
  onPageSizeChange?: (newSize: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "éléments",
  pageSizeOptions,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Si aucun élément, ne pas afficher la barre de pagination
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  // Génération des numéros de pages avec ellipses intelligentes
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EFECE6] p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-2xs">
      {/* ── Gauche : Compteur & Sélecteur de taille ── */}
      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Affichage de <strong className="text-gray-900 font-extrabold">{startItem}</strong> à{" "}
          <strong className="text-gray-900 font-extrabold">{endItem}</strong> sur{" "}
          <strong className="text-gray-900 font-extrabold">{totalItems}</strong> {itemLabel}
        </span>

        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 sm:border-l border-gray-200">
            <label htmlFor="pageSizeSelect" className="sr-only">Éléments par page</label>
            <select
              id="pageSizeSelect"
              value={itemsPerPage}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-[#FAF7F2] border border-[#EFECE6] rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Droite : Contrôles de navigation ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        {/* Bouton Précédent */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-[#FAF7F2] hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-[#FAF7F2] disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Page précédente"
        >
          <svg className="w-4 h-4 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Numéros de page sur desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-bold select-none"
                >
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? "bg-[#B85028] text-white font-black shadow-xs scale-105"
                    : "text-gray-700 hover:bg-[#FAF7F2] font-bold"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Indicateur mobile compact */}
        <div className="sm:hidden px-3 py-1 text-xs font-bold text-gray-700 bg-[#FAF7F2] rounded-xl">
          {currentPage} / {totalPages}
        </div>

        {/* Bouton Suivant */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-[#FAF7F2] hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-[#FAF7F2] disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <svg className="w-4 h-4 sm:ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
