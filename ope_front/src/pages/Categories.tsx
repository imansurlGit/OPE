import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  title: string;
  tag: string;
  desc: string;
  color: {
    topBorder: string;
    tagColor: string;
    btnBg: string;
    btnHover: string;
    iconBg: string;
    iconColor: string;
    dotColor: string;
  };
  icon: React.ReactNode;
  details: {
    objectifs: string[];
    exemples: string[];
    criteres: string;
  };
}

const CATEGORIES: Category[] = [
  {
    id: "steam",
    title: "S.T.E.A.M.",
    tag: "SCIENCE, TECH, ENGINEERING, ART, MATH",
    desc: "Propulser l'innovation technologique et scientifique. Nous formons les jeunes aux competences numeriques, a l'ingenierie creative et aux sciences pour resoudre les defis complexes de demain.",
    color: {
      topBorder: "border-t-[4px] border-t-[#00B0D7]",
      tagColor: "text-[#0092B3]",
      btnBg: "bg-[#00B0D7]",
      btnHover: "hover:bg-[#0092B3]",
      iconBg: "bg-[#e0f7fc]",
      iconColor: "text-[#0092B3]",
      dotColor: "bg-[#00B0D7]",
    },
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M19 19L14 10.5V5H15C15.55 5 16 4.55 16 4C16 3.45 15.55 3 15 3H9C8.45 3 8 3.45 8 4C8 4.55 8.45 5 9 5H10V10.5L5 19C4.19 20.37 5.18 22 6.78 22H17.22C18.82 22 19.81 20.37 19 19ZM7.84 18L11.16 12.35C11.53 11.72 12.19 11.33 12.92 11.33C13.65 11.33 14.31 11.72 14.68 12.35L18 18H7.84Z" />
      </svg>
    ),
    details: {
      objectifs: [
        "Formation avancee en robotique et intelligence artificielle",
        "Developpement d'applications web & mobiles orientees impact local",
        "Conception 3D, prototypage electronique et mathematiques appliquees",
      ],
      exemples: [
        "Systemes d'irrigation connectes",
        "Solutions solaires intelligentes",
        "Drones de cartographie agricole",
      ],
      criteres: "Ouvert aux passionnes de tech, etudiants et createurs ayant un prototype ou une idee innovante.",
    },
  },
  {
    id: "lp",
    title: "Projet Local (LP)",
    tag: "AGRICULTURE, ELEVAGE, ARTISANAT",
    desc: "Valoriser le patrimoine et les ressources du Sahel. Ce pilier soutient les initiatives locales visant a moderniser les pratiques traditionnelles pour un developpement economique durable.",
    color: {
      topBorder: "border-t-[4px] border-t-[#F15B29]",
      tagColor: "text-ope-orange",
      btnBg: "bg-ope-orange",
      btnHover: "hover:bg-[#d44d1f]",
      iconBg: "bg-[#fde9e2]",
      iconColor: "text-ope-orange",
      dotColor: "bg-ope-orange",
    },
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M19 14C17.34 14 16 15.34 16 17C16 18.66 17.34 20 19 20C20.66 20 22 18.66 22 17C22 15.34 20.66 14 19 14ZM19 18.5C18.17 18.5 17.5 17.83 17.5 17C17.5 16.17 18.17 15.5 19 15.5C19.83 15.5 20.5 16.17 20.5 17C20.5 17.83 19.83 18.5 19 18.5ZM7.5 14C5.57 14 4 15.57 4 17.5C4 19.43 5.57 21 7.5 21C9.43 21 11 19.43 11 17.5C11 15.57 9.43 14 7.5 14ZM7.5 19.5C6.4 19.5 5.5 18.6 5.5 17.5C5.5 16.4 6.4 15.5 7.5 15.5C8.6 15.5 9.5 16.4 9.5 17.5C9.5 18.6 8.6 19.5 7.5 19.5ZM16.5 12H15V8H11V10H9V6H17.34L19.58 9.58C19.85 10 20 10.5 20 11V12.33C19.68 12.12 19.35 12 19 12H16.5ZM4.34 12H1.5C1.22 12 1 11.78 1 11.5C1 11.22 1.22 11 1.5 11H3.66L4.76 7.69C4.9 7.27 5.29 7 5.73 7H9V9H6.13L5.13 12H4.34Z" />
      </svg>
    ),
    details: {
      objectifs: [
        "Modernisation des techniques agro-pastorales adaptees au climat aride",
        "Transformation locale et valorisation des produits du terroir",
        "Preservation et rayonnement de l'artisanat d'art d'Agadez",
      ],
      exemples: [
        "Cultures maraicheres sous serre solaire",
        "Transformation du cuir & bijouterie touaregue",
        "Alimentation betail eco-responsable",
      ],
      criteres: "Destine aux porteurs de projets a fort ancrage local, cooperatives et artisans innovants.",
    },
  },
  {
    id: "mc2",
    title: "M.C.2",
    tag: "MODELE DE CITOYEN COMMUNAUTAIRE",
    desc: "Forger les leaders de demain. Un accent sur le leadership, l'ethique, et l'engagement civique pour batir une jeunesse responsable et devouee au progres de sa communaute.",
    color: {
      topBorder: "border-t-[4px] border-t-ope-primary",
      tagColor: "text-ope-primary",
      btnBg: "bg-ope-primary",
      btnHover: "hover:bg-[#245070]",
      iconBg: "bg-[#e8f3f9]",
      iconColor: "text-ope-primary",
      dotColor: "bg-ope-primary",
    },
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
      </svg>
    ),
    details: {
      objectifs: [
        "Actions civiques d'envergure (reboisement, refection scolaire)",
        "Formation au leadership, a la prise de parole et a la gestion de projet",
        "Sensibilisation au vivre-ensemble et a la cohesion sociale",
      ],
      exemples: [
        "Plantation d'arbres sur le site de Courbouru",
        "Reparation de tables-bancs",
        "Confection et deploiement de poubelles eco-concues",
      ],
      criteres: "Pour les jeunes engages dans la vie citoyenne, leaders associatifs et benevoles actifs.",
    },
  },
];

