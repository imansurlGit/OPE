import React, { useMemo, useState } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState<CategorieType>("");
  const [selectedHouse, setSelectedHouse] = useState<MaisonType>("");

  const isReady = useMemo(() => selectedCategory !== "" && selectedHouse !== "", [selectedCategory, selectedHouse]);

  const handleContinue = () => {
    if (selectedCategory && selectedHouse) {
      onSelectCategory(selectedCategory, selectedHouse);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 sm:p-8 lg:p-10 shadow-sm">
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

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-xs font-bold text-[#1d3d52]">
            <span>{t("form.step_prefix", "Étape 1 sur 5")}</span>
            <span>{t("form.category_house_step", "Choix du domaine")}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#e9edf1] overflow-hidden">
            <div className="h-full w-[20%] rounded-full bg-[#f15b29]" />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d3d52] tracking-tight">Choisissez votre Maison</h1>
          <p className="mt-3 text-base text-[#5b6773]">
            Sélectionnez le domaine principal de votre candidature.
          </p>
        </div>

        <div className="mb-8 flex justify-center gap-2 rounded-full bg-[#f3f6f8] border border-slate-200 p-1.5 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory("senior")}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
              selectedCategory === "senior" ? "bg-[#1d3d52] text-white shadow-sm" : "text-[#1d3d52] bg-transparent"
            }`}
          >
            Senior
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("junior")}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
              selectedCategory === "junior" ? "bg-[#1d3d52] text-white shadow-sm" : "text-[#1d3d52] bg-transparent"
            }`}
          >
            Junior
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MAISON_OPTIONS.map((option) => {
            const selected = selectedHouse === option.value;
            const isSteam = option.value === "steam";

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedHouse(option.value)}
                className={`group relative rounded-[22px] border p-5 text-left transition-all duration-200 ${
                  selected
                    ? "border-[#f15b29] bg-white shadow-sm ring-2 ring-[#f15b29]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                } ${isSteam ? "min-h-[208px]" : "min-h-[208px]"}`}
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
          <span />
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isReady}
            className={`rounded-xl px-6 py-3 text-sm font-bold text-white transition-all ${
              isReady ? "bg-[#f15b29] hover:bg-[#dd4d1c]" : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};
