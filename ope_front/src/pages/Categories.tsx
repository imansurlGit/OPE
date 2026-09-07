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
    btnBorder: string;
    btnText: string;
    iconBg: string;
    iconColor: string;
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
    desc: "Propulser l'innovation technologique et scientifique. Nous formons les jeunes aux compétences numériques, à l'ingénierie créative et aux sciences pour résoudre les défis complexes de demain.",
    color: {
      topBorder: "border-t-[5px] border-t-[#00B0D7]",
      tagColor: "text-[#0092B3]",
      btnBorder: "border-[#00B0D7]",
      btnText: "text-[#0092B3] hover:bg-[#00B0D7]/10",
      iconBg: "bg-[#00B0D7]",
      iconColor: "text-white",
    },
    icon: (
      /* Flacon / Bécher Sciences */
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M19 19L14 10.5V5H15C15.55 5 16 4.55 16 4C16 3.45 15.55 3 15 3H9C8.45 3 8 3.45 8 4C8 4.55 8.45 5 9 5H10V10.5L5 19C4.19 20.37 5.18 22 6.78 22H17.22C18.82 22 19.81 20.37 19 19ZM7.84 18L11.16 12.35C11.53 11.72 12.19 11.33 12.92 11.33C13.65 11.33 14.31 11.72 14.68 12.35L18 18H7.84Z" />
      </svg>
    ),
    details: {
      objectifs: [
        "Formation avancée en robotique et intelligence artificielle",
        "Développement d'applications web & mobiles orientées impact local",
        "Conception 3D, prototypage électronique et mathématiques appliquées",
      ],
      exemples: [
        "Systèmes d'irrigation connectés",
        "Solutions solaires intelligentes",
        "Drones de cartographie agricole",
      ],
      criteres:
        "Ouvert aux passionnés de tech, étudiants et créateurs ayant un prototype ou une idée innovante.",
    },
  },
  {
    id: "lp",
    title: "Projet Local (LP)",
    tag: "AGRICULTURE, ÉLEVAGE, ARTISANAT",
    desc: "Valoriser le patrimoine et les ressources du Sahel. Ce pilier soutient les initiatives locales visant à moderniser les pratiques traditionnelles pour un développement économique durable.",
    color: {
      topBorder: "border-t-[5px] border-t-[#BD5338]",
      tagColor: "text-[#BD5338]",
      btnBorder: "border-[#BD5338]",
      btnText: "text-[#BD5338] hover:bg-[#BD5338]/10",
      iconBg: "bg-[#FDE9E2]",
      iconColor: "text-[#BD5338]",
    },
    icon: (
      /* Tracteur / Agriculture */
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M19 14C17.34 14 16 15.34 16 17C16 18.66 17.34 20 19 20C20.66 20 22 18.66 22 17C22 15.34 20.66 14 19 14ZM19 18.5C18.17 18.5 17.5 17.83 17.5 17C17.5 16.17 18.17 15.5 19 15.5C19.83 15.5 20.5 16.17 20.5 17C20.5 17.83 19.83 18.5 19 18.5ZM7.5 14C5.57 14 4 15.57 4 17.5C4 19.43 5.57 21 7.5 21C9.43 21 11 19.43 11 17.5C11 15.57 9.43 14 7.5 14ZM7.5 19.5C6.4 19.5 5.5 18.6 5.5 17.5C5.5 16.4 6.4 15.5 7.5 15.5C8.6 15.5 9.5 16.4 9.5 17.5C9.5 18.6 8.6 19.5 7.5 19.5ZM16.5 12H15V8H11V10H9V6H17.34L19.58 9.58C19.85 10 20 10.5 20 11V12.33C19.68 12.12 19.35 12 19 12H16.5ZM4.34 12H1.5C1.22 12 1 11.78 1 11.5C1 11.22 1.22 11 1.5 11H3.66L4.76 7.69C4.9 7.27 5.29 7 5.73 7H9V9H6.13L5.13 12H4.34Z" />
      </svg>
    ),
    details: {
      objectifs: [
        "Modernisation des techniques agro-pastorales adaptées au climat aride",
        "Transformation locale et valorisation des produits du terroir",
        "Préservation et rayonnement de l'artisanat d'art d'Agadez",
      ],
      exemples: [
        "Cultures maraîchères sous serre solaire",
        "Transformation du cuir & bijouterie touarègue",
        "Alimentation bétail éco-responsable",
      ],
      criteres:
        "Destiné aux porteurs de projets à fort ancrage local, coopératives et artisans innovants.",
    },
  },
  {
    id: "mc2",
    title: "M.C.C.",
    tag: "MODÈLE DE CITOYEN COMMUNAUTAIRE",
    desc: "Forger les leaders de demain. Un accent sur le leadership, l'éthique, et l'engagement civique pour bâtir une jeunesse responsable et dévouée au progrès de sa communauté.",
    color: {
      topBorder: "border-t-[5px] border-t-[#8C4A27]",
      tagColor: "text-[#8C4A27]",
      btnBorder: "border-[#8C4A27]",
      btnText: "text-[#8C4A27] hover:bg-[#8C4A27]/10",
      iconBg: "bg-[#F7ECE4]",
      iconColor: "text-[#8C4A27]",
    },
    icon: (
      /* Groupe / Communauté */
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
      </svg>
    ),
    details: {
      objectifs: [
        "Actions civiques d'envergure (reboisement, réfection scolaire)",
        "Formation au leadership, à la prise de parole et à la gestion de projet",
        "Sensibilisation au vivre-ensemble et à la cohésion sociale",
      ],
      exemples: [
        "Plantation d'arbres sur le site de Courbouru",
        "Réparation de tables-bancs",
        "Confection et déploiement de poubelles éco-conçues",
      ],
      criteres:
        "Pour les jeunes engagés dans la vie citoyenne, leaders associatifs et bénévoles actifs.",
    },
  },
];

