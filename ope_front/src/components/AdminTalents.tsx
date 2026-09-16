import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { talentService, type Candidature } from "../services";
import Pagination from "./Pagination";

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

export default function AdminTalents() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomaine, setSelectedDomaine] = useState<string>("all");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("Toutes");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidature | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Formulaire d'édition dans le modal
  const [editStatut, setEditStatut] = useState<Candidature["statut"]>("admis");
  const [editNote, setEditNote] = useState("");
  const [editScore, setEditScore] = useState<number>(0);

  // Charger les vraies candidatures depuis le service
  const fetchCandidatures = async () => {
    setIsLoading(true);
    try {
      const data = await talentService.getTalents();
      console.log("Candidatures reçues depuis l'API :", data);
      const items = Array.isArray(data) ? data : (data as any)?.results || [];
      setCandidatures(items);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des talents :", err);
      showToast("Impossible de charger les candidatures. Vérifiez votre connexion ou réessayez dans quelques instants.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtrage combiné sur les vraies données
  const filteredCandidatures = useMemo(() => {
    return candidatures.filter((c) => {
      // Filtre Domaine
      if (
        selectedDomaine !== "all" &&
        c.domaine?.toUpperCase() !== selectedDomaine.toUpperCase()
      ) {
        return false;
      }
      // Filtre Statut
      if (
        selectedStatut !== "all" &&
        c.statut?.toLowerCase() !== selectedStatut.toLowerCase()
      ) {
        return false;
      }
      // Filtre Région
      if (
        selectedRegion !== "Toutes" &&
        c.region?.toLowerCase() !== selectedRegion.toLowerCase()
      ) {
        return false;
      }
      // Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${c.prenom || ""} ${c.nom || ""}`.toLowerCase();
        const ref = (c.reference || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        const ville = (c.ville_village || "").toLowerCase();
        const projet = (c.description_projet || "").toLowerCase();
        const house = (c.house_visee || "").toLowerCase();

        return (
          fullName.includes(q) ||
          ref.includes(q) ||
          email.includes(q) ||
          ville.includes(q) ||
          projet.includes(q) ||
          house.includes(q)
        );
      }
      return true;
    });
  }, [candidatures, selectedDomaine, selectedStatut, selectedRegion, searchQuery]);

  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDomaine, selectedStatut, selectedRegion, searchQuery]);

  // Candidatures paginées
  const paginatedCandidatures = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidatures.slice(start, start + itemsPerPage);
  }, [filteredCandidatures, currentPage, itemsPerPage]);

  // Statistiques réelles calculées via le service
  const stats = useMemo(() => {
    return talentService.computeStats(candidatures);
  }, [candidatures]);

  // Ouverture du modal détaillé
  const handleOpenDetail = (cand: Candidature) => {
    setSelectedCandidate(cand);
    setEditStatut(cand.statut);
    setEditNote(cand.note_interne || "");
    setEditScore(cand.score_evaluation || 0);
  };

  // Enregistrement de la décision/mise à jour du statut via le service
  const handleSaveDecision = async () => {
    if (!selectedCandidate) return;

    setIsUpdating(true);
    try {
      const updated = await talentService.updateTalent(selectedCandidate.id, {
        statut: editStatut,
        note_interne: editNote,
        score_evaluation: editScore,
      });

      // Mettre à jour localement
      setCandidatures((prev) =>
        prev.map((c) => (c.id === selectedCandidate.id ? { ...c, ...updated } : c))
      );

      setSelectedCandidate((prev) => (prev ? { ...prev, ...updated } : null));
      showToast(`Le dossier ${selectedCandidate.reference} a bien été mis à jour.`, "success");
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      showToast("L'enregistrement a échoué. Réessayez ou rafraîchissez la page si le problème persiste.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Suppression d'un talent
  const handleDeleteTalent = async () => {
    if (!selectedCandidate) return;
    if (!window.confirm(`Confirmez-vous la suppression du dossier ${selectedCandidate.reference} ?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await talentService.deleteTalent(selectedCandidate.id);
      setCandidatures((prev) => prev.filter((c) => c.id !== selectedCandidate.id));
      setSelectedCandidate(null);
      showToast("Le dossier de candidature a été supprimé définitivement.", "success");
    } catch (err) {
      console.error("Erreur suppression candidature :", err);
      showToast("La suppression a échoué. Le dossier est peut-être déjà retiré ou une erreur réseau s'est produite.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    // Formatage de date ISO → JJ/MM/AAAA
    const fmtDate = (iso?: string) => {
      if (!iso) return "";
      try {
        // date_naissance est déjà YYYY-MM-DD, created_at est ISO 8601
        const d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return iso;
      }
    };

    const fmtSexe = (s?: string) =>
      s === "F" ? "Féminin" : s === "M" ? "Masculin" : s || "";

    const fmtStatut = (s?: string) => {
      switch (s) {
        case "admis": return "Admis";
        case "preselectionne": return "Pré-sélectionné";
        case "en_revue": return "En cours d'examen";
        case "rejete": return "Non retenu";
        case "soumis": return "Soumis";
        default: return s || "";
      }
    };

    const fmtDomaine = (d?: string) => {
      switch (d) {
        case "STEAM": return "House STEAM (Sciences & Technologie)";
        case "LP": return "House LP (Entrepreneuriat Local)";
        case "MCC": return "House MCC (Citoyenneté & Culture)";
        default: return d || "";
      }
    };

    // ── Colonnes ──
    const headers = [
      "N° Dossier",
      "Nom",
      "Prénom",
      "Sexe",
      "Date de Naissance",
      "Maison d'Excellence",
      "Projet / House Spécifique",
      "Région",
      "Ville / Village",
      "Téléphone Candidat",
      "Email",
      "Statut",
      "Score /100",
      "Date d'Inscription",
    ].map((h) => `"${h}"`);

    // ── Lignes de données ──
    const rows = filteredCandidatures.map((c) => [
      `"${c.reference}"`,
      `"${c.nom}"`,
      `"${c.prenom}"`,
      `"${fmtSexe(c.sexe)}"`,
      `"${fmtDate(c.date_naissance)}"`,
      `"${fmtDomaine(c.domaine)}"`,
      `"${c.house_visee || ""}"`,
      `"${c.region || ""}"`,
      `"${c.ville_village || ""}"`,
      `"${c.telephone_candidat || ""}"`,
      `"${c.email}"`,
      `"${fmtStatut(c.statut)}"`,
      c.score_evaluation || 0,
      `"${fmtDate(c.created_at)}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileDate = new Date()
      .toLocaleDateString("fr-FR")
      .replace(/\//g, "-");
    link.setAttribute(
      "download",
      `OPE_1000_Talents_CNCEIZ2026_${fileDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper pour les badges de statut
  const renderStatutBadge = (statut: Candidature["statut"]) => {
    switch (statut) {
      case "admis":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Admis
          </span>
        );
      case "preselectionne":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2F6084] border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6084]" />
            Pré-sélectionné
          </span>
        );
      case "en_revue":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            En examen
          </span>
        );
      case "rejete":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Non retenu
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Soumis
          </span>
        );
    }
  };

  const getDomaineBadge = (domaine: string) => {
    switch (domaine) {
      case "STEAM":
        return "bg-orange-50 text-[#B85028] border-orange-200";
      case "LP":
        return "bg-blue-50 text-[#2F6084] border-blue-200";
      case "MCC":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Toast de notification */}
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

      {/* ── En-tête : Titre & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Les 1000 Talents
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#B85028] text-white shadow-xs">
              {stats.admis} / 1 000 Admis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchCandidatures}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#EFECE6] bg-white text-gray-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Rafraîchir"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin text-[#B85028]" : ""}`}
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
            onClick={handleExportCSV}
            disabled={filteredCandidatures.length === 0}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#B85028] hover:bg-[#9e3f1d] active:scale-95 cursor-pointer shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Exporter CSV ({filteredCandidatures.length})</span>
          </button>
        </div>
      </div>

      {/* ── Cartes Synthétiques ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Admis */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Talents Sélectionnés</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.admis > 0 ? Math.round((stats.admis / 1000) * 100) : 0}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.admis} <span className="text-xs font-bold text-gray-400">/ 1 000</span>
          </p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((stats.admis / 1000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Candidatures Totales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Dossiers Enregistrés</span>
            <span className="text-[11px] font-bold text-[#B85028] bg-orange-50 px-2 py-0.5 rounded-full">
              Base de données
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.total}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {stats.soumis} en attente • {stats.en_revue} en cours
          </p>
        </div>

        {/* Parité Filles / Garçons */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Parité F / G</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Inclusion
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {stats.filles} <span className="text-xs font-bold text-purple-600">F</span> · {stats.garcons} <span className="text-xs font-bold text-blue-600">G</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {stats.total > 0 ? Math.round((stats.filles / stats.total) * 100) : 0}% de filles inscrites
          </p>
        </div>

        {/* Maisons d'Excellence */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Par Maison</span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              3 Piliers
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {stats.steam} <span className="text-xs font-semibold text-gray-400">STEAM</span> · {stats.lp} <span className="text-xs font-semibold text-gray-400">LP</span> · {stats.mcc} <span className="text-xs font-semibold text-gray-400">MCC</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {stats.regionsCount} régions mobilisées
          </p>
        </div>
      </div>

      {/* ── Barre d'Outils : Recherche & Filtres ── */}
      <div className="bg-white p-5 rounded-3xl border border-[#EFECE6] shadow-2xs space-y-4">
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
              placeholder="Rechercher par nom, prénom, n° dossier, ville, projet..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2]/50 text-sm focus:outline-none focus:border-[#B85028] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
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
              className="px-3 py-2.5 rounded-xl border border-[#EFECE6] bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="admis">Admis uniquement</option>
              <option value="preselectionne">Pré-sélectionnés</option>
              <option value="en_revue">En cours d'examen</option>
              <option value="soumis">Dossiers soumis</option>
              <option value="rejete">Non retenus</option>
            </select>

            {/* Région */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#EFECE6] bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
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
                  viewMode === "table" ? "bg-white text-gray-900 shadow-2xs font-black" : "text-gray-500 hover:text-gray-900"
                }`}
                title="Vue Tableau"
              >
                Tableau
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                  viewMode === "cards" ? "bg-white text-gray-900 shadow-2xs font-black" : "text-gray-500 hover:text-gray-900"
                }`}
                title="Vue Cartes"
              >
                Cartes
              </button>
            </div>
          </div>
        </div>

        {/* Pilules de Maisons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EFECE6]/80">
          <span className="text-xs font-bold text-gray-500 mr-1">Maisons :</span>
          {[
            { key: "all", label: "Toutes les maisons", count: stats.total },
            { key: "STEAM", label: "House STEAM", count: stats.steam },
            { key: "LP", label: "House LP", count: stats.lp },
            { key: "MCC", label: "House MCC", count: stats.mcc },
          ].map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setSelectedDomaine(pill.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedDomaine === pill.key
                  ? "bg-[#FAF7F2] text-[#B85028] border-[#B85028] shadow-2xs font-black"
                  : "bg-white text-gray-600 border-[#EFECE6] hover:bg-slate-50"
              }`}
            >
              {pill.label} ({pill.count})
            </button>
          ))}
        </div>
      </div>

      {/* ── Chargement en cours ── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center shadow-2xs flex flex-col items-center justify-center">
          <svg className="w-8 h-8 text-[#B85028] animate-spin mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm font-bold text-gray-900">Chargement des candidatures...</p>
          <p className="text-xs text-gray-400 mt-0.5">Interrogation de la table candidature en cours</p>
        </div>
      ) : filteredCandidatures.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#B85028] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900">Aucune candidature trouvée</p>
          <p className="text-xs text-gray-400 mt-1">
            {candidatures.length === 0
              ? "Aucune candidature n'est encore enregistrée dans la base de données."
              : "Aucun profil ne correspond aux critères de recherche sélectionnés."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        /* ── Vue 1 : TABLEAU MODERNE DES VRAIS TALENTS ── */
        <div className="bg-white rounded-3xl border border-[#EFECE6] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EFECE6] text-[11px] font-black uppercase text-gray-500 tracking-wider">
                  <th className="py-3.5 px-4">Talent / Candidat</th>
                  <th className="py-3.5 px-4">Réf. Dossier</th>
                  <th className="py-3.5 px-4">Maison & Projet</th>
                  <th className="py-3.5 px-4">Origine</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]/80 font-medium text-gray-700">
                {paginatedCandidatures.map((cand) => (
                  <tr
                    key={cand.id || cand.reference}
                    className="hover:bg-[#FAF7F2]/60 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(cand)}
                  >
                    {/* Nom & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B85028] to-[#2F6084] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {cand.prenom?.charAt(0) || ""}{cand.nom?.charAt(0) || ""}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-sm group-hover:text-[#B85028] transition-colors">
                            {cand.prenom} {cand.nom}
                          </p>
                          <p className="text-[11px] text-gray-400">{cand.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Référence */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-[#2F6084] bg-blue-50/70 px-2 py-0.5 rounded-md border border-blue-100">
                        {cand.reference}
                      </span>
                    </td>

                    {/* Maison & House */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${getDomaineBadge(cand.domaine)}`}>
                          {cand.domaine}
                        </span>
                        <p className="text-xs font-semibold text-gray-800 truncate" title={cand.house_visee}>
                          {cand.house_visee || "—"}
                        </p>
                      </div>
                    </td>

                    {/* Origine */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900">{cand.region || "—"}</p>
                      <p className="text-[11px] text-gray-400">{cand.ville_village || "—"}</p>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-black text-sm text-gray-900">
                        {cand.score_evaluation || "—"}
                      </span>
                      <span className="text-[10px] text-gray-400">/100</span>
                    </td>

                    {/* Statut */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStatutBadge(cand.statut)}
                    </td>

                    {/* Bouton Voir */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(cand);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[#EFECE6] bg-white hover:bg-[#FAF7F2] text-[#B85028] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer"
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
        /* ── Vue 2 : CARTES EN GRILLE ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {paginatedCandidatures.map((cand) => (
            <div
              key={cand.id || cand.reference}
              onClick={() => handleOpenDetail(cand)}
              className="bg-white p-5 rounded-3xl border border-[#EFECE6] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] text-[#B85028] flex items-center justify-center font-black text-sm shrink-0">
                      {cand.prenom?.charAt(0) || ""}{cand.nom?.charAt(0) || ""}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-[#B85028] transition-colors">
                        {cand.prenom} {cand.nom}
                      </h3>
                      <span className="font-mono text-[11px] font-semibold text-[#2F6084]">
                        {cand.reference}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${getDomaineBadge(cand.domaine)}`}>
                    {cand.domaine}
                  </span>
                </div>

                <div className="space-y-1.5 my-3">
                  <p className="text-xs font-bold text-gray-800 line-clamp-1">
                    {cand.house_visee || "Projet en cours"}
                  </p>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {cand.description_projet || cand.motivation || "Aucune description"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFECE6]/80 flex items-center justify-between mt-2">
                <div className="text-[11px] font-semibold text-gray-400">
                  <span>{cand.region}</span> · <span>{cand.ville_village}</span>
                </div>
                {renderStatutBadge(cand.statut)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredCandidatures.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCandidatures.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="talents"
          pageSizeOptions={[10, 25, 50]}
          onPageSizeChange={setItemsPerPage}
        />
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MODAL DE FICHE COMPLÈTE DU TALENT (ÉVALUATION & VALIDATION)
          ═════════════════════════════════════════════════════════════════════ */}
      {selectedCandidate && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#EFECE6] overflow-hidden my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Entête Modal */}
            <div className="p-5 sm:p-6 bg-[#FAF7F2] border-b border-[#EFECE6] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#B85028] text-white flex items-center justify-center font-black text-base shadow-sm">
                  {selectedCandidate.prenom?.charAt(0) || ""}{selectedCandidate.nom?.charAt(0) || ""}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900">
                      {selectedCandidate.prenom} {selectedCandidate.nom}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${getDomaineBadge(selectedCandidate.domaine)}`}>
                      {selectedCandidate.domaine}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    Dossier N° {selectedCandidate.reference} • Région de {selectedCandidate.region}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#EFECE6] flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenu Déroulant Modal */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs text-gray-700">
              {/* 1. État d'admission & Note Jury */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm">Décision du Jury & Statut Officiel</span>
                  {renderStatutBadge(editStatut)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Modifier le statut :
                    </label>
                    <select
                      value={editStatut}
                      onChange={(e) => setEditStatut(e.target.value as Candidature["statut"])}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-xs focus:border-[#B85028] focus:outline-none cursor-pointer"
                    >
                      <option value="admis">Admis au Camp National (Les 1 000)</option>
                      <option value="preselectionne">Pré-sélectionné (Pré-camp)</option>
                      <option value="en_revue">En cours d'examen</option>
                      <option value="soumis">Dossier soumis</option>
                      <option value="rejete">Non retenu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Score Jury / 100 :
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editScore}
                      onChange={(e) => setEditScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-xs focus:border-[#B85028] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
                    Remarques internes / Notes d'évaluation :
                  </label>
                  <textarea
                    rows={2}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Observations du comité de sélection..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#B85028] focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Identité & Coordonnées */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#B85028] mb-3 pb-1 border-b border-[#EFECE6]">
                  1. Identité & Origine
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Sexe & Âge</span>
                    <span className="font-bold text-gray-900">
                      {selectedCandidate.sexe === "F" ? "Féminin" : "Masculin"} ({selectedCandidate.date_naissance || "—"})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Région</span>
                    <span className="font-bold text-gray-900">{selectedCandidate.region || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Ville / Village</span>
                    <span className="font-bold text-gray-900">{selectedCandidate.ville_village || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Téléphone</span>
                    <span className="font-bold text-gray-900">{selectedCandidate.telephone_candidat || "Non renseigné"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Email</span>
                    <span className="font-bold text-gray-900">{selectedCandidate.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Tuteur / Parent</span>
                    <span className="font-bold text-gray-900">{selectedCandidate.telephone_tuteur || "Majeur"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Établissement / Classe</span>
                    <span className="font-bold text-gray-900">
                      {selectedCandidate.etablissement || "—"} ({selectedCandidate.classe || "—"})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Point Focal OPE</span>
                    <span className="font-bold text-gray-900">{selectedCandidate.point_focal || "Direct"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Accès numérique</span>
                    <span className="font-bold text-gray-900">{selectedCandidate.acces_numerique || "Non renseigné"}</span>
                  </div>
                </div>

                {selectedCandidate.biographie && (
                  <div className="mt-3 p-3 rounded-xl bg-[#FAF7F2]/60 border border-[#EFECE6]">
                    <span className="text-gray-400 block text-[10px] font-bold">Biographie :</span>
                    <p className="text-xs text-gray-700 mt-0.5">{selectedCandidate.biographie}</p>
                  </div>
                )}
              </div>

              {/* 3. Projet & House */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#2F6084] mb-3 pb-1 border-b border-[#EFECE6]">
                  2. House visée & Projet de Candidature
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 block text-[10px]">House Spécifique</span>
                      <span className="font-extrabold text-gray-900 text-sm">{selectedCandidate.house_visee || "Non spécifiée"}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2F6084] font-bold text-xs border border-blue-100">
                      {selectedCandidate.statut_projet || "En cours"}
                    </span>
                  </div>

                  {selectedCandidate.description_projet && (
                    <div className="p-3.5 rounded-xl bg-white border border-[#EFECE6]">
                      <span className="text-gray-400 block text-[10px] font-bold">Description du projet :</span>
                      <p className="text-xs text-gray-800 mt-1 leading-relaxed whitespace-pre-line">
                        {selectedCandidate.description_projet}
                      </p>
                    </div>
                  )}

                  {selectedCandidate.motivation && (
                    <div className="p-3.5 rounded-xl bg-white border border-[#EFECE6]">
                      <span className="text-gray-400 block text-[10px] font-bold">Motivation pour Agadez 2026 :</span>
                      <p className="text-xs text-gray-800 mt-1 leading-relaxed whitespace-pre-line">
                        {selectedCandidate.motivation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pied Modal : Actions */}
            <div className="p-4 sm:p-5 bg-white border-t border-[#EFECE6] flex items-center justify-between shrink-0">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTalent}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs transition-colors cursor-pointer"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSaveDecision}
                  className="px-5 py-2 rounded-xl bg-[#B85028] hover:bg-[#9e3f1d] active:scale-95 text-white font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {isUpdating ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <span>Enregistrer la décision</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
