import { useTranslation } from "react-i18next";
import campNationalCitoyen from "../assets/camp_natio.png";
import { useCandidatureForm } from "../hooks/useCandidatureForm";
import { CategoryChoice } from "../components/formulaire/CategoryChoice";
import { JuniorForm } from "../components/formulaire/JuniorForm";
import { SeniorForm } from "../components/formulaire/SeniorForm";
import { SuccessView } from "../components/formulaire/SuccessView";
import { JUNIOR_STEPS, SENIOR_STEPS } from "../types/formulaire";

export default function Formulaire() {
  const { t } = useTranslation();

  const {
    categorie,
    maison,
    step,
    juniorData,
    seniorData,
    juniorErrors,
    seniorErrors,
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
  } = useCandidatureForm();

  const activeSteps = categorie === "junior" ? JUNIOR_STEPS : SENIOR_STEPS;
  const currentStepConfig = activeSteps[step - 1] || activeSteps[0];
  const maxSteps = activeSteps.length;

  // ── VUE DE SUCCÈS APRÈS ENREGISTREMENT ──
  if (isSubmitted) {
    const isJunior = categorie === "junior";
    const nom = isJunior ? juniorData.nom : seniorData.nom;
    const prenom = isJunior ? juniorData.prenom : seniorData.prenom;
    const regionVille = isJunior ? juniorData.regionVille : seniorData.regionVille;
    const badgeTag = isJunior
      ? juniorData.houseVisee === "autre"
        ? juniorData.houseViseeAutre || "Junior"
        : (juniorData.houseVisee || "Junior").toUpperCase()
      : seniorData.domaineSteam === "autre"
        ? seniorData.domaineSteamAutre || "Innovation"
        : seniorData.domaineSteam.toUpperCase();
    const photoUrl = isJunior
      ? juniorData.photoIdentite?.previewUrl
      : seniorData.photoIdentite?.previewUrl;
    return (
      <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 bg-[#F4F7F9] flex flex-col items-center">
        <div className="w-full max-w-2xl mt-8">
          <SuccessView
            reference={candidateRef}
            categorie={categorie as "junior" | "senior"}
            nom={nom}
            prenom={prenom}
            regionVille={regionVille}
            badgeTag={badgeTag}
            photoUrl={photoUrl}
            onNewApplication={changeCategory}
          />
        </div>
      </div>
    );
  }

  // ── ÉTAPE 0 : CHOIX DE LA CATÉGORIE ──
  if (!categorie) {
    return (
      <div className="min-h-screen pt-12 sm:pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-[#F4F7F9] text-ope-text flex flex-col items-center">
        <div className="w-full max-w-5xl mt-6">
          <CategoryChoice onSelectCategory={selectCategory} />
        </div>
      </div>
    );
  }

  // ── FORMULAIRE DÉDIÉ (JUNIOR OU SENIOR) ──
  return (
    <div className="min-h-screen pt-10 sm:pt-12 pb-28 px-3 sm:px-6 lg:px-8 bg-[#F4F7F9] text-ope-text flex flex-col items-center">
      <div className="w-full max-w-4xl lg:max-w-5xl mt-8 mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-8 lg:p-10 mb-6">
          {/* Top Brand & Category Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <img
                src={campNationalCitoyen}
                alt="CNCEIZ"
                className="w-9 h-9 rounded-full object-contain p-0.5 bg-slate-50 border border-slate-200 shadow-xs"
              />
              <div>
                <span className="text-base sm:text-lg font-extrabold text-[#193549] tracking-tight block">
                  CNCEIZ Agadez 2026
                </span>
                <span className="text-xs font-semibold text-[#F15B29]">
                  {categorie === "junior"
                    ? "Parcours Junior — Concours de la Mascotte"
                    : "Parcours Senior — Innovation STEAM"}
                </span>
                {maison && (
                  <span className="text-xs font-semibold text-[#5C6B76]">
                    Maison : {maison.replaceAll("_", " ")}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={changeCategory}
              className="text-xs font-bold text-white bg-[#193549] hover:bg-[#F15B29] px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Changer de catégorie</span>
            </button>
          </div>

          {/* Progress Bar & Dynamic Step Label */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#193549]">
                {t("form.step_prefix", "Étape")} {step} {t("form.step_of", "sur")} {maxSteps}
              </span>
              <span className="text-xs font-semibold text-[#5C6B76]">
                {currentStepConfig.label}
              </span>
            </div>
            <div className="w-full bg-[#E5ECF0] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#F15B29] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / maxSteps) * 100}%` }}
              />
            </div>

            {/* Stepper Indicators */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {activeSteps.map((st, idx) => {
                const stepNum = idx + 1;
                const isCurrent = stepNum === step;
                const isPassed = stepNum < step;
                return (
                  <div
                    key={st.key}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                      isCurrent
                        ? "bg-[#F15B29] text-white font-bold"
                        : isPassed
                          ? "bg-[#18794E] text-white font-semibold"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span className="text-[11px] block truncate">
                      {isPassed ? `✓ ${st.shortLabel}` : `${stepNum}. ${st.shortLabel}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3.5 rounded-r-xl text-xs sm:text-sm font-medium mb-6 flex items-start gap-2.5 animate-fade-up">
              <svg
                className="w-4 h-4 shrink-0 text-red-500 mt-0.5"
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
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Step Form Body */}
          <form onSubmit={(e) => e.preventDefault()}>
            {categorie === "junior" ? (
              <JuniorForm
                step={step}
                maison={maison}
                data={juniorData}
                fieldErrors={juniorErrors}
                onChangeField={updateJuniorField}
                onFileUpload={(field, file) => handleFileUpload(field, file)}
                onFileRemove={(field) => handleFileRemove(field)}
              />
            ) : (
              <SeniorForm
                step={step}
                maison={maison}
                data={seniorData}
                fieldErrors={seniorErrors}
                onChangeField={updateSeniorField}
                onFileUpload={(field, file) => handleFileUpload(field, file)}
                onFileRemove={(field) => handleFileRemove(field)}
              />
            )}
          </form>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-3.5 px-4 z-40 shadow-lg">
        <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={step === 1 ? changeCategory : handlePrev}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 text-[#193549] hover:bg-slate-200 active:scale-95 cursor-pointer transition-all"
          >
            {step === 1 ? "Changer de catégorie" : t("form.prev", "Précédent")}
          </button>

          <span className="text-xs font-bold text-[#5C6B76] hidden sm:inline">
            {t("form.step_prefix", "Étape")} {step} {t("form.step_of", "sur")} {maxSteps}
          </span>

          {step < maxSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F15B29] hover:bg-orange-600 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              {t("form.next", "Suivant")}
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-[#b9431c] cursor-not-allowed"
                  : "bg-[#F15B29] hover:bg-orange-600 active:scale-95 cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="text-orange-200" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="text-white" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                t("form.submit", "Valider et soumettre ma candidature")
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
