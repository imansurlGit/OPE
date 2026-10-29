import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createCandidatureMascotte } from "../services/mascotteApi";
import {
  MascotteForm,
  type MascotteFormData,
  type MascotteFormErrors,
} from "../components/formulaire/MascotteForm";
import { MascotteSuccessView } from "../components/formulaire/MascotteSuccessView";
import { MAX_FILE_SIZE, PHONE_REGEX } from "../types/formulaire";

const INITIAL_MASCOTTE_DATA: MascotteFormData = {
  nom: "",
  prenom: "",
  classe: "",
  etablissement: "",
  regionVille: "",
  telephoneTuteur: "",
  mascotteNom: "",
  mascottePourquoi: "",
  mascotteDessin: null,
  mascotteSignification: "",
  nomTuteur: "",
  autorisationParent: false,
  accordUtilisationDessin: false,
};

export default function ConcoursMascotte() {
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<MascotteFormData>(INITIAL_MASCOTTE_DATA);
  const [fieldErrors, setFieldErrors] = useState<MascotteFormErrors>({});
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [candidateRef, setCandidateRef] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title =
      "Concours de la mascotte CNCEIZ Agadez 2026 - Je participe !";
  }, []);

  const activeSteps = [
    {
      key: "qui_es_tu",
      label: t("mascotte_page.step_1_label", "Qui es-tu ?"),
      shortLabel: t("mascotte_page.step_1_short", "Identité"),
    },
    {
      key: "ta_mascotte",
      label: t("mascotte_page.step_2_label", "Ta mascotte"),
      shortLabel: t("mascotte_page.step_2_short", "Mascotte"),
    },
    {
      key: "autorisation",
      label: t("mascotte_page.step_3_label", "Autorisation & Finalisation"),
      shortLabel: t("mascotte_page.step_3_short", "Autorisation"),
    },
  ];

  const currentStepConfig = activeSteps[step - 1] || activeSteps[0];
  const maxSteps = activeSteps.length;

  const updateField = useCallback(
    <K extends keyof MascotteFormData>(
      field: K,
      value: MascotteFormData[K],
    ) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleFileUpload = useCallback(
    (_field: "mascotteDessin", file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          t("mascotte_page.err_file_size", "Le fichier dépasse la taille maximale autorisée de 10 Mo."),
        );
        return;
      }
      setRawFile(file);
      setData((prev) => ({
        ...prev,
        mascotteDessin: {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} Mo`,
          previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
        },
      }));
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.mascotteDessin;
        return next;
      });
    },
    [t],
  );

  const handleFileRemove = useCallback((_field: "mascotteDessin") => {
    setRawFile(null);
    setData((prev) => ({ ...prev, mascotteDessin: null }));
  }, []);

  const validateStep = (currentStep: number): boolean => {
    const errs: MascotteFormErrors = {};
    if (currentStep === 1) {
      if (!data.nom.trim()) errs.nom = t("mascotte_page.err_nom", "Le nom est obligatoire.");
      if (!data.prenom.trim()) errs.prenom = t("mascotte_page.err_prenom", "Le prénom est obligatoire.");
      if (!data.classe) errs.classe = t("mascotte_page.err_classe", "La classe est obligatoire.");
      if (!data.regionVille)
        errs.regionVille = t("mascotte_page.err_region", "La région de résidence est obligatoire.");
      if (!data.telephoneTuteur.trim()) {
        errs.telephoneTuteur = t("mascotte_page.err_phone_req", "Le téléphone du parent/tuteur est obligatoire.");
      } else if (!PHONE_REGEX.test(data.telephoneTuteur.trim())) {
        errs.telephoneTuteur = t("mascotte_page.err_phone_inv", "Numéro de téléphone invalide.");
      }
    } else if (currentStep === 2) {
      if (!data.mascotteNom.trim())
        errs.mascotteNom = t("mascotte_page.err_mascotte_nom", "Le nom de la mascotte est obligatoire.");
      if (!data.mascotteDessin)
        errs.mascotteDessin = t("mascotte_page.err_mascotte_dessin", "Le dessin de la mascotte est obligatoire (photo ou scan).");
    } else if (currentStep === 3) {
      if (!data.nomTuteur.trim())
        errs.nomTuteur = t("mascotte_page.err_nom_tuteur", "Le nom du parent ou tuteur est obligatoire.");
      if (!data.autorisationParent)
        errs.autorisationParent = t("mascotte_page.err_auto_parent", "L'accord du parent/tuteur est obligatoire pour participer.");
      if (!data.accordUtilisationDessin)
        errs.accordUtilisationDessin = t("mascotte_page.err_accord_dessin", "L'accord d'utilisation du dessin est obligatoire.");
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
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

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("nom", data.nom.trim());
      formData.append("prenom", data.prenom.trim());
      formData.append("classe", data.classe);
      formData.append("etablissement", data.etablissement.trim());
      formData.append("region_ville", data.regionVille.trim());
      formData.append("telephone_tuteur", data.telephoneTuteur.trim());
      formData.append("mascotte_nom", data.mascotteNom.trim());
      formData.append("mascotte_pourquoi", data.mascottePourquoi.trim());
      formData.append(
        "mascotte_signification",
        data.mascotteSignification.trim(),
      );
      formData.append("nom_tuteur", data.nomTuteur.trim());
      formData.append("autorisation_parent", String(data.autorisationParent));
      formData.append(
        "accord_utilisation_dessin",
        String(data.accordUtilisationDessin),
      );

      if (rawFile) {
        formData.append("mascotte_dessin", rawFile);
      }

      const res = await createCandidatureMascotte(formData);
      setCandidateRef(res.reference);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Une erreur est survenue lors de l'enregistrement de votre candidature.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setData(INITIAL_MASCOTTE_DATA);
    setStep(1);
    setFieldErrors({});
    setIsSubmitted(false);
    setCandidateRef("");
  };

  // ── ÉCRAN DE SUCCÈS DÉDIÉ AU CONCOURS DE LA MASCOTTE ──
  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 bg-[#F4F7F9] flex flex-col items-center">
        <div className="w-full max-w-3xl mt-6">
          <MascotteSuccessView
            reference={candidateRef}
            nom={data.nom}
            prenom={data.prenom}
            classe={data.classe}
            etablissement={data.etablissement}
            regionVille={data.regionVille}
            mascotteNom={data.mascotteNom}
            mascottePourquoi={data.mascottePourquoi}
            mascotteSignification={data.mascotteSignification}
            dessinUrl={data.mascotteDessin?.previewUrl}
            telephoneTuteur={data.telephoneTuteur}
            nomTuteur={data.nomTuteur}
            onNewApplication={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 sm:pt-14 pb-28 px-3 sm:px-6 lg:px-8 bg-[#F4F7F9] text-[#193549] flex flex-col items-center">
      <div className="w-full max-w-4xl lg:max-w-5xl mt-6 mx-auto">
        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-8 lg:p-10 mb-6">
          {/* Stepper Header */}
          <div className="border-b border-slate-100 pb-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-[#F15B29] uppercase tracking-wider">
                  {t("mascotte_page.step", "Étape")} {step} {t("mascotte_page.of", "sur")} {maxSteps}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
                  {currentStepConfig.label}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#193549]">
                {Math.round((step / maxSteps) * 100)}% {t("mascotte_page.completed", "complété")}
              </span>
            </div>

            {/* Stepper Dots/Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {activeSteps.map((s, idx) => {
                const sNum = idx + 1;
                const isCurrent = sNum === step;
                const isPassed = sNum < step;

                return (
                  <div
                    key={s.key}
                    className={`relative p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                      isCurrent
                        ? "bg-[#193549] text-white border-[#193549] shadow-sm"
                        : isPassed
                          ? "bg-[#193549]/10 text-[#193549] border-[#193549]/20"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrent
                          ? "bg-[#F15B29] text-white"
                          : isPassed
                            ? "bg-[#193549] text-white"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isPassed ? (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        sNum
                      )}
                    </div>

                    <div className="min-w-0 hidden sm:block">
                      <p className="text-xs font-bold truncate leading-tight">
                        {s.label}
                      </p>
                      <p
                        className={`text-[10px] font-medium truncate ${
                          isCurrent || isPassed
                            ? "text-white"
                            : "text-slate-500"
                        }`}
                      >
                        {s.shortLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Erreur générale API */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-fade-in"
            >
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold">{t("form.verification_required", "Vérification requise")}</p>
                <p className="mt-0.5 text-xs sm:text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Formulaire Mascotte */}
          <MascotteForm
            step={step}
            data={data}
            fieldErrors={fieldErrors}
            onChangeField={updateField}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
          />

          {/* Barre d'actions Navigation */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  {t("mascotte_page.prev_step", "Étape précédente")}
                </button>
              ) : (
                <Link
                  to="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors text-center inline-block"
                >
                  {t("mascotte_page.back_home", "Retour à l'accueil")}
                </Link>
              )}
            </div>

            <div className="w-full sm:w-auto">
              {step < maxSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#F15B29] hover:bg-[#d94d1f] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {t("mascotte_page.next_step", "Continuer vers l'étape suivante")}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F15B29] to-[#ff7444] hover:from-[#e04e1e] hover:to-[#f15b29] text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:from-slate-200 disabled:to-slate-200 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="text-[#fca583]"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="text-white"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("mascotte_page.submitting_btn", "Envoi de ton dessin en cours...")}
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      {t("mascotte_page.submit_btn", "Valider ma candidature au concours")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
