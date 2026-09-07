import { useTranslation } from "react-i18next";
import souleymaneImg from "../assets/team-souleymane.jpg";
import fatimataImg from "../assets/team-fatimata.jpg";
import ibrahimImg from "../assets/team-ibrahim.jpg";
import aminaImg from "../assets/team-amina.jpg";

// ── Données de l'Équipe Organisatrice ────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    nom: "Souleymane Abdoulaye",
    role: "COORDINATEUR GÉNÉRAL",
    desc: "Passionné par l'innovation technologique au service du développement local, Souleymane coordonne l'ensemble des initiatives OPE.",
    photo: souleymaneImg,
    linkedin: "#",
    email: "mailto:souleymane@ope-agadez.org",
  },
  {
    nom: "Fatimata Seyni",
    role: "RESPONSABLE STEAM",
    desc: "Ingénieure de formation, Fatimata conçoit les programmes éducatifs pour éveiller la passion des sciences et technologies.",
    photo: fatimataImg,
    linkedin: "#",
    email: "mailto:fatimata@ope-agadez.org",
  },
  {
    nom: "Ibrahim K.",
    role: "DIRECTEUR LOGISTIQUE",
    desc: "L'expert de l'organisation sur le terrain. Ibrahim assure que chaque événement se déroule dans des conditions optimales.",
    photo: ibrahimImg,
    linkedin: "#",
    email: "mailto:ibrahim@ope-agadez.org",
  },
  {
    nom: "Amina Bello",
    role: "COMMUNICATION & RP",
    desc: "Amina est la voix de l'OPE. Elle connecte notre mission avec le public à travers des campagnes percutantes.",
    photo: aminaImg,
    linkedin: "#",
    email: "mailto:amina@ope-agadez.org",
  },
];

export default function Membres() {
  const { t } = useTranslation();

  return (
    <div className="pt-14 bg-ope-bg min-h-screen">
      {/* ── Section L'Équipe Organisatrice ───────────────────────── */}
      <section id="membres" className="pt-8 pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* En-tête de la page */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ope-text tracking-tight mb-4">
              {t("membres.title")}
            </h1>
            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed">
              {t("membres.subtitle")}
            </p>
          </div>

          {/* Grille des 4 Membres de l'Équipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.nom}
                className="bg-ope-white rounded-3xl overflow-hidden border border-ope-border shadow-sm flex flex-col justify-between"
              >
                {/* Contenu supérieur de la carte */}
                <div className="p-6 flex flex-col items-center text-center">
                  {/* Photo ronde */}
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-ope-border/60 shadow-inner">
                    <img
                      src={member.photo}
                      alt={member.nom}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Nom */}
                  <h3 className="font-extrabold text-base text-ope-text mb-1 leading-snug">
                    {member.nom}
                  </h3>

                  {/* Badge Rôle */}
                  <span className="inline-block text-[9px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-[#d7f1f7] text-[#1c647b] uppercase mb-4">
                    {member.role}
                  </span>

                  {/* Description */}
                  <p className="text-xs text-ope-text-muted leading-relaxed">
                    {member.desc}
                  </p>
                </div>

                {/* Barre inférieure avec icônes de contact */}
                <div className="bg-[#fceedd] py-3 px-6 flex items-center justify-center gap-6 border-t border-[#f4dfc7]">
                  {/* Icône Lien */}
                  <a
                    href={member.linkedin}
                    className="text-[#967d68] hover:text-ope-orange transition-colors"
                    aria-label={`Lien profil de ${member.nom}`}
                  >
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </a>

                  {/* Icône Email */}
                  <a
                    href={member.email}
                    className="text-[#967d68] hover:text-ope-orange transition-colors"
                    aria-label={`Envoyer un email à ${member.nom}`}
                  >
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
