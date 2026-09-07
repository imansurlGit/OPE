import { useState } from "react";
import { useTranslation } from "react-i18next";
import newsInscriptionsImg from "../assets/apropos-inspire.jpg";
import newsWebinaireImg from "../assets/talent-moussa-ali.jpg";
import newsCriteresImg from "../assets/talent-amina-sani.jpg";
import newsDirectImg from "../assets/agadez_drone.jpeg";
import newsBilanImg from "../assets/talent-ibrahim-diallo.jpg";

export type PhaseType = "avant" | "pendant" | "apres";

interface NewsItem {
  id: string;
  phase: PhaseType;
  badge: {
    label: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
  };
  date: string;
  titre: string;
  resume: string;
  contenu: string;
  image: string;
}

const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    phase: "avant",
    badge: {
      label: "OFFICIEL",
      bg: "bg-[#E6F8FB]",
      text: "text-[#0092B3]",
      icon: (
        <svg
          className="w-3 h-3 text-[#0092B3]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    date: "12 Février 2026",
    titre: "Ouverture officielle des candidatures pour l'édition 2026",
    resume:
      "Les inscriptions pour le programme des 1000 Talents à Agadez sont désormais ouvertes à toute la jeunesse nigérienne.",
    contenu:
      "Le comité de pilotage d'OPE Agadez a officiellement donné le coup d'envoi de la campagne nationale de recrutement. Les jeunes innovateurs, scientifiques et leaders communautaires des huit régions du Niger sont invités à soumettre leur dossier en ligne. Les sélections régionales débuteront dès le mois prochain avec des ateliers d'orientation dans chaque chef-lieu.",
    image: newsInscriptionsImg,
  },
  {
    id: "2",
    phase: "avant",
    badge: {
      label: "ATELIER",
      bg: "bg-[#E6F8FB]",
      text: "text-[#0092B3]",
      icon: (
        <svg
          className="w-3 h-3 text-[#0092B3]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    date: "05 Mars 2026",
    titre: "Webinaire de préparation : Structurer son projet",
    resume:
      "Rejoignez nos mentors experts pour une session en ligne intensive dédiée à la maturation de votre candidature.",
    contenu:
      "Une session interactive de 2 heures animée par les responsables pédagogiques de l'OPE. Au programme : affiner sa proposition de valeur, structurer son modèle économique saharien et préparer une vidéo de présentation percutante. Plus de 350 candidats sont attendus en visioconférence avec session de questions-réponses en direct.",
    image: newsWebinaireImg,
  },
  {
    id: "3",
    phase: "avant",
    badge: {
      label: "RESSOURCES",
      bg: "bg-[#FDF3E7]",
      text: "text-[#C05621]",
      icon: (
        <svg
          className="w-3 h-3 text-[#C05621]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    date: "18 Mars 2026",
    titre: "Nouveaux critères de sélection dévoilés",
    resume:
      "Découvrez en détail les compétences clés et les domaines d'innovation qui seront privilégiés par le jury cette année.",
    contenu:
      "Le jury pluridisciplinaire composé d'ingénieurs, d'universitaires et d'acteurs institutionnels a publié la grille d'évaluation officielle 2026. L'accent est particulièrement mis sur l'adaptation aux enjeux climatiques, l'usage des énergies propres et le renforcement des liens communautaires locaux.",
    image: newsCriteresImg,
  },
  {
    id: "4",
    phase: "avant",
    badge: {
      label: "LOGISTIQUE",
      bg: "bg-[#F0FDF4]",
      text: "text-[#15803D]",
      icon: (
        <svg
          className="w-3 h-3 text-[#15803D]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    date: "25 Mars 2026",
    titre: "Plan de transport et d'hébergement pour les délégations",
    resume:
      "L'organisation met en place des convois sécurisés et des résidences d'accueil pour tous les participants des 8 régions.",
    contenu:
      "Pour garantir la participation équitable de tous les talents retenus, un dispositif logistique complet prendra en charge les navettes régionales, l'hébergement au campus citoyen d'Agadez et la restauration équilibrée durant toute la durée de l'événement.",
    image: newsDirectImg,
  },
  {
    id: "5",
    phase: "pendant",
    badge: {
      label: "EN DIRECT",
      bg: "bg-[#FEE2E2]",
      text: "text-[#DC2626]",
      icon: (
        <svg
          className="w-3 h-3 text-[#DC2626]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      ),
    },
    date: "15 Décembre 2026",
    titre: "Cérémonie d'ouverture : 1000 talents réunis au cœur d'Agadez",
    resume:
      "Revivez les temps forts du lancement officiel en présence des autorités locales et des délégations des 8 régions.",
    contenu:
      "Dans une ambiance festive et solennelle, le Camp National Citoyen a ouvert ses portes devant plus de 2000 spectateurs. Les délégations régionales ont défilé aux couleurs de leurs projets avant le discours inaugural rappelant la mission historique de cette première édition.",
    image: newsDirectImg,
  },
  {
    id: "6",
    phase: "apres",
    badge: {
      label: "BILAN",
      bg: "bg-[#FEF9C3]",
      text: "text-[#A16207]",
      icon: (
        <svg
          className="w-3 h-3 text-[#A16207]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    date: "22 Décembre 2026",
    titre: "Annonce des lauréats et bourses d'incubation",
    resume:
      "Découvrez les 15 projets primés qui bénéficieront d'un financement d'amorçage et d'un accompagnement de 12 mois.",
    contenu:
      "Le jury a récompensé les projets les plus prometteurs des trois catégories. Les lauréats rejoindront l'incubateur OPE Agadez avec un soutien technique, financier et juridique pour accélérer leur déploiement sur le terrain.",
    image: newsBilanImg,
  },
];

export default function Actualites() {
  const { t } = useTranslation();
  const [activePhase, setActivePhase] = useState<PhaseType>("avant");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const handlePhaseChange = (phase: PhaseType) => {
    setActivePhase(phase);
  };

  const currentArticles = NEWS_DATA.filter(
    (item) => item.phase === activePhase,
  );

  return (
    <div className="pt-16 bg-ope-bg min-h-screen">
      {/* ── Section En-Tête ──────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text leading-tight mb-4 tracking-tight">
            {t("actualites.title")}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl mx-auto">
            {t("actualites.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Section Navigation par Phases (Tabs) ──────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Barre d'onglets de phases */}
          <div className="border-b border-[#E8DEC8] mb-8">
            <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handlePhaseChange("avant")}
                className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 cursor-pointer shrink-0 relative ${
                  activePhase === "avant"
                    ? "text-ope-orange"
                    : "text-ope-text-muted hover:text-ope-text"
                }`}
              >
                <span>Avant le camp</span>
                {activePhase === "avant" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-ope-orange rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => handlePhaseChange("pendant")}
                className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 cursor-pointer shrink-0 relative ${
                  activePhase === "pendant"
                    ? "text-ope-orange"
                    : "text-ope-text-muted hover:text-ope-text"
                }`}
              >
                <span>Pendant le camp</span>
                {activePhase === "pendant" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-ope-orange rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => handlePhaseChange("apres")}
                className={`flex items-center gap-2 pb-3.5 text-xs sm:text-sm font-extrabold tracking-tight transition-all duration-200 cursor-pointer shrink-0 relative ${
                  activePhase === "apres"
                    ? "text-ope-orange"
                    : "text-ope-text-muted hover:text-ope-text"
                }`}
              >
                <span>Après le camp</span>
                {activePhase === "apres" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-ope-orange rounded-t-full" />
                )}
              </button>
            </div>
          </div>

          {/* Grille des Articles */}
          {currentArticles.length === 0 ? (
            <div className="text-center py-16 bg-ope-white rounded-3xl border border-ope-border p-8">
              <p className="text-base font-bold text-ope-text mb-1">
                Aucune actualité pour le moment
              </p>
              <p className="text-xs text-ope-text-muted">
                Les publications pour cette phase seront bientôt disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              {currentArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-ope-white rounded-2xl overflow-hidden border border-ope-border shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                      <img
                        src={article.image}
                        alt={article.titre}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-bold text-ope-text-muted block mb-1">
                        {article.date}
                      </span>
                      <h3 className="font-extrabold text-base text-ope-text mb-2 line-clamp-2">
                        {article.titre}
                      </h3>
                      <p className="text-xs text-ope-text-muted leading-relaxed line-clamp-3">
                        {article.resume}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="text-xs font-bold text-ope-orange hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {t("actualites.read_more")}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal Détails Article */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ope-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-ope-border animate-fadeIn relative p-6 sm:p-8">
            <button
              onClick={() => setSelectedArticle(null)}
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
            <div className="mb-4">
              <span className="text-xs font-bold text-ope-text-muted">
                {selectedArticle.date}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ope-text mt-1">
                {selectedArticle.titre}
              </h2>
            </div>
            <img
              src={selectedArticle.image}
              alt={selectedArticle.titre}
              className="w-full rounded-2xl mb-6 max-h-72 object-cover"
            />
            <p className="text-sm text-ope-text leading-relaxed whitespace-pre-line mb-6">
              {selectedArticle.contenu}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-ope-primary hover:opacity-90 transition-opacity cursor-pointer"
              >
                {t("talents.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
