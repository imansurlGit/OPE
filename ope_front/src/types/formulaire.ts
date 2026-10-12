export type CategorieType = "junior" | "senior" | "";

export type MaisonType = "steam" | "local_project" | "mouvement_citoyen" | "";

export type ClasseJunior = "6e" | "5e" | "4e" | "3e" | "";

export type DomaineSteam =
  | "robotique"
  | "ia"
  | "aerospatial"
  | "solaire"
  | "biotech"
  | "art"
  | "maths_logique"
  | "autre"
  | "";

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
  // Étape 1 : Qui es-tu ?
  nom: string;
  prenom: string;
  age: string; // 8 à 17
  classe: ClasseJunior;
  etablissement: string;
  regionVille: string;
  telephoneTuteur: string;

  // Étape 2 : Ta mascotte
  mascotteNom: string;
  mascottePourquoi: string;
  mascotteDessin: UploadedFileInfo | null;
  mascotteSignification: string;

  // Étape 3 : Autorisation & Récap
  nomTuteur: string;
  autorisationParent: boolean;
  accordUtilisationDessin: boolean;
}

export interface SeniorData {
  categorie: "senior";
  // Étape 1 : Identité du candidat
  nom: string;
  prenom: string;
  sexe: "M" | "F" | "";
  dateNaissance: string;
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
  { key: "qui_es_tu", label: "Qui es-tu ?", shortLabel: "Identité" },
  { key: "ta_mascotte", label: "Ta mascotte", shortLabel: "Mascotte" },
  { key: "autorisation", label: "Autorisation & Finalisation", shortLabel: "Autorisation" },
];

export const SENIOR_STEPS: FormStepConfig[] = [
  { key: "identite", label: "Identité du candidat", shortLabel: "Identité" },
  { key: "innovation", label: "Votre innovation STEAM", shortLabel: "Innovation" },
  { key: "modalites", label: "Modalités de participation", shortLabel: "Modalités" },
];

export const INITIAL_JUNIOR_DATA: JuniorData = {
  categorie: "junior",
  nom: "",
  prenom: "",
  age: "",
  classe: "",
  etablissement: "",
  regionVille: "",
  telephoneTuteur: "",
  mascotteNom: "",
  mascottePourquoi: "",
  mascotteDessin: null,
  mascotteSignification: "",
  nomTuteur: "",
  autorisationParent: false,
  accordUtilisationDessin: false,
};

export const INITIAL_SENIOR_DATA: SeniorData = {
  categorie: "senior",
  nom: "",
  prenom: "",
  sexe: "",
  dateNaissance: "",
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

export const DOMAINES_STEAM_OPTIONS: { value: DomaineSteam; label: string }[] = [
  { value: "robotique", label: "Robotique" },
  { value: "ia", label: "Intelligence Artificielle" },
  { value: "aerospatial", label: "Aéronautique et sciences spatiales" },
  { value: "solaire", label: "Technologie solaire" },
  { value: "biotech", label: "Biotechnologie" },
  { value: "art", label: "Art" },
  { value: "maths_logique", label: "Mathématiques et Logique" },
  { value: "autre", label: "Autre" },
];

export const STADES_DEVELOPPEMENT_OPTIONS: { value: StadeDeveloppement; label: string }[] = [
  { value: "prototype", label: "Prototype" },
  { value: "commercialise", label: "Produit commercialisé" },
  { value: "en_test", label: "En cours de test" },
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
export const PHONE_REGEX = /^(?:\+?\d{1,4}[ -]?)?(?:\d{2}[ -]?){3,5}\d{2}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
