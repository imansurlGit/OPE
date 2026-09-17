import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { contactService, type MessageContact } from "../services";
import Pagination from "./Pagination";

export default function AdminContact() {
  const [messages, setMessages] = useState<MessageContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "en_attente" | "traite">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [selectedMessage, setSelectedMessage] = useState<MessageContact | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MessageContact | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formulaire d'édition dans le modal de détail
  const [editTraite, setEditTraite] = useState<boolean>(false);
  const [editReponse, setEditReponse] = useState<string>("");

  // ── Chargement ────────────────────────────────────────────────────────────
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await contactService.getMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      showToast("Impossible de charger les messages de contact. Vérifiez la connexion au serveur.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return messages.filter((m) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "traite" && m.traite === true) ||
        (statusFilter === "en_attente" && !m.traite);

      const matchesSearch =
        q === "" ||
        m.nom.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.sujet.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [messages, statusFilter, searchQuery]);

  // Réinitialiser la page si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Messages paginés
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(start, start + itemsPerPage);
  }, [filteredMessages, currentPage, itemsPerPage]);

  // ── Statistiques ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = messages.length;
    const traites = messages.filter((m) => m.traite).length;
    const enAttente = total - traites;
    const taux = total > 0 ? Math.round((traites / total) * 100) : 0;
    return { total, enAttente, traites, taux };
  }, [messages]);

  // ── Ouvrir modal de consultation ──────────────────────────────────────────
  const openDetailModal = (msg: MessageContact) => {
    setSelectedMessage(msg);
    setEditTraite(Boolean(msg.traite));
    setEditReponse(msg.reponse_interne || "");
  };

  // ── Sauvegarder les modifications d'un message ────────────────────────────
  const handleSaveDetails = async () => {
    if (!selectedMessage) return;
    setIsUpdating(true);
    try {
      const updated = await contactService.updateMessage(selectedMessage.id, {
        traite: editTraite,
        reponse_interne: editReponse,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, ...updated, traite: editTraite, reponse_interne: editReponse } : m))
      );
      setSelectedMessage((prev) => (prev ? { ...prev, ...updated, traite: editTraite, reponse_interne: editReponse } : null));
      showToast(
        editTraite ? "Message marqué comme traité avec succès." : "Statut du message mis à jour.",
        "success"
      );
      setSelectedMessage(null);
    } catch {
      showToast("Erreur lors de la mise à jour du message. Veuillez réessayer.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Basculer rapidement le statut traité ──────────────────────────────────
  const handleToggleTraiteQuick = async (msg: MessageContact, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !msg.traite;
    try {
      await contactService.marquerCommeTraite(msg.id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, traite: newStatus } : m))
      );
      showToast(
        newStatus ? "Message marqué comme traité." : "Message remis en attente.",
        "success"
      );
    } catch {
      showToast("Impossible de modifier le statut. Vérifiez votre connexion.", "error");
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await contactService.deleteMessage(deleteCandidate.id);
      setMessages((prev) => prev.filter((m) => m.id !== deleteCandidate.id));
      showToast("Le message a été supprimé définitivement.", "success");
      setDeleteCandidate(null);
      if (selectedMessage?.id === deleteCandidate.id) {
        setSelectedMessage(null);
      }
    } catch {
      showToast("La suppression a échoué. Veuillez réessayer.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Formatage de date ─────────────────────────────────────────────────────
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date inconnue";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateString;
    }
  };

  // ── Initiales expéditeur ──────────────────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Toast de notification ── */}
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

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Messages & Contact
          </h1>
        </div>
        <button
          type="button"
          onClick={fetchMessages}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-50 border border-[#EFECE6] cursor-pointer shadow-2xs transition-all active:scale-95 disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Actualiser</span>
        </button>
      </div>

      {/* ── Cartes Statistiques ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider block text-gray-500">
            Total Reçus
          </span>
          <span className="text-2xl font-black mt-1 block text-gray-900">{stats.total}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider block text-[#B85028]">
            En attente
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#B85028]">{stats.enAttente}</span>
            {stats.enAttente > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-[#B85028]">
                À traiter
              </span>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider block text-[#1D6353]">
            Traités
          </span>
          <span className="text-2xl font-black mt-1 block text-[#1D6353]">{stats.traites}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider block text-[#1c5d6f]">
            Taux de suivi
          </span>
          <span className="text-2xl font-black mt-1 block text-[#1c5d6f]">{stats.taux}%</span>
        </div>
      </div>

      {/* ── Barre de recherche & Filtres ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email, sujet ou mot-clé..."
            className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B85028]"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "en_attente" | "traite")}
          className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
        >
          <option value="all">Tous les messages ({messages.length})</option>
          <option value="en_attente">En attente ({stats.enAttente})</option>
          <option value="traite">Traités ({stats.traites})</option>
        </select>
      </div>

      {/* ── Contenu / Liste des messages ── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl w-full" />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#B85028] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1">Aucun message trouvé</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
            {searchQuery || statusFilter !== "all"
              ? "Aucun message ne correspond à vos critères de recherche ou de filtre."
              : "Aucun message n'a encore été envoyé via le formulaire de contact du site."}
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 rounded-xl font-bold text-xs text-[#B85028] bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        /* ── Liste des Messages ── */
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedMessages.map((msg) => {
            const isTraite = Boolean(msg.traite);
            return (
              <div
                key={msg.id}
                onClick={() => openDetailModal(msg)}
                className={`group bg-white rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md overflow-hidden ${
                  isTraite
                    ? "border-[#EFECE6] opacity-90 hover:opacity-100"
                    : "border-orange-200/80 shadow-2xs bg-gradient-to-r from-white via-white to-orange-50/20"
                }`}
              >
                {/* Expéditeur & Contenu */}
                <div className="flex items-start gap-3 w-full sm:flex-1 sm:min-w-0">
                  {/* Avatar avec initiales */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${
                      isTraite
                        ? "bg-slate-100 text-slate-600"
                        : "bg-[#B85028]/10 text-[#B85028]"
                    }`}
                  >
                    {getInitials(msg.nom)}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    {/* Nom + Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-extrabold text-sm text-gray-900 break-all sm:truncate">
                        {msg.nom}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                          isTraite
                            ? "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]"
                            : "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]"
                        }`}
                      >
                        {isTraite ? "Traité" : "En attente"}
                      </span>
                    </div>

                    {/* Email */}
                    <p className="text-xs text-gray-400 truncate mb-1">
                      {msg.email}
                    </p>

                    {/* Sujet */}
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 mb-1 truncate">
                      {msg.sujet}
                    </h4>

                    {/* Extrait du message */}
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed break-words">
                      {msg.message}
                    </p>

                    {/* Note interne si existante */}
                    {msg.reponse_interne && (
                      <div className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold text-[#1c5d6f] bg-[#d7f1f7]/50 px-2.5 py-1 rounded-lg border border-[#5ba7be]/20">
                        <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="truncate">Suivi : {msg.reponse_interne}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                    {formatDate(msg.created_at)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Bouton rapide bascule statut */}
                    <button
                      type="button"
                      title={isTraite ? "Marquer comme non traité" : "Marquer comme traité"}
                      onClick={(e) => handleToggleTraiteQuick(msg, e)}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isTraite
                          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          : "text-[#B85028] bg-orange-50 hover:bg-orange-100"
                      }`}
                    >
                      {isTraite ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Bouton Voir détails */}
                    <button
                      type="button"
                      onClick={() => openDetailModal(msg)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#193549] bg-[#EBF2F7] hover:bg-[#C5D8E8] transition-colors cursor-pointer"
                    >
                      Ouvrir
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCandidate(msg);
                      }}
                      className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Supprimer le message"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMessages.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="messages"
            pageSizeOptions={[10, 25, 50]}
            onPageSizeChange={setItemsPerPage}
          />
        </div>
      )}

      {/* ══ MODAL : CONSULTATION & SUIVI DU MESSAGE ══════════════════════════ */}
      {selectedMessage &&
        createPortal(
          <div
            className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedMessage(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 flex flex-col my-auto max-h-[90vh] overflow-hidden animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="p-5 sm:p-6 border-b border-[#EFECE6] flex items-center justify-between bg-[#FAF7F2]">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        editTraite
                          ? "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]"
                          : "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]"
                      }`}
                    >
                      {editTraite ? "Message Traité" : "En attente de traitement"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Reçu le {formatDate(selectedMessage.created_at)}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 truncate">
                    {selectedMessage.sujet}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Corps Modal Scrollable */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
                {/* Expéditeur Info Box */}
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#B85028]/10 text-[#B85028] flex items-center justify-center font-extrabold text-sm shrink-0">
                      {getInitials(selectedMessage.nom)}
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900">{selectedMessage.nom}</div>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-xs text-[#B85028] hover:underline font-medium flex items-center gap-1 mt-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>

                  {/* Bouton Répondre par Email */}
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.sujet)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>Répondre par email</span>
                  </a>
                </div>

                {/* Contenu complet du message */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Message transmis
                  </label>
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] text-gray-800 leading-relaxed whitespace-pre-wrap font-normal">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Section Suivi / Note Interne */}
                <div className="bg-gradient-to-br from-[#FAF7F2] to-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Suivi interne & Traitement
                    </label>

                    {/* Toggle Statut */}
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editTraite}
                        onChange={(e) => setEditTraite(e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                          editTraite ? "bg-emerald-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                            editTraite ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </span>
                      <span className="text-xs font-extrabold text-gray-700">
                        {editTraite ? "Traité" : "Non traité"}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Note de réponse / actions prises par l'équipe :
                    </label>
                    <textarea
                      rows={3}
                      value={editReponse}
                      onChange={(e) => setEditReponse(e.target.value)}
                      placeholder="Ex: Répondu le 16/09 par téléphone, réorienté vers le pôle STEAM..."
                      className="w-full bg-white border border-[#EFECE6] rounded-xl p-3 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B85028]"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-4 sm:p-6 border-t border-[#EFECE6] bg-[#FAF7F2] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteCandidate(selectedMessage);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  Supprimer
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDetails}
                    disabled={isUpdating}
                    className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-all disabled:opacity-50"
                  >
                    {isUpdating ? "Enregistrement..." : "Enregistrer le suivi"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ══ MODAL : CONFIRMATION DE SUPPRESSION ══════════════════════════════ */}
      {deleteCandidate &&
        createPortal(
          <div
            className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setDeleteCandidate(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="font-extrabold text-gray-900 text-base mb-1">Supprimer ce message ?</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le message de{" "}
                <strong className="text-gray-800">{deleteCandidate.nom}</strong> ? Cette action est irréversible.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
