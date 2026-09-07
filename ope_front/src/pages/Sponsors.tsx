import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import mosqueeImg from "../assets/Mosquée d'Agadez.png";
import agadezDrone from "../assets/agadez_drone.jpeg";

interface Partner {
  id: string;
  nom: string;
  role: string;
  tier: "or" | "argent" | "bronze";
  logoText?: string;
  logoColor?: string;
  image?: string;
}

const PARTENAIRES_OR: Partner[] = [
  {
    id: "or-1",
    nom: "Sahel Technologies",
    role: "Fournisseur d'Infrastructures",
    tier: "or",
    logoText: "SAHEL TECH",
    logoColor: "from-blue-600 to-cyan-500",
  },
  {
    id: "or-2",
    nom: "Fondation Excellence",
    role: "Bourses & Mentoring",
    tier: "or",
    image: mosqueeImg,
  },
  {
    id: "or-3",
    nom: "Agadez Innovation Hub",
    role: "Partenaire Écosystème",
    tier: "or",
    image: agadezDrone,
  },
];

const PARTENAIRES_ARGENT: Partner[] = [
  {
    id: "arg-1",
    nom: "Niger Telecom",
    role: "Connectivité",
    tier: "argent",
    logoText: "NT",
    logoColor: "from-amber-600 to-orange-500",
  },
  {
    id: "arg-2",
    nom: "Solar Sahel",
    role: "Énergie Verte",
    tier: "argent",
    logoText: "SOLAR+",
    logoColor: "from-yellow-500 to-amber-600",
  },
  {
    id: "arg-3",
    nom: "Banque Régionale",
    role: "Finance Inclusive",
    tier: "argent",
    logoText: "BRN",
    logoColor: "from-emerald-600 to-teal-500",
  },
  {
    id: "arg-4",
    nom: "Alliance Agro",
    role: "Développement Rural",
    tier: "argent",
    logoText: "AGRO",
    logoColor: "from-green-600 to-lime-500",
  },
];

const PARTENAIRES_BRONZE: Partner[] = [
  {
    id: "br-1",
    nom: "Mairie d'Agadez",
    role: "Institution",
    tier: "bronze",
    logoText: "VILLE",
    logoColor: "from-orange-500 to-amber-500",
  },
  {
    id: "br-2",
    nom: "Chambre de Commerce",
    role: "Économie",
    tier: "bronze",
    logoText: "CCI",
    logoColor: "from-cyan-600 to-blue-500",
  },
  {
    id: "br-3",
    nom: "Université d'Agadez",
    role: "Recherche",
    tier: "bronze",
    logoText: "UA",
    logoColor: "from-indigo-600 to-purple-500",
  },
  {
    id: "br-4",
    nom: "FabLab Sahel",
    role: "Prototypage",
    tier: "bronze",
    logoText: "FAB",
    logoColor: "from-rose-500 to-red-500",
  },
  {
    id: "br-5",
    nom: "Jeunesse Saharienne",
    role: "Jeunesse",
    tier: "bronze",
    logoText: "JS",
    logoColor: "from-amber-600 to-yellow-500",
  },
  {
    id: "br-6",
    nom: "Tech Hub Niamey",
    role: "Incubateur",
    tier: "bronze",
    logoText: "THN",
    logoColor: "from-teal-600 to-cyan-500",
  },
];

