import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { actualiteService, type Actualite, type ActualitePhase } from "../services";
import Pagination from "./Pagination";

const PHASES_CONFIG: Record<
  ActualitePhase,
  { label: string; badgeClass: string; bgSoft: string; textColor: string }
> = {
  avant: {
    label: "Avant le camp",
    badgeClass: "bg-[#EBF2F7] text-[#193549] border-[#C5D8E8]",
    bgSoft: "bg-[#EBF2F7]/50",
    textColor: "text-[#193549]",
  },
  pendant: {
    label: "Pendant le camp",
    badgeClass: "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]",
    bgSoft: "bg-[#FDF3EE]/50",
    textColor: "text-[#B85028]",
  },
  apres: {
    label: "Après le camp",
    badgeClass: "bg-[#F0ECE8] text-[#6B4533] border-[#D9C4B8]",
    bgSoft: "bg-[#F0ECE8]/50",
    textColor: "text-[#6B4533]",
  },
};

export default function AdminActualites() {
  const [articles, setArticles] = useState<Actualite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Actualite | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Actualite | null>(null);
  const [previewArticle, setPreviewArticle] = useState<Actualite | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitre, setFormTitre] = useState("");
  const [formPhase, setFormPhase] = useState<ActualitePhase>("avant");
  const [formBadge, setFormBadge] = useState("OFFICIEL");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formTempsLecture, setFormTempsLecture] = useState(3);
  const [formResume, setFormResume] = useState("");
  const [formContenu, setFormContenu] = useState("");
  const [formPublie, setFormPublie] = useState(true);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Charger les articles depuis l'API
  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const data = await actualiteService.getArticles();
      const items = Array.isArray(data) ? data : (data as any)?.results || [];
      setArticles(items);
    } catch (err: any) {
      console.error("Erreur chargement actualités :", err);
      showToast("Impossible de charger les articles. Vérifiez votre connexion ou réessayez dans quelques instants.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtrage combiné en temps réel
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((a) => {
      const matchesPhase = selectedPhase === "all" || a.phase === selectedPhase;
      const matchesStatut =
        selectedStatut === "all" ||
        (selectedStatut === "publie" && a.publie) ||
        (selectedStatut === "brouillon" && !a.publie);
      const matchesSearch =
        q === "" ||
        a.titre.toLowerCase().includes(q) ||
        a.resume.toLowerCase().includes(q) ||
        a.badge_label.toLowerCase().includes(q) ||
        a.contenu.toLowerCase().includes(q);

      return matchesPhase && matchesStatut && matchesSearch;
    });
  }, [articles, selectedPhase, selectedStatut, searchQuery]);

  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPhase, selectedStatut, searchQuery]);

  // Articles paginés
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredArticles.slice(start, start + itemsPerPage);
  }, [filteredArticles, currentPage, itemsPerPage]);

  // Statistiques rapides
  const stats = useMemo(() => {
    const total = articles.length;
    const publies = articles.filter((a) => a.publie).length;
    const brouillons = total - publies;
    const avant = articles.filter((a) => a.phase === "avant").length;
    const pendant = articles.filter((a) => a.phase === "pendant").length;
    const apres = articles.filter((a) => a.phase === "apres").length;
    return { total, publies, brouillons, avant, pendant, apres };
  }, [articles]);

  // Ouvrir modal création
  const openCreateModal = () => {
    setEditingArticle(null);
    setFormTitre("");
    setFormPhase("avant");
    setFormBadge("OFFICIEL");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTempsLecture(3);
    setFormResume("");
    setFormContenu("");
    setFormPublie(true);
    setFormImageFile(null);
    setImagePreviewUrl(null);
    setIsModalOpen(true);
  };

  // Ouvrir modal édition
  const openEditModal = (article: Actualite) => {
    setEditingArticle(article);
    setFormTitre(article.titre);
    setFormPhase(article.phase);
    setFormBadge(article.badge_label);
    setFormDate(article.date_publication || new Date().toISOString().slice(0, 10));
    setFormTempsLecture(article.temps_lecture || 3);
    setFormResume(article.resume);
    setFormContenu(article.contenu);
    setFormPublie(article.publie);
    setFormImageFile(null);
    setImagePreviewUrl(article.image_principale || null);
    setIsModalOpen(true);
  };

  // Gérer la sélection d'une image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Soumission Formulaire (Créer ou Modifier)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitre.trim()) {
      showToast("Veuillez renseigner un titre pour l'article avant de continuer.", "error");
      return;
    }
    if (!formResume.trim()) {
      showToast("Le résumé est obligatoire. Il apparaîtra comme accroche sur la page des actualités.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("titre", formTitre.trim());
      formData.append("phase", formPhase);
      formData.append("badge_label", formBadge.trim().toUpperCase());
      formData.append("date_publication", formDate);
      formData.append("temps_lecture", String(formTempsLecture));
      formData.append("resume", formResume.trim());
      formData.append("contenu", formContenu.trim() || formResume.trim());
      formData.append("publie", formPublie ? "true" : "false");

      if (formImageFile) {
        formData.append("image_principale", formImageFile);
      }

      if (editingArticle) {
        const updated = await actualiteService.updateArticle(editingArticle.id, formData);
        setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        showToast("Les modifications ont bien été enregistrées.", "success");
      } else {
        const created = await actualiteService.createArticle(formData);
        setArticles((prev) => [created, ...prev]);
        showToast("Nouvel article créé et ajouté à la liste.", "success");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Erreur enregistrement article :", err);
      showToast("L'enregistrement a échoué. Vérifiez les champs et réessayez. Si le problème persiste, contactez l'administrateur.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basculer statut publié / brouillon
  const togglePublie = async (article: Actualite) => {
    try {
      const newStatus = !article.publie;
      const updated = await actualiteService.updateArticle(article.id, {
        publie: newStatus,
      });
      setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(newStatus ? "L'article est maintenant visible sur le site public." : "L'article a été repassé en brouillon et masqué du site.", "success");
    } catch (err: any) {
      console.error("Erreur bascule statut :", err);
      showToast("Impossible de changer le statut de l'article. Réessayez ou rafraîchissez la page.", "error");
    }
  };

  // Supprimer article
  const handleDeleteArticle = async () => {
    if (!deleteCandidate) return;
    try {
      await actualiteService.deleteArticle(deleteCandidate.id);
      setArticles((prev) => prev.filter((a) => a.id !== deleteCandidate.id));
      showToast("L'article a été supprimé définitivement.", "success");
      setDeleteCandidate(null);
    } catch (err: any) {
      console.error("Erreur suppression article :", err);
      showToast("La suppression a échoué. L'article est peut-être déjà supprimé ou une erreur réseau s'est produite.", "error");
    }
  };

  // Formater date DD/MM/YYYY
  const formatDateFr = (dStr: string) => {
    if (!dStr) return "—";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Toast Notification ── */}
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

      {/* ── En-tête Principal ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Gestion des Actualités
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Nouvel Article</span>
        </button>
      </div>

      {/* ── Statistiques Rapides ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Articles
          </span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {stats.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold text-[#B85028] uppercase tracking-wider block">
            Publiés
          </span>
          <span className="text-2xl font-black text-[#B85028] mt-1 block">
            {stats.publies}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold text-[#6B4533] uppercase tracking-wider block">
            Brouillons
          </span>
          <span className="text-2xl font-black text-[#6B4533] mt-1 block">
            {stats.brouillons}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
          <span className="text-[11px] font-bold text-[#193549] uppercase tracking-wider block">
            Avant Camp
          </span>
          <span className="text-2xl font-black text-[#193549] mt-1 block">
            {stats.avant}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-[#B85028] uppercase tracking-wider block">
            Pendant / Après
          </span>
          <span className="text-2xl font-black text-[#B85028] mt-1 block">
            {stats.pendant + stats.apres}
          </span>
        </div>
      </div>

      {/* ── Barre d'outils : Filtres, Recherche & Affichage ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, résumé..."
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
          </div>

          {/* Filtre Phase */}
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
          >
            <option value="all">Toutes les phases</option>
            <option value="avant">Avant le camp</option>
            <option value="pendant">Pendant le camp</option>
            <option value="apres">Après le camp</option>
          </select>

          {/* Filtre Statut */}
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="publie">Publié en ligne</option>
            <option value="brouillon">Brouillon</option>
          </select>
        </div>

        {/* Switch Mode Vue */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#EFECE6] self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg cursor-pointer transition-all ${
              viewMode === "table"
                ? "bg-white text-[#B85028] shadow-2xs"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Vue tableau"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`p-1.5 rounded-lg cursor-pointer transition-all ${
              viewMode === "cards"
                ? "bg-white text-[#B85028] shadow-2xs"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Vue grille de cartes"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Contenu : Chargement, Empty state ou Liste ── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          <div className="h-10 bg-slate-100 rounded w-full" />
          <div className="h-10 bg-slate-100 rounded w-full" />
          <div className="h-10 bg-slate-100 rounded w-full" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#B85028] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1">
            Aucun article trouvé
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
            Aucun article ne correspond à vos filtres actuels. Commencez par créer une nouvelle actualité.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-colors"
          >
            + Rédiger un article
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ── Vue Tableau ── */
        <div className="bg-white rounded-3xl border border-[#EFECE6] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFECE6] bg-[#FAF7F2]/60 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Article</th>
                  <th className="py-3.5 px-4">Phase</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6] text-xs">
                {paginatedArticles.map((article) => {
                  const phaseInfo = PHASES_CONFIG[article.phase] || PHASES_CONFIG.avant;
                  return (
                    <tr key={article.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Titre & Résumé */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                            {article.image_principale ? (
                              <img
                                src={article.image_principale}
                                alt={article.titre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 max-w-md">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                {article.badge_label || "ACTUALITÉ"}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {article.temps_lecture} min de lecture
                              </span>
                            </div>
                            <h4 className="font-extrabold text-gray-900 text-sm truncate hover:text-[#B85028] transition-colors cursor-pointer"
                              onClick={() => setPreviewArticle(article)}
                            >
                              {article.titre}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {article.resume}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phase */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${phaseInfo.badgeClass}`}>
                          {phaseInfo.label}
                        </span>
                      </td>

                      {/* Date de publication */}
                      <td className="py-4 px-4 font-semibold text-gray-600">
                        {formatDateFr(article.date_publication)}
                      </td>

                      {/* Statut Publié Toggle */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => togglePublie(article)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                            article.publie
                              ? "bg-[#FDF3EE] text-[#B85028] border border-[#F0C5AE] hover:bg-[#F9E4D6]"
                              : "bg-[#FAF7F2] text-[#6B4533] border border-[#EFECE6] hover:bg-[#EFECE6]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${article.publie ? "bg-[#B85028]" : "bg-[#9C8578]"}`} />
                          <span>{article.publie ? "Publié" : "Brouillon"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right sm:pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {/* Aperçu */}
                          <button
                            type="button"
                            onClick={() => setPreviewArticle(article)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Lire l'aperçu"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Éditer */}
                          <button
                             type="button"
                             onClick={() => openEditModal(article)}
                             className="p-1.5 rounded-lg text-[#193549] hover:bg-[#EBF2F7] transition-colors cursor-pointer"
                             title="Modifier l'article"
                           >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Supprimer */}
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(article)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        </div>
      ) : (
        /* ── Vue Grille de Cartes ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedArticles.map((article) => {
            const phaseInfo = PHASES_CONFIG[article.phase] || PHASES_CONFIG.avant;
            return (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-[#EFECE6] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group h-[400px]"
              >
                {/* Image de couverture — 50% fixe */}
                <div className="relative h-1/2 w-full bg-[#F0ECE8] overflow-hidden shrink-0">
                  {article.image_principale ? (
                    <img
                      src={article.image_principale}
                      alt={article.titre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF7F2] to-[#ECE7DC] text-[#9C8578]">
                      <svg className="w-10 h-10 opacity-40 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Sans image</span>
                    </div>
                  )}

                  {/* Badges phase + badge label */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#193549]/80 text-white backdrop-blur-xs">
                      {article.badge_label || "ACTUALITÉ"}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border bg-white/95 shadow-xs ${phaseInfo.textColor} ${phaseInfo.badgeClass}`}>
                      {phaseInfo.label}
                    </span>
                  </div>

                  {/* Toggle En ligne / Brouillon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePublie(article);
                    }}
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black shadow-xs cursor-pointer ${
                      article.publie ? "bg-[#B85028] text-white" : "bg-[#193549]/80 text-gray-200"
                    }`}
                  >
                    {article.publie ? "En ligne" : "Brouillon"}
                  </button>
                </div>

                {/* Contenu — remplit le reste (50%) */}
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="p-4 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 mb-1.5">
                      <span>{formatDateFr(article.date_publication)}</span>
                      <span>•</span>
                      <span>{article.temps_lecture} min</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-gray-900 mb-1.5 group-hover:text-[#B85028] transition-colors line-clamp-2">
                      {article.titre}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {article.resume}
                    </p>
                  </div>

                  {/* Footer Carte */}
                  <div className="px-4 py-3 border-t border-[#EFECE6] bg-[#FAF7F2]/40 flex items-center justify-between shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewArticle(article)}
                      className="text-xs font-bold text-gray-500 hover:text-[#193549] cursor-pointer transition-colors"
                    >
                      Aperçu
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(article)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#193549] bg-[#EBF2F7] hover:bg-[#C5D8E8] transition-colors cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(article)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredArticles.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredArticles.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="articles"
          pageSizeOptions={[8, 16, 24]}
          onPageSizeChange={setItemsPerPage}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL : CRÉATION / MODIFICATION D'UN ARTICLE
          ══════════════════════════════════════════════════════ */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDF3EE] text-[#B85028] flex items-center justify-center">
                  {editingArticle ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base">
                    {editingArticle ? "Modifier l'article" : "Rédiger une nouvelle actualité"}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    CNCEIZ Agadez 2026 — Publication officielle
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EFECE6] text-[#193549] hover:bg-[#DDD8D0] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Titre */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Titre de l'actualité *
                </label>
                <input
                  type="text"
                  required
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  placeholder="Ex : Lancement des inscriptions au Camp 2026..."
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                />
              </div>

              {/* Ligne : Phase, Badge & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Phase */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Phase de l'événement
                  </label>
                  <select
                    value={formPhase}
                    onChange={(e) => setFormPhase(e.target.value as ActualitePhase)}
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028]"
                  >
                    <option value="avant">Avant le camp</option>
                    <option value="pendant">Pendant le camp</option>
                    <option value="apres">Après le camp</option>
                  </select>
                </div>

                {/* Badge */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Badge de l'article
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="OFFICIEL, ATELIER, DIRECT..."
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028]"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Date de publication
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028]"
                  />
                </div>
              </div>

              {/* Temps de lecture & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Temps de lecture (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formTempsLecture}
                    onChange={(e) => setFormTempsLecture(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Image de couverture
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Choisir une image...
                    </button>
                    {imagePreviewUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormImageFile(null);
                            setImagePreviewUrl(null);
                          }}
                          className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Résumé / Chapeau */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Résumé d'introduction (accroche) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formResume}
                  onChange={(e) => setFormResume(e.target.value)}
                  placeholder="Bref résumé en 1 à 2 phrases..."
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B85028]"
                />
              </div>

              {/* Contenu complet */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Contenu détaillé de l'article *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formContenu}
                  onChange={(e) => setFormContenu(e.target.value)}
                  placeholder="Rédigez ici l'article complet..."
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B85028]"
                />
              </div>

              {/* Statut de publication */}
              <div className="pt-2 flex items-center gap-3">
                <label className="relative flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formPublie}
                    onChange={(e) => setFormPublie(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#B85028] focus:ring-[#B85028] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    Publier immédiatement sur le site public
                  </span>
                </label>
              </div>

              {/* Footer Modal Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#B85028] hover:bg-[#a0431f] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : editingArticle ? "Enregistrer les modifications" : "Publier l'article"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL : APERÇU DE L'ARTICLE
          ══════════════════════════════════════════════════════ */}
      {previewArticle && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPreviewArticle(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 w-full bg-slate-900 shrink-0">
              {previewArticle.image_principale ? (
                <img
                  src={previewArticle.image_principale}
                  alt={previewArticle.titre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950 text-white/50">
                  <span className="text-xs font-semibold">Aucune image de couverture</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#B85028] text-white mb-2 inline-block">
                  {previewArticle.badge_label}
                </span>
                <h2 className="text-lg sm:text-xl font-black leading-tight">
                  {previewArticle.titre}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#193549]/70 text-white flex items-center justify-center hover:bg-[#193549]/90 cursor-pointer transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span>Publié le {formatDateFr(previewArticle.date_publication)}</span>
                <span>•</span>
                <span>{previewArticle.temps_lecture} min de lecture</span>
                <span>•</span>
                 <span className={previewArticle.publie ? "text-[#B85028] font-bold" : "text-[#6B4533] font-bold"}>
                   {previewArticle.publie ? "En ligne" : "Brouillon"}
                 </span>
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFECE6]">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 italic">
                  {previewArticle.resume}
                </p>
              </div>

              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {previewArticle.contenu}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#FAF7F2] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const toEdit = previewArticle;
                  setPreviewArticle(null);
                  openEditModal(toEdit);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#193549] bg-[#EBF2F7] hover:bg-[#C5D8E8] cursor-pointer transition-colors"
              >
                Modifier cet article
              </button>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#193549] hover:bg-[#12273A] cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL : CONFIRMATION SUPPRESSION
          ══════════════════════════════════════════════════════ */}
      {deleteCandidate && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-extrabold text-gray-900 text-base mb-1">
              Supprimer cet article ?
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement l'article <strong className="text-gray-800">« {deleteCandidate.titre} »</strong> ? Cette action est irréversible.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteArticle}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
