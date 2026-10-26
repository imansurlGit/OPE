import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import type {
  CategorieType,
  MaisonType,
  JuniorData,
  SeniorData,
  JuniorErrors,
  SeniorErrors,
  UploadedFileInfo,
} from "../types/formulaire";
import {
  INITIAL_JUNIOR_DATA,
  INITIAL_SENIOR_DATA,
  MAX_FILE_SIZE,
  PHONE_REGEX,
  EMAIL_REGEX,
  URL_REGEX,
  JUNIOR_STEPS,
  SENIOR_STEPS,
} from "../types/formulaire";


export function useCandidatureForm(
  initialCategory: CategorieType = "",
  initialMaison: MaisonType = ""
) {
  const { t } = useTranslation();

  const [categorie, setCategorie] = useState<CategorieType>(initialCategory);
  const [maison, setMaison] = useState<MaisonType>(initialMaison);
  const [step, setStep] = useState<number>(1);

  const [juniorData, setJuniorData] = useState<JuniorData>(INITIAL_JUNIOR_DATA);
  const [seniorData, setSeniorData] = useState<SeniorData>(INITIAL_SENIOR_DATA);

  const [juniorErrors, setJuniorErrors] = useState<JuniorErrors>({});
  const [seniorErrors, setSeniorErrors] = useState<SeniorErrors>({});

  const [rawFiles, setRawFiles] = useState<Record<string, File>>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [candidateRef, setCandidateRef] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── SÉLECTION & CHANGEMENT DE CATÉGORIE ──
  const selectCategory = useCallback((cat: "junior" | "senior", nextMaison?: MaisonType) => {
    setCategorie(cat);
    setMaison(nextMaison ?? "");
    setStep(1);
    setJuniorErrors({});
    setSeniorErrors({});
    setErrorMessage(null);
  }, []);

  const changeCategory = useCallback(() => {
    setCategorie(initialCategory);
    setMaison(initialMaison);
    setStep(1);
    setJuniorData(INITIAL_JUNIOR_DATA);
    setSeniorData(INITIAL_SENIOR_DATA);
    setJuniorErrors({});
    setSeniorErrors({});
    setRawFiles({});
    setErrorMessage(null);
    setIsSubmitted(false);
    setCandidateRef("");
  }, [initialCategory, initialMaison]);

  // ── GESTION DES CHAMPS ──
  const updateJuniorField = useCallback(
    <K extends keyof JuniorData>(field: K, value: JuniorData[K]) => {
      setJuniorData((prev) => ({ ...prev, [field]: value }));
      setJuniorErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const updateSeniorField = useCallback(
    <K extends keyof SeniorData>(field: K, value: SeniorData[K]) => {
      setSeniorData((prev) => ({ ...prev, [field]: value }));
      setSeniorErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  // ── UPLOAD DE FICHIERS ──
  const handleFileUpload = useCallback(
    (field: string, file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        const errMsg = t(
          "form.err_file_size",
          "Le fichier dépasse la taille maximale autorisée de 10 Mo.",
        );
        setErrorMessage(errMsg);
        if (categorie === "junior") {
          setJuniorErrors((prev) => ({ ...prev, [field]: errMsg }));
        } else {
          setSeniorErrors((prev) => ({ ...prev, [field]: errMsg }));
        }
        return;
      }

      setRawFiles((prev) => ({ ...prev, [field]: file }));

      const fileInfo: UploadedFileInfo = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} Mo`,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      };

      if (categorie === "junior") {
        setJuniorData((prev) => ({ ...prev, [field]: fileInfo }));
        setJuniorErrors((prev) => {
          const next = { ...prev };
          delete next[field as keyof JuniorData];
          return next;
        });
      } else {
        setSeniorData((prev) => ({ ...prev, [field]: fileInfo }));
        setSeniorErrors((prev) => {
          const next = { ...prev };
          delete next[field as keyof SeniorData];
          return next;
        });
      }
    },
    [categorie, t],
  );

  const handleFileRemove = useCallback(
    (field: string) => {
      setRawFiles((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });

      if (categorie === "junior") {
        setJuniorData((prev) => ({ ...prev, [field]: null }));
      } else {
        setSeniorData((prev) => ({ ...prev, [field]: null }));
      }
    },
    [categorie],
  );

  // ── VALIDATION D'ÉTAPE ──
  const validateJuniorStep = (currentStep: number): boolean => {
    const errs: JuniorErrors = {};

    if (currentStep === 1) {
      if (!juniorData.nom.trim()) errs.nom = t("form.err_nom", "Le nom est obligatoire.");
      if (!juniorData.prenom.trim()) errs.prenom = t("form.err_prenom", "Le prénom est obligatoire.");
      if (!juniorData.sexe) errs.sexe = t("form.senior.err_sexe", "Le sexe est obligatoire.");
      if (!juniorData.regionVille || !juniorData.regionVille.trim()) {
        errs.regionVille = t("form.junior.err_region", "La région de résidence est obligatoire.");
      }
      if (!juniorData.telephoneTuteur.trim()) {
        errs.telephoneTuteur = t("form.junior.err_tel_tuteur", "Le téléphone du parent/tuteur est obligatoire.");
      } else if (!PHONE_REGEX.test(juniorData.telephoneTuteur.trim())) {
        errs.telephoneTuteur = t("form.err_phone_format", "Numéro de téléphone invalide.");
      }
    } else if (currentStep === 2) {
      if (!juniorData.houseVisee) {
        errs.houseVisee = "Veuillez sélectionner la House visée.";
      }
      if (juniorData.houseVisee === "autre" && !juniorData.houseViseeAutre.trim()) {
        errs.houseViseeAutre = "Veuillez préciser votre House / spécialité.";
      }
      if (!juniorData.situation) {
        errs.situation = "Veuillez sélectionner votre situation / état d'avancement.";
      }
      if (!juniorData.descriptionProjet.trim()) {
        errs.descriptionProjet = "La description de votre projet / idée est obligatoire.";
      }
    } else if (currentStep === 3) {
      if (!juniorData.motivation.trim()) {
        errs.motivation = "Votre lettre / texte de motivation est obligatoire.";
      }
      if (!juniorData.nomTuteur.trim()) {
        errs.nomTuteur = t("form.junior.err_nom_tuteur", "Le nom du parent ou tuteur est obligatoire.");
      }
      if (!juniorData.disponibleCamps) {
        errs.disponibleCamps = "Vous devez certifier l'exactitude des informations et votre disponibilité.";
      }
      if (!juniorData.signatureCandidat) {
        errs.signatureCandidat = "La signature du candidat est requise.";
      }
      if (!juniorData.signatureParent) {
        errs.signatureParent = "La signature du parent ou tuteur est obligatoire.";
      }
    }

    setJuniorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSeniorStep = (currentStep: number): boolean => {
    const errs: SeniorErrors = {};

    if (currentStep === 1) {
      if (!seniorData.nom.trim()) errs.nom = t("form.err_nom", "Le nom est obligatoire.");
      if (!seniorData.prenom.trim()) errs.prenom = t("form.err_prenom", "Le prénom est obligatoire.");
      if (!seniorData.sexe) errs.sexe = t("form.senior.err_sexe", "Le sexe est obligatoire.");
      if (!seniorData.regionVille || !seniorData.regionVille.trim()) {
        errs.regionVille = t("form.senior.err_region", "La région de résidence est obligatoire.");
      }
      if (!seniorData.telephone.trim()) {
        errs.telephone = t("form.err_phone", "Le numéro de téléphone est obligatoire.");
      } else if (!PHONE_REGEX.test(seniorData.telephone.trim())) {
        errs.telephone = t("form.err_phone_format", "Numéro de téléphone invalide.");
      }
      if (!seniorData.email.trim()) {
        errs.email = t("form.err_email", "L'adresse email est obligatoire.");
      } else if (!EMAIL_REGEX.test(seniorData.email.trim())) {
        errs.email = t("form.err_email_format", "Format d'adresse email invalide.");
      }
    } else if (currentStep === 2) {
      if (!seniorData.domaineSteam) {
        errs.domaineSteam = t("form.senior.err_domaine", "Le domaine ou la classe est obligatoire.");
      }
      if (seniorData.domaineSteam === "autre" && !seniorData.domaineSteamAutre.trim()) {
        errs.domaineSteamAutre = t("form.senior.err_domaine_autre", "Veuillez préciser le domaine / la classe.");
      }
      if (!seniorData.innovationNom.trim()) {
        errs.innovationNom = t("form.senior.err_innovation_nom", "Le nom de l'innovation est obligatoire.");
      }
      if (!seniorData.innovationDescription.trim()) {
        errs.innovationDescription = t(
          "form.senior.err_innovation_desc",
          "La description de l'innovation est obligatoire.",
        );
      }
      if (!seniorData.stadeDeveloppement) {
        errs.stadeDeveloppement = t("form.senior.err_stade", "Le stade de développement est obligatoire.");
      }
      if (seniorData.lienPortfolio.trim() && !URL_REGEX.test(seniorData.lienPortfolio.trim())) {
        errs.lienPortfolio = t("form.senior.err_url_format", "Format d'URL invalide.");
      }
    } else if (currentStep === 3) {
      if (seniorData.participeDefile && !seniorData.oeuvreDefile.trim()) {
        errs.oeuvreDefile = t("form.senior.err_oeuvre_defile", "Veuillez préciser l'œuvre à présenter au défilé.");
      }
      if (!seniorData.disponibleCamps) {
        errs.disponibleCamps = t(
          "form.senior.err_dispo_camps",
          "Vous devez confirmer votre disponibilité pendant le camp.",
        );
      }
      if (!seniorData.accepteConditions) {
        errs.accepteConditions = t(
          "form.senior.err_conditions",
          "Vous devez accepter les conditions de participation.",
        );
      }
    }

    setSeniorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCurrentStep = (): boolean => {
    if (categorie === "junior") {
      return validateJuniorStep(step);
    } else if (categorie === "senior") {
      return validateSeniorStep(step);
    }
    return false;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      const maxSteps = categorie === "junior" ? JUNIOR_STEPS.length : SENIOR_STEPS.length;
      if (step < maxSteps) {
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── SOUMISSION DU FORMULAIRE ──
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    if (!categorie || !maison) {
      setErrorMessage("Veuillez choisir une catégorie et une maison avant l'envoi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("categorie", categorie);
      formData.append("maison", maison);

      if (categorie === "junior") {
        formData.append("nom", juniorData.nom.trim());
        formData.append("prenom", juniorData.prenom.trim());
        formData.append("sexe", juniorData.sexe);
        formData.append("region_ville", juniorData.regionVille.trim());
        formData.append("telephone", (juniorData.telephoneCandidat || juniorData.telephoneTuteur).trim());
        formData.append("telephone_tuteur", juniorData.telephoneTuteur.trim());
        formData.append("email", juniorData.email.trim());
        formData.append("classe", juniorData.classe.trim());
        formData.append("etablissement", juniorData.etablissement.trim());
        formData.append("nom_tuteur", juniorData.nomTuteur.trim());

        formData.append("domaine_steam", juniorData.houseVisee);
        formData.append("domaine_steam_autre", juniorData.houseViseeAutre.trim());
        formData.append("innovation_nom", juniorData.houseVisee === "autre" ? juniorData.houseViseeAutre : juniorData.houseVisee);
        formData.append("innovation_description", juniorData.descriptionProjet.trim());

        // Détails supplémentaires dans note_interne
        const noteDetails = [
          juniorData.villeVillage ? `Ville/Village: ${juniorData.villeVillage}` : "",
          juniorData.nationalite ? `Nationalité: ${juniorData.nationalite}` : "",
          juniorData.nomPointFocal ? `Point focal: ${juniorData.nomPointFocal}` : "",
          juniorData.situation ? `Situation projet: ${juniorData.situation}` : "",
          juniorData.filiereVisee ? `Filière visée: ${juniorData.filiereVisee}` : "",
          juniorData.moyenneScolaire ? `Moyenne scolaire: ${juniorData.moyenneScolaire}` : "",
          juniorData.contactRecommandation ? `Contact recommandation: ${juniorData.contactRecommandation}` : "",
          juniorData.engagementType ? `Engagement type: ${juniorData.engagementType}` : "",
          juniorData.accesNumerique ? `Accès numérique: ${juniorData.accesNumerique}` : "",
          juniorData.biographie ? `Biographie: ${juniorData.biographie}` : "",
          juniorData.motivation ? `Motivation: ${juniorData.motivation}` : "",
        ]
          .filter(Boolean)
          .join("\n");
        formData.append("note_interne", noteDetails);

        formData.append("disponible_camps", String(juniorData.disponibleCamps));
        formData.append("accepte_conditions", String(juniorData.signatureCandidat && juniorData.signatureParent));
        formData.append("autorisation_parent", String(juniorData.signatureParent));

        if (rawFiles.photoIdentite) {
          formData.append("photo_identite", rawFiles.photoIdentite);
        }
        if (rawFiles.pieceIdentite) {
          formData.append("piece_identite", rawFiles.pieceIdentite);
        }
        if (rawFiles.bulletinsScolaires) {
          formData.append("preuves_realisation", rawFiles.bulletinsScolaires);
        } else if (rawFiles.preuveProjet) {
          formData.append("preuves_realisation", rawFiles.preuveProjet);
        }
      } else if (categorie === "senior") {
        formData.append("nom", seniorData.nom.trim());
        formData.append("prenom", seniorData.prenom.trim());
        formData.append("sexe", seniorData.sexe);
        formData.append("region_ville", seniorData.regionVille.trim());
        formData.append("telephone", seniorData.telephone.trim());
        formData.append("email", seniorData.email.trim());

        formData.append("domaine_steam", seniorData.domaineSteam);
        formData.append("domaine_steam_autre", seniorData.domaineSteamAutre.trim());
        formData.append("innovation_nom", seniorData.innovationNom.trim());
        formData.append("innovation_description", seniorData.innovationDescription.trim());
        formData.append("stade_developpement", seniorData.stadeDeveloppement);
        formData.append("lien_portfolio", seniorData.lienPortfolio.trim());

        formData.append("participe_defile", String(seniorData.participeDefile));
        formData.append("oeuvre_defile", seniorData.oeuvreDefile.trim());
        formData.append("facilitateur_juniors", String(seniorData.facilitateurJuniors));
        formData.append("souhaite_stand", String(seniorData.souhaiteStand));
        formData.append("concours_prix_innovation", String(seniorData.concoursPrixInnovation));
        formData.append("disponible_camps", String(seniorData.disponibleCamps));
        formData.append("accepte_conditions", String(seniorData.accepteConditions));

        if (rawFiles.pieceIdentite) {
          formData.append("piece_identite", rawFiles.pieceIdentite);
        }
        if (rawFiles.photoIdentite) {
          formData.append("photo_identite", rawFiles.photoIdentite);
        }
        if (rawFiles.preuvesRealisation) {
          formData.append("preuves_realisation", rawFiles.preuvesRealisation);
        }
      }

      const res = await api.post<{
        id: number;
        reference?: string;
        [key: string]: any;
      }>("candidatures/", formData, { requiresAuth: false });

      if (!res || !res.reference) {
        throw new Error(
          "Le serveur n'a pas renvoyé de numéro de dossier officiel. Veuillez contacter l'administration de l'OPE.",
        );
      }
      const ref = res.reference;

      setCandidateRef(ref);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Erreur de soumission candidature :", err);

      if (categorie === "junior" && err?.fieldErrors) {
        setJuniorErrors((prev) => ({
          ...prev,
          ...err.fieldErrors,
        }));
      }

      const detail =
        err?.message ||
        err?.data?.detail ||
        err?.data?.message ||
        (err?.data && typeof err.data === "object"
          ? Object.entries(err.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : null) ||
        "Une erreur est survenue lors de l'enregistrement de votre candidature. Veuillez vérifier les informations saisies.";
      setErrorMessage(detail);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    categorie,
    maison,
    step,
    juniorData,
    seniorData,
    juniorErrors,
    seniorErrors,
    rawFiles,
    isSubmitting,
    isSubmitted,
    candidateRef,
    errorMessage,
    selectCategory,
    changeCategory,
    updateJuniorField,
    updateSeniorField,
    handleFileUpload,
    handleFileRemove,
    handleNext,
    handlePrev,
    handleSubmit,
  };
}
