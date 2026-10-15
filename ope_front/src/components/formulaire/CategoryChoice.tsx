import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CategorieType, MaisonType } from "../../types/formulaire";
import { MAISON_OPTIONS } from "../../types/formulaire";

interface CategoryChoiceProps {
  onSelectCategory: (cat: "junior" | "senior", maison?: MaisonType) => void;
}

const getHouseIcon = (icon: "steam" | "local" | "citoyen") => {
  const commonProps = {
    className: "w-7 h-7",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
  };

  if (icon === "steam") {
    return (
      <svg {...commonProps}>
        <path d="M9 2.75c1.02 0 1.96.37 2.7 1.02a3.5 3.5 0 0 1 2.38 3.27 3.5 3.5 0 0 1-2.09 3.26 4.25 4.25 0 0 1 1.76 3.4 4.25 4.25 0 1 1-8.5 0 4.25 4.25 0 0 1 1.7-3.36A3.5 3.5 0 0 1 5.9 7.04 3.5 3.5 0 0 1 8.3 3.77C8.35 3.4 8.63 2.75 9 2.75Z" />
        <path d="M9 9.5c-.5 1.5 1.5 2.5 2.25 3.5.5.72.5 1.43 0 2.16-.8 1.16-2.02 1.15-3-.34" />
        <path d="M13.25 8.5c.3 1.15-.3 2.18-1.25 2.9" />
      </svg>
    );
  }

  if (icon === "local") {
    return (
      <svg {...commonProps}>
        <path d="M4 18.5V9.25L12 4l8 5.25v9.25" />
        <path d="M8 18.5v-6h8v6" />
        <path d="M10 12.75h4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 18.5c3.4 0 6.25-2.6 6.25-5.75A6.25 6.25 0 0 0 12 6.5a6.25 6.25 0 0 0-6.25 6.25C5.75 15.9 8.6 18.5 12 18.5Z" />
      <path d="M9 13.5s1.25 1.25 3 1.25 3-1.25 3-1.25" />
      <path d="M9 10.5h.01M15 10.5h.01" />
    </svg>
  );
};

export const CategoryChoice: React.FC<CategoryChoiceProps> = ({ onSelectCategory }) => {
  const { t } = useTranslation();
  // Slide 1 : Choix Junior ou Senior
  // Slide 2 : Choix de la Maison (STEAM, LP ou MC2)
  const [slide, setSlide] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategorieType>("");
  const [selectedHouse, setSelectedHouse] = useState<MaisonType>("");

  const handleNextSlide = () => {
    if (selectedCategory) {
      setSlide(2);
    }
  };

  const handlePrevSlide = () => {
    setSlide(1);
  };

  const handleConfirm = () => {
    if (selectedCategory && selectedHouse) {
      onSelectCategory(selectedCategory, selectedHouse);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 sm:p-8 lg:p-10 shadow-sm">
        {/* Entête CNCEIZ */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1f2f3d] text-white text-[10px] font-black flex items-center justify-center">
              OPE
            </div>
            <div>
              <span className="block text-lg font-extrabold text-[#1d3d52] tracking-tight">CNCEIZ Agadez 2026</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Aide"
            className="w-9 h-9 rounded-full bg-[#1d3d52] text-white flex items-center justify-center text-lg font-bold shadow-sm"
          >
            ?
          </button>
        </div>

        {/* Barre de progression initiale */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-xs font-bold text-[#1d3d52]">
            <span>
              {slide === 1
                ? t("form.step_prefix", "Étape 1 sur 2 : Choix du profil")
                : t("form.step_prefix", "Étape 2 sur 2 : Choix de la Maison")}
            </span>
            <span>
              {slide === 1
                ? t("form.category_level_step", "Junior ou Senior")
                : t("form.category_house_step", "STEAM, LP ou MC2")}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#e9edf1] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#f15b29] transition-all duration-300"
              style={{ width: slide === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* ── SLIDE 1 : CHOIX JUNIOR OU SENIOR ── */}
        {slide === 1 && (
          <div className="animate-fade-up">
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d3d52] tracking-tight mb-3">
                Choix de la catégorie
              </h1>
              <p className="text-sm sm:text-base font-semibold text-[#1d3d52] leading-relaxed">
                « Avant de continuer, choisissez la catégorie qui correspond à votre profil. Rassurer vous de faire le choix correspondant à votre profil. »
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Option Junior */}
              <button
                type="button"
                onClick={() => setSelectedCategory("junior")}
                className={`group relative rounded-[24px] border p-6 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  selectedCategory === "junior"
                    ? "border-[#f15b29] bg-white shadow-md ring-2 ring-[#f15b29]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        selectedCategory === "junior" ? "bg-[#f15b29] text-white" : "bg-slate-100 text-[#1d3d52]"
                      }`}
                    >
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        selectedCategory === "junior" ? "border-[#f15b29] bg-[#f15b29]" : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedCategory === "junior" && (
                        <span className="block h-full w-full rounded-full bg-[#f15b29]" />
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-extrabold text-[#1d3d52] mb-3">Junior</h2>
                  <p className="text-sm leading-relaxed text-[#5b6773]">
                    « Vous avez plus de 12 ans vous êtes élève, étudiant, vous avez une idée ou jeune talent et vous voulez vous former et vous initier (STEAM, LP ou MC2) ? Choisissez Junior. »
                  </p>
                </div>
              </button>

              {/* Option Senior */}
              <button
                type="button"
                onClick={() => setSelectedCategory("senior")}
                className={`group relative rounded-[24px] border p-6 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  selectedCategory === "senior"
                    ? "border-[#f15b29] bg-white shadow-md ring-2 ring-[#f15b29]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        selectedCategory === "senior" ? "bg-[#f15b29] text-white" : "bg-slate-100 text-[#1d3d52]"
                      }`}
                    >
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        selectedCategory === "senior" ? "border-[#f15b29] bg-[#f15b29]" : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedCategory === "senior" && (
                        <span className="block h-full w-full rounded-full bg-[#f15b29]" />
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-extrabold text-[#1d3d52] mb-3">Senior</h2>
                  <p className="text-sm leading-relaxed text-[#5b6773]">
                    « Vous avez plus de 18 ans, vous avez déjà réalisé des projets, vous avez un produit ou un savoir-faire à présenter ? Choisissez Senior. »
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={handleNextSlide}
                disabled={!selectedCategory}
                className={`rounded-xl px-6 py-3 text-sm font-bold text-white transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategory ? "bg-[#f15b29] hover:bg-[#dd4d1c]" : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                <span>Suivant</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── SLIDE 2 : LES TROIS MAISONS (STEAM, LP, MC2) ── */}
        {slide === 2 && (
          <div className="animate-fade-up">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1d3d52] text-white text-xs font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-[#f15b29]" />
                <span>Profil sélectionné : {selectedCategory === "junior" ? "Junior" : "Senior"}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d3d52] tracking-tight">
                Choisissez votre Maison
              </h1>
              <p className="mt-3 text-base text-[#5b6773]">
                Sélectionnez le domaine principal de votre candidature (STEAM, Local Project ou MC2).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {MAISON_OPTIONS.map((option) => {
                const selected = selectedHouse === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedHouse(option.value)}
                    className={`group relative rounded-[22px] border p-5 text-left transition-all duration-200 cursor-pointer ${
                      selected
                        ? "border-[#f15b29] bg-white shadow-sm ring-2 ring-[#f15b29]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    } min-h-[208px]`}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          selected ? "bg-[#f15b29] text-white" : "bg-slate-100 text-[#1d3d52]"
                        }`}
                      >
                        {getHouseIcon(option.icon)}
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          selected ? "border-[#f15b29] bg-[#f15b29]" : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <span className="block h-full w-full rounded-full bg-[#f15b29]" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-extrabold text-[#1d3d52]">{option.label}</h2>
                      <p className="text-sm leading-relaxed text-[#5b6773]">{option.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour au profil</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedHouse}
                className={`rounded-xl px-6 py-3 text-sm font-bold text-white transition-all cursor-pointer flex items-center gap-2 ${
                  selectedHouse ? "bg-[#f15b29] hover:bg-[#dd4d1c]" : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                <span>Accéder au formulaire</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
