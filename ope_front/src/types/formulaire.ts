export type CategorieType = "junior" | "senior" | "";

export type MaisonType = "steam" | "local_project" | "mouvement_citoyen" | "";

export type ClasseJunior = "6e" | "5e" | "4e" | "3e" | "";

export type DomaineSteam = string;

export type StadeDeveloppement =
  | "prototype"
  | "commercialise"
  | "en_test"
  | "";

export interface UploadedFileInfo {
  name: string;
  size: string;
  previewUrl?: string;
}

export interface JuniorData {
  categorie: "junior";
  // Étape 1 : Identité du candidat
  nom: string;
  prenom: string;
  sexe: "M" | "F" | "";
  regionVille: string; // Région / Zone de pré-camp
  villeVillage: string;
  nationalite: string;
  etablissement: string;
  classe: string;
  telephoneCandidat: string;
  email: string;
  telephoneTuteur: string;
  nomPointFocal: string;
  biographie: string;

  // Étape 2 : House visée & Parcours / Projet
  houseVisee: string;
  houseViseeAutre: string;
  situation: string; // Ex: 'projet_realise' | 'idee_projet' | 'vocation_claire'
  descriptionProjet: string;
  filiereVisee: string;
  moyenneScolaire: string;
  contactRecommandation: string; // Enseignant, chef de village, etc.
  engagementType: "ponctuel" | "regulier" | "";

  // Étape 3 : Motivation, Aptitude numérique & Pièces à joindre
  motivation: string;
  accesNumerique: "personnel" | "aide_tiers" | "sur_place" | "";
  photoIdentite: UploadedFileInfo | null;
  pieceIdentite: UploadedFileInfo | null;
  bulletinsScolaires: UploadedFileInfo | null;
  autorisationParentale: UploadedFileInfo | null;
  preuveProjet: UploadedFileInfo | null;
  lettreRecommandation: UploadedFileInfo | null;

  // Signatures & Engagements
  nomTuteur: string;
  signatureCandidat: boolean;
  signatureParent: boolean;
  disponibleCamps: boolean;
  accepteConditions: boolean;
}

export interface SeniorData {
  categorie: "senior";
  // Étape 1 : Identité du candidat
  nom: string;
  prenom: string;
  sexe: "M" | "F" | "";
  regionVille: string;
  telephone: string;
  email: string;
  pieceIdentite: UploadedFileInfo | null;
  photoIdentite: UploadedFileInfo | null;

  // Étape 2 : Votre innovation
  domaineSteam: DomaineSteam;
  domaineSteamAutre: string;
  innovationNom: string;
  innovationDescription: string;
  stadeDeveloppement: StadeDeveloppement;
  preuvesRealisation: UploadedFileInfo | null;
  lienPortfolio: string;

  // Étape 3 : Modalités de participation
  participeDefile: boolean;
  oeuvreDefile: string;
  facilitateurJuniors: boolean;
  souhaiteStand: boolean;
  concoursPrixInnovation: boolean;
  disponibleCamps: boolean;
  accepteConditions: boolean;
}

export type CandidatureFormData = JuniorData | SeniorData;

export type JuniorErrors = Partial<Record<keyof JuniorData, string>>;
export type SeniorErrors = Partial<Record<keyof SeniorData, string>>;

export interface FormStepConfig {
  key: string;
  label: string;
  shortLabel: string;
}

export const JUNIOR_STEPS: FormStepConfig[] = [
  { key: "identite", label: "Identité du candidat", shortLabel: "Identité" },
  { key: "house_projet", label: "House visée & Projet", shortLabel: "Projet" },
  { key: "motivation_pieces", label: "Motivation & Justificatifs", shortLabel: "Finalisation" },
];

export const SENIOR_STEPS: FormStepConfig[] = [
  { key: "identite", label: "Identité du candidat", shortLabel: "Identité" },
  { key: "innovation", label: "Votre projet / innovation", shortLabel: "Projet" },
  { key: "modalites", label: "Modalités de participation", shortLabel: "Modalités" },
];

export const INITIAL_JUNIOR_DATA: JuniorData = {
  categorie: "junior",
  nom: "",
  prenom: "",
  sexe: "",
  regionVille: "",
  villeVillage: "",
  nationalite: "Nigérienne",
  etablissement: "",
  classe: "",
  telephoneCandidat: "",
  email: "",
  telephoneTuteur: "",
  nomPointFocal: "",
  biographie: "",

  houseVisee: "",
  houseViseeAutre: "",
  situation: "",
  descriptionProjet: "",
  filiereVisee: "",
  moyenneScolaire: "",
  contactRecommandation: "",
  engagementType: "",

  motivation: "",
  accesNumerique: "personnel",
  photoIdentite: null,
  pieceIdentite: null,
  bulletinsScolaires: null,
  autorisationParentale: null,
  preuveProjet: null,
  lettreRecommandation: null,

  nomTuteur: "",
  signatureCandidat: false,
  signatureParent: false,
  disponibleCamps: false,
  accepteConditions: false,
};

