import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  documentService,
  type DocumentItem,
  type DocumentType,
} from "../services";
import Pagination from "./Pagination";

const TYPE_CONFIG: Record<
  DocumentType,
  { label: string; badgeClass: string; textColor: string; iconBg: string }
> = {
  archive: {
    label: "Archive",
    badgeClass: "bg-[#EBF2F7] text-[#193549] border-[#C5D8E8]",
    textColor: "text-[#193549]",
    iconBg: "bg-[#EBF2F7] text-[#193549]",
  },
  talent: {
    label: "Livret Talents",
    badgeClass: "bg-[#FDF3EE] text-[#f15b29] border-[#F0C5AE]",
    textColor: "text-[#f15b29]",
    iconBg: "bg-[#FDF3EE] text-[#f15b29]",
  },
  rapport: {
    label: "Rapport",
    badgeClass: "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]",
    textColor: "text-[#1D6353]",
    iconBg: "bg-[#EAF5F2] text-[#1D6353]",
  },
};

const resolveFileUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `http://127.0.0.1:7777${url.startsWith("/") ? "" : "/"}${url}`;
};

const getFileExtension = (url?: string | null) => {
  if (!url) return "DOC";
  const clean = url.split("?")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "DOC" : "DOC";
};

const getFileIconColor = (ext: string) => {
  switch (ext) {
    case "PDF":
      return "bg-rose-50 text-rose-600 border-rose-200";
    case "DOC":
    case "DOCX":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "XLS":
    case "XLSX":
    case "CSV":
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "PPT":
    case "PPTX":
      return "bg-amber-50 text-amber-600 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

export default function AdminArchives() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAnnee, setSelectedAnnee] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Notifications Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<DocumentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const currentYear = new Date().getFullYear();
  const [formTitre, setFormTitre] = useState("");
  const [formType, setFormType] = useState<DocumentType>("archive");
  const [formAnnee, setFormAnnee] = useState<number>(currentYear);
  const [formFichier, setFormFichier] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Chargement ────────────────────────────────────────────────────────────
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch {
      showToast(
        "Impossible de charger les documents. Vérifiez votre connexion.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Liste des années uniques disponibles
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(documents.map((d) => d.annee))).filter(Boolean);
    return years.sort((a, b) => b - a);
  }, [documents]);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesType = selectedType === "all" || doc.type === selectedType;
      const matchesAnnee =
        selectedAnnee === "all" || String(doc.annee) === selectedAnnee;
      const matchesSearch =
        q === "" ||
        doc.titre.toLowerCase().includes(q) ||
        String(doc.annee).includes(q);
      return matchesType && matchesAnnee && matchesSearch;
    });
  }, [documents, selectedType, selectedAnnee, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedAnnee, searchQuery]);

  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: documents.length,
      archive: documents.filter((d) => d.type === "archive").length,
      talent: documents.filter((d) => d.type === "talent").length,
      rapport: documents.filter((d) => d.type === "rapport").length,
      anneesCount: availableYears.length,
    }),
    [documents, availableYears]
  );

  // ── Modals Handlers ───────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingDoc(null);
    setFormTitre("");
    setFormType("archive");
    setFormAnnee(currentYear);
    setFormFichier(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setFormTitre(doc.titre);
    setFormType(doc.type || "archive");
    setFormAnnee(doc.annee || currentYear);
    setFormFichier(null);
    setFormError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingDoc(null);
    setFormFichier(null);
    setFormError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormFichier(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitre.trim()) {
      setFormError("Le titre du document est obligatoire.");
      return;
    }

    if (!formAnnee || formAnnee < 1900 || formAnnee > 2100) {
      setFormError("Veuillez saisir une année valide.");
      return;
    }

    if (!editingDoc && !formFichier) {
      setFormError("Veuillez sélectionner un fichier à téléverser.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("titre", formTitre.trim());
      formData.append("type", formType);
      formData.append("annee", String(formAnnee));

      if (formFichier) {
        formData.append("fichier", formFichier);
      }

      if (editingDoc) {
        const updated = await documentService.updateDocument(
          editingDoc.id,
          formData
        );
        setDocuments((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
        );
        showToast("Document modifié avec succès.");
      } else {
        const created = await documentService.createDocument(formData);
        setDocuments((prev) => [created, ...prev]);
        showToast("Nouveau document ajouté avec succès.");
      }
      closeModal();
    } catch {
      setFormError(
        "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setIsSubmitting(true);
    try {
      await documentService.deleteDocument(deleteCandidate.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteCandidate.id));
      showToast("Document supprimé avec succès.");
      setDeleteCandidate(null);
    } catch {
      showToast("Impossible de supprimer le document.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Toast ── */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3.5 max-w-sm text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-2xl border flex items-start gap-3 animate-fade-up ${
            toastType === "error"
              ? "bg-rose-600 border-rose-400/30"
              : "bg-emerald-600 border-emerald-400/30"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            {toastType === "error" ? (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Archives & Documents
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Gestion des livrets de talents, rapports annuels et documents officiels
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-[#f15b29] hover:bg-[#d44d1f] cursor-pointer shadow-xs transition-all active:scale-95"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Nouveau document</span>
        </button>
      </div>

      {/* ── Statistiques ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: "Total Documents", value: stats.total, color: "text-gray-900" },
          { label: "Archives", value: stats.archive, color: "text-[#193549]" },
          { label: "Livrets Talents", value: stats.talent, color: "text-[#f15b29]" },
          { label: "Rapports", value: stats.rapport, color: "text-[#1D6353]" },
          { label: "Années", value: stats.anneesCount, color: "text-indigo-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white p-4 rounded-2xl border border-[#d0e4f0] shadow-2xs"
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider block ${s.color}`}
            >
              {s.label}
            </span>
            <span className={`text-2xl font-black mt-1 block ${s.color}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Filtres & Barre d'outils ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#d0e4f0] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou année..."
            className="w-full bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f15b29]"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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

        {/* Filtres Type et Année */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#f15b29] cursor-pointer"
          >
            <option value="all">Tous les types</option>
            <option value="archive">Archives</option>
            <option value="talent">Livrets Talents</option>
            <option value="rapport">Rapports</option>
          </select>

          <select
            value={selectedAnnee}
            onChange={(e) => setSelectedAnnee(e.target.value)}
            className="bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#f15b29] cursor-pointer"
          >
            <option value="all">Toutes les années</option>
            {availableYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr}
              </option>
            ))}
          </select>

          {/* Toggle Grille / Tableau */}
          <div className="flex items-center bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#2F6084] shadow-xs font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Vue Grille"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#2F6084] shadow-xs font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Vue Tableau"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#d0e4f0] p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d0e4f0] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#edf4f9] text-[#2F6084] flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1">
            Aucun document trouvé
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
            {searchQuery || selectedType !== "all" || selectedAnnee !== "all"
              ? "Aucun document ne correspond à vos filtres. Essayez d'ajuster votre recherche."
              : "Aucun document n'a encore été téléversé. Commencez par en ajouter un."}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#f15b29] hover:bg-[#d44d1f] cursor-pointer shadow-xs transition-colors"
          >
            + Ajouter un document
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Vue Grille ── */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedDocs.map((doc) => {
              const typeInfo = TYPE_CONFIG[doc.type] || TYPE_CONFIG.archive;
              const ext = getFileExtension(doc.fichier);
              const extColor = getFileIconColor(ext);
              const fileUrl = resolveFileUrl(doc.fichier);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-[#d0e4f0] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                >
                  {/* Haut de la carte */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Badges Type & Année */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${typeInfo.badgeClass}`}
                      >
                        {typeInfo.label}
                      </span>
                      <span className="text-[11px] font-black text-gray-500 bg-[#edf4f9] px-2.5 py-0.5 rounded-full border border-[#d0e4f0]">
                        {doc.annee}
                      </span>
                    </div>

                    {/* Icône fichier & Titre */}
                    <div className="flex items-start gap-3 my-2 flex-1">
                      <div
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border font-black text-xs shadow-2xs ${extColor}`}
                      >
                        <svg
                          className="w-5 h-5 mb-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-[9px] tracking-tight">{ext}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2">
                          {doc.titre}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-1 truncate">
                          {doc.fichier ? doc.fichier.split("/").pop() : "Aucun fichier"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bas : Actions */}
                  <div className="px-5 py-3 bg-[#f8fbfe] border-t border-[#d0e4f0] flex items-center justify-between gap-2">
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2F6084] hover:text-[#f15b29] transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>Télécharger</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sans fichier</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(doc)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#2F6084] hover:bg-white transition-all cursor-pointer"
                        title="Modifier"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(doc)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Supprimer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="documents"
            pageSizeOptions={[8, 16, 24, 32]}
            onPageSizeChange={(newSize) => {
              setItemsPerPage(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      ) : (
        /* ── Vue Tableau ── */
        <div className="bg-white rounded-3xl border border-[#d0e4f0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f4f8fb] text-gray-500 font-bold uppercase tracking-wider border-b border-[#d0e4f0]">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Année</th>
                  <th className="py-3 px-4">Fichier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0e4f0]/60">
                {paginatedDocs.map((doc) => {
                  const typeInfo = TYPE_CONFIG[doc.type] || TYPE_CONFIG.archive;
                  const ext = getFileExtension(doc.fichier);
                  const extColor = getFileIconColor(ext);
                  const fileUrl = resolveFileUrl(doc.fichier);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-[#f9fcfe] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold text-[10px] ${extColor}`}
                          >
                            {ext}
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-900 block text-xs">
                              {doc.titre}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${typeInfo.badgeClass}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-gray-700 bg-[#edf4f9] px-2 py-0.5 rounded-full border border-[#d0e4f0]">
                          {doc.annee}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2F6084] hover:text-[#f15b29] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            <span className="truncate max-w-[150px]">
                              {doc.fichier.split("/").pop()}
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Aucun</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(doc)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#2F6084] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(doc)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#d0e4f0]">
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="documents"
              pageSizeOptions={[8, 16, 24, 32]}
              onPageSizeChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MODALE AJOUT / ÉDITION
          ═════════════════════════════════════════════════════════════════════ */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#d0e4f0] space-y-5">
              <div className="flex items-center justify-between border-b border-[#d0e4f0] pb-4">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  {editingDoc ? "Modifier le document" : "Ajouter un document"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Titre du document *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitre}
                    onChange={(e) => setFormTitre(e.target.value)}
                    placeholder="Ex: Livret OPE 2026 - Promotion Agadez"
                    className="w-full bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f15b29]"
                  />
                </div>

                {/* Type et Année */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Catégorie *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as DocumentType)}
                      className="w-full bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#f15b29] cursor-pointer"
                    >
                      <option value="archive">Archive</option>
                      <option value="talent">Livret Talents</option>
                      <option value="rapport">Rapport d'activité</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Année *
                    </label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2099}
                      value={formAnnee}
                      onChange={(e) => setFormAnnee(parseInt(e.target.value) || currentYear)}
                      className="w-full bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#f15b29]"
                    />
                  </div>
                </div>

                {/* Téléversement Fichier */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Fichier (PDF, Word, Excel, etc.) {!editingDoc && "*"}
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#d0e4f0] hover:border-[#f15b29] rounded-2xl p-5 text-center bg-[#f8fbfe] cursor-pointer transition-all"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="w-10 h-10 rounded-full bg-[#edf4f9] text-[#2F6084] flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>

                    {formFichier ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-600">
                          {formFichier.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {(formFichier.size / 1024 / 1024).toFixed(2)} Mo - Cliquez pour changer
                        </p>
                      </div>
                    ) : editingDoc?.fichier ? (
                      <div>
                        <p className="text-xs font-bold text-gray-700">
                          Fichier actuel : {editingDoc.fichier.split("/").pop()}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Cliquez pour sélectionner un nouveau fichier de remplacement
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-gray-700">
                          Cliquez pour sélectionner un document
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Tous formats acceptés (PDF, DOCX, etc.)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#d0e4f0]">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs text-white bg-[#f15b29] hover:bg-[#d44d1f] disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                  >
                    {isSubmitting && (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{editingDoc ? "Enregistrer" : "Créer le document"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ═════════════════════════════════════════════════════════════════════
          MODALE SUPPRESSION
          ═════════════════════════════════════════════════════════════════════ */}
      {deleteCandidate &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#d0e4f0] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Supprimer ce document ?
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  « {deleteCandidate.titre} » sera définitivement supprimé des archives. Cette action est irréversible.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
                >
                  {isSubmitting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
