import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import campNationalCitoyen from "../assets/camp_natio.png";
import api from "../services/api";

export type DomainType = "STEAM" | "LP" | "MCC";

export interface FormData {
  domaine: DomainType | "";
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: "M" | "F" | "";
  region: string;
  villeVillage: string;
  nationalite: string;
  etablissement: string;
  classe: string;
  telephoneCandidat: string;
  email: string;
  telephoneTuteur: string;
  pointFocal: string;
  biographie: string;
  houseVisee: string;
  houseViseeAutre: string;
  statutProjet: string;
  descriptionProjet: string;
  filiere: string;
  moyenneRecente: string;
  nomRecommandant: string;
  telRecommandant: string;
  frequenceEngagement: "Ponctuel" | "Régulier" | "";
  motivation: string;
  accesNumerique: string;
  photoIdentite: { name: string; previewUrl: string } | null;
  pieceIdentite: { name: string; size: string } | null;
  bulletinsScolaires: { name: string; size: string } | null;
  autorisationParentale: { name: string; size: string } | null;
  preuveProjet: { name: string; size: string } | null;
  lettreRecommandation: { name: string; size: string } | null;
  certification: boolean;
  confirmationParent: boolean;
}

const INITIAL_DATA: FormData = {
  domaine: "STEAM",
  nom: "",
  prenom: "",
  dateNaissance: "",
  sexe: "",
  region: "Agadez",
  villeVillage: "",
  nationalite: "Nigérienne",
  etablissement: "",
  classe: "",
  telephoneCandidat: "",
  email: "",
  telephoneTuteur: "",
  pointFocal: "",
  biographie: "",
  houseVisee: "",
  houseViseeAutre: "",
  statutProjet: "",
  descriptionProjet: "",
  filiere: "",
  moyenneRecente: "",
  nomRecommandant: "",
  telRecommandant: "",
  frequenceEngagement: "",
  motivation: "",
  accesNumerique: "Oui personnellement",
  photoIdentite: null,
  pieceIdentite: null,
  bulletinsScolaires: null,
  autorisationParentale: null,
  preuveProjet: null,
  lettreRecommandation: null,
  certification: false,
  confirmationParent: false,
};

const REGIONS_NIGER = [
  "Agadez",
  "Diffa",
  "Dosso",
  "Maradi",
  "Niamey",
  "Tahoua",
  "Tillabéri",
  "Zinder",
  "Diaspora / Autre",
];

const HOUSES_BY_DOMAIN: Record<DomainType, string[]> = {
  STEAM: [
    "Robotique",
    "Intelligence Artificielle",
    "Aéronautique et Sciences spatiales",
    "Énergie renouvelable",
    "Biotechnologie",
    "Art & Design technologique",
    "Mathématiques et Logique",
  ],
  LP: [
    "Agriculture et Agro-business",
    "Élevage et Santé animale",
    "Artisanat et Métiers d'art",
    "Autre projet local",
  ],
  MCC: [
    "Débats communautaires & Plaidoyer",
    "Fabrication de poubelles & Assainissement",
    "7 km de la Paix & Cohésion",
    "Réhabilitation de tables-bancs",
    "Don & Solidarité",
    "Plantation d'arbres & Écologie",
    "Sensibilisation Paix & Vivre-ensemble",
    "Sensibilisation Éducation",
    "Salubrité & Hygiène publique",
    "Volontariat à l'Organisation",
  ],
};

const STATUTS_PROJET_BY_DOMAIN: Record<DomainType, string[]> = {
  STEAM: [
    "J'ai déjà réalisé un projet ou une expérience scientifique/technique",
    "J'ai une idée de projet que je souhaite développer au camp",
    "Je n'ai pas encore de projet, mais j'ai une vocation scientifique claire",
  ],
  LP: [
    "Mon projet est déjà en activité sur le terrain",
    "J'ai une idée de projet local que je souhaite développer",
    "Je n'ai pas encore de projet, mais j'ai une vocation claire",
  ],
  MCC: [
    "J'ai déjà mené une action citoyenne ou communautaire",
    "J'ai une idée d'action citoyenne que je souhaite mener",
    "Je n'ai pas encore mené d'action, mais j'ai une vocation citoyenne claire",
  ],
};

const STEPS = [
  { num: 1, key: "domain", label: "Domaine", short: "Domaine" },
  { num: 2, key: "identity", label: "Identité", short: "Identité" },
  { num: 3, key: "house_project", label: "House & Projet", short: "Projet" },
  { num: 4, key: "motivation", label: "Motivation", short: "Motivation" },
  { num: 5, key: "validation", label: "Pièces & Validation", short: "Envoi" },
];

function calculateAge(birthDateString: string): number | null {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s.-]{8,20}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

const NOW = new Date();
const padZero = (n: number) => n.toString().padStart(2, "0");
// Candidat au moins 10 ans (date de naissance au plus tard il y a 10 ans)
const MAX_BIRTH_DATE = `${NOW.getFullYear() - 10}-${padZero(NOW.getMonth() + 1)}-${padZero(NOW.getDate())}`;
// Candidat au plus 35 ans (date de naissance au plus tôt il y a 35 ans)
const MIN_BIRTH_DATE = `${NOW.getFullYear() - 35}-${padZero(NOW.getMonth() + 1)}-${padZero(NOW.getDate())}`;