export default function Categories() {
  const { t } = useTranslation();
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

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
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-ope-border flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${cat.color.iconBg} ${cat.color.iconColor}`}>
                  {cat.icon}
                </div>
                <h3 className="text-lg font-black text-ope-text mb-1 tracking-tight">{cat.title}</h3>
                <p className={`text-[10px] font-extrabold tracking-widest uppercase mb-4 ${cat.color.tagColor}`}>{cat.tag}</p>
                <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed mb-6">{cat.desc}</p>
              </div>
              <button
                onClick={() => setSelectedCat(cat)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white ${cat.color.btnBg} ${cat.color.btnHover} transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm`}
              >
                {t("categories_page.discover_domain")} &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Banniere CTA */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 sm:p-10 border border-ope-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center sm:text-left max-w-xl">
            <h3 className="text-lg sm:text-xl font-black text-ope-text mb-2 tracking-tight">{t("apropos.title")}</h3>
            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">{t("apropos.description")}</p>
          </div>
          <NavLink
            to="/formulaire"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-ope-orange hover:bg-[#d44d1f] shadow-md transition-all duration-200 shrink-0 active:scale-95"
          >
            {t("categories_page.apply_house")}
          </NavLink>
        </div>
      </section>

      {/* Modale details */}
      {selectedCat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setSelectedCat(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-ope-border relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCat(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ope-bg flex items-center justify-center text-ope-text-muted hover:bg-ope-border transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedCat.color.iconBg} ${selectedCat.color.iconColor}`}>
                {selectedCat.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-ope-text leading-tight">{selectedCat.title}</h3>
                <p className={`text-[10px] font-extrabold uppercase tracking-wider ${selectedCat.color.tagColor}`}>{selectedCat.tag}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed mb-5">{selectedCat.desc}</p>

            <div className="mb-4">
              <h4 className="text-xs font-black text-ope-text uppercase tracking-wider mb-2">Objectifs Cles</h4>
              <ul className="space-y-1.5">
                {selectedCat.details.objectifs.map((obj, i) => (
                  <li key={i} className="text-xs text-ope-text-muted flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${selectedCat.color.dotColor}`} />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-black text-ope-text uppercase tracking-wider mb-2">Exemples de Projets</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCat.details.exemples.map((ex, i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-ope-bg text-ope-text border border-ope-border">
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6 p-3 rounded-xl bg-ope-bg border border-ope-border">
              <p className="text-xs text-ope-text">
                <span className="font-black text-ope-orange">Eligibilite : </span>
                {selectedCat.details.criteres}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedCat(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-ope-text-muted hover:bg-ope-bg border border-ope-border transition-colors cursor-pointer"
              >
                {t("talents.close")}
              </button>
              <NavLink
                to="/formulaire"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-ope-orange hover:bg-[#d44d1f] transition-colors"
              >
                {t("categories_page.apply_house")} &rarr;
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