export default function Categories() {
  const { t } = useTranslation();
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);

  return (
    <div className="pt-16 bg-ope-bg min-h-screen">
      {/* ── Section En-Tête / Présentation ───────────────────────── */}
      <section className="py-8 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Titre Principal */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-4 tracking-tight">
            {t("categories_page.title")}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
            {t("categories_page.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Grille des 3 Cartes Catégories ────────────────────────── */}
      <section className="py-6 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`bg-ope-white rounded-2xl p-7 shadow-sm border border-ope-border ${cat.color.topBorder} flex flex-col justify-between transition-all duration-300 hover:shadow-md`}
            >
              <div>
                {/* Icône Encadrée */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${cat.color.iconBg} ${cat.color.iconColor}`}
                >
                  {cat.icon}
                </div>

                {/* Titre Catégorie */}
                <h3 className="text-xl font-extrabold text-ope-text mb-1 tracking-tight">
                  {cat.title}
                </h3>

                {/* Tagline / Sous-titre */}
                <p
                  className={`text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase mb-4 ${cat.color.tagColor}`}
                >
                  {cat.tag}
                </p>

                {/* Description */}
                <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed mb-6">
                  {cat.desc}
                </p>
              </div>

              {/* Bouton En savoir plus */}
              <button
                onClick={() => setSelectedCat(cat)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border ${cat.color.btnBorder} ${cat.color.btnText} transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95`}
              >
                {t("categories_page.discover_domain")} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bannière CTA en bas ──────────────────────────────────── */}
      <section className="pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-[#F5EADB] rounded-3xl p-8 sm:p-10 border border-[#ebd8c1] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="text-center sm:text-left max-w-xl">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#BD5338] mb-2 tracking-tight">
              {t("apropos.title")}
            </h3>
            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
              {t("apropos.description")}
            </p>
          </div>

          <NavLink
            to="/participer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#BD5338] hover:bg-[#a5442c] shadow-md transition-all duration-200 shrink-0 active:scale-95"
          >
            {t("categories_page.apply_house")}
          </NavLink>
        </div>
      </section>

      {/* ── Modal Détails "En Savoir Plus" ───────────────────────── */}
      {selectedCat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ope-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-ope-border animate-fadeIn relative">
            {/* Bouton Fermer */}
            <button
              onClick={() => setSelectedCat(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ope-bg flex items-center justify-center text-ope-text hover:bg-ope-border transition-colors cursor-pointer"
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

            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCat.color.iconBg} ${selectedCat.color.iconColor}`}
              >
                {selectedCat.icon}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-ope-text">
                  {selectedCat.title}
                </h3>
                <p
                  className={`text-[10px] font-extrabold uppercase ${selectedCat.color.tagColor}`}
                >
                  {selectedCat.tag}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed mb-5">
              {selectedCat.desc}
            </p>

            {/* Objectifs clés */}
            <div className="mb-4">
              <h4 className="text-xs font-extrabold text-ope-text uppercase tracking-wider mb-2">
                Objectifs Clés :
              </h4>
              <ul className="space-y-1.5">
                {selectedCat.details.objectifs.map((obj, i) => (
                  <li
                    key={i}
                    className="text-xs text-ope-text-muted flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-ope-orange shrink-0 mt-1.5" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Exemples de projets */}
            <div className="mb-4">
              <h4 className="text-xs font-extrabold text-ope-text uppercase tracking-wider mb-2">
                Exemples de Projets :
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedCat.details.exemples.map((ex, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-ope-bg text-ope-text border border-ope-border"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            {/* Critères d'éligibilité */}
            <div className="mb-6 p-3 rounded-xl bg-[#FAF5EE] border border-[#E5DCD0]">
              <p className="text-xs text-ope-text font-medium">
                <span className="font-bold text-[#BD5338]">Éligibilité : </span>
                {selectedCat.details.criteres}
              </p>
            </div>

            {/* Actions Modal */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedCat(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-ope-text-muted hover:bg-ope-bg transition-colors cursor-pointer"
              >
                {t("talents.close")}
              </button>
              <NavLink
                to="/participer"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#BD5338] hover:bg-[#a5442c] transition-colors"
              >
                {t("categories_page.apply_house")} →
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
