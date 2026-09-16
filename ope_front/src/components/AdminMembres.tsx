import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { membreService, type MembreEquipe } from "../services";
import Pagination from "./Pagination";

// ── Palette dynamique des badges de section ─────────────────────────────────
const getSectionBadge = (section: string) => {
  const BADGE_PALETTES = [
    { badgeClass: "bg-[#FDF3EE] text-[#B85028] border-[#F0C5AE]" },
    { badgeClass: "bg-[#EBF2F7] text-[#193549] border-[#C5D8E8]" },
    { badgeClass: "bg-[#F0ECE8] text-[#6B4533] border-[#D9C4B8]" },
    { badgeClass: "bg-[#EAF5F2] text-[#1D6353] border-[#BDE0D6]" },
    { badgeClass: "bg-[#FEF6E9] text-[#9A6700] border-[#FCE1B4]" },
  ];
  if (!section) return BADGE_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < section.length; i++) {
    hash = section.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BADGE_PALETTES.length;
  return BADGE_PALETTES[index];
};


export default function AdminMembres() {
  const [membres, setMembres] = useState<MembreEquipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedActif, setSelectedActif] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMembre, setEditingMembre] = useState<MembreEquipe | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MembreEquipe | null>(null);
  const [previewMembre, setPreviewMembre] = useState<MembreEquipe | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formNom, setFormNom] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLinkedin, setFormLinkedin] = useState("");
  const [formOrdre, setFormOrdre] = useState(0);
  const [formActif, setFormActif] = useState(true);
  const [formPhotoFile, setFormPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Chargement ────────────────────────────────────────────────────────────
  const fetchMembres = async () => {
    setIsLoading(true);
    try {
      const data = await membreService.getMembres();
      const items = Array.isArray(data) ? data : (data as any)?.results || [];
      setMembres(items);
    } catch (err: any) {
      showToast("Impossible de charger la liste des membres. Vérifiez votre connexion et réessayez.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMembres(); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Sections disponibles (uniques) ────────────────────────────────────────
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    membres.forEach((m) => {
      if (m.section && m.section.trim()) {
        set.add(m.section.trim());
      }
    });
    return Array.from(set).sort();
  }, [membres]);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filteredMembres = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return membres.filter((m) => {
      const matchesSection =
        selectedSection === "all" ||
        (m.section && m.section.trim().toLowerCase() === selectedSection.trim().toLowerCase());
      const matchesActif =
        selectedActif === "all" ||
        (selectedActif === "actif" && m.actif) ||
        (selectedActif === "inactif" && !m.actif);
      const matchesSearch =
        q === "" ||
        m.nom.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (m.section || "").toLowerCase().includes(q);
      return matchesSection && matchesActif && matchesSearch;
    });
  }, [membres, selectedSection, selectedActif, searchQuery]);

  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSection, selectedActif, searchQuery]);

  // Membres paginés
  const paginatedMembres = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembres.slice(start, start + itemsPerPage);
  }, [filteredMembres, currentPage, itemsPerPage]);

  // ── Stats rapides ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = membres.length;
    const actifs = membres.filter((m) => m.actif).length;
    const inactifs = total - actifs;
    return { total, actifs, inactifs, sectionsCount: availableSections.length };
  }, [membres, availableSections]);

  // ── Ouvrir Modal Création ─────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingMembre(null);
    setFormNom(""); setFormRole(""); setFormSection("");
    setFormDescription(""); setFormEmail(""); setFormLinkedin("");
    setFormOrdre(membres.length); setFormActif(true);
    setFormPhotoFile(null); setPhotoPreviewUrl(null);
    setIsModalOpen(true);
  };

  // ── Ouvrir Modal Édition ──────────────────────────────────────────────────
  const openEditModal = (m: MembreEquipe) => {
    setEditingMembre(m);
    setFormNom(m.nom); setFormRole(m.role); setFormSection(m.section || "");
    setFormDescription(m.description || ""); setFormEmail(m.email || "");
    setFormLinkedin(m.linkedin || ""); setFormOrdre(m.ordre); setFormActif(m.actif);
    setFormPhotoFile(null); setPhotoPreviewUrl(m.photo || null);
    setIsModalOpen(true);
  };

  // ── Gestion photo ─────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ── Soumission formulaire ─────────────────────────────────────────────────
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim()) { showToast("Le nom du membre est obligatoire.", "error"); return; }
    if (!formRole.trim()) { showToast("Le rôle / titre est obligatoire.", "error"); return; }
    if (!formSection.trim()) { showToast("La section est obligatoire.", "error"); return; }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nom", formNom.trim());
      formData.append("role", formRole.trim().toUpperCase());
      formData.append("section", formSection.trim());
      formData.append("description", formDescription.trim());
      formData.append("email", formEmail.trim());
      formData.append("linkedin", formLinkedin.trim());
      formData.append("ordre", String(formOrdre));
      formData.append("actif", formActif ? "true" : "false");
      if (formPhotoFile) formData.append("photo", formPhotoFile);

      if (editingMembre) {
        const updated = await membreService.updateMembre(editingMembre.id, formData);
        setMembres((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        showToast("Les informations du membre ont bien été mises à jour.", "success");
      } else {
        const created = await membreService.createMembre(formData);
        setMembres((prev) => [...prev, created]);
        showToast("Nouveau membre ajouté à l'équipe avec succès.", "success");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast("L'enregistrement a échoué. Vérifiez les champs et réessayez. Si le problème persiste, contactez l'administrateur.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Toggle actif ──────────────────────────────────────────────────────────
  const toggleActif = async (m: MembreEquipe) => {
    try {
      const updated = await membreService.updateMembre(m.id, { actif: !m.actif });
      setMembres((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      showToast(updated.actif ? "Le membre est maintenant visible sur le site public." : "Le membre a été masqué du site.", "success");
    } catch (err: any) {
      showToast("Impossible de changer la visibilité de ce membre. Réessayez ou rafraîchissez la page.", "error");
    }
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await membreService.deleteMembre(deleteCandidate.id);
      setMembres((prev) => prev.filter((m) => m.id !== deleteCandidate.id));
      showToast("Le membre a été supprimé définitivement.", "success");
      setDeleteCandidate(null);
    } catch (err: any) {
      showToast("La suppression a échoué. L'entrée est peut-être déjà retirée ou une erreur réseau s'est produite.", "error");
    }
  };

  // ── Avatar (photo ou initiales) ───────────────────────────────────────────
  const Avatar = ({
    membre,
    size = "md",
  }: {
    membre: MembreEquipe;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClass = size === "sm" ? "w-10 h-10 text-xs" : size === "lg" ? "w-24 h-24 text-2xl" : "w-14 h-14 text-base";
    const initials = membre.nom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    if (membre.photo) {
      return (
        <img
          src={membre.photo}
          alt={membre.nom}
          className={`${sizeClass} rounded-full object-cover border-2 border-[#EFECE6] shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-[#B85028] to-[#6B4533] text-white font-black flex items-center justify-center shrink-0`}
      >
        {initials}
      </div>
    );
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
            Membres de l'OPE
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
          <span>Ajouter un membre</span>
        </button>
      </div>

      {/* ── Statistiques rapides ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Actifs", value: stats.actifs, color: "text-[#B85028]" },
          { label: "Masqués", value: stats.inactifs, color: "text-gray-500" },
          { label: "Sections", value: stats.sectionsCount, color: "text-[#193549]" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${s.color}`}>
              {s.label}
            </span>
            <span className={`text-2xl font-black mt-1 block ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, rôle..."
            className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B85028]"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filtre Section */}
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
        >
          <option value="all">Toutes les sections ({availableSections.length})</option>
          {availableSections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        {/* Filtre Statut */}
        <select
          value={selectedActif}
          onChange={(e) => setSelectedActif(e.target.value)}
          className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B85028] cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Visibles sur le site</option>
          <option value="inactif">Masqués</option>
        </select>

        {/* Rafraîchir */}
        <button
          type="button"
          onClick={fetchMembres}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] text-gray-600 hover:bg-[#EFECE6] cursor-pointer transition-colors"
          title="Rafraîchir"
        >
          <svg className={`w-4 h-4 ${isLoading ? "animate-spin text-[#B85028]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* ── Contenu principal ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-8 space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EFECE6]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#EFECE6] rounded w-1/4" />
                <div className="h-3 bg-[#EFECE6] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMembres.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EFECE6] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#FDF3EE] text-[#B85028] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1">Aucun membre trouvé</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
            Aucun membre ne correspond à vos filtres. Commencez par ajouter un membre à l'équipe.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#B85028] hover:bg-[#a0431f] cursor-pointer shadow-xs transition-colors"
          >
            + Ajouter un membre
          </button>
        </div>
      ) : (
        /* ── Tableau ──────────────────────────────────────────────────────── */
        <div className="bg-white rounded-3xl border border-[#EFECE6] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EFECE6] bg-[#FAF7F2]/60 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Membre</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Contact</th>
                  <th className="py-3.5 px-4">Ordre</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6] text-xs">
                {paginatedMembres.map((membre) => {
                  const secBadge = getSectionBadge(membre.section);
                  return (
                    <tr key={membre.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      {/* Membre */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <Avatar membre={membre} size="sm" />
                          <div className="min-w-0">
                            <div
                              className="font-extrabold text-sm text-gray-900 truncate hover:text-[#B85028] cursor-pointer transition-colors"
                              onClick={() => setPreviewMembre(membre)}
                            >
                              {membre.nom}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 truncate mt-0.5">
                              {membre.role}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Section */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${secBadge.badgeClass}`}>
                          {membre.section || "Non assignée"}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="space-y-0.5">
                          {membre.email && (
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate max-w-[140px]">{membre.email}</span>
                            </div>
                          )}
                          {membre.linkedin && (
                            <a
                              href={membre.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#193549] hover:underline flex items-center gap-1"
                            >
                              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                              LinkedIn
                            </a>
                          )}
                          {!membre.email && !membre.linkedin && (
                            <span className="text-[10px] text-gray-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* Ordre */}
                      <td className="py-4 px-4 font-semibold text-gray-600">
                        #{membre.ordre}
                      </td>

                      {/* Statut */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => toggleActif(membre)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                            membre.actif
                              ? "bg-[#FDF3EE] text-[#B85028] border border-[#F0C5AE] hover:bg-[#F9E4D6]"
                              : "bg-[#FAF7F2] text-[#6B4533] border border-[#EFECE6] hover:bg-[#EFECE6]"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${membre.actif ? "bg-[#B85028]" : "bg-[#9C8578]"}`} />
                          {membre.actif ? "Visible" : "Masqué"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right sm:pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {/* Aperçu */}
                          <button
                            type="button"
                            onClick={() => setPreviewMembre(membre)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Voir le profil"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {/* Éditer */}
                          <button
                            type="button"
                            onClick={() => openEditModal(membre)}
                            className="p-1.5 rounded-lg text-[#193549] hover:bg-[#EBF2F7] transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Supprimer */}
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(membre)}
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
      )}

      {/* Pagination */}
      {filteredMembres.length > 0 && !isLoading && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredMembres.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="membres"
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
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDF3EE] text-[#B85028] flex items-center justify-center">
                  {editingMembre ? (
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
                    {editingMembre ? "Modifier le membre" : "Ajouter un membre"}
                  </h3>
                  <p className="text-[11px] text-gray-500">Équipe OPE Agadez — CNCEIZ 2026</p>
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
              {/* Photo + Nom */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt="Aperçu"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#B85028] shadow-inner"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border-2 border-dashed border-[#EFECE6] flex items-center justify-center text-gray-400">
                      <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#B85028] text-white flex items-center justify-center shadow-xs hover:bg-[#a0431f] cursor-pointer transition-colors"
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
                    placeholder="Ex: Moussa Ibrahim Mahamane"
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                  />
                </div>
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">Rôle / Titre *</label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="Ex: COORDINATEUR GÉNÉRAL, POINT FOCAL AGADEZ..."
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                />
              </div>

              {/* Section + Ordre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Section *</label>
                  <input
                    type="text"
                    required
                    list="admin-sections-list"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    placeholder="Saisir la section (ex: Bureau exécutif...)"
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                  />
                  <datalist id="admin-sections-list">
                    {availableSections.map((sec) => (
                      <option key={sec} value={sec} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    min={0}
                    value={formOrdre}
                    onChange={(e) => setFormOrdre(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#B85028]"
                  />
                </div>
              </div>

              {/* Email + LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Email de contact</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-1">Lien LinkedIn</label>
                  <input
                    type="url"
                    value={formLinkedin}
                    onChange={(e) => setFormLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#B85028]"
                  />
                </div>
              </div>

              {/* Biographie */}
              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-1">Courte biographie</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Présentation synthétique du rôle et du parcours du membre..."
                  className="w-full bg-[#FAF7F2] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-[#B85028]"
                />
              </div>

              {/* Visible sur le site */}
              <div className="pt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formActif}
                    onChange={(e) => setFormActif(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#B85028] focus:ring-[#B85028] cursor-pointer"
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
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#B85028] hover:bg-[#a0431f] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Enregistrement..." : editingMembre ? "Enregistrer" : "Ajouter le membre"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL : PROFIL (Aperçu)
          ══════════════════════════════════════════════════════════════════════ */}
      {previewMembre && createPortal(
        <div
          className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPreviewMembre(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bande couleur + photo */}
            <div className="h-24 bg-gradient-to-r from-[#193549] to-[#B85028] relative">
              <button
                type="button"
                onClick={() => setPreviewMembre(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute -bottom-8 left-6">
                <Avatar membre={previewMembre} size="lg" />
              </div>
            </div>

            <div className="pt-12 px-6 pb-6 space-y-4">
              <div>
                <h3 className="font-black text-xl text-gray-900">{previewMembre.nom}</h3>
                <p className="text-xs font-bold text-[#B85028] uppercase tracking-wider mt-0.5">
                  {previewMembre.role}
                </p>
                {previewMembre.section && (
                  <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSectionBadge(previewMembre.section).badgeClass}`}>
                    {previewMembre.section}
                  </span>
                )}
              </div>

              {previewMembre.description && (
                <p className="text-xs text-gray-600 leading-relaxed bg-[#FAF7F2] p-3 rounded-xl border border-[#EFECE6]">
                  {previewMembre.description}
                </p>
              )}

              <div className="space-y-2">
                {previewMembre.email && (
                  <a href={`mailto:${previewMembre.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#B85028] transition-colors">
                    <svg className="w-4 h-4 text-[#B85028] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {previewMembre.email}
                  </a>
                )}
                {previewMembre.linkedin && (
                  <a href={previewMembre.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#193549] hover:underline">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Voir le profil LinkedIn
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => { setPreviewMembre(null); openEditModal(previewMembre); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#193549] bg-[#EBF2F7] hover:bg-[#C5D8E8] cursor-pointer transition-colors"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMembre(null)}
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
          MODAL : CONFIRMATION SUPPRESSION
          ══════════════════════════════════════════════════════════════════════ */}
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
            <h3 className="font-extrabold text-gray-900 text-base mb-1">Supprimer ce membre ?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Voulez-vous supprimer définitivement{" "}
              <strong className="text-gray-800">« {deleteCandidate.nom} »</strong> de l'équipe ? Cette action est irréversible.
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