export default function Formulaire() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [candidateRef, setCandidateRef] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawFiles, setRawFiles] = useState<Record<string, File>>({});

  const age = calculateAge(data.dateNaissance);
  const isMinor = age !== null && age < 18;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrorMessage(null);
    setFieldErrors({});
  }, [step]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSelectDomain = (domain: DomainType) => {
    updateField("domaine", domain);
    setErrorMessage(null);
    setFieldErrors({});
    setStep(2);
  };

  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!data.domaine) {
        errors.domaine = t("form.err_domain");
      }
    }

    if (currentStep === 2) {
      const nomTrim = data.nom.trim();
      if (!nomTrim) {
        errors.nom = t("form.err_nom_prenom");
      } else if (!NAME_REGEX.test(nomTrim)) {
        errors.nom = t("form.err_nom");
      }

      const prenomTrim = data.prenom.trim();
      if (!prenomTrim) {
        errors.prenom = t("form.err_nom_prenom");
      } else if (!NAME_REGEX.test(prenomTrim)) {
        errors.prenom = t("form.err_prenom");
      }

      if (!data.dateNaissance) {
        errors.dateNaissance = t("form.err_dob");
      } else if (age === null || age < 10 || age > 35) {
        errors.dateNaissance = t("form.err_dob_age");
      }

      if (!data.sexe) {
        errors.sexe = t("form.err_sex");
      }

      if (!data.villeVillage.trim() || data.villeVillage.trim().length < 2) {
        errors.villeVillage = t("form.err_ville");
      }

      if (
        data.telephoneCandidat.trim() &&
        !PHONE_REGEX.test(data.telephoneCandidat.trim())
      ) {
        errors.telephoneCandidat = t("form.err_tel");
      }

      if (!data.email.trim() || !EMAIL_REGEX.test(data.email.trim())) {
        errors.email = t("form.err_email");
      }

      if (isMinor) {
        if (!data.telephoneTuteur.trim()) {
          errors.telephoneTuteur = t("form.err_tel_tuteur");
        } else if (!PHONE_REGEX.test(data.telephoneTuteur.trim())) {
          errors.telephoneTuteur = t("form.err_tel_tuteur_format");
        }
      } else if (
        data.telephoneTuteur.trim() &&
        !PHONE_REGEX.test(data.telephoneTuteur.trim())
      ) {
        errors.telephoneTuteur = t("form.err_tel_tuteur_format");
      }

      if (countWords(data.biographie) > 100) {
        errors.biographie = t("form.err_bio");
      }
    }

    if (currentStep === 3) {
      if (!data.houseVisee) {
        errors.houseVisee = t("form.err_house");
      }
      if (
        data.houseVisee === "Autre projet local" &&
        (!data.houseViseeAutre.trim() || data.houseViseeAutre.trim().length < 3)
      ) {
        errors.houseViseeAutre = t("form.err_house_autre");
      }
      if (!data.statutProjet) {
        errors.statutProjet = t("form.err_statut");
      }
      if (!data.descriptionProjet.trim()) {
        errors.descriptionProjet = t("form.err_desc_projet");
      } else if (data.descriptionProjet.trim().length < 20) {
        errors.descriptionProjet = t("form.err_desc_projet_len");
      }
      if (
        data.telRecommandant.trim() &&
        !PHONE_REGEX.test(data.telRecommandant.trim())
      ) {
        errors.telRecommandant = t("form.err_tel");
      }
    }

    if (currentStep === 4) {
      if (!data.motivation.trim()) {
        errors.motivation = t("form.err_motivation");
      } else if (data.motivation.trim().length < 20) {
        errors.motivation = t("form.err_motivation_len");
      }
    }

    if (currentStep === 5) {
      if (!data.photoIdentite) {
        errors.photoIdentite = t("form.err_photo");
      }
      if (!data.pieceIdentite) {
        errors.pieceIdentite = t("form.err_piece");
      }
      if (data.domaine === "STEAM" && !data.bulletinsScolaires) {
        errors.bulletinsScolaires = t("form.err_bulletin");
      }
      if (isMinor && !data.autorisationParentale) {
        errors.autorisationParentale = t("form.err_autorisation");
      }
      if (!data.certification) {
        errors.certification = t("form.err_cert");
      }
      if (isMinor && !data.confirmationParent) {
        errors.confirmationParent = t("form.err_confirm_parent");
      }
    }

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      setFieldErrors(errors);
      setErrorMessage(errors[errorKeys[0]]);
      return false;
    }

    setFieldErrors({});
    setErrorMessage(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setErrorMessage(null);
      setFieldErrors({});
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(5)) {
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const formData = new FormData();

        // Étape 1 : Domaine
        formData.append("domaine", data.domaine);

        // Étape 2 : Identité
        formData.append("nom", data.nom.trim());
        formData.append("prenom", data.prenom.trim());
        formData.append("date_naissance", data.dateNaissance);
        formData.append("sexe", data.sexe);
        formData.append("region", data.region);
        formData.append("ville_village", data.villeVillage.trim());
        formData.append("nationalite", data.nationalite.trim() || "Nigérienne");
        formData.append("etablissement", data.etablissement.trim());
        formData.append("classe", data.classe.trim());
        formData.append("telephone_candidat", data.telephoneCandidat.trim());
        formData.append("email", data.email.trim());
        formData.append("telephone_tuteur", data.telephoneTuteur.trim());
        formData.append("point_focal", data.pointFocal.trim());
        formData.append("biographie", data.biographie.trim());

        // Étape 3 : House & Projet
        formData.append("house_visee", data.houseVisee);
        formData.append("house_visee_autre", data.houseViseeAutre.trim());
        formData.append("statut_projet", data.statutProjet);
        formData.append("description_projet", data.descriptionProjet.trim());
        formData.append("filiere", data.filiere.trim());
        formData.append("moyenne_recente", data.moyenneRecente.trim());
        formData.append("nom_recommandant", data.nomRecommandant.trim());
        formData.append("tel_recommandant", data.telRecommandant.trim());
        formData.append("frequence_engagement", data.frequenceEngagement);

        // Étape 4 : Motivation & Numérique
        formData.append("motivation", data.motivation.trim());
        formData.append("acces_numerique", data.accesNumerique);

        // Déclarations
        formData.append("certification", String(data.certification));
        formData.append("confirmation_parent", String(data.confirmationParent));

        // Statut par défaut 'admis'
        formData.append("statut", "admis");

        // Fichiers binaires
        if (rawFiles.photoIdentite) {
          formData.append("photo_identite", rawFiles.photoIdentite);
        }
        if (rawFiles.pieceIdentite) {
          formData.append("piece_identite", rawFiles.pieceIdentite);
        }
        if (rawFiles.bulletinsScolaires) {
          formData.append("bulletins_scolaires", rawFiles.bulletinsScolaires);
        }
        if (rawFiles.autorisationParentale) {
          formData.append("autorisation_parentale", rawFiles.autorisationParentale);
        }
        if (rawFiles.preuveProjet) {
          formData.append("preuve_projet", rawFiles.preuveProjet);
        }
        if (rawFiles.lettreRecommandation) {
          formData.append("lettre_recommandation", rawFiles.lettreRecommandation);
        }

        const saved = await api.post<{
          id: number;
          reference: string;
          statut: string;
          [key: string]: any;
        }>("candidatures/", formData, { requiresAuth: false });

        const finalRef = saved?.reference || "CNCEIZ-2026-" + Math.floor(10000 + Math.random() * 90000);
        setCandidateRef(finalRef);

        // Génération du QR Code contenant les données vérifiables du candidat
        const qrPayload = JSON.stringify({
          ref: finalRef,
          candidat: `${data.prenom} ${data.nom}`,
          domaine: data.domaine,
          house: data.houseVisee || data.domaine,
          region: data.region,
          ville: data.villeVillage,
          statut: saved?.statut || "admis",
          date: new Date().toLocaleDateString("fr-FR"),
          event: "CNCEIZ Agadez 2026",
        });

        try {
          const url = await QRCode.toDataURL(qrPayload, {
            width: 280,
            margin: 1,
            color: {
              dark: "#193549",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "M",
          });
          setQrCodeUrl(url);
        } catch (qrErr) {
          console.error("Erreur génération QR code:", qrErr);
        }

        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: any) {
        console.error("Erreur lors de la soumission de la candidature :", err);
        const errorDetail =
          err?.data?.detail ||
          err?.data?.message ||
          (err?.data && typeof err.data === "object"
            ? Object.entries(err.data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ")
            : null) ||
          "Une erreur est survenue lors de l'enregistrement de votre candidature. Veuillez vérifier les informations saisies et réessayer.";
        setErrorMessage(errorDetail);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData,
    isImage = false,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(t("form.err_file_size"));
      setFieldErrors((prev) => ({ ...prev, [field]: t("form.err_file_size") }));
      e.target.value = "";
      return;
    }

    setRawFiles((prev) => ({ ...prev, [field]: file }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " Mo";
        updateField(field, {
          name: file.name,
          size: sizeStr,
          previewUrl: event.target?.result as string,
        } as any);
      };
      reader.readAsDataURL(file);
    } else {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " Mo";
      updateField(field, {
        name: file.name,
        size: sizeStr,
      } as any);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-16 pb-12 px-4 bg-[#F8FAFC] text-[#193549] flex flex-col items-center justify-center">
        {/* En-tête statut */}
        <div className="text-center mb-5 animate-fade-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t("form.submitted_badge")}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#193549] mt-2">
            {t("form.submitted_congrats")}, {data.prenom} !
          </h1>
        </div>

        {/* Badge Minimaliste */}
        <div
          id="badge-candidat-print"
          className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col items-center text-center animate-fade-up"
        >
          {/* Header aux couleurs du footer */}
          <div className="w-full bg-ope-footer text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={campNationalCitoyen}
                alt="CNCEIZ"
                className="w-6 h-6 object-contain"
              />
              <span className="text-xs font-bold tracking-tight text-white">
                CNCEIZ Agadez 2026
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
              {data.houseVisee || data.domaine}
            </span>
          </div>

          {/* Contenu du Badge */}
          <div className="p-5 w-full flex flex-col items-center text-center">
            {/* Photo & Identité */}
            <div className="mb-3">
              {data.photoIdentite?.previewUrl ? (
                <img
                  src={data.photoIdentite.previewUrl}
                  alt={`${data.prenom} ${data.nom}`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-2xs mx-auto"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-[#193549] leading-tight">
              {data.prenom} {data.nom}
            </h2>
            <p className="text-xs font-mono font-medium text-slate-400 mt-1">
              {candidateRef}
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-slate-500">
              <span>{data.region}</span>
              <span>•</span>
              <span>{data.villeVillage}</span>
            </div>

            {/* QR Code */}
            <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code ${candidateRef}`}
                  className="w-36 h-36 object-contain mix-blend-multiply"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                  ...
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Pass officiel • Présentez ce code lors du pré-camp
            </p>
          </div>
        </div>

        {/* Info succincte */}
        <div className="w-full max-w-sm mt-3 px-3 py-2 rounded-xl bg-slate-100/70 border border-slate-200/60 text-[11px] text-slate-600 text-center">
          Confirmation envoyée à <strong className="text-slate-800">{data.email}</strong>
        </div>

        {/* Actions minimalistes */}
        <div className="w-full max-w-sm mt-4 flex gap-2.5">
          {qrCodeUrl && (
            <a
              href={qrCodeUrl}
              download={`Badge-${candidateRef}.png`}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#193549] hover:bg-[#24455d] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Télécharger le QR Code
            </a>
          )}
          <Link
            to="/"
            className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-center transition-all shadow-xs"
          >
            {t("form.submitted_back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 sm:pt-12 pb-24 px-3 sm:px-6 lg:px-8 bg-[#F4F7F9] text-ope-text flex flex-col items-center">
      <div className="w-full max-w-4xl lg:max-w-5xl mt-10 mx-auto">
        {/* ── En-tête CNCEIZ Agadez 2026 ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-8 lg:p-10 mb-6">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <img
                src={campNationalCitoyen}
                alt="CNCEIZ"
                className="w-9 h-9 rounded-full object-contain p-0.5 bg-slate-50 border border-slate-200 shadow-xs"
              />
              <span className="text-base sm:text-lg font-extrabold text-[#193549] tracking-tight">
                CNCEIZ Agadez 2026
              </span>
            </div>
            <button
              type="button"
              title="Informations d'aide sur la candidature"
              className="w-7 h-7 rounded-full bg-[#193549] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              ?
            </button>
          </div>

          {/* Progress Bar & Step Label */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#193549]">
                {t("form.step_prefix")} {step} {t("form.step_of")} 5
              </span>
              <span className="text-xs font-semibold text-[#5C6B76]">
                {step === 1
                  ? t("form.step1_choice_label")
                  : t(
                      `form.steps.${STEPS[step - 1].key}`,
                      STEPS[step - 1].label,
                    )}
              </span>
            </div>
            <div className="w-full bg-[#E5ECF0] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#F15B29] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-xl text-xs sm:text-sm font-medium mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                {errorMessage}
              </span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 font-bold ml-2 hover:text-red-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#193549] tracking-tight mb-1.5">
                    {t("form.step1_title")}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C6B76]">
                    {t("form.step1_desc")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ── House 1 : STEAM ── */}
                  <div
                    onClick={() => handleSelectDomain("STEAM")}
                    className={`rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 border-2 ${
                      data.domaine === "STEAM"
                        ? "border-[#F15B29] bg-white shadow-md ring-2 ring-[#F15B29]/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EBF2F7] flex items-center justify-center shrink-0">
                        {/* Flask Icon */}
                        <svg
                          className="w-6 h-6 text-[#193549]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 3h6M10 3v5.586a1 1 0 01-.293.707l-5.414 5.414A2 2 0 004 16.121V19a2 2 0 002 2h12a2 2 0 002-2v-2.879a2 2 0 00-.586-1.414l-5.414-5.414A1 1 0 0114 8.586V3"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16h10"
                          />
                        </svg>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            data.domaine === "STEAM"
                              ? "border-[#F15B29] bg-[#F15B29]"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {data.domaine === "STEAM" && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#193549]">
                        STEAM
                      </h3>
                      <p className="text-xs text-[#5C6B76] leading-relaxed mt-1">
                        {t("form.steam_desc")}
                      </p>
                    </div>
                  </div>

                  {/* ── House 2 : Local Project ── */}
                  <div
                    onClick={() => handleSelectDomain("LP")}
                    className={`rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 border-2 ${
                      data.domaine === "LP"
                        ? "border-[#F15B29] bg-white shadow-md ring-2 ring-[#F15B29]/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EBF2F7] flex items-center justify-center shrink-0">
                        {/* Handshake Icon */}
                        <svg
                          className="w-6 h-6 text-[#193549]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L13 12.4" />
                          <path d="m13 7.6 1.7-1.7a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4L17 11.6" />
                          <path d="m2 14 6-6 3 3-4 4" />
                          <path d="m14 17 4 4 4-4" />
                        </svg>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            data.domaine === "LP"
                              ? "border-[#F15B29] bg-[#F15B29]"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {data.domaine === "LP" && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#193549]">
                        Local Project
                      </h3>
                      <p className="text-xs text-[#5C6B76] leading-relaxed mt-1">
                        {t("form.lp_desc")}
                      </p>
                    </div>
                  </div>

                  {/* ── House 3 : Mouvement Citoyen ── */}
                  <div
                    onClick={() => handleSelectDomain("MCC")}
                    className={`rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 border-2 ${
                      data.domaine === "MCC"
                        ? "border-[#F15B29] bg-white shadow-md ring-2 ring-[#F15B29]/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EBF2F7] flex items-center justify-center shrink-0">
                        {/* Users Icon */}
                        <svg
                          className="w-6 h-6 text-[#193549]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            data.domaine === "MCC"
                              ? "border-[#F15B29] bg-[#F15B29]"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {data.domaine === "MCC" && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#193549]">
                        Mouvement Citoyen
                      </h3>
                      <p className="text-xs text-[#5C6B76] leading-relaxed mt-1">
                        {t("form.mcc_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-ope-border/60 pb-3">
                  <h2 className="text-lg sm:text-xl font-extrabold text-ope-primary tracking-tight">
                    {t("form.step2_title")}
                  </h2>
                  <p className="text-xs sm:text-sm text-ope-text-muted">
                    {t("form.step2_desc")}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_nom")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={data.nom}
                      onChange={(e) =>
                        updateField("nom", e.target.value.toUpperCase())
                      }
                      placeholder="Nom de famille"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.nom
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-ope-border focus:border-ope-orange focus:ring-1 focus:ring-ope-orange"
                      }`}
                    />
                    {fieldErrors.nom && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.nom}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_prenom")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={data.prenom}
                      onChange={(e) => updateField("prenom", e.target.value)}
                      placeholder="Prénom(s)"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.prenom
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-ope-border focus:border-ope-orange focus:ring-1 focus:ring-ope-orange"
                      }`}
                    />
                    {fieldErrors.prenom && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.prenom}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-ope-text flex items-center gap-1.5">
                        {t("form.field_dob")} *
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 normal-case">
                          10 à 35 ans
                        </span>
                      </label>
                      {age !== null && (
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            age < 10 || age > 35
                              ? "bg-red-100 text-red-700"
                              : isMinor
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {age} {t("form.age_ans")}{" "}
                          {age < 10 || age > 35
                            ? "(Non éligible)"
                            : isMinor
                              ? `(${t("form.age_minor")})`
                              : `(${t("form.age_major")})`}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      required
                      min={MIN_BIRTH_DATE}
                      max={MAX_BIRTH_DATE}
                      value={data.dateNaissance}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateField("dateNaissance", val);
                        if (val) {
                          const calculated = calculateAge(val);
                          if (
                            calculated !== null &&
                            (calculated < 10 || calculated > 35)
                          ) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              dateNaissance: t("form.err_dob_age"),
                            }));
                          } else {
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.dateNaissance;
                              return next;
                            });
                          }
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.dateNaissance
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-ope-border focus:border-ope-orange focus:ring-1 focus:ring-ope-orange"
                      }`}
                    />
                    {fieldErrors.dateNaissance && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.dateNaissance}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_sex")} *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateField("sexe", "M")}
                        className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border cursor-pointer ${
                          data.sexe === "M"
                            ? "bg-ope-primary text-white border-ope-primary shadow-sm"
                            : fieldErrors.sexe
                              ? "bg-red-50/20 text-slate-600 border-red-500"
                              : "bg-slate-50 text-slate-600 border-ope-border hover:bg-slate-100"
                        }`}
                      >
                        {t("form.field_sex_m")}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("sexe", "F")}
                        className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border cursor-pointer ${
                          data.sexe === "F"
                            ? "bg-ope-orange text-white border-ope-orange shadow-sm"
                            : fieldErrors.sexe
                              ? "bg-red-50/20 text-slate-600 border-red-500"
                              : "bg-slate-50 text-slate-600 border-ope-border hover:bg-slate-100"
                        }`}
                      >
                        {t("form.field_sex_f")}
                      </button>
                    </div>
                    {fieldErrors.sexe && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.sexe}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_region")}
                    </label>
                    <select
                      value={data.region}
                      onChange={(e) => updateField("region", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ope-border text-sm bg-white focus:border-ope-orange focus:outline-none focus:ring-1 focus:ring-ope-orange"
                    >
                      {REGIONS_NIGER.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_ville")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={data.villeVillage}
                      onChange={(e) =>
                        updateField("villeVillage", e.target.value)
                      }
                      placeholder={t("form.field_ville_placeholder")}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.villeVillage
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-ope-border focus:border-ope-orange focus:ring-1 focus:ring-ope-orange"
                      }`}
                    />
                    {fieldErrors.villeVillage && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.villeVillage}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_nationalite")}
                    </label>
                    <input
                      type="text"
                      value={data.nationalite}
                      onChange={(e) =>
                        updateField("nationalite", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ope-border text-sm focus:border-ope-orange focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_etablissement")}
                    </label>
                    <input
                      type="text"
                      value={data.etablissement}
                      onChange={(e) =>
                        updateField("etablissement", e.target.value)
                      }
                      placeholder={t("form.field_etablissement_placeholder")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ope-border text-sm focus:border-ope-orange focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_classe")}
                    </label>
                    <input
                      type="text"
                      value={data.classe}
                      onChange={(e) => updateField("classe", e.target.value)}
                      placeholder={t("form.field_classe_placeholder")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ope-border text-sm focus:border-ope-orange focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_tel_candidat")}
                    </label>
                    <input
                      type="tel"
                      value={data.telephoneCandidat}
                      onChange={(e) =>
                        updateField("telephoneCandidat", e.target.value)
                      }
                      placeholder="+227 XX XX XX XX"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.telephoneCandidat
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-ope-border focus:border-ope-orange focus:ring-1 focus:ring-ope-orange"
                      }`}
                    />
                    {fieldErrors.telephoneCandidat && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.telephoneCandidat}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_email")} *
                    </label>
                    <input
                      type="email"
                      required
                      value={data.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="exemple@domaine.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.email
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-ope-border focus:border-ope-orange focus:ring-1 focus:ring-ope-orange"
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                        {t("form.field_tel_tuteur")}{" "}
                        {isMinor && <span className="text-red-500">*</span>}
                      </label>
                      {isMinor && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {t("form.field_tel_tuteur_required")}
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      required={isMinor}
                      value={data.telephoneTuteur}
                      onChange={(e) =>
                        updateField("telephoneTuteur", e.target.value)
                      }
                      placeholder="+227 XX XX XX XX"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.telephoneTuteur
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : isMinor && !data.telephoneTuteur
                            ? "border-amber-400 bg-amber-50/40 focus:border-red-500"
                            : "border-ope-border focus:border-ope-orange"
                      }`}
                    />
                    {fieldErrors.telephoneTuteur && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.telephoneTuteur}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                      {t("form.field_point_focal")}
                    </label>
                    <input
                      type="text"
                      value={data.pointFocal}
                      onChange={(e) =>
                        updateField("pointFocal", e.target.value)
                      }
                      placeholder={t("form.field_point_focal_placeholder")}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ope-border text-sm focus:border-ope-orange focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                        {t("form.field_bio")}
                      </label>
                      <span
                        className={`text-xs font-bold ${
                          countWords(data.biographie) > 100 ||
                          fieldErrors.biographie
                            ? "text-red-500"
                            : countWords(data.biographie) > 85
                              ? "text-ope-orange"
                              : "text-ope-text-muted"
                        }`}
                      >
                        {countWords(data.biographie)} / 100{" "}
                        {t("form.field_bio_count")}
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={data.biographie}
                      onChange={(e) =>
                        updateField("biographie", e.target.value)
                      }
                      placeholder={t("form.field_bio_placeholder")}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.biographie
                          ? "border-red-500 bg-red-50/20 focus:border-red-500"
                          : "border-ope-border focus:border-ope-orange"
                      }`}
                    />
                    {fieldErrors.biographie && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.biographie}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-ope-border/60 pb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-ope-primary tracking-tight">
                      3. {t("form.steps.house_project", "House visée & Projet")}
                    </h2>
                    <p className="text-xs sm:text-sm text-ope-text-muted">
                      {t("form.step3_domain")}{" "}
                      <strong className="text-ope-orange">
                        {data.domaine}
                      </strong>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FDC705]/20 text-[#856404] border border-[#FDC705]">
                    {t("form.step3_one_choice")}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-2">
                    {t("form.step3_title")} *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {data.domaine &&
                      HOUSES_BY_DOMAIN[data.domaine].map((house) => {
                        const isSelected = data.houseVisee === house;

                        return (
                          <div
                            key={house}
                            onClick={() => updateField("houseVisee", house)}
                            className={`cursor-pointer rounded-2xl p-4 transition-all border-2 flex items-center justify-between ${
                              isSelected
                                ? "border-ope-orange bg-ope-orange/10 text-ope-text shadow-sm font-bold"
                                : fieldErrors.houseVisee
                                  ? "border-red-300 bg-white hover:border-red-400 text-slate-700"
                                  : "border-ope-border bg-white hover:border-slate-300 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-ope-orange text-white"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {isSelected ? (
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 block" />
                                )}
                              </span>
                              <span className="text-xs sm:text-sm font-bold leading-tight">
                                {house}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {fieldErrors.houseVisee && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1 animate-fade-up">
                      <svg
                        className="w-3 h-3 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {fieldErrors.houseVisee}
                    </p>
                  )}

                  {data.houseVisee === "Autre projet local" && (
                    <div className="mt-4 p-4 rounded-2xl bg-ope-bg border border-ope-border animate-fade-up">
                      <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                        {t("form.step3_other_label")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={data.houseViseeAutre}
                        onChange={(e) =>
                          updateField("houseViseeAutre", e.target.value)
                        }
                        placeholder={t("form.step3_other_placeholder")}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white focus:outline-none transition-colors ${
                          fieldErrors.houseViseeAutre
                            ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-ope-border focus:border-ope-orange"
                        }`}
                      />
                      {fieldErrors.houseViseeAutre && (
                        <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {fieldErrors.houseViseeAutre}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-ope-border/60">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-2">
                      {t("form.step4_status_label")} *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {data.domaine &&
                        STATUTS_PROJET_BY_DOMAIN[data.domaine].map((statut) => {
                          const isSelected = data.statutProjet === statut;

                          return (
                            <div
                              key={statut}
                              onClick={() =>
                                updateField("statutProjet", statut)
                              }
                              className={`cursor-pointer rounded-xl p-3.5 transition-all border flex items-center gap-3 ${
                                isSelected
                                  ? "border-ope-orange bg-ope-orange/10 font-bold text-ope-text"
                                  : fieldErrors.statutProjet
                                    ? "border-red-300 bg-slate-50 hover:bg-slate-100 text-slate-700"
                                    : "border-ope-border bg-slate-50 hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-ope-orange text-white"
                                    : "border border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-2.5 h-2.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className="text-xs sm:text-sm leading-snug">
                                {statut}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    {fieldErrors.statutProjet && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.statutProjet}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                        {t("form.step4_project_label")} *
                      </label>
                      <span
                        className={`text-[10px] font-bold ${
                          data.descriptionProjet.trim().length < 20
                            ? "text-slate-400"
                            : "text-green-600"
                        }`}
                      >
                        {data.descriptionProjet.trim().length} / 20 car. min.
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={data.descriptionProjet}
                      onChange={(e) =>
                        updateField("descriptionProjet", e.target.value)
                      }
                      placeholder={
                        data.domaine === "STEAM"
                          ? t("form.step4_placeholder_steam")
                          : data.domaine === "LP"
                            ? t("form.step4_placeholder_lp")
                            : t("form.step4_placeholder_mcc")
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                        fieldErrors.descriptionProjet
                          ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-ope-border focus:border-ope-orange"
                      }`}
                    />
                    {fieldErrors.descriptionProjet && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                        <svg
                          className="w-3 h-3 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {fieldErrors.descriptionProjet}
                      </p>
                    )}
                  </div>

                  {(data.domaine === "STEAM" || data.domaine === "LP") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-ope-border/60">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                          {t("form.step4_filiere_label")}
                        </label>
                        <input
                          type="text"
                          value={data.filiere}
                          onChange={(e) =>
                            updateField("filiere", e.target.value)
                          }
                          placeholder={t("form.step4_filiere_placeholder")}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-ope-border text-sm focus:border-ope-orange focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                          {t("form.step4_moyenne_label")}
                        </label>
                        <input
                          type="text"
                          value={data.moyenneRecente}
                          onChange={(e) =>
                            updateField("moyenneRecente", e.target.value)
                          }
                          placeholder={t("form.step4_moyenne_placeholder")}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-ope-border text-sm focus:border-ope-orange focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                          {t("form.step4_recommandant_label")}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={data.nomRecommandant}
                            onChange={(e) =>
                              updateField("nomRecommandant", e.target.value)
                            }
                            placeholder={t("form.step4_recommandant_nom")}
                            className="w-full px-3.5 py-2 rounded-xl border border-ope-border text-sm"
                          />
                          <div>
                            <input
                              type="tel"
                              value={data.telRecommandant}
                              onChange={(e) =>
                                updateField("telRecommandant", e.target.value)
                              }
                              placeholder={t("form.step4_recommandant_tel")}
                              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none ${
                                fieldErrors.telRecommandant
                                  ? "border-red-500 bg-red-50/20 focus:border-red-500"
                                  : "border-ope-border"
                              }`}
                            />
                            {fieldErrors.telRecommandant && (
                              <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                                <svg
                                  className="w-3 h-3 shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {fieldErrors.telRecommandant}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {data.domaine === "MCC" && (
                    <div className="space-y-4 pt-2 border-t border-ope-border/60">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                          {t("form.step4_engagement_label")}
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-w-sm">
                          {["Ponctuel", "Régulier"].map((freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() =>
                                updateField("frequenceEngagement", freq as any)
                              }
                              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                data.frequenceEngagement === freq
                                  ? "bg-[#C25E38] text-white border-[#C25E38]"
                                  : "bg-slate-50 text-slate-700 border-ope-border"
                              }`}
                            >
                              {freq}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-1">
                          {t("form.step4_citoyen_recommandant")}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={data.nomRecommandant}
                            onChange={(e) =>
                              updateField("nomRecommandant", e.target.value)
                            }
                            placeholder={t("form.step4_recommandant_nom")}
                            className="w-full px-3.5 py-2 rounded-xl border border-ope-border text-sm"
                          />
                          <input
                            type="tel"
                            value={data.telRecommandant}
                            onChange={(e) =>
                              updateField("telRecommandant", e.target.value)
                            }
                            placeholder={t("form.step4_recommandant_tel")}
                            className="w-full px-3.5 py-2 rounded-xl border border-ope-border text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="border-b border-ope-border/60 pb-3">
                  <h2 className="text-lg sm:text-xl font-extrabold text-ope-primary tracking-tight">
                    4. {t("form.steps.motivation", "Motivation & Contexte")}
                  </h2>
                  <p className="text-xs sm:text-sm text-ope-text-muted">
                    {t("form.step5_desc")}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                      {t("form.step5_motivation_label")} *
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        data.motivation.trim().length < 20
                          ? "text-slate-400"
                          : "text-green-600"
                      }`}
                    >
                      {data.motivation.trim().length} / 20 car. min.
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    value={data.motivation}
                    onChange={(e) => updateField("motivation", e.target.value)}
                    placeholder={t("form.step5_motivation_placeholder")}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
                      fieldErrors.motivation
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-ope-border focus:border-ope-orange"
                    }`}
                  />
                  {fieldErrors.motivation && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-fade-up">
                      <svg
                        className="w-3 h-3 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {fieldErrors.motivation}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ope-text mb-2">
                    {t("form.step5_numerique_label")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "Oui personnellement",
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <rect
                              x="7"
                              y="2"
                              width="10"
                              height="20"
                              rx="2"
                              ry="2"
                            />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                          </svg>
                        ),
                        label: t("form.step5_num_own"),
                        desc: t("form.step5_num_own_desc"),
                      },
                      {
                        id: "Oui avec l'aide d'un tiers",
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        ),
                        label: t("form.step5_num_shared"),
                        desc: t("form.step5_num_shared_desc"),
                      },
                      {
                        id: "Non mais je m'organiserai sur place",
                        icon: (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.75}
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        ),
                        label: t("form.step5_num_place"),
                        desc: t("form.step5_num_place_desc"),
                      },
                    ].map((opt) => {
                      const isSelected = data.accesNumerique === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() =>
                            updateField("accesNumerique", opt.id as any)
                          }
                          className={`cursor-pointer rounded-2xl p-4 transition-all border-2 flex flex-col justify-between gap-3 ${
                            isSelected
                              ? "border-ope-orange bg-ope-orange/10 font-bold text-ope-text shadow-sm"
                              : "border-ope-border bg-white hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={
                                isSelected
                                  ? "text-ope-orange"
                                  : "text-ope-text-muted"
                              }
                            >
                              {opt.icon}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-ope-orange bg-ope-orange"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                              )}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-ope-primary">
                              {opt.label}
                            </p>
                            <p className="text-[11px] text-ope-text-muted mt-0.5 leading-snug">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="border-b border-ope-border/60 pb-3">
                  <h2 className="text-lg sm:text-xl font-extrabold text-ope-primary tracking-tight">
                    5.{" "}
                    {t(
                      "form.steps.validation",
                      "Pièces justificatives & Validation",
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm text-ope-text-muted">
                    {t("form.step7_desc")}
                  </p>
                </div>

                {/* Résumé de la candidature */}
                <div className="bg-ope-bg rounded-2xl p-4 sm:p-5 space-y-3 text-xs border border-ope-border">
                  <div className="flex items-center justify-between border-b border-ope-border pb-2">
                    <span className="font-extrabold uppercase text-ope-primary">
                      {t("form.step7_summary")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-ope-orange font-bold hover:underline cursor-pointer"
                    >
                      {t("form.modify")}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-ope-text-muted block">
                        {t("form.step7_candidate")}
                      </span>
                      <strong className="text-ope-text">
                        {data.prenom} {data.nom}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ope-text-muted block">
                        {t("form.step7_age_sex")}
                      </span>
                      <strong className="text-ope-text">
                        {age !== null ? `${age} ${t("form.age_ans")}` : "-"} /{" "}
                        {data.sexe}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ope-text-muted block">
                        {t("form.step7_domain")}
                      </span>
                      <strong className="text-ope-orange">
                        {data.domaine}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ope-text-muted block">
                        {t("form.step7_region")}
                      </span>
                      <strong className="text-ope-text">
                        {data.region} ({data.villeVillage})
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ope-border/60">
                    <span className="text-ope-text-muted block">
                      {t("form.step7_house")}
                    </span>
                    <strong className="text-ope-primary">
                      {data.houseVisee || "-"}{" "}
                      {data.houseViseeAutre ? `(${data.houseViseeAutre})` : ""}
                    </strong>
                  </div>
                </div>

                {/* Pièces jointes */}
                <div className="space-y-4">
                  <div className="border-b border-ope-border/60 pb-2">
                    <h3 className="text-sm font-extrabold text-ope-primary uppercase tracking-wide">
                      {t("form.step6_title")}
                    </h3>
                    <p className="text-xs text-ope-text-muted">
                      {t("form.step6_desc")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Photo d'identité */}
                    <div
                      className={`border-2 border-dashed rounded-2xl p-4 transition-colors relative ${
                        fieldErrors.photoIdentite
                          ? "border-red-400 bg-red-50/25"
                          : "border-ope-border hover:border-ope-orange bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                          {t("form.step6_photo_label")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        {data.photoIdentite && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-ope-orange text-white">
                            {t("form.provided_badge")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {data.photoIdentite?.previewUrl ? (
                          <img
                            src={data.photoIdentite.previewUrl}
                            alt="Photo candidat"
                            className="w-14 h-14 rounded-xl object-cover border border-ope-border shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.75}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                              />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, "photoIdentite", true)
                            }
                            className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ope-primary file:text-white hover:file:bg-ope-primary-dark cursor-pointer w-full text-slate-500"
                          />
                          <p className="text-[10px] text-slate-400 mt-1 truncate">
                            {data.photoIdentite
                              ? data.photoIdentite.name
                              : t("form.step6_photo_hint")}
                          </p>
                        </div>
                      </div>
                      {fieldErrors.photoIdentite && (
                        <p className="text-[11px] font-semibold text-red-600 mt-2 flex items-center gap-1 animate-fade-up">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {fieldErrors.photoIdentite}
                        </p>
                      )}
                    </div>

                    {/* Pièce d'identité */}
                    <div
                      className={`border-2 border-dashed rounded-2xl p-4 transition-colors relative ${
                        fieldErrors.pieceIdentite
                          ? "border-red-400 bg-red-50/25"
                          : "border-ope-border hover:border-ope-orange bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                          {t("form.step6_piece_label")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        {data.pieceIdentite && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-ope-orange text-white">
                            {t("form.provided_badge")}
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, "pieceIdentite")}
                        className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ope-primary file:text-white hover:file:bg-ope-primary-dark cursor-pointer w-full text-slate-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {data.pieceIdentite
                          ? `${data.pieceIdentite.name} (${data.pieceIdentite.size})`
                          : t("form.step6_piece_hint")}
                      </p>
                      {fieldErrors.pieceIdentite && (
                        <p className="text-[11px] font-semibold text-red-600 mt-2 flex items-center gap-1 animate-fade-up">
                          <svg
                            className="w-3 h-3 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {fieldErrors.pieceIdentite}
                        </p>
                      )}
                    </div>

                    {/* Bulletins scolaires STEAM */}
                    {data.domaine === "STEAM" && (
                      <div
                        className={`border-2 border-dashed rounded-2xl p-4 transition-colors relative ${
                          fieldErrors.bulletinsScolaires
                            ? "border-red-400 bg-red-50/25"
                            : "border-ope-border hover:border-ope-orange bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                            3. Deux derniers bulletins scolaires (STEAM) *
                          </label>
                          {data.bulletinsScolaires && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-ope-orange text-white">
                              Fourni
                              <svg
                                className="w-2.5 h-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(e, "bulletinsScolaires")
                          }
                          className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ope-primary file:text-white hover:file:bg-ope-primary-dark cursor-pointer w-full text-slate-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {data.bulletinsScolaires
                            ? `${data.bulletinsScolaires.name} (${data.bulletinsScolaires.size})`
                            : "Relevés de notes de l'année"}
                        </p>
                        {fieldErrors.bulletinsScolaires && (
                          <p className="text-[11px] font-semibold text-red-600 mt-2 flex items-center gap-1 animate-fade-up">
                            <svg
                              className="w-3 h-3 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {fieldErrors.bulletinsScolaires}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Autorisation parentale (mineurs) */}
                    {isMinor && (
                      <div
                        className={`border-2 border-dashed rounded-2xl p-4 transition-colors relative ${
                          fieldErrors.autorisationParentale
                            ? "border-red-400 bg-red-50/25"
                            : "border-amber-300 hover:border-ope-orange bg-amber-50/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                            4. Autorisation parentale signée (Mineur) *
                          </label>
                          {data.autorisationParentale && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-ope-orange text-white">
                              Fourni
                              <svg
                                className="w-2.5 h-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(e, "autorisationParentale")
                          }
                          className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ope-orange file:text-white hover:file:bg-ope-orange-dark cursor-pointer w-full text-slate-500"
                        />
                        <p className="text-[10px] text-amber-700 mt-1">
                          {data.autorisationParentale
                            ? `${data.autorisationParentale.name} (${data.autorisationParentale.size})`
                            : "Document signé par le père, mère ou tuteur légal"}
                        </p>
                        {fieldErrors.autorisationParentale && (
                          <p className="text-[11px] font-semibold text-red-600 mt-2 flex items-center gap-1 animate-fade-up">
                            <svg
                              className="w-3 h-3 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {fieldErrors.autorisationParentale}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="border-2 border-dashed border-ope-border hover:border-ope-orange rounded-2xl p-4 transition-colors relative bg-slate-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                          5. Preuve du projet ou engagement (optionnel)
                        </label>
                        {data.preuveProjet && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-ope-orange text-white">
                            Fourni
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, "preuveProjet")}
                        className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ope-primary file:text-white hover:file:bg-ope-primary-dark cursor-pointer w-full text-slate-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {data.preuveProjet
                          ? `${data.preuveProjet.name} (${data.preuveProjet.size})`
                          : "Photo du prototype, attestation, article ou vidéo"}
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-ope-border hover:border-ope-orange rounded-2xl p-4 transition-colors relative bg-slate-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-ope-text">
                          6. Lettre de recommandation (optionnel)
                        </label>
                        {data.lettreRecommandation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-ope-orange text-white">
                            Fourni
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={(e) =>
                          handleFileUpload(e, "lettreRecommandation")
                        }
                        className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-ope-primary file:text-white hover:file:bg-ope-primary-dark cursor-pointer w-full text-slate-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {data.lettreRecommandation
                          ? `${data.lettreRecommandation.name} (${data.lettreRecommandation.size})`
                          : "Lettre de l'établissement ou d'une autorité"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirmation checkboxes */}
                <div className="space-y-3 pt-2">
                  {/* ── Confirmation candidat ── */}
                  <div
                    className={`rounded-2xl p-5 border-2 transition-all cursor-pointer ${
                      data.certification
                        ? "border-[#F15B29] bg-[#FFF5F2] ring-2 ring-[#F15B29]/15"
                        : fieldErrors.certification
                          ? "border-red-400 bg-red-50/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() =>
                      updateField("certification", !data.certification)
                    }
                  >
                    <label className="flex items-start gap-4 cursor-pointer select-none">
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          data.certification
                            ? "border-[#F15B29] bg-[#F15B29]"
                            : fieldErrors.certification
                              ? "border-red-400 bg-white"
                              : "border-slate-300 bg-white"
                        }`}
                      >
                        {data.certification && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#193549] leading-snug">
                          {t("form.step7_cert")} *
                        </p>
                        <p className="text-xs text-[#5C6B76] mt-1 leading-relaxed">
                          {t("form.step7_cert_desc")}
                        </p>
                        {fieldErrors.certification && (
                          <p className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1 animate-fade-up">
                            <svg
                              className="w-3 h-3 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {fieldErrors.certification}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* ── Confirmation parent/tuteur (mineurs uniquement) ── */}
                  {isMinor && (
                    <div
                      className={`rounded-2xl p-5 border-2 transition-all cursor-pointer animate-fade-up ${
                        data.confirmationParent
                          ? "border-amber-500 bg-amber-50 ring-2 ring-amber-400/20"
                          : fieldErrors.confirmationParent
                            ? "border-red-400 bg-red-50/20"
                            : "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                      }`}
                      onClick={() =>
                        updateField(
                          "confirmationParent",
                          !data.confirmationParent,
                        )
                      }
                    >
                      <label className="flex items-start gap-4 cursor-pointer select-none">
                        <div
                          className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            data.confirmationParent
                              ? "border-amber-500 bg-amber-500"
                              : fieldErrors.confirmationParent
                                ? "border-red-400 bg-white"
                                : "border-amber-300 bg-white"
                          }`}
                        >
                          {data.confirmationParent && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold text-amber-900 leading-snug">
                              {t("form.step7_cert_parent")} *
                            </p>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-800">
                              {t("form.age_minor")}
                            </span>
                          </div>
                          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                            {t("form.step7_cert_parent_desc")}
                          </p>
                          {fieldErrors.confirmationParent && (
                            <p className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1 animate-fade-up">
                              <svg
                                className="w-3 h-3 shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {fieldErrors.confirmationParent}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {step > 1 && (
        <div className="fixed bottom-0 inset-x-0 bg-ope-white/95 backdrop-blur-md border-t border-ope-border py-3.5 px-4 z-40 shadow-lg">
          <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-ope-bg text-ope-text hover:bg-slate-200 active:scale-95 cursor-pointer transition-all"
            >
              {t("form.prev")}
            </button>

            <span className="text-xs font-bold text-ope-text-muted hidden sm:inline">
              {t("form.step_prefix")} {step} {t("form.step_of")} 5
            </span>

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-ope-orange hover:bg-ope-orange-dark active:scale-95 transition-all shadow-md shadow-ope-orange/30 cursor-pointer"
              >
                {t("form.next")}
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "bg-ope-orange/70 cursor-not-allowed"
                    : "bg-ope-orange hover:bg-ope-orange-dark active:scale-95 shadow-ope-orange/40 animate-pulse cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  t("form.submit")
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
