import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import fatimataOumarouImg from "../assets/talent-fatimata-oumarou.jpg";
import ibrahimDialloImg from "../assets/talent-ibrahim-diallo.jpg";
import aminaSaniImg from "../assets/talent-amina-sani.jpg";
import moussaAliImg from "../assets/talent-moussa-ali.jpg";
import zaraMamaneImg from "../assets/talent-zara-mamane.jpg";
import kaderIssoufouImg from "../assets/talent-kader-issoufou.jpg";
import halimaAbdouImg from "../assets/talent-halima-abdou.jpg";
import ousmaneSeydouImg from "../assets/talent-ousmane-seydou.jpg";

interface Talent {
  id: string;
  nom: string;
  region: string;
  categorie: "STEAM" | "LP" | "MCC";
  description: string;
  descriptionComplete: string;
  photo: string;
  tags?: string[];
}

const TALENTS_DATA: Talent[] = [
  {
    id: "1",
    nom: "Fatimata Oumarou",
    region: "Agadez",
    categorie: "STEAM",
    description:
      "Développement d'un système d'irrigation automatisé alimenté par énergie solaire pour les oasis.",
    descriptionComplete:
      "Ingénieure en mécatronique originaire d'Agadez, Fatimata a mis au point des capteurs d'humidité et des vannes autonomes alimentées par énergie solaire pour optimiser l'irrigation des cultures maraîchères dans le désert.",
    photo: fatimataOumarouImg,
    tags: ["Robotique", "IoT", "Énergie Solaire"],
  },
  {
    id: "2",
    nom: "Ibrahim Diallo",
    region: "Niamey",
    categorie: "LP",
    description:
      "Initiative de mentorat civique pour la jeunesse urbaine et renforcement des compétences locales.",
    descriptionComplete:
      "Diplômé en sciences politiques et dynamique entrepreneur social, Ibrahim a lancé une académie itinérante pour former les jeunes aux métiers d'avenir et encourager l'entrepreneuriat local dans les quartiers défavorisés.",
    photo: ibrahimDialloImg,
    tags: ["Leadership", "Agri-tech", "Incubation"],
  },
  {
    id: "3",
    nom: "Amina Sani",
    region: "Zinder",
    categorie: "MCC",
    description:
      "Création d'une plateforme de narration numérique valorisant le patrimoine et l'artisanat saharien.",
    descriptionComplete:
      "Designer et illustratrice engagée, Amina utilise les technologies créatives pour numériser et raconter les contes, motifs architecturaux et légendes traditionnelles de la région de Zinder auprès de la diaspora et du monde.",
    photo: aminaSaniImg,
    tags: ["Culture", "Design 3D", "Éducation"],
  },
  {
    id: "4",
    nom: "Moussa Ali",
    region: "Maradi",
    categorie: "STEAM",
    description:
      "Application mobile d'optimisation logistique pour les agriculteurs locaux et coopératives céréalières.",
    descriptionComplete:
      "Développeur full-stack passionné, Moussa a conçu une solution légère fonctionnant hors-ligne permettant aux producteurs de Maradi d'échanger en direct avec les marchés régionaux et d'éviter les intermédiaires coûteux.",
    photo: moussaAliImg,
    tags: ["Mobile", "Agronomie", "Fintech"],
  },
  {
    id: "5",
    nom: "Zara Mamane",
    region: "Tahoua",
    categorie: "LP",
    description:
      "Réseau d'incubation pour les femmes entrepreneures dans le secteur agro-pastoral et transformation.",
    descriptionComplete:
      "Spécialiste de la transformation agro-alimentaire, Zara accompagne plus de 80 femmes rurales à Tahoua dans la valorisation du lait de chamelle et de l'oignon violet avec des procédés hygiéniques innovants.",
    photo: zaraMamaneImg,
    tags: ["Agro-alimentaire", "Autonomie", "Coopératives"],
  },
  {
    id: "6",
    nom: "Kader Issoufou",
    region: "Dosso",
    categorie: "STEAM",
    description:
      "Drone low-cost de surveillance environnementale et reboisement assisté pour les zones sahéliennes.",
    descriptionComplete:
      "Passionné d'aéromodélisme et d'IA embarquée, Kader fabrique des drones à partir de matériaux recyclés capables de cartographier la dégradation des sols et de disséminer des semences d'acacias.",
    photo: kaderIssoufouImg,
    tags: ["Drones", "Environnement", "IA"],
  },
  {
    id: "7",
    nom: "Halima Abdou",
    region: "Diffa",
    categorie: "LP",
    description:
      "Système de purification d'eau décentralisé par filtration naturelle et énergie solaire.",
    descriptionComplete:
      "Jeune chimiste engagée, Halima a développé des filtres à base de sable du désert et de charbon actif local pour fournir de l'eau potable aux campements et villages isolés du bassin du lac Tchad.",
    photo: halimaAbdouImg,
    tags: ["Santé Publique", "Eau", "Impact Social"],
  },
  {
    id: "8",
    nom: "Ousmane Seydou",
    region: "Tillabéri",
    categorie: "MCC",
    description:
      "Plateforme participative de signalement citoyen et cartographie des besoins communautaires.",
    descriptionComplete:
      "Militant associatif et développeur web, Ousmane a créé un outil open-source permettant aux comités de village d'exprimer leurs priorités en matière d'infrastructures et d'alerte précoce.",
    photo: ousmaneSeydouImg,
    tags: ["Civic Tech", "Gouvernance", "Open Data"],
  },
];

