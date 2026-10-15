import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  REGIONS_NIGER_OPTIONS,
  MAISON_OPTIONS,
  CLASSES_JUNIOR_OPTIONS,
  DOMAINES_STEAM_OPTIONS,
  STADES_DEVELOPPEMENT_OPTIONS,
  PHONE_REGEX,
  EMAIL_REGEX,
} from "../types/formulaire";
import { talentService, type Candidature } from "../services";

interface AddTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTalent: Candidature) => void;
}

export const AddTalentModal: React.FC<AddTalentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [categorie, setCategorie] = useState<"senior" | "junior">("senior");
  const [maison, setMaison] = useState<string>("steam");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [regionVille, setRegionVille] = useState("Agadez");
  const [telephone, setTelephone] = useState("");

  // Senior
  const [sexe, setSexe] = useState<"M" | "F">("M");
  const [email, setEmail] = useState("");
  const [domaineSteam, setDomaineSteam] = useState("robotique");
  const [domaineSteamAutre, setDomaineSteamAutre] = useState("");
  const [innovationNom, setInnovationNom] = useState("");
  const [innovationDescription, setInnovationDescription] = useState("");
  const [stadeDeveloppement, setStadeDeveloppement] = useState("prototype");
  const [lienPortfolio, setLienPortfolio] = useState("");
  const [participeDefile, setParticipeDefile] = useState(false);
  const [oeuvreDefile, setOeuvreDefile] = useState("");
  const [photoIdentite, setPhotoIdentite] = useState<File | null>(null);
  const [preuvesRealisation, setPreuvesRealisation] = useState<File | null>(null);

  // Junior
  const [classe, setClasse] = useState("4e");
  const [etablissement, setEtablissement] = useState("");
  const [nomTuteur, setNomTuteur] = useState("");
  const [telephoneTuteur, setTelephoneTuteur] = useState("");
  const [mascotteNom, setMascotteNom] = useState("");
  const [mascottePourquoi, setMascottePourquoi] = useState("");
  const [mascotteSignification, setMascotteSignification] = useState("");
  const [mascotteDessin, setMascotteDessin] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!nom.trim()) errs.nom = "Le nom de famille est obligatoire.";
    if (!prenom.trim()) errs.prenom = "Le prénom est obligatoire.";
    if (!regionVille) errs.regionVille = "La région de résidence est obligatoire.";
    if (!maison) errs.maison = "La maison est obligatoire.";

    if (categorie === "senior") {
      if (!email.trim()) {
        errs.email = "L'adresse e-mail est obligatoire.";
      } else if (!EMAIL_REGEX.test(email.trim())) {
        errs.email = "Format d'adresse e-mail invalide.";
      }

      if (!telephone.trim()) {
        errs.telephone = "Le numéro de téléphone est obligatoire.";
      } else if (!PHONE_REGEX.test(telephone.trim())) {
        errs.telephone = "Format de numéro de téléphone invalide.";
      }

      if (!domaineSteam) errs.domaineSteam = "Le domaine STEAM est obligatoire.";
      if (domaineSteam === "autre" && !domaineSteamAutre.trim()) {
        errs.domaineSteamAutre = "Veuillez préciser le domaine STEAM.";
      }

      if (!innovationNom.trim()) {
        errs.innovationNom = "Le nom de l'innovation / projet est obligatoire.";
      }
      if (!innovationDescription.trim()) {
        errs.innovationDescription = "La description du projet est obligatoire.";
      }
      if (!stadeDeveloppement) {
        errs.stadeDeveloppement = "Le stade de développement est obligatoire.";
      }
    } else {
      // Junior
      if (!classe) errs.classe = "La classe est obligatoire.";
      if (!nomTuteur.trim()) errs.nomTuteur = "Le nom du parent ou tuteur est obligatoire.";
      if (!telephoneTuteur.trim()) {
        errs.telephoneTuteur = "Le téléphone du parent/tuteur est obligatoire.";
      } else if (!PHONE_REGEX.test(telephoneTuteur.trim())) {
        errs.telephoneTuteur = "Format de numéro de téléphone invalide.";
      }
      if (!mascotteNom.trim()) {
        errs.mascotteNom = "Le nom de la mascotte est obligatoire.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("categorie", categorie);
      formData.append("maison", maison);
      formData.append("nom", nom.trim());
      formData.append("prenom", prenom.trim());
      formData.append("region_ville", regionVille);
      formData.append("statut", "admis");
      formData.append("note_interne", "Ajouté manuellement par le comité d'organisation");

      if (categorie === "senior") {
        formData.append("sexe", sexe);
        formData.append("email", email.trim());
        formData.append("telephone", telephone.trim());
        formData.append("domaine_steam", domaineSteam);
        if (domaineSteam === "autre") {
          formData.append("domaine_steam_autre", domaineSteamAutre.trim());
        }
        formData.append("innovation_nom", innovationNom.trim());
        formData.append("innovation_description", innovationDescription.trim());
        formData.append("stade_developpement", stadeDeveloppement);
        if (lienPortfolio.trim()) {
          formData.append("lien_portfolio", lienPortfolio.trim());
        }
        formData.append("participe_defile", String(participeDefile));
        if (participeDefile && oeuvreDefile.trim()) {
          formData.append("oeuvre_defile", oeuvreDefile.trim());
        }
        formData.append("disponible_camps", "true");
        formData.append("accepte_conditions", "true");

        if (photoIdentite) formData.append("photo_identite", photoIdentite);
        if (preuvesRealisation) formData.append("preuves_realisation", preuvesRealisation);
      } else {
        // Junior
        formData.append("classe", classe);
        if (etablissement.trim()) formData.append("etablissement", etablissement.trim());
        if (telephone.trim()) formData.append("telephone", telephone.trim());
        formData.append("nom_tuteur", nomTuteur.trim());
        formData.append("telephone_tuteur", telephoneTuteur.trim());
        formData.append("mascotte_nom", mascotteNom.trim());
        if (mascottePourquoi.trim()) formData.append("mascotte_pourquoi", mascottePourquoi.trim());
        if (mascotteSignification.trim()) formData.append("mascotte_signification", mascotteSignification.trim());
        formData.append("autorisation_parent", "true");
        formData.append("accord_utilisation_dessin", "true");

        if (mascotteDessin) formData.append("mascotte_dessin", mascotteDessin);
      }

      const created = await talentService.createTalent(formData);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error("Erreur ajout talent admin :", err);
      const detail =
        err?.data?.detail ||
        (err?.data && typeof err.data === "object"
          ? Object.entries(err.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : null) ||
        err?.message ||
        "Une erreur est survenue lors de l'enregistrement du talent.";
      setErrors({ server: detail });
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
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#d0e4f0] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#193549] to-[#254d6a] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#f15b29] text-white flex items-center justify-center font-black shadow-md">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Ajouter un Nouveau Talent
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Enregistrement direct dans le vivier national des 1 000 Talents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
            title="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulaire défilant */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs text-gray-700">
          {errors.server && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errors.server}</span>
            </div>
          )}

          {/* 1. Choix du Parcours (Senior ou Junior) */}
          <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={() => setCategorie("senior")}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                categorie === "senior"
                  ? "bg-white text-[#193549] shadow-sm border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#f15b29]" />
              Parcours Senior • Innovation STEAM
            </button>
            <button
              type="button"
              onClick={() => setCategorie("junior")}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                categorie === "junior"
                  ? "bg-white text-[#193549] shadow-sm border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Parcours Junior • Mascotte (Collège)
            </button>
          </div>

          {/* 2. Identité du Talent (Communs) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
              1. Identité & Coordonnées Civiles
            </h3>

            {/* Maison d'Excellence */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Maison d'Excellence *
              </label>
              <select
                value={maison}
                onChange={(e) => setMaison(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border bg-white font-bold text-xs focus:outline-none cursor-pointer ${
                  errors.maison ? "border-rose-500" : "border-gray-300 focus:border-[#f15b29]"
                }`}
              >
                {MAISON_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {errors.maison && <p className="text-rose-600 text-[10px] mt-0.5">{errors.maison}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Nom de famille *
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Harouna"
                  className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                    errors.nom ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                  }`}
                />
                {errors.nom && <p className="text-rose-600 text-[10px] mt-0.5">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Prénom(s) *
                </label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex: Amina"
                  className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                    errors.prenom ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                  }`}
                />
                {errors.prenom && <p className="text-rose-600 text-[10px] mt-0.5">{errors.prenom}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Région de résidence (Obligatoire) *
                </label>
                <select
                  value={regionVille}
                  onChange={(e) => setRegionVille(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border bg-white font-semibold text-xs focus:outline-none cursor-pointer ${
                    errors.regionVille ? "border-rose-500" : "border-gray-300 focus:border-[#f15b29]"
                  }`}
                >
                  {REGIONS_NIGER_OPTIONS.map((reg) => (
                    <option key={reg.value} value={reg.value}>
                      {reg.label}
                    </option>
                  ))}
                </select>
                {errors.regionVille && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{errors.regionVille}</p>
                )}
              </div>

              {categorie === "senior" ? (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Sexe *
                  </label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value as "M" | "F")}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs focus:border-[#f15b29] focus:outline-none cursor-pointer"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Classe actuelle *
                  </label>
                  <select
                    value={classe}
                    onChange={(e) => setClasse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs focus:border-[#f15b29] focus:outline-none cursor-pointer"
                  >
                    {CLASSES_JUNIOR_OPTIONS.map((cl) => (
                      <option key={cl.value} value={cl.value}>
                        {cl.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {categorie === "senior" ? "Téléphone *" : "Téléphone direct (facultatif)"}
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: +227 90 12 34 56"
                  className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                    errors.telephone ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                  }`}
                />
                {errors.telephone && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{errors.telephone}</p>
                )}
              </div>

              {categorie === "senior" && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Adresse e-mail *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: aminaharouna@gmail.com"
                    className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                      errors.email ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-rose-600 text-[10px] mt-0.5">{errors.email}</p>
                  )}
                </div>
              )}

              {categorie === "junior" && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Nom du collège / Établissement
                  </label>
                  <input
                    type="text"
                    value={etablissement}
                    onChange={(e) => setEtablissement(e.target.value)}
                    placeholder="Ex: CEG 1 d'Agadez"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#f15b29] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 4. Détails Spécifiques Senior */}
          {categorie === "senior" && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
                2. Innovation STEAM & Projet
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Domaine STEAM *
                  </label>
                  <select
                    value={domaineSteam}
                    onChange={(e) => setDomaineSteam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs focus:border-[#f15b29] focus:outline-none cursor-pointer"
                  >
                    {DOMAINES_STEAM_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Stade de développement *
                  </label>
                  <select
                    value={stadeDeveloppement}
                    onChange={(e) => setStadeDeveloppement(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-xs focus:border-[#f15b29] focus:outline-none cursor-pointer"
                  >
                    {STADES_DEVELOPPEMENT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {domaineSteam === "autre" && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Préciser le domaine STEAM *
                  </label>
                  <input
                    type="text"
                    value={domaineSteamAutre}
                    onChange={(e) => setDomaineSteamAutre(e.target.value)}
                    placeholder="Ex: Éco-matériaux locaux"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#f15b29] focus:outline-none"
                  />
                  {errors.domaineSteamAutre && (
                    <p className="text-rose-600 text-[10px] mt-0.5">{errors.domaineSteamAutre}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Nom du produit / prototype / innovation *
                </label>
                <input
                  type="text"
                  value={innovationNom}
                  onChange={(e) => setInnovationNom(e.target.value)}
                  placeholder="Ex: Drone solaire de surveillance agricole"
                  className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                    errors.innovationNom ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                  }`}
                />
                {errors.innovationNom && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{errors.innovationNom}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Description succincte de l'innovation *
                </label>
                <textarea
                  rows={2}
                  value={innovationDescription}
                  onChange={(e) => setInnovationDescription(e.target.value)}
                  placeholder="Décrivez en quelques lignes le fonctionnement, le problème résolu et l'impact..."
                  className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                    errors.innovationDescription
                      ? "border-rose-500 bg-rose-50/20"
                      : "border-gray-300 focus:border-[#f15b29]"
                  }`}
                />
                {errors.innovationDescription && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{errors.innovationDescription}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Photo d'identité (facultatif)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoIdentite(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Preuve / Document du projet (facultatif)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setPreuvesRealisation(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Lien portfolio / vidéo de démo (facultatif)
                </label>
                <input
                  type="url"
                  value={lienPortfolio}
                  onChange={(e) => setLienPortfolio(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#f15b29] focus:outline-none"
                />
              </div>

              <div className="pt-1 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 text-xs select-none">
                  <input
                    type="checkbox"
                    checked={participeDefile}
                    onChange={(e) => setParticipeDefile(e.target.checked)}
                    className="w-4 h-4 rounded text-[#f15b29] focus:ring-[#f15b29] border-gray-300"
                  />
                  <span>Présentation au défilé scientifique d'ouverture</span>
                </label>
              </div>

              {participeDefile && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Œuvre à présenter au défilé
                  </label>
                  <input
                    type="text"
                    value={oeuvreDefile}
                    onChange={(e) => setOeuvreDefile(e.target.value)}
                    placeholder="Ex: Prototype motorisé ou maquette fonctionnelle"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#f15b29] focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* 5. Détails Spécifiques Junior */}
          {categorie === "junior" && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1">
                2. Représentant Légal & Mascotte Proposée
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Nom du parent / tuteur légal *
                  </label>
                  <input
                    type="text"
                    value={nomTuteur}
                    onChange={(e) => setNomTuteur(e.target.value)}
                    placeholder="Ex: Ibrahim Harouna"
                    className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                      errors.nomTuteur ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                    }`}
                  />
                  {errors.nomTuteur && (
                    <p className="text-rose-600 text-[10px] mt-0.5">{errors.nomTuteur}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Téléphone du parent / tuteur *
                  </label>
                  <input
                    type="tel"
                    value={telephoneTuteur}
                    onChange={(e) => setTelephoneTuteur(e.target.value)}
                    placeholder="Ex: +227 90 00 11 22"
                    className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                      errors.telephoneTuteur ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                    }`}
                  />
                  {errors.telephoneTuteur && (
                    <p className="text-rose-600 text-[10px] mt-0.5">{errors.telephoneTuteur}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Nom proposé pour la mascotte *
                </label>
                <input
                  type="text"
                  value={mascotteNom}
                  onChange={(e) => setMascotteNom(e.target.value)}
                  placeholder="Ex: Taghalam le chamelon de la science"
                  className={`w-full px-3 py-2 rounded-xl border bg-white text-xs focus:outline-none ${
                    errors.mascotteNom ? "border-rose-500 bg-rose-50/20" : "border-gray-300 focus:border-[#f15b29]"
                  }`}
                />
                {errors.mascotteNom && (
                  <p className="text-rose-600 text-[10px] mt-0.5">{errors.mascotteNom}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Pourquoi ce nom ? (facultatif)
                  </label>
                  <textarea
                    rows={2}
                    value={mascottePourquoi}
                    onChange={(e) => setMascottePourquoi(e.target.value)}
                    placeholder="Explication du choix..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#f15b29] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Signification / Symbole (facultatif)
                  </label>
                  <textarea
                    rows={2}
                    value={mascotteSignification}
                    onChange={(e) => setMascotteSignification(e.target.value)}
                    placeholder="Que représente cette mascotte..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#f15b29] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Fichier ou dessin de la mascotte (photo/scan/PDF, facultatif pour l'admin)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setMascotteDessin(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Boutons d'Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 hover:bg-slate-50 cursor-pointer text-xs transition-all"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#f15b29] hover:bg-[#d44d1f] active:scale-95 cursor-pointer shadow-md transition-all flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Valider et Enregistrer le Talent</span>
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
