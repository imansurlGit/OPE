import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { partenaireService, type Partenaire, type PartenaireType } from "../services";

const TYPE_CONFIG: Record<PartenaireType, { label: string; badgeClass: string; textColor: string }> = {
  pays: {
    label: "Pays",
    badgeClass: "bg-[#EBF2F7] text-[#193549] border-[#C5D8E8]",
    textColor: "text-[#193549]",
  },
  institution: {
    label: "Institution",
    badgeClass: "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]",
    textColor: "text-[#B85028]",
  },
  ong: {
    label: "ONG",
    badgeClass: "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]",
    textColor: "text-[#1D6353]",
  },
  ambassade: {
    label: "Ambassade",
    badgeClass: "bg-[#FEF6E9] text-[#9A6700] border-[#FCE1B4]",
    textColor: "text-[#9A6700]",
  },
};

export default function AdminPartenaires() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartenaire, setEditingPartenaire] = useState<Partenaire | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Partenaire | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formNom, setFormNom] = useState("");
  const [formType, setFormType] = useState<PartenaireType>("institution");
  const [formLogoFile, setFormLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Chargement ────────────────────────────────────────────────────────────
  const fetchPartenaires = async () => {
    setIsLoading(true);
    try {
      const data = await partenaireService.getPartenaires();
      setPartenaires(data);
    } catch {
      showToast("Impossible de charger la liste des partenaires. Vérifiez votre connexion et réessayez.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPartenaires(); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return partenaires.filter((p) => {
      const matchesType = selectedType === "all" || p.type === selectedType;
      const matchesSearch = q === "" || p.nom.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [partenaires, selectedType, searchQuery]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: partenaires.length,
    pays: partenaires.filter((p) => p.type === "pays").length,
    institution: partenaires.filter((p) => p.type === "institution").length,
    ong: partenaires.filter((p) => p.type === "ong").length,
    ambassade: partenaires.filter((p) => p.type === "ambassade").length,
  }), [partenaires]);

  // ── Ouvrir modal création ─────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingPartenaire(null);
    setFormNom("");
    setFormType("institution");
    setFormLogoFile(null);
    setLogoPreviewUrl(null);
    setIsModalOpen(true);
  };

  // ── Ouvrir modal édition ──────────────────────────────────────────────────
  const openEditModal = (p: Partenaire) => {
    setEditingPartenaire(p);
    setFormNom(p.nom);
    setFormType(p.type);
    setFormLogoFile(null);
    setLogoPreviewUrl(p.logo || null);
    setIsModalOpen(true);
  };

  // ── Sélection logo ────────────────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ── Soumission formulaire ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim()) {
      showToast("Veuillez renseigner le nom du partenaire avant de continuer.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nom", formNom.trim());
      formData.append("type", formType);
      if (formLogoFile) formData.append("logo", formLogoFile);

      if (editingPartenaire) {
        const updated = await partenaireService.updatePartenaire(editingPartenaire.id, formData);
        setPartenaires((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast("Les informations du partenaire ont bien été mises à jour.", "success");
      } else {
        const created = await partenaireService.createPartenaire(formData);
        setPartenaires((prev) => [...prev, created]);
        showToast("Nouveau partenaire ajouté avec succès.", "success");
      }
      setIsModalOpen(false);
    } catch {
      showToast("L'enregistrement a échoué. Vérifiez les champs et réessayez. Si le problème persiste, contactez l'administrateur.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await partenaireService.deletePartenaire(deleteCandidate.id);
      setPartenaires((prev) => prev.filter((p) => p.id !== deleteCandidate.id));
      showToast("Le partenaire a été supprimé définitivement.", "success");
      setDeleteCandidate(null);
    } catch {
      showToast("La suppression a échoué. L'entrée est peut-être déjà retirée ou une erreur réseau s'est produite.", "error");
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
            Partenaires & Sponsors
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
          <span>Nouveau partenaire</span>
        </button>
      </div>

      {/* ── Statistiques ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Pays", value: stats.pays, color: "text-[#193549]" },
          { label: "Institutions", value: stats.institution, color: "text-[#B85028]" },
          { label: "ONG", value: stats.ong, color: "text-[#1D6353]" },
          { label: "Ambassades", value: stats.ambassade, color: "text-[#9A6700]" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${s.color}`}>{s.label}</span>
            <span className={`text-2xl font-black mt-1 block ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un partenaire..."
            className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B85028]"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
        >
          <option value="all">Tous les types</option>
          <option value="pays">Pays</option>
          <option value="institution">Institution</option>
          <option value="ong">ONG</option>
          <option value="ambassade">Ambassade</option>
        </select>
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-[#B85028] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1">Aucun partenaire trouvé</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
            {searchQuery || selectedType !== "all"
              ? "Aucun partenaire ne correspond à vos filtres. Essayez de modifier votre recherche."
              : "Aucun partenaire n'a encore été ajouté. Commencez par en créer un."}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-colors"
          >
            + Ajouter un partenaire
          </button>
        </div>
      ) : (
        /* ── Grille de cartes ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const typeInfo = TYPE_CONFIG[p.type];
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-[#EFECE6] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col"
              >
                {/* Logo */}
                <div className="h-32 bg-[#FAF7F2] flex items-center justify-center overflow-hidden border-b border-[#EFECE6]">
                  {p.logo ? (
                    <img
                      src={p.logo}
                      alt={`Logo ${p.nom}`}
                      className="max-h-24 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-300">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Sans logo</span>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="p-4 flex-1 flex flex-col">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border self-start mb-2 ${typeInfo.badgeClass}`}>
                    {typeInfo.label}
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-sm leading-snug flex-1">
                    {p.nom}
                  </h3>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-[#EFECE6] bg-[#FAF7F2]/40 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#193549] bg-[#EBF2F7] hover:bg-[#C5D8E8] transition-colors cursor-pointer"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(p)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ MODAL : CRÉER / MODIFIER ══════════════════════════════════════════ */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDF3EE] text-[#B85028] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-black text-gray-900 text-base">
                  {editingPartenaire ? "Modifier le partenaire" : "Nouveau partenaire"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EFECE6] text-[#193549] hover:bg-[#DDD8D0] flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Nom du partenaire *
                </label>
                <input
                  type="text"
                  required
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  placeholder="Nom complet de l'organisation"
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Type de partenaire
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as PartenaireType)}
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028] cursor-pointer"
                >
                  <option value="pays">Pays</option>
                  <option value="institution">Institution</option>
                  <option value="ong">ONG</option>
                  <option value="ambassade">Ambassade</option>
                </select>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Logo (optionnel)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Choisir un logo...
                  </button>
                  {logoPreviewUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={logoPreviewUrl}
                        alt="Aperçu logo"
                        className="h-10 w-auto max-w-[80px] object-contain rounded-lg border border-gray-200 bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={() => { setFormLogoFile(null); setLogoPreviewUrl(null); }}
                        className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
                      >
                        Retirer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons */}
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
                  {isSubmitting ? "Enregistrement..." : editingPartenaire ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ══ MODAL : CONFIRMATION SUPPRESSION ══════════════════════════════════ */}
      {deleteCandidate && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
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
            <h3 className="font-extrabold text-gray-900 text-base mb-1">Supprimer ce partenaire ?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Êtes-vous sûr de vouloir retirer définitivement{" "}
              <strong className="text-gray-800">« {deleteCandidate.nom} »</strong> de la liste des partenaires ?
              Cette action est irréversible.
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
