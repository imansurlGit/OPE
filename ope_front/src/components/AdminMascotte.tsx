import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  getCandidaturesMascotte,
  updateCandidatureMascotte,
  deleteCandidatureMascotte,
  type CandidatMascotteItem,
} from "../services/mascotteApi";
import Pagination from "./Pagination";
import AddMascotteModal from "./AddMascotteModal";

const REGIONS = [
  "Toutes",
  "Agadez",
  "Diffa",
  "Dosso",
  "Maradi",
  "Niamey",
  "Tahoua",
  "Tillabéri",
  "Zinder",
];

const CLASSES = ["Toutes", "6e", "5e", "4e", "3e"];

export default function AdminMascotte() {
  const [candidatures, setCandidatures] = useState<CandidatMascotteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [selectedClasse, setSelectedClasse] = useState<string>("Toutes");
  const [selectedRegion, setSelectedRegion] = useState<string>("Toutes");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [selectedCandidate, setSelectedCandidate] = useState<CandidatMascotteItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidateTarget, setDeleteCandidateTarget] = useState<CandidatMascotteItem | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCandidatures = async () => {
    setIsLoading(true);
    try {
      const data = await getCandidaturesMascotte();
      setCandidatures(data);
    } catch (err: any) {
      console.error("Erreur récupération candidats mascotte :", err);
      showToast("Impossible de charger les candidatures du concours mascotte.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatures();
  }, []);

  // Statistiques en direct calquées sur AdminTalents
  const stats = useMemo(() => {
    const total = candidatures.length;
    const valides = candidatures.filter((c) => c.statut === "valide").length;
    const enAttente = candidatures.filter((c) => c.statut === "en_attente").length;
    const rejetes = candidatures.filter((c) => c.statut === "rejete").length;
    return { total, valides, enAttente, rejetes };
  }, [candidatures]);

  // Filtrage combiné
  const filteredCandidatures = useMemo(() => {
    return candidatures.filter((c) => {
      if (selectedStatut !== "all" && c.statut !== selectedStatut) return false;
      if (selectedClasse !== "Toutes" && c.classe !== selectedClasse) return false;
      if (
        selectedRegion !== "Toutes" &&
        !c.region_ville?.toLowerCase().includes(selectedRegion.toLowerCase())
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${c.prenom || ""} ${c.nom || ""}`.toLowerCase();
        const ref = (c.reference || "").toLowerCase();
        const mascotte = (c.mascotte_nom || "").toLowerCase();
        const etablissement = (c.etablissement || "").toLowerCase();
        const tuteur = (c.nom_tuteur || "").toLowerCase();
        const tel = (c.telephone_tuteur || "").toLowerCase();

        return (
          fullName.includes(q) ||
          ref.includes(q) ||
          mascotte.includes(q) ||
          etablissement.includes(q) ||
          tuteur.includes(q) ||
          tel.includes(q)
        );
      }

      return true;
    });
  }, [candidatures, selectedStatut, selectedClasse, selectedRegion, searchQuery]);

  // Reset pagination au filtrage
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatut, selectedClasse, selectedRegion, itemsPerPage]);

  const paginatedCandidatures = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidatures.slice(start, start + itemsPerPage);
  }, [filteredCandidatures, currentPage, itemsPerPage]);

  // Mise à jour du statut
  const handleUpdateStatut = async (
    candidateId: number,
    newStatut: "en_attente" | "valide" | "rejete"
  ) => {
    setIsUpdating(true);
    try {
      const updated = await updateCandidatureMascotte(candidateId, { statut: newStatut });
      setCandidatures((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, statut: updated.statut } : c))
      );
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate((prev) => (prev ? { ...prev, statut: updated.statut } : null));
      }
      showToast(
        `Dossier mis à jour : ${newStatut === "valide" ? "Validé" : newStatut === "rejete" ? "Rejeté" : "En attente"}.`,
        "success"
      );
    } catch (err: any) {
      console.error("Erreur mise à jour statut mascotte :", err);
      showToast("La mise à jour du statut a échoué.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Suppression
  const handleDeleteConfirm = async () => {
    if (!deleteCandidateTarget) return;
    setIsDeleting(true);
    try {
      await deleteCandidatureMascotte(deleteCandidateTarget.id);
      setCandidatures((prev) => prev.filter((c) => c.id !== deleteCandidateTarget.id));
      if (selectedCandidate?.id === deleteCandidateTarget.id) {
        setSelectedCandidate(null);
      }
      showToast("Le dossier de candidature a été supprimé définitivement.", "success");
      setDeleteCandidateTarget(null);
    } catch (err: any) {
      console.error("Erreur suppression candidat mascotte :", err);
      showToast("La suppression a échoué. Réessayez dans un instant.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Excel identique à AdminTalents
  const handleExportExcel = () => {
    import("xlsx").then((XLSX) => {
      const fmtDate = (iso?: string | null) => {
        if (!iso) return "";
        try {
          const d = new Date(iso);
          if (isNaN(d.getTime())) return iso;
          return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        } catch {
          return iso;
        }
      };

      const fmtStatut = (s?: string) => {
        switch (s) {
          case "valide":
            return "Validé";
          case "rejete":
            return "Rejeté";
          case "en_attente":
          default:
            return "En attente";
        }
      };

      const COLS = [
        "N° Dossier",
        "Nom",
        "Prénom",
        "Classe",
        "Collège / Établissement",
        "Région / Ville",
        "Nom de la Mascotte",
        "Pourquoi ce nom",
        "Signification / Message",
        "Parent / Tuteur",
        "Téléphone Tuteur",
        "Statut",
        "Date d'inscription",
      ];

      const dataRows = filteredCandidatures.map((c) => [
        c.reference,
        c.nom,
        c.prenom,
        c.classe,
        c.etablissement || "Non renseigné",
        c.region_ville || "Agadez",
        c.mascotte_nom,
        c.mascotte_pourquoi || "",
        c.mascotte_signification || "",
        c.nom_tuteur,
        c.telephone_tuteur,
        fmtStatut(c.statut),
        fmtDate(c.created_at),
      ]);

      const ws = XLSX.utils.aoa_to_sheet([COLS, ...dataRows]);

      const colWidths = COLS.map((col, idx) => {
        const maxLen = Math.max(
          col.length,
          ...dataRows.map((row) => String(row[idx] || "").length)
        );
        return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Candidats Mascotte");

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      XLSX.writeFile(wb, `Candidats_Mascotte_CNCEIZ_2026_${dateStr}.xlsx`);
      showToast("Fichier Excel exporté avec succès.", "success");
    }).catch((err) => {
      console.error("Erreur export Excel mascotte :", err);
      showToast("Impossible d'exporter le fichier Excel.", "error");
    });
  };

  const renderStatutBadge = (statut: string) => {
    switch (statut) {
      case "valide":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Validé
          </span>
        );
      case "rejete":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejeté
          </span>
        );
      case "en_attente":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast Notification calqué sur AdminTalents */}
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
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* ── En-tête : Titre & Actions (Identique AdminTalents) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Concours Mascotte
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#f15b29] text-white shadow-xs">
              {stats.valides} Validé{stats.valides > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#193549] hover:bg-[#122838] active:scale-95 cursor-pointer shadow-xs transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-[#f15b29]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Ajouter un candidat</span>
          </button>

          <button
            type="button"
            onClick={fetchCandidatures}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#d0e4f0] bg-white text-gray-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Rafraîchir"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin text-[#f15b29]" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={filteredCandidatures.length === 0}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Exporter Excel ({filteredCandidatures.length})</span>
          </button>
        </div>
      </div>

      {/* ── Cartes Synthétiques (Identique AdminTalents) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Inscrits */}
        <div
          onClick={() => setSelectedStatut("all")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer shadow-2xs ${
            selectedStatut === "all"
              ? "bg-[#f4f8fb] border-[#f15b29] ring-1 ring-[#f15b29]"
              : "bg-white border-[#d0e4f0] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Dossiers Mascotte</span>
            <span className="text-[11px] font-bold text-[#2F6084] bg-[#edf4f9] px-2 py-0.5 rounded-full">
              Base Junior
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.total}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {stats.valides} validés · {stats.enAttente} en attente
          </p>
        </div>

        {/* Validés */}
        <div
          onClick={() => setSelectedStatut("valide")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer shadow-2xs ${
            selectedStatut === "valide"
              ? "bg-[#f4f8fb] border-emerald-500 ring-1 ring-emerald-500"
              : "bg-white border-[#d0e4f0] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Dessins Validés</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.total > 0 ? Math.round((stats.valides / stats.total) * 100) : 0}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.valides}
          </p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${stats.total > 0 ? Math.min((stats.valides / stats.total) * 100, 100) : 0}%` }}
            />
          </div>
        </div>

        {/* En attente */}
        <div
          onClick={() => setSelectedStatut("en_attente")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer shadow-2xs ${
            selectedStatut === "en_attente"
              ? "bg-[#f4f8fb] border-amber-500 ring-1 ring-amber-500"
              : "bg-white border-[#d0e4f0] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>En Attente d'Examen</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              À traiter
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.enAttente}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            Dessins nécessitant une revue
          </p>
        </div>

        {/* Rejetés */}
        <div
          onClick={() => setSelectedStatut("rejete")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer shadow-2xs ${
            selectedStatut === "rejete"
              ? "bg-[#f4f8fb] border-rose-500 ring-1 ring-rose-500"
              : "bg-white border-[#d0e4f0] hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Dossiers Non Retenus</span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              Rejetés
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.rejetes}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            Non conformes au règlement
          </p>
        </div>
      </div>

      {/* ── Barre d'Outils : Recherche & Filtres (Exactement comme AdminTalents) ── */}
      <div className="bg-white p-5 rounded-3xl border border-[#d0e4f0] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Champ Recherche */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, prénom, mascotte, collège, réf..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d0e4f0] bg-[#f4f8fb]/50 text-sm focus:outline-none focus:border-[#f15b29] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtres déroulants : Statut, Région & Mode Vue */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Statut */}
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#d0e4f0] bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-[#f15b29] cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="valide">Validés</option>
              <option value="en_attente">En attente</option>
              <option value="rejete">Rejetés</option>
            </select>

            {/* Région */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#d0e4f0] bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-[#f15b29] cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r === "Toutes" ? "Toutes les régions" : `Région ${r}`}
                </option>
              ))}
            </select>

            {/* Sélecteur Mode : Table / Cartes */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-2xs font-black"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Vue Tableau"
              >
                Tableau
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-gray-900 shadow-2xs font-black"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                title="Vue Cartes"
              >
                Cartes
              </button>
            </div>
          </div>
        </div>

        {/* Pilules de Classes */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#d0e4f0]/80">
          <span className="text-xs font-bold text-gray-500 mr-1">Classes :</span>
          {CLASSES.map((cls) => {
            const count =
              cls === "Toutes"
                ? candidatures.length
                : candidatures.filter((c) => c.classe === cls).length;
            const isSelected = selectedClasse === cls;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClasse(cls)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#f4f8fb] text-[#f15b29] border-[#f15b29] shadow-2xs font-black"
                    : "bg-white text-gray-600 border-[#d0e4f0] hover:bg-slate-50"
                }`}
              >
                {cls === "Toutes" ? "Toutes les classes" : `Classe de ${cls}`} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contenu Principal (Tableau / Cartes) ── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#d0e4f0] p-12 text-center shadow-2xs flex flex-col items-center justify-center">
          <svg className="w-8 h-8 text-[#f15b29] animate-spin mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="text-slate-200" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="text-[#f15b29]" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm font-bold text-gray-900">Chargement des candidats mascotte...</p>
          <p className="text-xs text-gray-400 mt-0.5">Interrogation de la base de données en cours</p>
        </div>
      ) : filteredCandidatures.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d0e4f0] p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#edf4f9] text-[#2F6084] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900">Aucun candidat trouvé</p>
          <p className="text-xs text-gray-400 mt-1">
            {candidatures.length === 0
              ? "Aucune candidature de mascotte n'est encore enregistrée."
              : "Aucun dossier ne correspond aux filtres de recherche."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* ── Vue 1 : TABLEAU IDENTIQUE ADMIN TALENTS ── */
        <div className="bg-white rounded-3xl border border-[#d0e4f0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f4f8fb] border-b border-[#d0e4f0] text-[11px] font-black uppercase text-gray-500 tracking-wider">
                  <th className="py-3.5 px-4">Candidat (Junior)</th>
                  <th className="py-3.5 px-4">Réf. Dossier</th>
                  <th className="py-3.5 px-4">Mascotte proposée</th>
                  <th className="py-3.5 px-4">Dessin</th>
                  <th className="py-3.5 px-4">Collège & Origine</th>
                  <th className="py-3.5 px-4">Tuteur légal</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0e4f0]/80 font-medium text-gray-700">
                {paginatedCandidatures.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-[#f4f8fb]/60 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    {/* Nom & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f15b29] to-[#2F6084] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {candidate.prenom?.charAt(0) || ""}{candidate.nom?.charAt(0) || ""}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-sm group-hover:text-[#f15b29] transition-colors">
                            {candidate.prenom} {candidate.nom}
                          </p>
                          <p className="text-[11px] text-gray-400">Classe de {candidate.classe}</p>
                        </div>
                      </div>
                    </td>

                    {/* Référence */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#2F6084] bg-blue-50/70 px-2 py-0.5 rounded-md border border-blue-100">
                        {candidate.reference}
                      </span>
                    </td>

                    {/* Nom Mascotte */}
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-[#f15b29] text-xs">
                        {candidate.mascotte_nom}
                      </p>
                      {candidate.mascotte_pourquoi && (
                        <p className="text-[11px] text-gray-500 truncate max-w-[200px]" title={candidate.mascotte_pourquoi}>
                          {candidate.mascotte_pourquoi}
                        </p>
                      )}
                    </td>

                    {/* Dessin miniature */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {candidate.mascotte_dessin ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={candidate.mascotte_dessin}
                            alt="Dessin"
                            className="w-9 h-9 object-cover rounded-lg border border-[#d0e4f0] shadow-2xs bg-white"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <a
                            href={candidate.mascotte_dessin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-bold text-[#f15b29] hover:underline"
                          >
                            Ouvrir
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Non joint</span>
                      )}
                    </td>

                    {/* Collège & Origine */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900">{candidate.region_ville || "Agadez"}</p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[160px]">
                        {candidate.etablissement || "Collège non précisé"}
                      </p>
                    </td>

                    {/* Tuteur */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-gray-800">{candidate.nom_tuteur}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{candidate.telephone_tuteur}</p>
                    </td>

                    {/* Statut */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatutBadge(candidate.statut)}
                    </td>

                    {/* Bouton Consulter */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(candidate);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[#d0e4f0] bg-white hover:bg-[#f4f8fb] text-[#f15b29] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      >
                        Consulter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Vue 2 : CARTES EN GRILLE (Identique AdminTalents) ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedCandidatures.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate)}
              className="bg-white p-5 rounded-3xl border border-[#d0e4f0] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f4f8fb] border border-[#d0e4f0] text-[#f15b29] flex items-center justify-center font-black text-sm shrink-0">
                      {candidate.prenom?.charAt(0) || ""}{candidate.nom?.charAt(0) || ""}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-[#f15b29] transition-colors">
                        {candidate.prenom} {candidate.nom}
                      </h3>
                      <span className="font-mono text-[11px] font-semibold text-[#2F6084]">
                        {candidate.reference}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase border bg-blue-50 text-blue-700 border-blue-200">
                    Classe {candidate.classe}
                  </span>
                </div>

                {/* Cadre dessin */}
                <div className="w-full h-36 rounded-2xl bg-[#f4f8fb] border border-[#d0e4f0] flex items-center justify-center overflow-hidden my-3 relative">
                  {candidate.mascotte_dessin ? (
                    <img
                      src={candidate.mascotte_dessin}
                      alt={candidate.mascotte_nom}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">Aucun aperçu</span>
                  )}
                </div>

                <div className="space-y-1 my-2">
                  <p className="text-xs font-bold text-[#f15b29] truncate">
                    Mascotte : {candidate.mascotte_nom}
                  </p>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {candidate.mascotte_pourquoi || candidate.mascotte_signification || "Aucune description saisie"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d0e4f0]/80 flex items-center justify-between mt-2">
                <div className="text-[11px] font-semibold text-gray-400">
                  <span>{candidate.region_ville || "Agadez"}</span> ·{" "}
                  <span>{candidate.etablissement || "Collège"}</span>
                </div>
                {renderStatutBadge(candidate.statut)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {filteredCandidatures.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCandidatures.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="candidats"
          pageSizeOptions={[10, 25, 50]}
          onPageSizeChange={setItemsPerPage}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          MODAL DE FICHE COMPLÈTE DU CANDIDAT (Identique AdminTalents)
          ═══════════════════════════════════════════════════════ */}
      {selectedCandidate &&
        createPortal(
          <div
            className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedCandidate(null)}
          >
            <div
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#d0e4f0] overflow-hidden my-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Entête Modal */}
              <div className="p-5 sm:p-6 bg-[#f4f8fb] border-b border-[#d0e4f0] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f15b29] text-white flex items-center justify-center font-black text-base shadow-sm">
                    {selectedCandidate.prenom?.charAt(0) || ""}{selectedCandidate.nom?.charAt(0) || ""}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-gray-900">
                        {selectedCandidate.prenom} {selectedCandidate.nom}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase border bg-blue-50 text-blue-700 border-blue-200">
                        Classe de {selectedCandidate.classe}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      Dossier N° {selectedCandidate.reference} · {selectedCandidate.region_ville || "Agadez"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#d0e4f0] flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Corps Modal */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Dessin et Détails de la mascotte */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                      Aperçu du Dessin
                    </span>
                    <div className="w-full h-56 rounded-2xl bg-[#f4f8fb] border border-[#d0e4f0] flex items-center justify-center overflow-hidden p-2">
                      {selectedCandidate.mascotte_dessin ? (
                        <img
                          src={selectedCandidate.mascotte_dessin}
                          alt={selectedCandidate.mascotte_nom}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">Aucun fichier</span>
                      )}
                    </div>
                    {selectedCandidate.mascotte_dessin && (
                      <a
                        href={selectedCandidate.mascotte_dessin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#f15b29] hover:underline"
                      >
                        <span>Ouvrir l'image originale</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#f4f8fb] border border-[#d0e4f0]">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">
                        Nom proposé pour la mascotte
                      </span>
                      <p className="text-base font-black text-[#f15b29] mt-0.5">
                        {selectedCandidate.mascotte_nom}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#f4f8fb] border border-[#d0e4f0]">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">
                        Pourquoi ce nom ?
                      </span>
                      <p className="text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedCandidate.mascotte_pourquoi || "Non précisé"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#f4f8fb] border border-[#d0e4f0]">
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">
                        Signification & Message
                      </span>
                      <p className="text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedCandidate.mascotte_signification || "Non précisé"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Représentant Légal & Établissement */}
                <div className="p-4 rounded-2xl bg-white border border-[#d0e4f0] space-y-3">
                  <span className="text-[11px] font-black uppercase text-[#2F6084] tracking-wider block border-b border-[#d0e4f0] pb-2">
                    Coordonnées & Établissement Scolaire
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Établissement :</span>{" "}
                      <strong className="text-gray-900">{selectedCandidate.etablissement || "Non renseigné"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Région / Ville :</span>{" "}
                      <strong className="text-gray-900">{selectedCandidate.region_ville || "Agadez"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Parent / Tuteur légal :</span>{" "}
                      <strong className="text-gray-900">{selectedCandidate.nom_tuteur}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Téléphone contact :</span>{" "}
                      <strong className="text-[#f15b29] font-mono">{selectedCandidate.telephone_tuteur}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied de Modal (Actions Décision) */}
              <div className="p-5 bg-[#f4f8fb] border-t border-[#d0e4f0] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Statut :</span>
                  {renderStatutBadge(selectedCandidate.statut)}
                </div>

                <div className="flex items-center gap-2">
                  {selectedCandidate.statut !== "valide" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatut(selectedCandidate.id, "valide")}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Valider le dossier
                    </button>
                  )}

                  {selectedCandidate.statut !== "rejete" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatut(selectedCandidate.id, "rejete")}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      Rejeter
                    </button>
                  )}

                  {selectedCandidate.statut !== "en_attente" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatut(selectedCandidate.id, "en_attente")}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-xl border border-[#d0e4f0] bg-white text-gray-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      Remettre en attente
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteCandidateTarget(selectedCandidate)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer ml-1"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ═══════════════════════════════════════════════════════
          MODAL DE CONFIRMATION DE SUPPRESSION
          ═══════════════════════════════════════════════════════ */}
      {deleteCandidateTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setDeleteCandidateTarget(null)}
          >
            <div
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#d0e4f0]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-base font-extrabold text-gray-900 text-center">
                Supprimer cette candidature ?
              </h3>
              <p className="text-xs text-gray-500 text-center mt-2">
                Confirmez-vous la suppression du dossier{" "}
                <strong>{deleteCandidateTarget.reference}</strong> ({deleteCandidateTarget.prenom}{" "}
                {deleteCandidateTarget.nom}) ? Cette action est irréversible.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteCandidateTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-[#d0e4f0] text-gray-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:bg-slate-300"
                >
                  {isDeleting ? "Suppression..." : "Supprimer définitivement"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ═══════════════════════════════════════════════════════
          MODAL D'AJOUT D'UN CANDIDAT PAR L'ADMINISTRATEUR
          ═══════════════════════════════════════════════════════ */}
      <AddMascotteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newCandidate) => {
          setCandidatures((prev) => [newCandidate, ...prev]);
          showToast(`Candidat ${newCandidate.prenom} ${newCandidate.nom} ajouté avec succès !`, "success");
        }}
      />
    </div>
  );
}
