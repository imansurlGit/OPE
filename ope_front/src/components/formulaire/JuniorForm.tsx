import React from "react";
import { useTranslation } from "react-i18next";
import type { JuniorData, JuniorErrors } from "../../types/formulaire";
import { CLASSES_JUNIOR_OPTIONS, REGIONS_NIGER_OPTIONS } from "../../types/formulaire";
import {
  TextField,
  TextAreaField,
  SelectField,
  FileField,
  CheckboxCard,
} from "./FormFields";

interface JuniorFormProps {
  step: number;
  data: JuniorData;
  fieldErrors: JuniorErrors;
  onChangeField: <K extends keyof JuniorData>(field: K, value: JuniorData[K]) => void;
  onFileUpload: (field: "mascotteDessin", file: File) => void;
  onFileRemove: (field: "mascotteDessin") => void;
}

export const JuniorForm: React.FC<JuniorFormProps> = ({
  step,
  data,
  fieldErrors,
  onChangeField,
  onFileUpload,
  onFileRemove,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* ── ÉTAPE 1 : QUI ES-TU ? ── */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {t("form.junior.step1_title", "Étape 1 : Qui es-tu ?")}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.junior.step1_subtitle",
                "Renseigne tes coordonnées et celles de ton collège pour participer au concours.",
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label={t("form.junior.classe", "Ta classe actuelle")}
              name="classe"
              required
              options={CLASSES_JUNIOR_OPTIONS}
              placeholder="Choisis ta classe (6e, 5e, 4e, 3e)"
              value={data.classe}
              onChange={(e) => onChangeField("classe", e.target.value as JuniorData["classe"])}
              error={fieldErrors.classe}
            />
            <TextField
              label={t("form.junior.etablissement", "Nom de ton collège")}
              name="etablissement"
              placeholder="Ex: Collège d'Enseignement Général d'Agadez"
              value={data.etablissement}
              onChange={(e) => onChangeField("etablissement", e.target.value)}
              error={fieldErrors.etablissement}
            />
          </div>

          <SelectField
            label={t("form.junior.region", "Région de résidence")}
            name="regionVille"
            required
            options={REGIONS_NIGER_OPTIONS}
            placeholder="Sélectionne ta région"
            value={data.regionVille}
            onChange={(e) => onChangeField("regionVille", e.target.value)}
            error={fieldErrors.regionVille}
          />

          <TextField
            label={t("form.junior.tel_tuteur", "Numéro de téléphone d'un parent ou tuteur")}
            name="telephoneTuteur"
            type="tel"
            required
            placeholder="Ex: +227 90 12 34 56"
            value={data.telephoneTuteur}
            onChange={(e) => onChangeField("telephoneTuteur", e.target.value)}
            error={fieldErrors.telephoneTuteur}
            helperText="Ce numéro sera utilisé pour informer ton représentant légal de ta participation."
          />
        </div>
      )}

      {/* ── ÉTAPE 2 : TA MASCOTTE ── */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {t("form.junior.step2_title", "Étape 2 : Ta mascotte")}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.junior.step2_subtitle",
                "Présente ta mascotte, ce qu'elle symbolise pour le Niger et télécharge ton dessin.",
              )}
            </p>
          </div>

          <TextField
            label={t("form.junior.mascotte_nom", "Nom proposé pour la mascotte")}
            name="mascotteNom"
            required
            placeholder="Ex: Taghalam, Fennec Innovateur, Ténéré..."
            value={data.mascotteNom}
            onChange={(e) => onChangeField("mascotteNom", e.target.value)}
            error={fieldErrors.mascotteNom}
          />

          <TextAreaField
            label={t("form.junior.mascotte_pourquoi", "Pourquoi avoir choisi ce nom ? (2 à 3 phrases)")}
            name="mascottePourquoi"
            rows={3}
            placeholder="Explique l'origine du nom ou ce qu'il évoque pour toi..."
            value={data.mascottePourquoi}
            onChange={(e) => onChangeField("mascottePourquoi", e.target.value)}
            error={fieldErrors.mascottePourquoi}
          />

          <FileField
            label={t("form.junior.mascotte_dessin", "Ton dessin de la mascotte (photo ou scan)")}
            required
            accept="image/*,application/pdf"
            fileInfo={data.mascotteDessin}
            previewImage
            onFileSelect={(file) => onFileUpload("mascotteDessin", file)}
            onFileRemove={() => onFileRemove("mascotteDessin")}
            error={fieldErrors.mascotteDessin}
            helperText="Prends une photo claire ou un scan de ton dessin sur papier • Max 10 Mo (JPG, PNG ou PDF)"
          />

          <TextAreaField
            label={t(
              "form.junior.mascotte_signification",
              "Que représente ta mascotte ? (animal, symbole d'Agadez, science...)",
            )}
            name="mascotteSignification"
            rows={4}
            placeholder="Décris l'animal ou le symbole que tu as dessiné, ses couleurs et le message qu'elle transmet pour le camp..."
            value={data.mascotteSignification}
            onChange={(e) => onChangeField("mascotteSignification", e.target.value)}
            error={fieldErrors.mascotteSignification}
          />
        </div>
      )}

      {/* ── ÉTAPE 3 : AUTORISATION & RÉCAP ── */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {t("form.junior.step3_title", "Étape 3 : Autorisation & Confirmation")}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.junior.step3_subtitle",
                "L'accord d'un parent ou représentant légal est obligatoire pour valider ton inscription.",
              )}
            </p>
          </div>

          <TextField
            label={t("form.junior.nom_tuteur", "Nom complet du parent ou tuteur légal")}
            name="nomTuteur"
            required
            placeholder="Ex: Idrissa Harouna"
            value={data.nomTuteur}
            onChange={(e) => onChangeField("nomTuteur", e.target.value)}
            error={fieldErrors.nomTuteur}
            helperText="Père, mère ou représentant légal responsable de l'enfant."
          />

          <div className="space-y-3.5">
            <CheckboxCard
              label={t(
                "form.junior.accord_parent",
                "Mon parent ou tuteur m'autorise à participer au concours",
              )}
              description="Je confirme avoir discuté avec mon parent/tuteur et obtenu son autorisation expresse pour participer au Concours de la Mascotte du CNCEIZ 2026."
              required
              checked={data.autorisationParent}
              onChange={(val) => onChangeField("autorisationParent", val)}
              error={fieldErrors.autorisationParent}
            />

            <CheckboxCard
              label={t(
                "form.junior.accord_dessin",
                "J'accepte que l'OPE utilise mon dessin pour le concours",
              )}
              description="J'autorise l'Organisation pour la Promotion de l'Éducation (OPE) à exposer, reproduire et valoriser mon œuvre dans le cadre des activités officielles du camp."
              required
              checked={data.accordUtilisationDessin}
              onChange={(val) => onChangeField("accordUtilisationDessin", val)}
              error={fieldErrors.accordUtilisationDessin}
            />
          </div>

          {/* Récapitulatif Junior */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Récapitulatif de ta participation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Candidat :</span>{" "}
                <strong className="text-[#193549]">{data.prenom} {data.nom}</strong>
              </div>
              <div>
                <span className="text-slate-400">Classe :</span>{" "}
                <strong className="text-[#193549]">{data.classe}</strong>
              </div>
              <div>
                <span className="text-slate-400">Collège :</span>{" "}
                <strong className="text-[#193549]">{data.etablissement || "Non renseigné"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Mascotte :</span>{" "}
                <strong className="text-[#F15B29]">{data.mascotteNom}</strong>
              </div>
              <div>
                <span className="text-slate-400">Parent / Tuteur :</span>{" "}
                <strong className="text-[#193549]">{data.nomTuteur}</strong>
              </div>
              <div>
                <span className="text-slate-400">Téléphone contact :</span>{" "}
                <strong className="text-[#193549]">{data.telephoneTuteur}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