const REGIONS = [
  "Toutes les régions",
  "Agadez",
  "Niamey",
  "Zinder",
  "Maradi",
  "Tahoua",
  "Dosso",
  "Diffa",
  "Tillabéri",
];
const CATEGORIES = ["Toutes les catégories", "STEAM", "LP", "MCC"];

const BADGE_STYLES: Record<
  "STEAM" | "LP" | "MCC",
  { label: string; bg: string }
> = {
  STEAM: { label: "STEAM", bg: "bg-[#0092B3] text-white" },
  LP: { label: "LP", bg: "bg-[#BD5338] text-white" },
  MCC: { label: "MCC", bg: "bg-[#8C4A27] text-white" },
};

export default function Talents() {
  const { t } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState("Toutes les régions");
  const [selectedCategory, setSelectedCategory] = useState(
    "Toutes les catégories",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [displayCount, setDisplayCount] = useState(8);

  // Filtrage dynamique
  const filteredTalents = useMemo(() => {
    return TALENTS_DATA.filter((talent) => {
      const matchesRegion =
        selectedRegion === "Toutes les régions" ||
        talent.region === selectedRegion;
      const matchesCategory =
        selectedCategory === "Toutes les catégories" ||
        talent.categorie === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        talent.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRegion && matchesCategory && matchesSearch;
    });
  }, [selectedRegion, selectedCategory, searchQuery]);

  const visibleTalents = filteredTalents.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 4);
  };

  return (
    <div className="pt-16 bg-ope-bg min-h-screen">
      {/* ── Section En-Tête ──────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-4 tracking-tight">
            {t("talents.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
            {t("talents.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Barre de Filtres & Recherche ─────────────────────────── */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Sélecteurs de Filtres */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Filtre Régions */}
            <div className="relative w-full sm:w-56">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-ope-primary cursor-pointer pr-10 shadow-2xs"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <svg
                className="w-4 h-4 text-ope-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Filtre Catégories */}
            <div className="relative w-full sm:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-ope-primary cursor-pointer pr-10 shadow-2xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "Toutes les catégories"
                      ? t("talents.all_domains")
                      : c}
                  </option>
                ))}
              </select>
              <svg
                className="w-4 h-4 text-ope-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Champ de Recherche */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("talents.search_placeholder")}
              className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm font-medium rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-ope-primary shadow-2xs placeholder:text-ope-text-muted"
            />
            <svg
              className="w-4 h-4 text-ope-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Grille des Talents ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {visibleTalents.length === 0 ? (
            <div className="text-center py-16 bg-ope-white rounded-3xl border border-ope-border">
              <p className="text-sm font-semibold text-ope-text-muted">
                {t("talents.no_results")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleTalents.map((talent) => {
                const badge = BADGE_STYLES[talent.categorie];
                return (
                  <div
                    key={talent.id}
                    onClick={() => setSelectedTalent(talent)}
                    className="bg-ope-white rounded-2xl overflow-hidden border border-ope-border shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Photo avec badge catégorie */}
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                        <img
                          src={talent.photo}
                          alt={talent.nom}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Badge Catégorie */}
                        <span
                          className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Informations */}
                      <div className="p-5">
                        <h3 className="font-extrabold text-base text-ope-text mb-1 tracking-tight group-hover:text-ope-orange transition-colors">
                          {talent.nom}
                        </h3>

                        {/* Région avec Pin */}
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-ope-text-muted mb-3">
                          <svg
                            className="w-3.5 h-3.5 text-ope-orange shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{talent.region}</span>
                        </div>

                        {/* Description courte */}
                        <p className="text-xs text-ope-text-muted leading-relaxed line-clamp-3">
                          {talent.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bouton Charger Plus */}
          {displayCount < filteredTalents.length && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-ope-primary border-2 border-ope-primary hover:bg-ope-primary/10 transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs"
              >
                <span>{t("talents.view_profile")}</span>
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Modal Détails du Talent ──────────────────────────────── */}
      {selectedTalent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ope-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-ope-border animate-fadeIn relative">
            {/* Bouton Fermer */}
            <button
              onClick={() => setSelectedTalent(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
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

            <div className="relative aspect-16/9 w-full">
              <img
                src={selectedTalent.photo}
                alt={selectedTalent.nom}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute bottom-3 left-4 text-xs font-extrabold uppercase px-3 py-1 rounded-full ${BADGE_STYLES[selectedTalent.categorie].bg}`}
              >
                {BADGE_STYLES[selectedTalent.categorie].label}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-extrabold text-ope-text mb-1">
                {selectedTalent.nom}
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ope-text-muted mb-4">
                <svg
                  className="w-4 h-4 text-ope-orange"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Région de {selectedTalent.region}</span>
              </div>

              <p className="text-xs sm:text-sm text-ope-text leading-relaxed mb-5">
                {selectedTalent.descriptionComplete}
              </p>

              {selectedTalent.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedTalent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-ope-bg text-ope-text border border-ope-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedTalent(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ope-primary hover:opacity-90 transition-opacity"
                >
                  {t("talents.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
