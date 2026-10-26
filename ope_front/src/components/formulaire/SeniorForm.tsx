import React from "react";
import { useTranslation } from "react-i18next";
import type { SeniorData, SeniorErrors, MaisonType } from "../../types/formulaire";
import {
  getClassesOptionsForMaison,
  STADES_DEVELOPPEMENT_OPTIONS,
  REGIONS_NIGER_OPTIONS,
} from "../../types/formulaire";
import {
  TextField,
  TextAreaField,
  SelectField,
  FileField,
  YesNoField,
  CheckboxCard,
} from "./FormFields";

interface SeniorFormProps {
  step: number;
  maison?: MaisonType;
  data: SeniorData;
  fieldErrors: SeniorErrors;
  onChangeField: <K extends keyof SeniorData>(field: K, value: SeniorData[K]) => void;
  onFileUpload: (
    field: "pieceIdentite" | "photoIdentite" | "preuvesRealisation",
    file: File,
  ) => void;
  onFileRemove: (field: "pieceIdentite" | "photoIdentite" | "preuvesRealisation") => void;
}

export const SeniorForm: React.FC<SeniorFormProps> = ({
  step,
  maison,
  data,
  fieldErrors,
  onChangeField,
  onFileUpload,
  onFileRemove,
}) => {
  const { t } = useTranslation();

  // Dynamique selon la Maison
  const classesOptions = getClassesOptionsForMaison(maison || "steam");

  const domaineLabel =
    maison === "local_project"
      ? "Filière / Classe"
      : maison === "mouvement_citoyen"
        ? "Activité / Engagement"
        : "Domaine / Classe STEAM";

  const domaineplaceholder =
    maison === "local_project"
      ? "Sélectionnez une filière"
      : maison === "mouvement_citoyen"
        ? "Sélectionnez une activité"
        : "Sélectionnez un domaine STEAM";

  const domaineAutreLabel =
    maison === "local_project"
      ? "Précisez la filière"
      : maison === "mouvement_citoyen"
        ? "Précisez l'activité"
        : "Précisez le domaine STEAM";

  const step2Title =
    maison === "local_project"
      ? "Étape 2 : Votre projet local"
      : maison === "mouvement_citoyen"
        ? "Étape 2 : Votre engagement citoyen"
        : "Étape 2 : Votre innovation";

  return (
    <div className="space-y-6">
      {/* ── ÉTAPE 1 : IDENTITÉ DU CANDIDAT ── */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {t("form.senior.step1_title", "Étape 1 : Identité & Contact")}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.senior.step1_subtitle",
                "Renseignez vos informations personnelles et justificatifs d'identité.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label={t("form.nom", "Nom de famille")}
              name="nom"
              required
              placeholder="Ex: Abdoulaye"
              value={data.nom}
              onChange={(e) => onChangeField("nom", e.target.value)}
              error={fieldErrors.nom}
            />
            <TextField
              label={t("form.prenom", "Prénom(s)")}
              name="prenom"
              required
              placeholder="Ex: Moussa"
              value={data.prenom}
              onChange={(e) => onChangeField("prenom", e.target.value)}
              error={fieldErrors.prenom}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label={t("form.senior.sexe", "Sexe")}
              name="sexe"
              required
              options={[
                { value: "M", label: "Masculin" },
                { value: "F", label: "Féminin" },
              ]}
              placeholder="Sélectionnez votre sexe"
              value={data.sexe}
              onChange={(e) => onChangeField("sexe", e.target.value as SeniorData["sexe"])}
              error={fieldErrors.sexe}
            />
            <SelectField
              label={t("form.senior.region", "Région de résidence")}
              name="regionVille"
              required
              options={REGIONS_NIGER_OPTIONS}
              placeholder="Sélectionnez votre région"
              value={data.regionVille}
              onChange={(e) => onChangeField("regionVille", e.target.value)}
              error={fieldErrors.regionVille}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label={t("form.senior.telephone", "Numéro de téléphone")}
              name="telephone"
              type="tel"
              required
              placeholder="Ex: +227 96 11 22 33"
              value={data.telephone}
              onChange={(e) => onChangeField("telephone", e.target.value)}
              error={fieldErrors.telephone}
            />
            <TextField
              label={t("form.senior.email", "Adresse e-mail")}
              name="email"
              type="email"
              required
              placeholder="Ex: m.abdoulaye@example.com"
              value={data.email}
              onChange={(e) => onChangeField("email", e.target.value)}
              error={fieldErrors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <FileField
              label={t("form.senior.piece_identite", "Copie de la pièce d'identité")}
              accept=".pdf,image/*"
              fileInfo={data.pieceIdentite}
              onFileSelect={(file) => onFileUpload("pieceIdentite", file)}
              onFileRemove={() => onFileRemove("pieceIdentite")}
              error={fieldErrors.pieceIdentite}
              helperText="Carte d'identité, passeport ou extrait d'acte de naissance (Max 10 Mo)"
            />
            <FileField
              label={t("form.senior.photo_identite", "Photo d'identité récente")}
              accept="image/*"
              previewImage
              fileInfo={data.photoIdentite}
              onFileSelect={(file) => onFileUpload("photoIdentite", file)}
              onFileRemove={() => onFileRemove("photoIdentite")}
              error={fieldErrors.photoIdentite}
              helperText="Photo de face sur fond neutre (Max 10 Mo)"
            />
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 : PROJET / INNOVATION (dynamique selon la Maison) ── */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {step2Title}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.senior.step2_subtitle",
                "Décrivez votre projet, son domaine / sa classe, son état d'avancement et fournissez vos éléments de preuve.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label={domaineLabel}
              name="domaineSteam"
              required
              options={classesOptions}
              placeholder={domaineplaceholder}
              value={data.domaineSteam}
              onChange={(e) =>
                onChangeField("domaineSteam", e.target.value as SeniorData["domaineSteam"])
              }
              error={fieldErrors.domaineSteam}
            />

            <SelectField
              label={t("form.senior.stade_developpement", "Stade de développement")}
              name="stadeDeveloppement"
              required
              options={STADES_DEVELOPPEMENT_OPTIONS}
              placeholder="Sélectionnez le stade d'avancement"
              value={data.stadeDeveloppement}
              onChange={(e) =>
                onChangeField(
                  "stadeDeveloppement",
                  e.target.value as SeniorData["stadeDeveloppement"],
                )
              }
              error={fieldErrors.stadeDeveloppement}
            />
          </div>

          {data.domaineSteam === "autre" && (
            <TextField
              label={domaineAutreLabel}
              name="domaineSteamAutre"
              required
              placeholder="Ex: Précisez votre domaine / activité..."
              value={data.domaineSteamAutre}
              onChange={(e) => onChangeField("domaineSteamAutre", e.target.value)}
              error={fieldErrors.domaineSteamAutre}
            />
          )}

          <TextField
            label={t("form.senior.innovation_nom", "Nom du produit / service / innovation")}
            name="innovationNom"
            required
            placeholder="Ex: Système d'irrigation intelligente solaire SolarDrop"
            value={data.innovationNom}
            onChange={(e) => onChangeField("innovationNom", e.target.value)}
            error={fieldErrors.innovationNom}
          />

          <TextAreaField
            label={t(
              "form.senior.innovation_description",
              "Description succincte (fonctionnement, problème résolu, public cible)",
            )}
            name="innovationDescription"
            rows={4}
            required
            placeholder="Décrivez en quoi consiste votre innovation, les technologies utilisées, quel défi concret elle relève au Niger/Sahel et qui en sont les bénéficiaires..."
            value={data.innovationDescription}
            onChange={(e) => onChangeField("innovationDescription", e.target.value)}
            error={fieldErrors.innovationDescription}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileField
              label={t(
                "form.senior.preuves_realisation",
                "Preuves de réalisation (photos, vidéo, document)",
              )}
              accept=".pdf,image/*,video/*"
              fileInfo={data.preuvesRealisation}
              onFileSelect={(file) => onFileUpload("preuvesRealisation", file)}
              onFileRemove={() => onFileRemove("preuvesRealisation")}
              error={fieldErrors.preuvesRealisation}
              helperText="Photos du prototype, schéma technique ou note descriptive • Max 10 Mo"
            />

            <TextField
              label={t(
                "form.senior.lien_portfolio",
                "Lien portfolio / vidéo de démonstration (facultatif)",
              )}
              name="lienPortfolio"
              type="url"
              placeholder="https://drive.google.com/... ou https://youtu.be/..."
              value={data.lienPortfolio}
              onChange={(e) => onChangeField("lienPortfolio", e.target.value)}
              error={fieldErrors.lienPortfolio}
              helperText="Lien vers une vidéo de démo, GitHub, Drive ou site web du projet."
            />
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 : MODALITÉS & ENGAGEMENT ── */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
              {t("form.senior.step3_title", "Étape 3 : Modalités de participation")}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">
              {t(
                "form.senior.step3_subtitle",
                "Indiquez vos choix logistiques, vos engagements sur le camp et validez votre candidature.",
              )}
            </p>
          </div>

          <div className="space-y-5 bg-slate-50 p-5 rounded-3xl border border-slate-200">
            {/* Défilé */}
            <div className="space-y-3">
              <YesNoField
                label={t(
                  "form.senior.participe_defile",
                  "Participation au défilé scientifique et technologique d'ouverture",
                )}
                value={data.participeDefile}
                onChange={(val) => onChangeField("participeDefile", val)}
                helperText="Présentation d'une œuvre innovante lors de la cérémonie officielle d'ouverture."
              />
              {data.participeDefile && (
                <TextField
                  label={t("form.senior.oeuvre_defile", "Œuvre à présenter au défilé")}
                  name="oeuvreDefile"
                  required
                  placeholder="Ex: Drone de surveillance agricole ou Maquette robotisée"
                  value={data.oeuvreDefile}
                  onChange={(e) => onChangeField("oeuvreDefile", e.target.value)}
                  error={fieldErrors.oeuvreDefile}
                />
              )}
            </div>

            {/* Facilitateur */}
            <YesNoField
              label={t(
                "form.senior.facilitateur_juniors",
                "Intervenir comme facilitateur / mentor auprès des délégués Juniors",
              )}
              value={data.facilitateurJuniors}
              onChange={(val) => onChangeField("facilitateurJuniors", val)}
              helperText="Partagez vos compétences et animez des ateliers découverte avec les plus jeunes."
            />

            {/* Stand */}
            <YesNoField
              label={t("form.senior.souhaite_stand", "Souhaitez-vous un stand d'exposition ?")}
              value={data.souhaiteStand}
              onChange={(val) => onChangeField("souhaiteStand", val)}
              helperText="Un espace dédié pour présenter votre innovation aux visiteurs et partenaires."
            />

            {/* Prix innovation */}
            <YesNoField
              label={t(
                "form.senior.concours_prix_innovation",
                "Concourir au Prix de la Meilleure Innovation STEAM",
              )}
              value={data.concoursPrixInnovation}
              onChange={(val) => onChangeField("concoursPrixInnovation", val)}
              helperText="Votre projet sera évalué par le jury d'experts scientifiques du CNCEIZ 2026."
            />

            {/* Disponibilité camp */}
            <YesNoField
              label={t(
                "form.senior.disponible_camps",
                "Disponible pendant les périodes des précamps et du Camp à Agadez",
              )}
              required
              value={data.disponibleCamps}
              onChange={(val) => onChangeField("disponibleCamps", val)}
              error={fieldErrors.disponibleCamps}
              helperText="La présence active aux sessions préparatoires et au Camp est requise."
            />
          </div>

          <CheckboxCard
            label={t(
              "form.senior.accepte_conditions",
              "J'accepte les conditions de participation du CNCEIZ Agadez 2026",
            )}
            description="Je certifie l'exactitude des informations fournies et m'engage à respecter le règlement intérieur, la charte éthique et les directives de l'OPE tout au long du camp."
            required
            checked={data.accepteConditions}
            onChange={(val) => onChangeField("accepteConditions", val)}
            error={fieldErrors.accepteConditions}
          />

          {/* Récapitulatif Senior */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Récapitulatif de votre dossier
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Candidat :</span>{" "}
                <strong className="text-[#193549]">{data.prenom} {data.nom}</strong>
              </div>
              <div>
                <span className="text-slate-400">Email & Tél :</span>{" "}
                <strong className="text-[#193549]">{data.email} • {data.telephone}</strong>
              </div>
              <div>
                <span className="text-slate-400">Résidence :</span>{" "}
                <strong className="text-[#193549]">{data.regionVille}</strong>
              </div>
              <div>
                <span className="text-slate-400">Domaine :</span>{" "}
                <strong className="text-[#193549]">
                  {data.domaineSteam === "autre" ? data.domaineSteamAutre : data.domaineSteam}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Innovation :</span>{" "}
                <strong className="text-[#F15B29]">{data.innovationNom}</strong>
              </div>
              <div>
                <span className="text-slate-400">Stade :</span>{" "}
                <strong className="text-[#193549]">{data.stadeDeveloppement}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
