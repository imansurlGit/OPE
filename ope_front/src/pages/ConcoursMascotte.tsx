import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCandidatureForm } from "../hooks/useCandidatureForm";
import { JuniorForm } from "../components/formulaire/JuniorForm";
import { SuccessView } from "../components/formulaire/SuccessView";
import { JUNIOR_STEPS } from "../types/formulaire";

export default function ConcoursMascotte() {
  const {
    step,
    juniorData,
    juniorErrors,
    isSubmitting,
    isSubmitted,
    candidateRef,
    errorMessage,
    changeCategory,
    updateJuniorField,
    handleFileUpload,
    handleFileRemove,
    handleNext,
    handlePrev,
    handleSubmit,
  } = useCandidatureForm("junior", "steam");

  useEffect(() => {
    document.title = "Concours de la mascotte CNCEIZ Agadez 2026 – Je participe !";
  }, []);

  const activeSteps = JUNIOR_STEPS;
  const currentStepConfig = activeSteps[step - 1] || activeSteps[0];
  const maxSteps = activeSteps.length;

  // ── ÉCRAN DE SUCCÈS ──
  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 bg-[#F4F7F9] flex flex-col items-center">
        <div className="w-full max-w-2xl mt-8">
          <SuccessView
            reference={candidateRef}
            categorie="junior"
            nom={juniorData.nom}
            prenom={juniorData.prenom}
            regionVille={juniorData.regionVille}
            badgeTag="Concours Mascotte"
            photoUrl={juniorData.mascotteDessin?.previewUrl}
            onNewApplication={changeCategory}
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
                  Étape {step} sur {maxSteps}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[#193549]">
                  {currentStepConfig.label}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#193549]">
                {Math.round((step / maxSteps) * 100)}% complété
              </span>
            </div>

            {/* Progress Bar & Steps Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {activeSteps.map((s, index) => {
                const stepNum = index + 1;
                const isCurrent = step === stepNum;
                const isPassed = step > stepNum;

                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-orange-50/70 border-[#F15B29] text-[#193549] shadow-xs"
                        : isPassed
                          ? "bg-slate-50 border-slate-200 text-slate-700"
                          : "bg-slate-50/50 border-slate-100 text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isCurrent
                          ? "bg-[#F15B29] text-white"
                          : isPassed
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isPassed ? (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <div className="hidden sm:block min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{s.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{s.shortLabel}</p>
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
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold">Vérification requise</p>
                <p className="mt-0.5 text-xs sm:text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Formulaire Junior (3 étapes, pas d'âge ni date de naissance) */}
          <JuniorForm
            step={step}
            data={juniorData}
            fieldErrors={juniorErrors}
            onChangeField={updateJuniorField}
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
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Étape précédente
                </button>
              ) : (
                <Link
                  to="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors text-center inline-block"
                >
                  Retour à l'accueil
                </Link>
              )}
            </div>

            <div className="w-full sm:w-auto">
              {step < maxSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#F15B29] hover:bg-[#d94d1f] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Continuer vers l'étape suivante
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F15B29] to-[#ff7444] hover:from-[#e04e1e] hover:to-[#f15b29] text-white font-black text-sm shadow-lg shadow-orange-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Envoi de ton dessin en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Valider ma candidature au concours
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
