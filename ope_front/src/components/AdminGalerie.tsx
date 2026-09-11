import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  galerieService,
  type MediaGalerie,
  type MediaCategorie,
} from "../services";

const CATEGORIES_CONFIG: Record<
  MediaCategorie,
  { label: string; badgeClass: string; textColor: string; bgSoft: string }
> = {
  steam: {
    label: "Modèles STEAM",
    badgeClass: "bg-[#EBF2F7] text-[#193549] border-[#C5D8E8]",
    textColor: "text-[#193549]",
    bgSoft: "bg-[#EBF2F7]",
  },
  local: {
    label: "Local Projects (LP)",
    badgeClass: "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]",
    textColor: "text-[#B85028]",
    bgSoft: "bg-[#FDF3EE]",
  },
  citoyen: {
    label: "Actions Citoyennes (MCC)",
    badgeClass: "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]",
    textColor: "text-[#1D6353]",
    bgSoft: "bg-[#EAF5F2]",
  },
  ambiance: {
    label: "Ambiance & Cérémonies",
    badgeClass: "bg-[#FEF6E9] text-[#9A6700] border-[#FCE1B4]",
    textColor: "text-[#9A6700]",
    bgSoft: "bg-[#FEF6E9]",
  },
};

export default function AdminGalerie() {
  const [medias, setMedias] = useState<MediaGalerie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedHighlight, setSelectedHighlight] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaGalerie | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MediaGalerie | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaGalerie | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitre, setFormTitre] = useState("");
  const [formCategorie, setFormCategorie] = useState<MediaCategorie>("ambiance");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formMisEnAvant, setFormMisEnAvant] = useState(false);
  const [formOrdre, setFormOrdre] = useState(0);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneInputRef = useRef<HTMLInputElement | null>(null);

  // ── Chargement des Médias ──────────────────────────────────────────────────
  const fetchMedias = async () => {
    setIsLoading(true);
    try {
      const data = await galerieService.getMedias();
      const items = Array.isArray(data) ? data : (data as any)?.results || [];
      setMedias(items);
    } catch (err: any) {
      showToast("Impossible de charger les photos de la galerie. Vérifiez votre connexion et réessayez.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedias();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Filtrage dynamique ────────────────────────────────────────────────────
  const filteredMedias = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return medias.filter((m) => {
      const matchesCategory =
        selectedCategory === "all" || m.categorie === selectedCategory;
      const matchesHighlight =
        selectedHighlight === "all" ||
        (selectedHighlight === "highlighted" && m.mis_en_avant) ||
        (selectedHighlight === "standard" && !m.mis_en_avant);
      const matchesSearch =
        q === "" || (m.titre || "").toLowerCase().includes(q);

      return matchesCategory && matchesHighlight && matchesSearch;
    });
  }, [medias, selectedCategory, selectedHighlight, searchQuery]);

  // ── Statistiques rapides ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = medias.length;
    const steam = medias.filter((m) => m.categorie === "steam").length;
    const local = medias.filter((m) => m.categorie === "local").length;
    const citoyen = medias.filter((m) => m.categorie === "citoyen").length;
    const ambiance = medias.filter((m) => m.categorie === "ambiance").length;
    const misEnAvant = medias.filter((m) => m.mis_en_avant).length;
    return { total, steam, local, citoyen, ambiance, misEnAvant };
  }, [medias]);

  // ── Ouvrir Modal Création ─────────────────────────────────────────────────
  const openCreateModal = (prefilledFile?: File) => {
    setEditingMedia(null);
    setFormTitre("");
    setFormCategorie("ambiance");
    setFormVideoUrl("");
    setFormMisEnAvant(false);
    setFormOrdre(medias.length);

    if (prefilledFile) {
      setFormImageFile(prefilledFile);
      setImagePreviewUrl(URL.createObjectURL(prefilledFile));
      // Donner un titre par défaut propre basé sur le nom du fichier sans extension
      const cleanName = prefilledFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ");
      setFormTitre(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    } else {
      setFormImageFile(null);
      setImagePreviewUrl(null);
    }

    setIsModalOpen(true);
  };

  // ── Ouvrir Modal Édition ──────────────────────────────────────────────────
  const openEditModal = (m: MediaGalerie) => {
    setEditingMedia(m);
    setFormTitre(m.titre || "");
    setFormCategorie(m.categorie || "ambiance");
    setFormVideoUrl(m.video_url || "");
    setFormMisEnAvant(m.mis_en_avant);
    setFormOrdre(m.ordre);
    setFormImageFile(null);
    setImagePreviewUrl(m.image || null);
    setIsModalOpen(true);
  };

  // ── Gestion de l'image du formulaire ─────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      if (!formTitre.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]/g, " ");
        setFormTitre(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  // ── Drag & Drop Handlers ──────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        openCreateModal(file);
      } else {
        showToast("Veuillez sélectionner un fichier image valide.", "error");
      }
    }
  };

  // ── Bascule "Mis en avant" (Favori / Grand format) ────────────────────────
  const toggleMisEnAvant = async (m: MediaGalerie, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated = await galerieService.updateMedia(m.id, {
        mis_en_avant: !m.mis_en_avant,
      });
      setMedias((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast(
        updated.mis_en_avant
          ? "Ce média est maintenant mis en avant sur le site public."
          : "Le média n'est plus mis en avant.",
        "success"
      );
    } catch (err: any) {
      showToast("Impossible de modifier le statut de ce média. Réessayez ou rafraîchissez la page.", "error");
    }
  };

  // ── Soumission Formulaire ─────────────────────────────────────────────────
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMedia && !formImageFile) {
      showToast("Veuillez sélectionner une image pour le média.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("titre", formTitre.trim());
      formData.append("categorie", formCategorie);
      formData.append("video_url", formVideoUrl.trim());
      formData.append("mis_en_avant", formMisEnAvant ? "true" : "false");
      formData.append("ordre", String(formOrdre));
      if (formImageFile) {
        formData.append("image", formImageFile);
      }

      if (editingMedia) {
        const updated = await galerieService.updateMedia(
          editingMedia.id,
          formData
        );
        setMedias((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        showToast("Les modifications ont bien été enregistrées.", "success");
      } else {
        const created = await galerieService.createMedia(formData);
        setMedias((prev) => [created, ...prev]);
        showToast("Le média a bien été ajouté à la galerie.", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(
        "L'enregistrement a échoué. Vérifiez les champs et réessayez. Si le problème persiste, contactez l'administrateur.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await galerieService.deleteMedia(deleteCandidate.id);
      setMedias((prev) => prev.filter((m) => m.id !== deleteCandidate.id));
      showToast("Le média a été supprimé définitivement.", "success");
      setDeleteCandidate(null);
    } catch (err: any) {
      showToast("La suppression a échoué. Le média est peut-être déjà retiré ou une erreur réseau s'est produite.", "error");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
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

      {/* ── En-tête ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Gestion de la Galerie
          </h1>
        </div>
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Ajouter un média</span>
        </button>
      </div>

      {/* ── Statistiques rapides ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "STEAM", value: stats.steam, color: "text-[#193549]" },
          { label: "Local (LP)", value: stats.local, color: "text-[#B85028]" },
          { label: "Citoyen", value: stats.citoyen, color: "text-[#1D6353]" },
          { label: "Ambiance", value: stats.ambiance, color: "text-[#9A6700]" },
          { label: "À la une", value: stats.misEnAvant, color: "text-amber-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs"
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

      {/* ── Zone Drag & Drop d'Upload ────────────────────────────────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white/80 border-2 border-dashed rounded-3xl p-6 sm:p-10 text-center transition-all ${
          isDragging
            ? "border-[#B85028] bg-orange-50/60 scale-[1.01]"
            : "border-[#E5DEC9] hover:border-[#B85028]/60 hover:bg-white"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-orange-50 text-[#B85028] flex items-center justify-center mx-auto mb-3 shadow-2xs">
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          {isDragging
            ? "Déposez votre photo ici..."
            : "Glissez-déposez vos photos ici"}
        </h3>
        <p className="text-xs text-gray-400 mb-4 font-medium">ou</p>

        <input
          ref={dropZoneInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              openCreateModal(e.target.files[0]);
            }
          }}
        />

        <button
          type="button"
          onClick={() => dropZoneInputRef.current?.click()}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-[#B85028] text-[#B85028] hover:bg-[#B85028] hover:text-white active:scale-95 font-bold text-xs sm:text-sm bg-white transition-all cursor-pointer shadow-2xs"
        >
          Parcourir les fichiers
        </button>

        <p className="text-[11px] text-gray-400 mt-3">
          Formats acceptés : JPG, PNG, WEBP (Dimensions libres, optimisé pour la galerie mosaïque)
        </p>
      </div>

      {/* ── Barre d'outils et Filtres ──────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou légende..."
            className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B85028]"
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

        {/* Filtre Catégorie */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
        >
          <option value="all">Toutes les catégories</option>
          <option value="steam">Modèles STEAM</option>
          <option value="local">Local Projects (LP)</option>
          <option value="citoyen">Actions Citoyennes (MCC)</option>
          <option value="ambiance">Ambiance & Cérémonies</option>
        </select>

        {/* Filtre À la une */}
        <select
          value={selectedHighlight}
          onChange={(e) => setSelectedHighlight(e.target.value)}
          className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
        >
          <option value="all">Tous les médias</option>
          <option value="highlighted">Mis en avant</option>
          <option value="standard">Standard</option>
        </select>

        {/* Rafraîchir */}
        <button
          type="button"
          onClick={fetchMedias}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] text-gray-600 hover:bg-[#EFECE6] cursor-pointer transition-colors shrink-0"
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
        </button>
      </div>

      {/* ── Contenu principal : Grille de Médias ───────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#EFECE6] overflow-hidden"
            >
              <div className="aspect-4/3 bg-[#EFECE6]" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 bg-[#EFECE6] rounded w-3/4" />
                <div className="h-3 bg-[#EFECE6] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMedias.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FDF3EE] text-[#B85028] flex items-center justify-center mx-auto mb-3">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1">
            Aucun média trouvé
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
            {medias.length === 0
              ? "Votre galerie est vide. Commencez par déposer ou ajouter votre première photo."
              : "Aucun média ne correspond à vos filtres actuels."}
          </p>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-colors"
          >
            + Ajouter un média
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredMedias.map((media) => {
            const config =
              CATEGORIES_CONFIG[media.categorie] || CATEGORIES_CONFIG.ambiance;

            return (
              <div
                key={media.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#EFECE6] shadow-2xs group hover:shadow-md transition-all flex flex-col"
              >
                {/* Image Container */}
                <div
                  className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer shrink-0"
                  onClick={() => setPreviewMedia(media)}
                >
                  <img
                    src={media.image}
                    alt={media.titre || "Média galerie"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Badge Catégorie */}
                  <span
                    className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-2xs ${config.badgeClass} backdrop-blur-xs`}
                  >
                    {config.label}
                  </span>

                  {/* Bouton Mis en avant */}
                  <button
                    type="button"
                    onClick={(e) => toggleMisEnAvant(media, e)}
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                      media.mis_en_avant
                        ? "bg-amber-400 text-white"
                        : "bg-white/80 text-gray-400 hover:text-amber-500 hover:bg-white"
                    }`}
                    title={
                      media.mis_en_avant
                        ? "Mis en avant (cliquez pour retirer)"
                        : "Mettre en avant"
                    }
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>

                  {/* Indicateur Vidéo */}
                  {media.video_url && (
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-black/80 text-white flex items-center gap-1 shadow-2xs">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Vidéo
                    </span>
                  )}
                </div>

                {/* Body Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      className="font-bold text-xs sm:text-sm text-gray-900 truncate hover:text-[#B85028] cursor-pointer transition-colors"
                      onClick={() => setPreviewMedia(media)}
                      title={media.titre}
                    >
                      {media.titre || "Sans titre"}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {media.created_at
                        ? new Date(media.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Récent"}
                      {media.ordre > 0 && ` • Ordre #${media.ordre}`}
                    </p>
                  </div>

                  {/* Actions Buttons */}
                  <div className="pt-3 border-t border-[#EFECE6]/80 flex items-center justify-between mt-3">
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(media)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-[#193549] transition-colors cursor-pointer"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>Aperçu</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(media)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#193549] hover:bg-[#EBF2F7] transition-colors cursor-pointer"
                        title="Modifier"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(media)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Supprimer"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL : AJOUT / MODIFICATION D'UN MÉDIA
          ══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF3EE] text-[#B85028] flex items-center justify-center">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-base">
                      {editingMedia ? "Modifier le média" : "Ajouter à la galerie"}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Galerie Multimédia — CNCEIZ Agadez 2026
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#EFECE6] text-[#193549] hover:bg-[#DDD8D0] flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Fermer"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Formulaire */}
              <form
                onSubmit={handleSubmitForm}
                className="p-6 overflow-y-auto space-y-4 flex-1"
              >
                {/* Image Upload / Preview */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Image du média *
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {imagePreviewUrl ? (
                      <div className="relative w-full sm:w-40 aspect-4/3 rounded-2xl overflow-hidden border-2 border-[#B85028] shadow-inner shrink-0 bg-slate-100">
                        <img
                          src={imagePreviewUrl}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormImageFile(null);
                            setImagePreviewUrl(null);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-40 aspect-4/3 rounded-2xl bg-[#FAF7F2] border-2 border-dashed border-[#EFECE6] hover:border-[#B85028] flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-colors shrink-0"
                      >
                        <svg
                          className="w-8 h-8 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="text-[10px] font-bold mt-1">
                          Choisir l'image
                        </span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        {imagePreviewUrl ? "Changer l'image" : "Parcourir vos fichiers..."}
                      </button>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Idéalement au format paysage (JPG ou PNG). Les photos de bonne résolution offriront un rendu parfait sur la galerie en puzzle.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Titre / Légende */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Légende / Titre du média
                  </label>
                  <input
                    type="text"
                    value={formTitre}
                    onChange={(e) => setFormTitre(e.target.value)}
                    placeholder="Ex: Atelier de robotique au campus d'Agadez..."
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                  />
                </div>

                {/* Catégorie + Ordre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-800 mb-1">
                      Catégorie *
                    </label>
                    <select
                      value={formCategorie}
                      onChange={(e) =>
                        setFormCategorie(e.target.value as MediaCategorie)
                      }
                      className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028] cursor-pointer"
                    >
                      <option value="steam">Modèles STEAM</option>
                      <option value="local">Local Projects (LP)</option>
                      <option value="citoyen">Actions Citoyennes (MCC)</option>
                      <option value="ambiance">Ambiance & Cérémonies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-800 mb-1">
                      Ordre d'affichage
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formOrdre}
                      onChange={(e) => setFormOrdre(Number(e.target.value))}
                      className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028]"
                    />
                  </div>
                </div>

                {/* Lien Vidéo optionnel */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">
                    Lien vidéo associé (Optionnel)
                  </label>
                  <input
                    type="url"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                  />
                </div>

                {/* Checkbox : Mis en avant */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formMisEnAvant}
                      onChange={(e) => setFormMisEnAvant(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#B85028] focus:ring-[#B85028] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">
                        Mettre en avant sur la galerie ( À la une)
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        Ce média occupera une place prépondérante dans la mosaïque.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Footer Modal */}
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
                    {isSubmitting
                      ? "Enregistrement..."
                      : editingMedia
                        ? "Enregistrer les modifications"
                        : "Ajouter le média"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL : APERÇU GRAND FORMAT (LIGHTBOX)
          ══════════════════════════════════════════════════════════════════════ */}
      {previewMedia &&
        createPortal(
          <div
            className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setPreviewMedia(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-800 my-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-16/10 w-full bg-black shrink-0">
                <img
                  src={previewMedia.image}
                  alt={previewMedia.titre || "Aperçu"}
                  className="w-full h-full object-contain"
                />

                {/* Bouton Fermer */}
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer transition-colors"
                  aria-label="Fermer"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Détails du média */}
              <div className="p-5 bg-white space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-1.5 ${
                        (
                          CATEGORIES_CONFIG[previewMedia.categorie] ||
                          CATEGORIES_CONFIG.ambiance
                        ).badgeClass
                      }`}
                    >
                      {
                        (
                          CATEGORIES_CONFIG[previewMedia.categorie] ||
                          CATEGORIES_CONFIG.ambiance
                        ).label
                      }
                    </span>
                    <h3 className="font-black text-lg text-gray-900 leading-tight">
                      {previewMedia.titre || "Sans titre"}
                    </h3>
                  </div>

                  {previewMedia.mis_en_avant && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 flex items-center gap-1 shrink-0">
                      <span>À la une</span>
                    </span>
                  )}
                </div>

                {previewMedia.video_url && (
                  <div className="pt-2">
                    <a
                      href={previewMedia.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#B85028] hover:underline"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Voir la vidéo associée</span>
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const m = previewMedia;
                      setPreviewMedia(null);
                      openEditModal(m);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#193549] bg-[#EBF2F7] hover:bg-[#C5D8E8] cursor-pointer transition-colors"
                  >
                    Modifier ce média
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMedia(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#193549] hover:bg-[#12273A] cursor-pointer transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL : CONFIRMATION DE SUPPRESSION
          ══════════════════════════════════════════════════════════════════════ */}
      {deleteCandidate &&
        createPortal(
          <div
            className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setDeleteCandidate(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
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
              <h3 className="font-extrabold text-gray-900 text-base mb-1">
                Supprimer ce média ?
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Voulez-vous supprimer définitivement ce média{" "}
                {deleteCandidate.titre && (
                  <strong className="text-gray-800">
                    « {deleteCandidate.titre} »
                  </strong>
                )}{" "}
                de la galerie ? Cette action est irréversible.
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
                  onClick={handleDelete}
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
