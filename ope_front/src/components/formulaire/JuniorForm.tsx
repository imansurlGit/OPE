import React from "react";
import { useTranslation } from "react-i18next";
import type { JuniorData, JuniorErrors, MaisonType } from "../../types/formulaire";
import {
  getClassesOptionsForMaison,
  REGIONS_NIGER_OPTIONS,
} from "../../types/formulaire";
import {
  TextField,
  TextAreaField,
  SelectField,
  FileField,
  CheckboxCard,
} from "./FormFields";

export type JuniorFileFieldKey =
  | "photoIdentite"
  | "pieceIdentite"
  | "bulletinsScolaires"
  | "autorisationParentale"
  | "preuveProjet"
  | "lettreRecommandation";

interface JuniorFormProps {
  step: number;
  maison?: MaisonType;
  data: JuniorData;
  fieldErrors: JuniorErrors;
  onChangeField: <K extends keyof JuniorData>(field: K, value: JuniorData[K]) => void;
  onFileUpload: (field: JuniorFileFieldKey, file: File) => void;
  onFileRemove: (field: JuniorFileFieldKey) => void;
}

export const JuniorForm: React.FC<JuniorFormProps> = ({
  step,
  maison = "steam",
  data,
  fieldErrors,
  onChangeField,
  onFileUpload,
  onFileRemove,
}) => {
  const { t } = useTranslation();

  // Dynamique selon la Maison
  const classesOptions = getClassesOptionsForMaison(maison);

  const maisonLabel =
    maison === "local_project"
      ? "LP — Local Project"
      : maison === "mouvement_citoyen"
        ? "MC2 — Modèle de Citoyen Communautaire"
        : "STEAM — Sciences, Technologies, Ingénierie, Art et Mathématiques";

  const houseFieldLabel =
    maison === "local_project"
      ? "House visée (Local Project)"
      : maison === "mouvement_citoyen"
        ? "House visée (Engagement Citoyen)"
        : "House visée (STEAM)";

  const step2Title =
    maison === "local_project"
      ? "Étape 2 : House visée & Projet local"
      : maison === "mouvement_citoyen"
        ? "Étape 2 : House visée & Engagement citoyen"
        : "Étape 2 : House visée & Parcours / Projet STEAM";

  return (
    <div className="space-y-6">
      {/* ── ÉTAPE 1 : IDENTITÉ DU CANDIDAT ── */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F15B29] text-xs font-bold mb-2">
              <span>Domaine : {maisonLabel}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {t("form.junior.step1_title", "1. Identité du candidat")}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.junior.step1_subtitle",
                "Renseignez les informations d'identité, coordonnées et établissement scolaire.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label={t("form.nom", "Nom de famille")}
              name="nom"
              required
              placeholder="Ex: Harouna"
              value={data.nom}
              onChange={(e) => onChangeField("nom", e.target.value)}
              error={fieldErrors.nom}
            />
            <TextField
              label={t("form.prenom", "Prénom(s)")}
              name="prenom"
              required
              placeholder="Ex: Amina"
              value={data.prenom}
              onChange={(e) => onChangeField("prenom", e.target.value)}
              error={fieldErrors.prenom}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label={t("form.junior.sexe", "Sexe (M/F)")}
              name="sexe"
              required
              options={[
                { value: "M", label: "Masculin (M)" },
                { value: "F", label: "Féminin (F)" },
              ]}
              placeholder="Sélectionnez le sexe"
              value={data.sexe}
              onChange={(e) => onChangeField("sexe", e.target.value as JuniorData["sexe"])}
              error={fieldErrors.sexe}
            />
            <SelectField
              label={t("form.junior.region", "Région / Zone de pré-camp")}
              name="regionVille"
              required
              options={REGIONS_NIGER_OPTIONS}
              placeholder="Sélectionnez la région"
              value={data.regionVille}
              onChange={(e) => onChangeField("regionVille", e.target.value)}
              error={fieldErrors.regionVille}
            />
            <TextField
              label={t("form.junior.ville_village", "Ville / Village")}
              name="villeVillage"
              placeholder="Ex: Agadez ville, Tchirozerine, Bilma..."
              value={data.villeVillage}
              onChange={(e) => onChangeField("villeVillage", e.target.value)}
              error={fieldErrors.villeVillage}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              label={t("form.junior.nationalite", "Nationalité")}
              name="nationalite"
              placeholder="Ex: Nigérienne"
              value={data.nationalite}
              onChange={(e) => onChangeField("nationalite", e.target.value)}
              error={fieldErrors.nationalite}
            />
            <TextField
              label={t("form.junior.etablissement", "Établissement scolaire (collège/lycée)")}
              name="etablissement"
              placeholder="Ex: CEG 1 Agadez, Lycée Akokan..."
              value={data.etablissement}
              onChange={(e) => onChangeField("etablissement", e.target.value)}
              error={fieldErrors.etablissement}
            />
            <TextField
              label={t("form.junior.classe", "Classe")}
              name="classe"
              placeholder="Ex: 4ème, 3ème, Seconde..."
              value={data.classe}
              onChange={(e) => onChangeField("classe", e.target.value)}
              error={fieldErrors.classe}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label={t("form.junior.tel_candidat", "Téléphone candidat (si disponible)")}
              name="telephoneCandidat"
              type="tel"
              placeholder="Ex: +227 96 00 00 00"
              value={data.telephoneCandidat}
              onChange={(e) => onChangeField("telephoneCandidat", e.target.value)}
              error={fieldErrors.telephoneCandidat}
            />
            <TextField
              label={t("form.junior.email", "Adresse e-mail (si disponible)")}
              name="email"
              type="email"
              placeholder="Ex: junior@example.com"
              value={data.email}
              onChange={(e) => onChangeField("email", e.target.value)}
              error={fieldErrors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label={t("form.junior.tel_tuteur", "Téléphone parent/tuteur")}
              name="telephoneTuteur"
              type="tel"
              required
              placeholder="Ex: +227 90 12 34 56"
              value={data.telephoneTuteur}
              onChange={(e) => onChangeField("telephoneTuteur", e.target.value)}
              error={fieldErrors.telephoneTuteur}
              helperText="Obligatoire pour les mineurs"
            />
            <TextField
              label={t("form.junior.nom_point_focal", "Nom du point focal ayant assisté la candidature")}
              name="nomPointFocal"
              placeholder="Le cas échéant (enseignant, encadreur...)"
              value={data.nomPointFocal}
              onChange={(e) => onChangeField("nomPointFocal", e.target.value)}
              error={fieldErrors.nomPointFocal}
            />
          </div>

          <TextAreaField
            label={t("form.junior.biographie", "Biographie (100 mots max)")}
            name="biographie"
            rows={3}
            placeholder="Présentez-vous brièvement : votre parcours scolaire, vos passions, vos centres d'intérêt..."
            value={data.biographie}
            onChange={(e) => onChangeField("biographie", e.target.value)}
            error={fieldErrors.biographie}
          />
        </div>
      )}

      {/* ── ÉTAPE 2 : HOUSE VISÉE & PARCOURS / PROJET ── */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F15B29] text-xs font-bold mb-2">
              <span>Domaine : {maisonLabel}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {step2Title}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {maison === "mouvement_citoyen"
                ? "Note : les juniors n'ayant pas encore d'action concrète menée peuvent candidater sur la base d'une idée d'engagement ou d'une vocation citoyenne claire."
                : "Note : les juniors n'ayant pas encore de projet abouti peuvent candidater sur la base d'une idée, de résultats scolaires convaincants, ou d'une vocation claire pour le domaine."}
            </p>
          </div>

          {/* 2. House visée */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#193549]">
              2. {houseFieldLabel} <span className="text-[#F15B29]">*</span>
            </h3>
            <p className="text-xs text-[#5C6B76]">{t("form.junior_check_house", "Cocher la House ou classe visée dans ce domaine :")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {classesOptions.map((opt) => {
                const isChecked = data.houseVisee === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeField("houseVisee", opt.value)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? "border-[#F15B29] bg-white ring-2 ring-[#F15B29] text-[#193549]"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isChecked ? "border-[#F15B29] bg-[#F15B29]" : "border-slate-300"
                      }`}
                    >
                      {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.houseVisee && (
              <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.houseVisee}</p>
            )}

            {data.houseVisee === "autre" && (
              <div className="pt-2">
                <TextField
                  label={t("form.junior_specify_specialty", "Préciser votre House / spécialité")}
                  name="houseViseeAutre"
                  required
                  placeholder="Précisez votre domaine..."
                  value={data.houseViseeAutre}
                  onChange={(e) => onChangeField("houseViseeAutre", e.target.value)}
                  error={fieldErrors.houseViseeAutre}
                />
              </div>
            )}
          </div>

          {/* 3. Parcours et projet / Votre situation */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#193549]">
              3. {maison === "mouvement_citoyen" ? "Votre engagement citoyen" : "Votre situation"}{" "}
              <span className="text-[#F15B29]">*</span>
            </h3>
            <p className="text-xs text-[#5C6B76]">{t("form.junior_situation_question", "Sélectionnez la situation qui correspond à votre état d'avancement :")}</p>

            <div className="space-y-2 pt-1">
              {[
                {
                  value: "projet_actif",
                  label:
                    maison === "mouvement_citoyen"
                      ? "J'ai déjà mené une action citoyenne ou communautaire"
                      : maison === "local_project"
                        ? "Mon projet est déjà en activité"
                        : "J'ai déjà réalisé un projet ou une expérience scientifique/technique",
                },
                {
                  value: "idee_projet",
                  label:
                    maison === "mouvement_citoyen"
                      ? "J'ai une idée d'action que je souhaite mener"
                      : "J'ai une idée de projet que je souhaite développer",
                },
                {
                  value: "vocation_claire",
                  label:
                    maison === "mouvement_citoyen"
                      ? "Je n'ai pas encore d'action menée, mais j'ai une vocation citoyenne claire"
                      : "Je n'ai pas encore de projet, mais j'ai une vocation claire pour ce domaine",
                },
              ].map((sit) => {
                const isSelected = data.situation === sit.value;
                return (
                  <button
                    key={sit.value}
                    type="button"
                    onClick={() => onChangeField("situation", sit.value)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#F15B29] bg-white ring-2 ring-[#F15B29] text-[#193549]"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span>{sit.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#F15B29] bg-[#F15B29]" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.situation && (
              <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.situation}</p>
            )}
          </div>

          {/* Description du projet / idée */}
          <TextAreaField
            label={
              maison === "mouvement_citoyen"
                ? "Décrivez votre action déjà menée, votre idée, ou votre motivation citoyenne (bénéficiaires visés / résultat espéré)"
                : "Décrivez votre projet ou votre idée (contexte, objectif, ce que vous avez déjà fait ou envisagez de faire)"
            }
            name="descriptionProjet"
            rows={4}
            required
            placeholder="Détaillez votre projet, vos réalisations ou ce que vous prévoyez d'accomplir..."
            value={data.descriptionProjet}
            onChange={(e) => onChangeField("descriptionProjet", e.target.value)}
            error={fieldErrors.descriptionProjet}
          />

          {/* Champs spécifiques MC2 ou STEAM/LP */}
          {maison === "mouvement_citoyen" && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-[#193549] uppercase tracking-wider">
                Cet engagement est-il (si applicable) :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onChangeField("engagementType", "ponctuel")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    data.engagementType === "ponctuel"
                      ? "bg-[#193549] text-white border-[#193549]"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Ponctuel
                </button>
                <button
                  type="button"
                  onClick={() => onChangeField("engagementType", "regulier")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    data.engagementType === "regulier"
                      ? "bg-[#193549] text-white border-[#193549]"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Régulier
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Série/filière suivie ou visée (ex. Scientifique, autre)"
              name="filiereVisee"
              placeholder="Ex: Série Scientifique, Technique..."
              value={data.filiereVisee}
              onChange={(e) => onChangeField("filiereVisee", e.target.value)}
              error={fieldErrors.filiereVisee}
            />
            <TextField
              label="Moyenne ou résultat scolaire récent (si disponible)"
              name="moyenneScolaire"
              placeholder="Ex: 14.5/20 ou Tableau d'honneur"
              value={data.moyenneScolaire}
              onChange={(e) => onChangeField("moyenneScolaire", e.target.value)}
              error={fieldErrors.moyenneScolaire}
            />
          </div>

          <TextField
            label={
              maison === "local_project"
                ? "Contact d'une personne pouvant recommander (chef de village, coopérative, association, enseignant)"
                : maison === "mouvement_citoyen"
                  ? "Contact d'une personne pouvant recommander (enseignant, leader communautaire, radio partenaire)"
                  : "Contact d'un enseignant/encadreur pouvant vous recommander (nom + téléphone)"
            }
            name="contactRecommandation"
            placeholder="Ex: M. Souley (Professeur de Physique) - +227 96 00 00 00"
            value={data.contactRecommandation}
            onChange={(e) => onChangeField("contactRecommandation", e.target.value)}
            error={fieldErrors.contactRecommandation}
          />
        </div>
      )}

      {/* ── ÉTAPE 3 : MOTIVATION, APTITUDE NUMÉRIQUE & PIÈCES ── */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F15B29] text-xs font-bold mb-2">
              <span>Domaine : {maisonLabel}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {t("form.junior.step3_title", "Étape 3 : Motivation & Justificatifs")}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.junior.step3_subtitle",
                "Exprimez vos motivations, confirmez l'accès numérique et joignez les pièces demandées.",
              )}
            </p>
          </div>

          {/* 4. Motivation */}
          <TextAreaField
            label="4. Motivation : Pourquoi voulez-vous participer au CNCEIZ ? Qu'espérez-vous apporter à votre communauté après le camp ?"
            name="motivation"
            rows={4}
            required
            placeholder="Expliquez vos motivations et votre volonté d'avoir un impact positif dans votre région ou communauté..."
            value={data.motivation}
            onChange={(e) => onChangeField("motivation", e.target.value)}
            error={fieldErrors.motivation}
          />

          {/* Aptitude numérique */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#193549]">
                {t("form.step5_title", "Aptitude numérique")}
              </h3>
              <p className="text-xs text-[#5C6B76] leading-relaxed">
                <strong>{t("form.step5_numerique_label", "Avez-vous accès à un smartphone ou une tablette pendant le camp pour cette activité ?")}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { value: "personnel", label: t("form.step5_num_own", "Oui personnellement") },
                { value: "aide_tiers", label: t("form.step5_num_shared", "Oui avec l'aide d'un tiers") },
                {
                  value: "sur_place",
                  label: t("form.step5_num_place", "Non mais je m'organiserai sur place"),
                },
              ].map((opt) => {
                const isSelected = data.accesNumerique === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChangeField("accesNumerique", opt.value as JuniorData["accesNumerique"])
                    }
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-[#F15B29] bg-white ring-2 ring-[#F15B29] text-[#193549]"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? "border-[#F15B29] bg-[#F15B29]" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pièces à joindre */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#193549]">
              Pièces à joindre (selon la fiche d'inscription)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileField
                label="Photo professionnelle ou photo d'identité (format carré 1080x1080 px)"
                accept="image/*"
                previewImage
                fileInfo={data.photoIdentite}
                onFileSelect={(file) => onFileUpload("photoIdentite", file)}
                onFileRemove={() => onFileRemove("photoIdentite")}
                error={fieldErrors.photoIdentite}
                helperText="Photo couleur récente de bonne qualité • Max 10 Mo"
              />

              <FileField
                label="Carte scolaire, Pièce d'identité ou extrait de naissance"
                accept=".pdf,image/*"
                fileInfo={data.pieceIdentite}
                onFileSelect={(file) => onFileUpload("pieceIdentite", file)}
                onFileRemove={() => onFileRemove("pieceIdentite")}
                error={fieldErrors.pieceIdentite}
                helperText="Document d'état civil ou scolaire officiel • Max 10 Mo"
              />

              <FileField
                label="Deux derniers Bulletins Scolaires"
                accept=".pdf,image/*"
                fileInfo={data.bulletinsScolaires}
                onFileSelect={(file) => onFileUpload("bulletinsScolaires", file)}
                onFileRemove={() => onFileRemove("bulletinsScolaires")}
                error={fieldErrors.bulletinsScolaires}
                helperText="Bulletins scolaires récents ou relevés de notes • Max 10 Mo"
              />

              <FileField
                label="Autorisation parentale / tutorale signée"
                accept=".pdf,image/*"
                fileInfo={data.autorisationParentale}
                onFileSelect={(file) => onFileUpload("autorisationParentale", file)}
                onFileRemove={() => onFileRemove("autorisationParentale")}
                error={fieldErrors.autorisationParentale}
                helperText="Fiche d'autorisation signée par le parent ou tuteur • Max 10 Mo"
              />

              <FileField
                label="Preuve du projet / de l'engagement (facultatif)"
                accept=".pdf,image/*"
                fileInfo={data.preuveProjet}
                onFileSelect={(file) => onFileUpload("preuveProjet", file)}
                onFileRemove={() => onFileRemove("preuveProjet")}
                error={fieldErrors.preuveProjet}
                helperText="Photo, schéma, attestation ou document illustratif • Max 10 Mo"
              />

              <FileField
                label="Contact ou lettre de recommandation (facultatif)"
                accept=".pdf,image/*"
                fileInfo={data.lettreRecommandation}
                onFileSelect={(file) => onFileUpload("lettreRecommandation", file)}
                onFileRemove={() => onFileRemove("lettreRecommandation")}
                error={fieldErrors.lettreRecommandation}
                helperText="Lettre de recommandation de l'établissement ou encadreur • Max 10 Mo"
              />
            </div>
          </div>

          {/* Engagement et signatures */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#193549]">
              Engagement et signatures
            </h3>

            <TextField
              label="Nom complet du parent ou tuteur légal"
              name="nomTuteur"
              required
              placeholder="Ex: Idrissa Harouna"
              value={data.nomTuteur}
              onChange={(e) => onChangeField("nomTuteur", e.target.value)}
              error={fieldErrors.nomTuteur}
            />

            <div className="space-y-3">
              <CheckboxCard
                label="Je certifie l'exactitude des informations fournies et ma disponibilité"
                description="Je certifie sur l'honneur l'exactitude des informations déclarées et ma disponibilité pour l'intégralité du pré-camp et du camp principal du CNCEIZ Agadez 2026."
                required
                checked={data.disponibleCamps}
                onChange={(val) => onChangeField("disponibleCamps", val)}
                error={fieldErrors.disponibleCamps}
              />

              <CheckboxCard
                label="Signature électronique du candidat"
                description="En cochant cette case, j'appose ma signature électronique et confirme ma volonté de candidater au CNCEIZ 2026."
                required
                checked={data.signatureCandidat}
                onChange={(val) => onChangeField("signatureCandidat", val)}
                error={fieldErrors.signatureCandidat}
              />

              <CheckboxCard
                label="Signature du parent / tuteur (obligatoire si mineur)"
                description="Le représentant légal certifie autoriser le candidat à participer aux activités préparatoires et au Camp National Citoyen de l'Excellence et de l'Innovation d'Agadez."
                required
                checked={data.signatureParent}
                onChange={(val) => onChangeField("signatureParent", val)}
                error={fieldErrors.signatureParent}
              />
            </div>
          </div>

          {/* Récapitulatif Junior */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {t("form.summary_title", "Récapitulatif de votre candidature Junior")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">{t("form.summary_candidate", "Candidat :")}</span>{" "}
                <strong className="text-[#193549]">{data.prenom} {data.nom}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_house", "Maison :")}</span>{" "}
                <strong className="text-[#F15B29]">{maisonLabel}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_school_class", "Établissement / Classe :")}</span>{" "}
                <strong className="text-[#193549]">
                  {data.etablissement || "Non renseigné"} ({data.classe || "Non renseignée"})
                </strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_residence", "Zone / Résidence :")}</span>{" "}
                <strong className="text-[#193549]">
                  {data.regionVille} {data.villeVillage ? `• ${data.villeVillage}` : ""}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_target_house", "House visée :")}</span>{" "}
                <strong className="text-[#F15B29]">
                  {data.houseVisee === "autre" ? data.houseViseeAutre : data.houseVisee || "Non choisie"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_guardian", "Parent / Tuteur :")}</span>{" "}
                <strong className="text-[#193549]">
                  {data.nomTuteur || "Non renseigné"} ({data.telephoneTuteur || "Non renseigné"})
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
