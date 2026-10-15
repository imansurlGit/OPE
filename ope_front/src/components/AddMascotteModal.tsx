import React, { useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS_NIGER_OPTIONS, CLASSES_JUNIOR_OPTIONS } from "../types/formulaire";
import {
  createCandidatureMascotteAdmin,
  type CandidatMascotteItem,
} from "../services/mascotteApi";

interface AddMascotteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCandidate: CandidatMascotteItem) => void;
}

export const AddMascotteModal: React.FC<AddMascotteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [classe, setClasse] = useState("4e");
  const [etablissement, setEtablissement] = useState("");
  const [regionVille, setRegionVille] = useState("Agadez");
  const [nomTuteur, setNomTuteur] = useState("");
  const [telephoneTuteur, setTelephoneTuteur] = useState("");
  const [mascotteNom, setMascotteNom] = useState("");
  const [mascottePourquoi, setMascottePourquoi] = useState("");
  const [mascotteSignification, setMascotteSignification] = useState("");
  const [mascotteDessin, setMascotteDessin] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statut, setStatut] = useState<"en_attente" | "valide">("valide");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          mascotteDessin: "Le fichier ne doit pas dépasser 10 Mo.",
        }));
        return;
      }
      setMascotteDessin(file);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.mascotteDessin;
        return next;
      });
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = "Le nom de famille est obligatoire.";
    if (!prenom.trim()) errs.prenom = "Le prénom est obligatoire.";
    if (!classe) errs.classe = "La classe est obligatoire.";
    if (!nomTuteur.trim()) errs.nomTuteur = "Le nom du tuteur est obligatoire.";
    if (!telephoneTuteur.trim()) errs.telephoneTuteur = "Le téléphone du tuteur est obligatoire.";
    if (!mascotteNom.trim()) errs.mascotteNom = "Le nom de la mascotte est obligatoire.";
    if (!mascotteDessin) errs.mascotteDessin = "Le dessin de la mascotte (image ou PDF) est obligatoire.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom.trim());
      formData.append("prenom", prenom.trim());
      formData.append("classe", classe);
      if (etablissement.trim()) formData.append("etablissement", etablissement.trim());
      formData.append("region_ville", regionVille);
      formData.append("nom_tuteur", nomTuteur.trim());
      formData.append("telephone_tuteur", telephoneTuteur.trim());
      formData.append("mascotte_nom", mascotteNom.trim());
      if (mascottePourquoi.trim()) formData.append("mascotte_pourquoi", mascottePourquoi.trim());
      if (mascotteSignification.trim()) formData.append("mascotte_signification", mascotteSignification.trim());
      if (mascotteDessin) formData.append("mascotte_dessin", mascotteDessin);
      formData.append("statut", statut);
      formData.append("autorisation_parent", "true");
      formData.append("accord_utilisation_dessin", "true");

      const created = await createCandidatureMascotteAdmin(formData);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error("Erreur création mascotte par l'admin :", err);
      if (err?.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        setErrors({
          global: err?.message || "Impossible d'ajouter le candidat. Vérifiez les informations saisies.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 lg:left-64 xl:left-72 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-[#d0e4f0] w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête du Modal (Identique AdminTalents / AddTalentModal) ── */}
        <div className="p-5 sm:p-6 bg-[#f4f8fb] border-b border-[#d0e4f0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#193549] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <svg className="w-5 h-5 text-[#f15b29]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Ajouter un candidat au Concours Mascotte
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Enregistrement direct d'une candidature junior
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#d0e4f0] flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* ── Formulaire défilable ── */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-xs">
          {errors.global && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errors.global}
            </div>
          )}

          {/* Section 1 : Identité du Collégien */}
          <div>
            <span className="text-[11px] font-black uppercase text-[#2F6084] tracking-wider block border-b border-[#d0e4f0] pb-2 mb-3">
              1. Identité du Candidat (Collégien)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nom de famille <span className="text-[#f15b29]">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Harouna"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.nom ? "border-rose-500 bg-rose-50/30" : "border-[#d0e4f0] bg-[#f4f8fb]/50"
                  } focus:outline-none focus:border-[#f15b29] focus:bg-white`}
                />
                {errors.nom && <p className="text-[11px] text-rose-600 mt-1">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Prénom(s) <span className="text-[#f15b29]">*</span>
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex: Amina"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.prenom ? "border-rose-500 bg-rose-50/30" : "border-[#d0e4f0] bg-[#f4f8fb]/50"
                  } focus:outline-none focus:border-[#f15b29] focus:bg-white`}
                />
                {errors.prenom && <p className="text-[11px] text-rose-600 mt-1">{errors.prenom}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Classe <span className="text-[#f15b29]">*</span>
                </label>
                <select
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#d0e4f0] bg-white font-semibold text-gray-700 focus:outline-none focus:border-[#f15b29]"
                >
                  {CLASSES_JUNIOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Collège / Établissement
                </label>
                <input
                  type="text"
                  value={etablissement}
                  onChange={(e) => setEtablissement(e.target.value)}
                  placeholder="Ex: CEG 1 Agadez"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#d0e4f0] bg-[#f4f8fb]/50 text-gray-700 focus:outline-none focus:border-[#f15b29] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Région ou Ville
                </label>
                <select
                  value={regionVille}
                  onChange={(e) => setRegionVille(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#d0e4f0] bg-white font-semibold text-gray-700 focus:outline-none focus:border-[#f15b29]"
                >
                  {REGIONS_NIGER_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 : Contact Parent / Tuteur */}
          <div>
            <span className="text-[11px] font-black uppercase text-[#2F6084] tracking-wider block border-b border-[#d0e4f0] pb-2 mb-3">
              2. Représentant Légal (Parent / Tuteur)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nom du parent ou tuteur <span className="text-[#f15b29]">*</span>
                </label>
                <input
                  type="text"
                  value={nomTuteur}
                  onChange={(e) => setNomTuteur(e.target.value)}
                  placeholder="Ex: Idrissa Harouna"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.nomTuteur ? "border-rose-500 bg-rose-50/30" : "border-[#d0e4f0] bg-[#f4f8fb]/50"
                  } focus:outline-none focus:border-[#f15b29] focus:bg-white`}
                />
                {errors.nomTuteur && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.nomTuteur}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Téléphone du tuteur <span className="text-[#f15b29]">*</span>
                </label>
                <input
                  type="tel"
                  value={telephoneTuteur}
                  onChange={(e) => setTelephoneTuteur(e.target.value)}
                  placeholder="Ex: +227 90 12 34 56"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.telephoneTuteur ? "border-rose-500 bg-rose-50/30" : "border-[#d0e4f0] bg-[#f4f8fb]/50"
                  } focus:outline-none focus:border-[#f15b29] focus:bg-white`}
                />
                {errors.telephoneTuteur && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.telephoneTuteur}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 : La Mascotte & Dessin */}
          <div>
            <span className="text-[11px] font-black uppercase text-[#2F6084] tracking-wider block border-b border-[#d0e4f0] pb-2 mb-3">
              3. Détails de la Mascotte & Dessin
            </span>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nom proposé pour la mascotte <span className="text-[#f15b29]">*</span>
                </label>
                <input
                  type="text"
                  value={mascotteNom}
                  onChange={(e) => setMascotteNom(e.target.value)}
                  placeholder="Ex: Taghalam, Fennec Innovateur"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.mascotteNom ? "border-rose-500 bg-rose-50/30" : "border-[#d0e4f0] bg-[#f4f8fb]/50"
                  } focus:outline-none focus:border-[#f15b29] focus:bg-white`}
                />
                {errors.mascotteNom && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.mascotteNom}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pourquoi ce nom ?
                </label>
                <textarea
                  rows={2}
                  value={mascottePourquoi}
                  onChange={(e) => setMascottePourquoi(e.target.value)}
                  placeholder="Origine ou symbolique du nom..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d0e4f0] bg-[#f4f8fb]/50 focus:outline-none focus:border-[#f15b29] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Que représente la mascotte ?
                </label>
                <textarea
                  rows={2}
                  value={mascotteSignification}
                  onChange={(e) => setMascotteSignification(e.target.value)}
                  placeholder="Animal, symbole d'Agadez, technologie..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#d0e4f0] bg-[#f4f8fb]/50 focus:outline-none focus:border-[#f15b29] focus:bg-white"
                />
              </div>

              {/* Upload Dessin */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Fichier du Dessin (Photo, Scan, JPG, PNG ou PDF) <span className="text-[#f15b29]">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition ${
                    errors.mascotteDessin ? "border-rose-400 bg-rose-50/20" : "border-[#d0e4f0] bg-[#f4f8fb]/40 hover:bg-[#f4f8fb]"
                  }`}
                >
                  {previewUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={previewUrl}
                        alt="Aperçu dessin"
                        className="h-32 object-contain rounded-lg border border-[#d0e4f0] shadow-2xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMascotteDessin(null);
                          setPreviewUrl(null);
                        }}
                        className="text-xs text-rose-600 hover:underline cursor-pointer font-semibold"
                      >
                        Changer de fichier
                      </button>
                    </div>
                  ) : mascotteDessin ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-700">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">{mascotteDessin.name}</span>
                      <button
                        type="button"
                        onClick={() => setMascotteDessin(null)}
                        className="text-xs text-rose-600 ml-2 hover:underline cursor-pointer font-semibold"
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="modal-mascotte-file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="modal-mascotte-file"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#d0e4f0] text-xs font-bold text-gray-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                      >
                        <svg className="w-4 h-4 text-[#f15b29]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Choisir un fichier</span>
                      </label>
                      <p className="text-[11px] text-gray-400 mt-1">Image JPG, PNG ou document PDF (max 10 Mo)</p>
                    </div>
                  )}
                </div>
                {errors.mascotteDessin && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.mascotteDessin}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4 : Statut Initial */}
          <div>
            <span className="text-[11px] font-black uppercase text-[#2F6084] tracking-wider block border-b border-[#d0e4f0] pb-2 mb-3">
              4. Statut Initial du Dossier
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="statut"
                  value="valide"
                  checked={statut === "valide"}
                  onChange={() => setStatut("valide")}
                  className="text-[#f15b29] focus:ring-[#f15b29]"
                />
                <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Validé directement
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="statut"
                  value="en_attente"
                  checked={statut === "en_attente"}
                  onChange={() => setStatut("en_attente")}
                  className="text-[#f15b29] focus:ring-[#f15b29]"
                />
                <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  En attente d'examen
                </span>
              </label>
            </div>
          </div>

          {/* Pied Modal (Boutons d'action) */}
          <div className="pt-4 border-t border-[#d0e4f0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#d0e4f0] text-gray-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#193549] hover:bg-[#122838] text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="text-slate-400" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="text-white" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-[#f15b29]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Enregistrer le candidat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddMascotteModal;
