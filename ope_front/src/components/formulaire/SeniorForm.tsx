import React from "react";
import { useTranslation } from "react-i18next";
import type { SeniorData, SeniorErrors, MaisonType } from "../../types/formulaire";
import {
  getSeniorDomainesForMaison,
  SENIOR_HOUSE_INFO,
  STADES_DEVELOPPEMENT_OPTIONS,
  ANCIENNETE_ACTIVITE_OPTIONS,
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

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

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

  // Un formulaire distinct par House : STEAM, LP ou MC2
  const house = maison || "steam";
  const isSteam = house === "steam";
  const isLP = house === "local_project";
  const houseInfo = SENIOR_HOUSE_INFO[house];
  const domainesOptions = getSeniorDomainesForMaison(house);

  const texts = {
    steam: {
      step2Title: t("form.senior.step2_title", "Étape 2 : Votre innovation"),
      step2Subtitle: t(
        "form.senior.step2_subtitle",
        "Décrivez votre innovation, son domaine, son stade de développement et fournissez vos preuves de réalisation.",
      ),
      domaineLabel: t("form.senior.domaine_steam", "Domaine STEAM concerné"),
      domainePlaceholder: "Sélectionnez un domaine STEAM",
      domaineAutreLabel: t("form.senior.domaine_steam_autre", "Précisez votre domaine STEAM"),
      nomLabel: t("form.senior.innovation_nom", "Nom du produit / service / innovation"),
      nomPlaceholder: "Ex: Système d'irrigation intelligente solaire SolarDrop",
      descriptionLabel: t(
        "form.senior.innovation_description",
        "Description succincte (fonctionnement, problème résolu, public cible)",
      ),
      descriptionPlaceholder:
        "Décrivez en quoi consiste votre innovation, comment elle fonctionne, quel défi concret elle relève au Niger/Sahel et qui en sont les bénéficiaires...",
      preuvesLabel: t("form.senior.preuves_realisation", "Preuves de réalisation (photos, vidéo, document)"),
      preuvesHelper: "Photos du prototype, vidéo, schéma technique ou note descriptive • Max 10 Mo",
      oeuvrePlaceholder: "Ex: Drone de surveillance agricole ou Maquette robotisée",
      standHelper: "Un espace dédié pour présenter votre innovation aux visiteurs et partenaires.",
      prixLabel: t("form.senior.concours_prix_innovation", "Concourir au Prix de la Meilleure Innovation STEAM"),
      prixHelper: "Votre innovation sera évaluée par le jury d'experts scientifiques du CNCEIZ 2026.",
      summaryNom: t("form.summary_innovation", "Innovation :"),
    },
    local_project: {
      step2Title: t("form.senior.lp.step2_title", "Étape 2 : Votre activité"),
      step2Subtitle: t(
        "form.senior.lp.step2_subtitle",
        "Présentez votre entreprise ou activité, son marché, son impact et fournissez une preuve de commercialisation.",
      ),
      domaineLabel: t("form.senior.lp.domaine", "Domaine LP concerné"),
      domainePlaceholder: "Sélectionnez un domaine LP",
      domaineAutreLabel: t("form.senior.lp.domaine_autre", "Précisez le domaine LP"),
      nomLabel: t("form.senior.lp.nom", "Nom de l'entreprise / activité / produit"),
      nomPlaceholder: "Ex: Coopérative Tagant — Transformation de dattes",
      descriptionLabel: t("form.senior.lp.description", "Description succincte (activité, marché, impact)"),
      descriptionPlaceholder:
        "Décrivez votre activité et vos produits ou services, votre marché (clients, zone de vente) et l'impact de votre activité sur votre communauté...",
      preuvesLabel: t(
        "form.senior.lp.preuves",
        "Preuve de commercialisation (NIF, facture, registre, photos, vidéo)",
      ),
      preuvesHelper: "NIF, facture, registre de commerce, photos ou vidéo de l'activité • Max 10 Mo",
      oeuvrePlaceholder: "Ex: Produits transformés ou articles artisanaux",
      standHelper: "Un espace dédié pour exposer vos produits aux visiteurs et partenaires.",
      prixLabel: t("form.senior.lp.prix", "Concourir au Prix de la Meilleure Entreprise LP"),
      prixHelper: "Votre entreprise sera évaluée par le jury du CNCEIZ 2026.",
      summaryNom: t("form.senior.lp.summary_nom", "Activité :"),
    },
    mouvement_citoyen: {
      step2Title: t("form.senior.mc2.step2_title", "Étape 2 : Votre engagement citoyen"),
      step2Subtitle: t(
        "form.senior.mc2.step2_subtitle",
        "Présentez l'initiative ou l'action que vous avez menée, son impact sur votre communauté et fournissez vos preuves.",
      ),
      domaineLabel: t("form.senior.mc2.domaine", "Domaine d'engagement"),
      domainePlaceholder: "Sélectionnez un domaine d'engagement",
      domaineAutreLabel: t("form.senior.mc2.domaine_autre", "Précisez le domaine d'engagement"),
      nomLabel: t("form.senior.mc2.nom", "Nom de l'initiative / action menée"),
      nomPlaceholder: "Ex: Opération quartier propre d'Agadez",
      descriptionLabel: t(
        "form.senior.mc2.description",
        "Description de l'action et de son impact communautaire",
      ),
      descriptionPlaceholder:
        "Décrivez l'action menée (lieu, période, participants), ses bénéficiaires et les changements constatés dans votre communauté...",
      preuvesLabel: t(
        "form.senior.mc2.preuves",
        "Preuves de l'action (photos, attestations, articles, vidéo)",
      ),
      preuvesHelper: "Photos, attestations, articles de presse ou vidéo de l'action • Max 10 Mo",
      oeuvrePlaceholder: "Ex: Exposition photo de vos actions communautaires",
      standHelper: "Un espace dédié pour présenter votre initiative aux visiteurs et partenaires.",
      prixLabel: t("form.senior.mc2.prix", "Concourir au Prix du Meilleur Acteur MC2"),
      prixHelper: "Votre engagement sera évalué par le jury du CNCEIZ 2026.",
      summaryNom: t("form.senior.mc2.summary_nom", "Initiative :"),
    },
  }[house];

  const houseBadge = (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F15B29] text-xs font-bold mb-2">
      <span>
        {houseInfo.code} — {houseInfo.fullName}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── ÉTAPE 1 : IDENTITÉ DU CANDIDAT ── */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            {houseBadge}
            <p className="text-xs text-[#5C6B76] mb-3">
              Camp National Citoyen de l'Excellence et de l'Innovation — Agadez, du 25 au 31 décembre
              2026. Organisé par l'OPE (Organisation pour la Promotion de l'Excellence).
            </p>
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

      {/* ── ÉTAPE 2 : INNOVATION (STEAM) / ACTIVITÉ (LP) / ENGAGEMENT CITOYEN (MC2) ── */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            {houseBadge}
            <h2 className="text-lg sm:text-xl font-bold text-[#193549]">{texts.step2Title}</h2>
            <p className="text-xs sm:text-sm text-[#5C6B76]">{texts.step2Subtitle}</p>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${isSteam || isLP ? "sm:grid-cols-2" : ""}`}>
            <SelectField
              label={texts.domaineLabel}
              name="domaineSteam"
              required
              options={domainesOptions}
              placeholder={texts.domainePlaceholder}
              value={data.domaineSteam}
              onChange={(e) =>
                onChangeField("domaineSteam", e.target.value as SeniorData["domaineSteam"])
              }
              error={fieldErrors.domaineSteam}
            />

            {isSteam && (
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
            )}

            {isLP && (
              <SelectField
                label={t("form.senior.lp.anciennete", "Ancienneté de l'activité")}
                name="ancienneteActivite"
                required
                options={ANCIENNETE_ACTIVITE_OPTIONS}
                placeholder="Sélectionnez l'ancienneté"
                value={data.ancienneteActivite}
                onChange={(e) =>
                  onChangeField(
                    "ancienneteActivite",
                    e.target.value as SeniorData["ancienneteActivite"],
                  )
                }
                error={fieldErrors.ancienneteActivite}
              />
            )}
          </div>

          {data.domaineSteam === "autre" && (
            <TextField
              label={texts.domaineAutreLabel}
              name="domaineSteamAutre"
              required
              placeholder="Ex: Précisez votre domaine..."
              value={data.domaineSteamAutre}
              onChange={(e) => onChangeField("domaineSteamAutre", e.target.value)}
              error={fieldErrors.domaineSteamAutre}
            />
          )}

          <TextField
            label={texts.nomLabel}
            name="innovationNom"
            required
            placeholder={texts.nomPlaceholder}
            value={data.innovationNom}
            onChange={(e) => onChangeField("innovationNom", e.target.value)}
            error={fieldErrors.innovationNom}
          />

          <TextAreaField
            label={texts.descriptionLabel}
            name="innovationDescription"
            rows={4}
            required
            placeholder={texts.descriptionPlaceholder}
            value={data.innovationDescription}
            onChange={(e) => onChangeField("innovationDescription", e.target.value)}
            error={fieldErrors.innovationDescription}
          />

          <div className={`grid grid-cols-1 gap-4 ${isSteam ? "sm:grid-cols-2" : ""}`}>
            <FileField
              label={texts.preuvesLabel}
              accept=".pdf,image/*,video/*"
              fileInfo={data.preuvesRealisation}
              onFileSelect={(file) => onFileUpload("preuvesRealisation", file)}
              onFileRemove={() => onFileRemove("preuvesRealisation")}
              error={fieldErrors.preuvesRealisation}
              helperText={texts.preuvesHelper}
            />

            {isSteam && (
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
            )}
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 : MODALITÉS & ENGAGEMENT ── */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-up">
          <div className="border-b border-slate-100 pb-3 mb-4">
            {houseBadge}
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
                helperText="Présentation d'une œuvre lors de la cérémonie officielle d'ouverture."
              />
              {data.participeDefile && (
                <TextField
                  label={t("form.senior.oeuvre_defile", "Œuvre à présenter au défilé")}
                  name="oeuvreDefile"
                  required
                  placeholder={texts.oeuvrePlaceholder}
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
              helperText={texts.standHelper}
            />

            {/* Prix de la House */}
            <YesNoField
              label={texts.prixLabel}
              value={data.concoursPrixInnovation}
              onChange={(val) => onChangeField("concoursPrixInnovation", val)}
              helperText={texts.prixHelper}
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
              {t("form.summary_title", "Récapitulatif de votre dossier")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">{t("form.summary_candidate", "Candidat :")}</span>{" "}
                <strong className="text-[#193549]">{data.prenom} {data.nom}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_email_phone", "Email & Tél :")}</span>{" "}
                <strong className="text-[#193549]">{data.email} • {data.telephone}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_residence", "Résidence :")}</span>{" "}
                <strong className="text-[#193549]">{data.regionVille}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_house", "Maison :")}</span>{" "}
                <strong className="text-[#F15B29]">{houseInfo.code}</strong>
              </div>
              <div>
                <span className="text-slate-400">{t("form.summary_domain", "Domaine :")}</span>{" "}
                <strong className="text-[#193549]">
                  {data.domaineSteam === "autre"
                    ? data.domaineSteamAutre
                    : labelOf(domainesOptions, data.domaineSteam)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">{texts.summaryNom}</span>{" "}
                <strong className="text-[#F15B29]">{data.innovationNom}</strong>
              </div>
              {isSteam && (
                <div>
                  <span className="text-slate-400">{t("form.summary_stage", "Stade :")}</span>{" "}
                  <strong className="text-[#193549]">
                    {labelOf(STADES_DEVELOPPEMENT_OPTIONS, data.stadeDeveloppement)}
                  </strong>
                </div>
              )}
              {isLP && (
                <div>
                  <span className="text-slate-400">
                    {t("form.senior.lp.summary_anciennete", "Ancienneté :")}
                  </span>{" "}
                  <strong className="text-[#193549]">
                    {labelOf(ANCIENNETE_ACTIVITE_OPTIONS, data.ancienneteActivite)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