export default function Sponsors() {
  const { t } = useTranslation();

  return (
    <div className="pt-20 sm:pt-24 bg-ope-bg min-h-screen">
      {/* ── Section En-Tête ──────────────────────────────────────── */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Titre Principal */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-3 sm:mb-4 tracking-tight">
            {t("sponsors_page.title")}
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8">
            {t("sponsors_page.subtitle")}
          </p>

          {/* Bloc Statistiques Chiffrées (Parfaitement responsive sur mobile) */}
          <div className="flex items-center justify-around gap-2 sm:gap-10 w-full max-w-sm sm:max-w-md mx-auto bg-ope-white px-4 sm:px-8 py-3.5 sm:py-5 rounded-2xl border border-ope-border shadow-xs">
            <div className="text-center flex-1">
              <p className="text-xl sm:text-3xl font-extrabold text-ope-primary tracking-tight">
                12+
              </p>
              <p className="text-[9.5px] sm:text-[11px] font-bold text-ope-text-muted uppercase tracking-wider mt-0.5">
                Entreprises
              </p>
            </div>
            <div className="h-7 w-px bg-ope-border" />
            <div className="text-center flex-1">
              <p className="text-xl sm:text-3xl font-extrabold text-ope-primary tracking-tight">
                3
              </p>
              <p className="text-[9.5px] sm:text-[11px] font-bold text-ope-text-muted uppercase tracking-wider mt-0.5">
                Institutions
              </p>
            </div>
            <div className="h-7 w-px bg-ope-border" />
            <div className="text-center flex-1">
              <p className="text-xl sm:text-3xl font-extrabold text-ope-primary tracking-tight">
                5M
              </p>
              <p className="text-[9.5px] sm:text-[11px] font-bold text-ope-text-muted uppercase tracking-wider mt-0.5">
                Impact FCFA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section Grille des Partenaires ───────────────────────── */}
      <section className="py-4 pb-16 sm:pb-20 px-3 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          {/* ── TIER 1 : Partenaires Or ── */}
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-6 text-xs sm:text-sm font-extrabold text-[#D97706] uppercase tracking-wider">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{t("sponsors_page.tier_gold")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {PARTENAIRES_OR.map((p) => (
                <div
                  key={p.id}
                  className="bg-ope-white rounded-2xl p-6 border-2 border-[#FDE68A] shadow-xs flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:border-[#F59E0B]"
                >
                  {p.image ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 border border-ope-border shadow-inner">
                      <img
                        src={p.image}
                        alt={p.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.logoColor} flex items-center justify-center text-white font-extrabold text-xs shadow-inner mb-4 tracking-tighter`}
                    >
                      {p.logoText}
                    </div>
                  )}
                  <h3 className="font-extrabold text-base text-ope-text mb-1">
                    {p.nom}
                  </h3>
                  <span className="text-xs font-semibold text-ope-text-muted">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── TIER 2 : Partenaires Argent ── */}
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-6 text-xs sm:text-sm font-extrabold text-[#64748B] uppercase tracking-wider">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{t("sponsors_page.tier_silver")}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {PARTENAIRES_ARGENT.map((p) => (
                <div
                  key={p.id}
                  className="bg-ope-white rounded-2xl p-5 border border-ope-border shadow-2xs flex flex-col items-center text-center transition-all duration-300 hover:shadow-xs hover:border-[#CBD5E1]"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.logoColor} flex items-center justify-center text-white font-extrabold text-xs shadow-2xs mb-3`}
                  >
                    {p.logoText}
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-ope-text mb-0.5 leading-snug">
                    {p.nom}
                  </h3>
                  <span className="text-[10px] sm:text-xs font-medium text-ope-text-muted">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── TIER 3 : Partenaires Bronze & Soutiens ── */}
          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-6 text-xs sm:text-sm font-extrabold text-[#9A3412] uppercase tracking-wider">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#B45309]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{t("sponsors_page.tier_bronze")}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-4">
              {PARTENAIRES_BRONZE.map((p) => (
                <div
                  key={p.id}
                  className="bg-ope-white rounded-xl p-3.5 border border-ope-border shadow-2xs flex flex-col items-center text-center transition-all duration-300 hover:bg-[#FAF5EE]"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.logoColor} flex items-center justify-center text-white font-extrabold text-[10px] shadow-2xs mb-2`}
                  >
                    {p.logoText}
                  </div>
                  <h4 className="font-bold text-[11px] sm:text-xs text-ope-text leading-tight mb-0.5">
                    {p.nom}
                  </h4>
                  <span className="text-[9px] sm:text-[10px] text-ope-text-muted">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bannière CTA Terracotta Incurvée ── */}
      <section className="relative bg-[#C25E38] text-white pt-14 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 text-center overflow-hidden">
        {/* Forme incurvée supérieure (Wave shape) */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            className="relative block w-full h-7 sm:h-12 text-ope-bg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,0 L1200,0 L0,0 Z"></path>
          </svg>
        </div>

        <div className="max-w-xl mx-auto relative z-20 pt-2 sm:pt-4">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-3 sm:mb-4 tracking-tight">
            {t("sponsors_page.become_sponsor")}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed mx-auto mb-6 sm:mb-8 font-normal max-w-lg">
            {t("sponsors_page.sponsor_cta_desc")}
          </p>

          <NavLink
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-[#C25E38] bg-white hover:bg-slate-50 active:scale-95 shadow-md transition-all cursor-pointer"
          >
            <span>{t("nav.contact")}</span>
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
                d="M12 19l9-7-9-7-9 7 9 7z"
              />
            </svg>
          </NavLink>
        </div>
      </section>
    </div>
  );
}
