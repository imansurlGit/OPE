import { useState } from "react";
import { useTranslation } from "react-i18next";
import steamImg from "../assets/steam.jpeg";
import lpImg from "../assets/lp.jpeg";
import mc2Img from "../assets/mc2.png";

export default function Categories() {
  const { t } = useTranslation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    steam: false,
    lp: false,
    mc2: false,
  });

  const toggleDropdown = (id: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const CATEGORIES = [
    {
      id: "steam",
      title: "STEAM",
      tag: "Sciences, Technologies, Ingénierie, Art et Mathématiques",
      desc: t("categories_page.steam_desc", "Propulser l'innovation technologique et scientifique. Nous formons les jeunes aux compétences numériques de pointe, à l'ingénierie créative et aux sciences appliquées pour résoudre les défis complexes de demain."),
      image: steamImg,
      dropdownLabel: t("categories_page.classes_label", "Classes"),
      classes: (t("categories_page.steam_classes", { returnObjects: true }) as string[]) || [
        "Robotique",
        "Intelligence artificielle",
        "Aéronautique",
        "Énergies renouvelables",
        "Biotechnologie",
        "Art",
        "Mathématiques et Logique",
      ],
      color: {
        topBorder: "border-t-[4px] border-t-[#00B0D7]",
        tagColor: "text-[#0092B3]",
        btnBg: "bg-[#00B0D7]",
        btnHover: "hover:bg-[#0092B3]",
        iconBg: "bg-[#e0f7fc]",
        iconColor: "text-[#0092B3]",
        dotColor: "bg-[#00B0D7]",
        subBg: "bg-[#f0fbfe]",
        border: "border-[#bce9f5]",
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M19 19L14 10.5V5H15C15.55 5 16 4.55 16 4C16 3.45 15.55 3 15 3H9C8.45 3 8 3.45 8 4C8 4.55 8.45 5 9 5H10V10.5L5 19C4.19 20.37 5.18 22 6.78 22H17.22C18.82 22 19.81 20.37 19 19ZM7.84 18L11.16 12.35C11.53 11.72 12.19 11.33 12.92 11.33C13.65 11.33 14.31 11.72 14.68 12.35L18 18H7.84Z" />
        </svg>
      ),
    },
    {
      id: "lp",
      title: "LP - Local Project",
      tag: "Agriculture, Élevage, Artisanat",
      desc: t("categories_page.lp_desc", "Valoriser le patrimoine et les ressources du Sahel. Ce pilier soutient les initiatives locales visant à moderniser les pratiques traditionnelles pour un développement économique durable et autonome."),
      image: lpImg,
      dropdownLabel: t("categories_page.classes_label", "Classes"),
      classes: (t("categories_page.lp_classes", { returnObjects: true }) as string[]) || ["Agriculture", "Élevage", "Artisanat"],
      color: {
        topBorder: "border-t-[4px] border-t-[#F15B29]",
        tagColor: "text-ope-orange",
        btnBg: "bg-ope-orange",
        btnHover: "hover:bg-[#d44d1f]",
        iconBg: "bg-[#fde9e2]",
        iconColor: "text-ope-orange",
        dotColor: "bg-ope-orange",
        subBg: "bg-[#fef4f0]",
        border: "border-[#fcd3c1]",
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M19 14C17.34 14 16 15.34 16 17C16 18.66 17.34 20 19 20C20.66 20 22 18.66 22 17C22 15.34 20.66 14 19 14ZM19 18.5C18.17 18.5 17.5 17.83 17.5 17C17.5 16.17 18.17 15.5 19 15.5C19.83 15.5 20.5 16.17 20.5 17C20.5 17.83 19.83 18.5 19 18.5ZM7.5 14C5.57 14 4 15.57 4 17.5C4 19.43 5.57 21 7.5 21C9.43 21 11 19.43 11 17.5C11 15.57 9.43 14 7.5 14ZM7.5 19.5C6.4 19.5 5.5 18.6 5.5 17.5C5.5 16.4 6.4 15.5 7.5 15.5C8.6 15.5 9.5 16.4 9.5 17.5C9.5 18.6 8.6 19.5 7.5 19.5ZM16.5 12H15V8H11V10H9V6H17.34L19.58 9.58C19.85 10 20 10.5 20 11V12.33C19.68 12.12 19.35 12 19 12H16.5ZM4.34 12H1.5C1.22 12 1 11.78 1 11.5C1 11.22 1.22 11 1.5 11H3.66L4.76 7.69C4.9 7.27 5.29 7 5.73 7H9V9H6.13L5.13 12H4.34Z" />
        </svg>
      ),
    },
    {
      id: "mc2",
      title: "MC2 - Modèle de Citoyen Communautaire",
      tag: "Modèle de Citoyen Communautaire",
      desc: t("categories_page.mcc_desc", "Forger les leaders de demain. Un accent sur le leadership, l'éthique et l'engagement civique pour bâtir une jeunesse responsable et dévouée au progrès de sa communauté."),
      image: mc2Img,
      dropdownLabel: t("categories_page.classes_label", "Classes"),
      classes: (t("categories_page.mc2_classes", { returnObjects: true }) as string[]) || [
        "Débats communautaires",
        "Formation sur la citoyenneté, développement personnel et leadership",
        "Fabrication de poubelles",
        "7 km de la Paix",
        "Réhabilitation de tables-bancs",
        "Don",
        "Plantation d'arbres",
        "Sensibilisation à la paix",
        "Sensibilisation à l'éducation",
        "Volontariat",
      ],
      color: {
        topBorder: "border-t-[4px] border-t-ope-primary",
        tagColor: "text-ope-primary",
        btnBg: "bg-ope-primary",
        btnHover: "hover:bg-[#245070]",
        iconBg: "bg-[#e8f3f9]",
        iconColor: "text-ope-primary",
        dotColor: "bg-ope-primary",
        subBg: "bg-[#f1f7fb]",
        border: "border-[#bfd9ea]",
      },
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pt-16 bg-ope-bg min-h-screen">
      {/* En-Tete */}
      <section className="pt-6 pb-8 sm:pt-10 sm:pb-12 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-4 tracking-tight">
            {t("categories_page.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
            {t("categories_page.subtitle")}
          </p>
        </div>
      </section>

      {/* Grille des cartes */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-xs border border-ope-border flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image d'illustration de la catégorie */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={cat.image}
                  alt={`Illustration ${cat.title}`}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                {/* Badge Catégorie & Icône */}
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate-100">
                  <span className={cat.color.iconColor}>{cat.icon}</span>
                  <span className="text-xs font-black text-ope-text tracking-wide">
                    {cat.title}
                  </span>
                </div>
              </div>

              {/* Contenu textuel avec flex-1 pour égaliser et pousser le dropdown au même niveau */}
              <div className="p-5 sm:p-6 pb-2 flex-1 flex flex-col">
                <p
                  className={`text-[10px] font-extrabold tracking-widest uppercase mb-2 ${cat.color.tagColor}`}
                >
                  {cat.tag}
                </p>
                <h3 className="text-xl font-black text-ope-text mb-2.5 tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              {/* Dropdown des Classes collé en bas de la carte au même niveau */}
              <div className="p-5 sm:p-6 pt-2 pb-6 mt-auto">
                <button
                  type="button"
                  onClick={() => toggleDropdown(cat.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white ${cat.color.btnBg} ${cat.color.btnHover} transition-all duration-200 flex items-center justify-between cursor-pointer active:scale-95 shadow-sm`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                    <span>{cat.dropdownLabel}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white transition-transform duration-200 shrink-0 ${
                      openDropdowns[cat.id] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Contenu déroulant */}
                {openDropdowns[cat.id] && (
                  <div
                    className={`mt-3 p-3.5 rounded-xl ${cat.color.subBg} border ${cat.color.border}`}
                  >
                    <ul className="space-y-1.5">
                      {cat.classes.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="text-xs text-ope-text flex items-start gap-2 font-medium"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${cat.color.dotColor}`}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banniere CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-ope-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center sm:text-left max-w-xl">
            <h3 className="text-lg sm:text-xl font-black text-ope-text mb-2 tracking-tight">
              {t("apropos.title")}
            </h3>
            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
              {t("apropos.description")}
            </p>
          </div>
          <span
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-ope-orange shadow-md shrink-0 cursor-not-allowed select-none"
            title={t("categories_page.reg_closed_title", "Les inscriptions sont actuellement fermées")}
          >
            {t("categories_page.apply_house")}
          </span>
        </div>
      </section>
    </div>
  );
}
