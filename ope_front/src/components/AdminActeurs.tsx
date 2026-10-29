import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { acteurService, type ActeurPage } from "../services";
import Pagination from "./Pagination";

// Palette couleurs prédéfinies pour la sélection rapide
const COLOR_PRESETS = [
  { label: "Noir", couleur: "#111111", couleur_light: "#F5F5F5" },
  { label: "OPE Bleu", couleur: "#0A7B8E", couleur_light: "#EBF7F9" },
  { label: "OPE Orange", couleur: "#f15b29", couleur_light: "#FDF3EE" },
  { label: "Nuit", couleur: "#193549", couleur_light: "#EBF2F7" },
];

export default function AdminActeurs() {
  const [acteurs, setActeurs] = useState<ActeurPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActif, setSelectedActif] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActeur, setEditingActeur] = useState<ActeurPage | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ActeurPage | null>(null);
  const [previewActeur, setPreviewActeur] = useState<ActeurPage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formTitre, setFormTitre] = useState("");
  const [formSousTitre, setFormSousTitre] = useState("Organisation pour la Promotion de l'Excellence (OPE)");
  const [formNom, setFormNom] = useState("");
  const [formCouleur, setFormCouleur] = useState("#111111");
  const [formCouleurLight, setFormCouleurLight] = useState("#F5F5F5");
  const [formExergue, setFormExergue] = useState("");
  const [formMot, setFormMot] = useState("");
  const [formOrdre, setFormOrdre] = useState(0);
  const [formActif, setFormActif] = useState(true);
  const [formPhotoFile, setFormPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Chargement ────────────────────────────────────────────────────────────
  const fetchActeurs = async () => {
    setIsLoading(true);
    try {
      const data = await acteurService.getActeurs();
      const items = Array.isArray(data) ? data : (data as any)?.results || [];
      setActeurs(items);
    } catch {
      showToast("Impossible de charger la liste des acteurs. Vérifiez votre connexion.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchActeurs(); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filteredActeurs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return acteurs.filter((a) => {
      const matchesActif =
        selectedActif === "all" ||
        (selectedActif === "actif" && a.actif) ||
        (selectedActif === "inactif" && !a.actif);
      const matchesSearch =
        q === "" ||
        a.nom.toLowerCase().includes(q) ||
        a.titre.toLowerCase().includes(q) ||
        a.exergue.toLowerCase().includes(q);
      return matchesActif && matchesSearch;
    });
  }, [acteurs, selectedActif, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [selectedActif, searchQuery]);

  const paginatedActeurs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActeurs.slice(start, start + itemsPerPage);
  }, [filteredActeurs, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    const total = acteurs.length;
    const actifs = acteurs.filter((a) => a.actif).length;
    return { total, actifs, inactifs: total - actifs };
  }, [acteurs]);

  // ── Helpers formulaire ────────────────────────────────────────────────────
  const resetForm = () => {
    setFormTitre(""); setFormSousTitre("Organisation pour la Promotion de l'Excellence (OPE)");
    setFormNom(""); setFormCouleur("#111111"); setFormCouleurLight("#F5F5F5");
    setFormExergue(""); setFormMot(""); setFormOrdre(acteurs.length);
    setFormActif(true); setFormPhotoFile(null); setPhotoPreviewUrl(null);
  };

  const openCreateModal = () => {
    setEditingActeur(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (a: ActeurPage) => {
    setEditingActeur(a);
    setFormTitre(a.titre);
    setFormSousTitre(a.sous_titre || "Organisation pour la Promotion de l'Excellence (OPE)");
    setFormNom(a.nom);
    setFormCouleur(a.couleur || "#111111");
    setFormCouleurLight(a.couleur_light || "#F5F5F5");
    setFormExergue(a.exergue);
    setFormMot(a.mot || "");
    setFormOrdre(a.ordre);
    setFormActif(a.actif);
    setFormPhotoFile(null);
    setPhotoPreviewUrl(a.photo || null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormCouleur(preset.couleur);
    setFormCouleurLight(preset.couleur_light);
  };

  // ── Soumission ────────────────────────────────────────────────────────────
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitre.trim()) { showToast("Le titre / fonction est obligatoire.", "error"); return; }
    if (!formNom.trim()) { showToast("Le nom complet est obligatoire.", "error"); return; }
    if (!formExergue.trim()) { showToast("La citation / exergue est obligatoire.", "error"); return; }
    if (!formMot.trim()) { showToast("Le message / biographie est obligatoire.", "error"); return; }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("titre", formTitre.trim());
      formData.append("sous_titre", formSousTitre.trim());
      formData.append("nom", formNom.trim());
      formData.append("couleur", formCouleur);
      formData.append("couleur_light", formCouleurLight);
      formData.append("exergue", formExergue.trim());
      formData.append("mot", formMot.trim());
      formData.append("ordre", String(formOrdre));
      formData.append("actif", formActif ? "true" : "false");
      if (formPhotoFile) formData.append("photo", formPhotoFile);

      if (editingActeur) {
        const updated = await acteurService.updateActeur(editingActeur.id, formData);
        setActeurs((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        showToast("L'acteur a bien été mis à jour.", "success");
      } else {
        const created = await acteurService.createActeur(formData);
        setActeurs((prev) => [...prev, created]);
        showToast("Nouvel acteur ajouté avec succès.", "success");
      }
      setIsModalOpen(false);
    } catch {
      showToast("L'enregistrement a échoué. Vérifiez les champs et réessayez.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Toggle actif ──────────────────────────────────────────────────────────
  const toggleActif = async (a: ActeurPage) => {
    try {
      const updated = await acteurService.updateActeur(a.id, { actif: !a.actif });
      setActeurs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      showToast(updated.actif ? "L'acteur est maintenant visible sur le site." : "L'acteur a été masqué du site.", "success");
    } catch {
      showToast("Impossible de changer la visibilité.", "error");
    }
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await acteurService.deleteActeur(deleteCandidate.id);
      setActeurs((prev) => prev.filter((a) => a.id !== deleteCandidate.id));
      showToast("L'acteur a été supprimé définitivement.", "success");
      setDeleteCandidate(null);
    } catch {
      showToast("La suppression a échoué.", "error");
    }
  };

  // ── Avatar ────────────────────────────────────────────────────────────────
  const Avatar = ({ acteur, size = "md" }: { acteur: ActeurPage; size?: "sm" | "md" | "lg" }) => {
    const sizeClass = size === "sm" ? "w-10 h-10 text-xs" : size === "lg" ? "w-24 h-24 text-2xl" : "w-14 h-14 text-base";
    const initials = acteur.nom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    if (acteur.photo) {
      return (
        <img
          src={acteur.photo}
          alt={acteur.nom}
          className={`${sizeClass} rounded-full object-cover object-top border-2 border-[#d0e4f0] shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${sizeClass} rounded-full text-white font-black flex items-center justify-center shrink-0`}
        style={{ backgroundColor: acteur.couleur || "#193549" }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3.5 max-w-sm text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-2xl border flex items-start gap-3 ${
            toastType === "error" ? "bg-rose-600 border-rose-400/30" : "bg-emerald-600 border-emerald-400/30"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            {toastType === "error" ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            )}
          </div>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Les Acteurs</h1>
          <p className="text-xs text-gray-400 mt-1">Personnalités affichées sur la page publique /acteurs</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-[#f15b29] hover:bg-[#d44d1f] cursor-pointer shadow-xs transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Ajouter un acteur</span>
        </button>
      </div>

      {/* ── Stats rapides ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Visibles", value: stats.actifs, color: "text-[#f15b29]" },
          { label: "Masqués", value: stats.inactifs, color: "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-[#d0e4f0] shadow-2xs">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${s.color}`}>{s.label}</span>
            <span className={`text-2xl font-black mt-1 block ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-[#d0e4f0] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, titre, citation..."
            className="w-full bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f15b29]"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={selectedActif}
          onChange={(e) => setSelectedActif(e.target.value)}
          className="bg-[#f4f8fb] border border-[#d0e4f0] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#f15b29] cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Visibles sur le site</option>
          <option value="inactif">Masqués</option>
        </select>

        <button
          type="button"
          onClick={fetchActeurs}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-[#d0e4f0] bg-[#f4f8fb] text-gray-600 hover:bg-[#d0e4f0] cursor-pointer transition-colors"
          title="Rafraîchir"
        >
          <svg className={`w-4 h-4 ${isLoading ? "animate-spin text-[#f15b29]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* ── Contenu principal ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#d0e4f0] p-8 space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#d0e4f0]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#d0e4f0] rounded w-1/4" />
                <div className="h-3 bg-[#d0e4f0] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredActeurs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#d0e4f0] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FDF3EE] text-[#f15b29] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1">Aucun acteur trouvé</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
            Aucun acteur ne correspond à vos filtres. Commencez par en ajouter un.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#f15b29] hover:bg-[#d44d1f] cursor-pointer shadow-xs transition-colors"
          >
            + Ajouter un acteur
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#d0e4f0] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d0e4f0] bg-[#f4f8fb]/60 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Acteur</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Citation</th>
                  <th className="py-3.5 px-4">Ordre</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0e4f0] text-xs">
                {paginatedActeurs.map((acteur) => (
                  <tr key={acteur.id} className="hover:bg-[#f4f8fb]/50 transition-colors">
                    {/* Acteur */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <Avatar acteur={acteur} size="sm" />
                        <div className="min-w-0">
                          <div
                            className="font-extrabold text-sm text-gray-900 truncate hover:text-[#f15b29] cursor-pointer transition-colors"
                            onClick={() => setPreviewActeur(acteur)}
                          >
                            {acteur.nom}
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 truncate mt-0.5">
                            {acteur.titre}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Citation */}
                    <td className="py-4 px-4 hidden md:table-cell max-w-[260px]">
                      <span className="text-[11px] text-gray-500 italic line-clamp-2">
                        « {acteur.exergue} »
                      </span>
                    </td>

                    {/* Ordre */}
                    <td className="py-4 px-4 font-semibold text-gray-600">
                      #{acteur.ordre}
                    </td>

                    {/* Statut */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => toggleActif(acteur)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                          acteur.actif
                            ? "bg-[#FDF3EE] text-[#f15b29] border border-[#F0C5AE] hover:bg-[#F9E4D6]"
                            : "bg-[#f4f8fb] text-[#1b3a4f] border border-[#d0e4f0] hover:bg-[#d0e4f0]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${acteur.actif ? "bg-[#f15b29]" : "bg-[#9C8578]"}`} />
                        {acteur.actif ? "Visible" : "Masqué"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right sm:pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewActeur(acteur)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Aperçu"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(acteur)}
                          className="p-1.5 rounded-lg text-[#193549] hover:bg-[#EBF2F7] transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(acteur)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredActeurs.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredActeurs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="acteurs"
          pageSizeOptions={[8, 16, 24]}
          onPageSizeChange={setItemsPerPage}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL : CRÉATION / MODIFICATION
          ══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#f4f8fb]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDF3EE] text-[#f15b29] flex items-center justify-center">
                  {editingActeur ? (
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
                    {editingActeur ? "Modifier l'acteur" : "Ajouter un acteur"}
                  </h3>
                  <p className="text-[11px] text-gray-500">Page publique /acteurs — CNCEIZ 2026</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#d0e4f0] text-[#193549] hover:bg-[#DDD8D0] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 flex-1">

              {/* Photo + Nom */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt="Aperçu"
                      className="w-16 h-16 rounded-full object-cover object-top border-2 border-[#f15b29] shadow-inner"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full border-2 border-dashed border-[#d0e4f0] flex items-center justify-center text-white font-black text-xl"
                      style={{ backgroundColor: formCouleur }}
                    >
                      {formNom ? formNom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#f15b29] text-white flex items-center justify-center shadow-xs hover:bg-[#d44d1f] cursor-pointer transition-colors"
                    title="Changer la photo"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={formNom}
                    onChange={(e) => setFormNom(e.target.value)}
                    placeholder="Ex: Mme la Présidente de l'OPE"
                    className="w-full bg-[#f4f8fb] border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#f15b29]"
                  />
                </div>
              </div>

              {/* Titre + Sous-titre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Titre / Fonction *</label>
                  <input
                    type="text"
                    required
                    value={formTitre}
                    onChange={(e) => setFormTitre(e.target.value)}
                    placeholder="Ex: Présidente, Secrétaire Général..."
                    className="w-full bg-[#f4f8fb] border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#f15b29]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Organisation</label>
                  <input
                    type="text"
                    value={formSousTitre}
                    onChange={(e) => setFormSousTitre(e.target.value)}
                    placeholder="Organisation pour la Promotion de l'Excellence (OPE)"
                    className="w-full bg-[#f4f8fb] border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#f15b29]"
                  />
                </div>
              </div>

              {/* Couleurs */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-2">Couleurs de la carte</label>
                {/* Presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d0e4f0] text-[11px] font-bold text-gray-700 hover:border-[#f15b29] transition-colors cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: preset.couleur }} />
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* Pickers custom */}
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-gray-500">Principale</label>
                    <input
                      type="color"
                      value={formCouleur}
                      onChange={(e) => setFormCouleur(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[#d0e4f0] cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-400 font-mono">{formCouleur}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-gray-500">Fond clair</label>
                    <input
                      type="color"
                      value={formCouleurLight}
                      onChange={(e) => setFormCouleurLight(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[#d0e4f0] cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-400 font-mono">{formCouleurLight}</span>
                  </div>
                </div>
              </div>

              {/* Citation / Exergue */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Citation / Exergue *
                  <span className="text-[10px] text-gray-400 font-normal ml-1">(affichée en grand sur la carte)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formExergue}
                  onChange={(e) => setFormExergue(e.target.value)}
                  placeholder="Ex: Ensemble construisons le Niger&#10;Soyons positifs"
                  className="w-full bg-[#f4f8fb] border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#f15b29]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Pour afficher sur 2 lignes, utilisez <code className="bg-gray-100 px-1 rounded">\n</code> entre les deux parties.
                </p>
              </div>

              {/* Message / Biographie */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">
                  Message / Biographie *
                  <span className="text-[10px] text-gray-400 font-normal ml-1">(séparez les paragraphes par une ligne vide)</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={formMot}
                  onChange={(e) => setFormMot(e.target.value)}
                  placeholder={"Premier paragraphe du message...\n\nDeuxième paragraphe...\n\nTroisième paragraphe..."}
                  className="w-full bg-[#f4f8fb] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-[#f15b29] resize-y font-mono"
                />
              </div>

              {/* Ordre + Actif */}
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    min={0}
                    value={formOrdre}
                    onChange={(e) => setFormOrdre(Number(e.target.value))}
                    className="w-24 bg-[#f4f8fb] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#f15b29]"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none pt-4">
                  <input
                    type="checkbox"
                    checked={formActif}
                    onChange={(e) => setFormActif(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#f15b29] focus:ring-[#f15b29] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-800">Afficher sur le site public</span>
                </label>
              </div>

              {/* Footer */}
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
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#f15b29] hover:bg-[#d44d1f] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : editingActeur ? "Enregistrer" : "Ajouter l'acteur"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL : APERÇU
          ══════════════════════════════════════════════════════════════════════ */}
      {previewActeur && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPreviewActeur(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bande couleur + photo */}
            <div className="h-24 relative" style={{ backgroundColor: previewActeur.couleur }}>
              <button
                type="button"
                onClick={() => setPreviewActeur(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute -bottom-10 left-6">
                <Avatar acteur={previewActeur} size="lg" />
              </div>
            </div>

            {/* Corps */}
            <div className="px-6 pt-14 pb-6 space-y-4">
              <div>
                <p className="font-black text-gray-900 text-lg">{previewActeur.nom}</p>
                <p className="text-xs font-bold" style={{ color: previewActeur.couleur }}>{previewActeur.titre}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{previewActeur.sous_titre}</p>
              </div>

              {/* Exergue */}
              <div className="rounded-2xl p-4" style={{ backgroundColor: previewActeur.couleur_light || "#f4f8fb" }}>
                <p
                  className="text-sm font-bold italic leading-snug whitespace-pre-line"
                  style={{ color: previewActeur.couleur }}
                >
                  « {previewActeur.exergue} »
                </p>
              </div>

              {/* Paragraphes du message */}
              {previewActeur.mot && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {previewActeur.mot.split(/\n\n+/).map((para, i) => (
                    <p key={i} className="text-xs text-gray-600 leading-relaxed">
                      {para.trim()}
                    </p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setPreviewActeur(null); openEditModal(previewActeur); }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#193549] hover:bg-[#2F6084] cursor-pointer transition-colors"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewActeur(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
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
      {deleteCandidate && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-gray-200 p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">Supprimer cet acteur ?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-bold text-gray-800">{deleteCandidate.nom}</span> sera retiré définitivement de la page publique. Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
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
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer shadow-xs"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