export const INITIAL_SENIOR_DATA: SeniorData = {
  categorie: "senior",
  nom: "",
  prenom: "",
  sexe: "",
  regionVille: "",
  telephone: "",
  email: "",
  pieceIdentite: null,
  photoIdentite: null,
  domaineSteam: "",
  domaineSteamAutre: "",
  innovationNom: "",
  innovationDescription: "",
  stadeDeveloppement: "",
  preuvesRealisation: null,
  lienPortfolio: "",
  participeDefile: false,
  oeuvreDefile: "",
  facilitateurJuniors: false,
  souhaiteStand: false,
  concoursPrixInnovation: false,
  disponibleCamps: false,
  accepteConditions: false,
};

export const REGIONS_NIGER = [
  "Agadez",
  "Diffa",
  "Dosso",
  "Maradi",
  "Niamey",
  "Tahoua",
  "Tillabéri",
  "Zinder",
  "Diaspora / Autre",
];

export const REGIONS_NIGER_OPTIONS: { value: string; label: string }[] = REGIONS_NIGER.map((r) => ({
  value: r,
  label: r,
}));

export const MAISON_OPTIONS: { value: MaisonType; label: string; subtitle: string; icon: "steam" | "local" | "citoyen" }[] = [
  {
    value: "steam",
    label: "STEAM",
    subtitle: "Sciences, Technologies, Ingénierie, Arts et Mathématiques",
    icon: "steam",
  },
  {
    value: "local_project",
    label: "Local Project",
    subtitle: "Agriculture, Élevage, Artisanat et Développement local",
    icon: "local",
  },
  {
    value: "mouvement_citoyen",
    label: "Modèle Citoyen Communautaire ou MC2",
    subtitle: "Engagement citoyen, inclusion sociale et actions communautaires.",
    icon: "citoyen",
  },
];

export const CLASSES_JUNIOR_OPTIONS: { value: ClasseJunior; label: string }[] = [
  { value: "6e", label: "6ème" },
  { value: "5e", label: "5ème" },
  { value: "4e", label: "4ème" },
  { value: "3e", label: "3ème" },
];

export const CLASSES_BY_MAISON: Record<string, { value: string; label: string }[]> = {
  steam: [
    { value: "robotique", label: "Robotique" },
    { value: "ia", label: "Intelligence artificielle" },
    {
      value: "aeronautique",
      label: "Aéronautique (simulateur de vol, montage de drones, observation de l'espace)",
    },
    { value: "energies_renouvelables", label: "Énergies renouvelables" },
    { value: "biotechnologie", label: "Biotechnologie" },
    { value: "art", label: "Art" },
    { value: "maths_logique", label: "Mathématiques et Logique" },
    { value: "autre", label: "Autre" },
  ],
  local_project: [
    { value: "agriculture", label: "Agriculture" },
    { value: "elevage", label: "Élevage" },
    { value: "artisanat", label: "Artisanat" },
    { value: "entrepreneuriat", label: "Entrepreneuriat" },
    { value: "marketing_digital", label: "Marketing digital" },
    { value: "autre", label: "Autre" },
  ],
  mouvement_citoyen: [
    { value: "debats_communautaires", label: "Débats communautaires" },
    {
      value: "formation_citoyennete",
      label: "Formation sur la citoyenneté, développement personnel et leadership",
    },
    { value: "fabrication_poubelles", label: "Fabrication de poubelles" },
    { value: "7km_paix", label: "7 km de la Paix" },
    { value: "rehabilitation_tables_bancs", label: "Réhabilitation de tables-bancs" },
    { value: "don", label: "Don" },
    { value: "plantation_arbres", label: "Plantation d'arbres" },
    { value: "sensibilisation_paix", label: "Sensibilisation à la paix" },
    { value: "sensibilisation_education", label: "Sensibilisation à l'éducation" },
    { value: "volontariat", label: "Volontariat" },
    { value: "autre", label: "Autre" },
  ],
};

export function getClassesOptionsForMaison(maison?: string): { value: string; label: string }[] {
  if (maison && CLASSES_BY_MAISON[maison]) {
    return CLASSES_BY_MAISON[maison];
  }
  return CLASSES_BY_MAISON.steam;
}

export function getDomaineClasseLabel(val?: string, maison?: string): string {
  if (!val) return "";
  const options = getClassesOptionsForMaison(maison);
  const found = options.find((o) => o.value === val);
  if (found) return found.label;
  for (const list of Object.values(CLASSES_BY_MAISON)) {
    const item = list.find((o) => o.value === val);
    if (item) return item.label;
  }
  return val;
}

export const DOMAINES_STEAM_OPTIONS: { value: string; label: string }[] = CLASSES_BY_MAISON.steam;

export const STADES_DEVELOPPEMENT_OPTIONS: { value: StadeDeveloppement; label: string }[] = [
  { value: "prototype", label: "Prototype" },
  { value: "commercialise", label: "Produit commercialisé" },
  { value: "en_test", label: "En cours de test" },
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
export const PHONE_REGEX = /^(?:\+?\d{1,4}[ -]?)?(?:\d{2}[ -]?){3,5}\d{2}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
