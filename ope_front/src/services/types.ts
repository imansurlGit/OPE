export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  success: boolean;
  access: string;
  refresh?: string;
  user: User;
  message: string;
  status_code: number;
  errors?: Record<string, string[]>;
}

export interface RefreshResponse {
  success: boolean;
  access: string;
  refresh?: string;
  user?: User;
  message: string;
  status_code: number;
}

export type StatutCandidature =
  | "soumis"
  | "en_revue"
  | "preselectionne"
  | "admis"
  | "rejete";

export type DomaineCandidature = "STEAM" | "LP" | "MCC";

export interface Candidature {
  id: number;
  reference: string;
  domaine: DomaineCandidature;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: "M" | "F";
  region: string;
  ville_village: string;
  nationalite: string;
  etablissement?: string;
  classe?: string;
  telephone_candidat?: string;
  email: string;
  telephone_tuteur?: string;
  point_focal?: string;
  biographie?: string;
  house_visee: string;
  house_visee_autre?: string;
  statut_projet: string;
  description_projet: string;
  filiere?: string;
  moyenne_recente?: string;
  nom_recommandant?: string;
  tel_recommandant?: string;
  frequence_engagement?: string;
  motivation: string;
  acces_numerique: string;
  photo_identite?: string | null;
  piece_identite?: string | null;
  bulletins_scolaires?: string | null;
  autorisation_parentale?: string | null;
  preuve_projet?: string | null;
  lettre_recommandation?: string | null;
  certification: boolean;
  confirmation_parent: boolean;
  statut: StatutCandidature;
  note_interne?: string;
  score_evaluation?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TalentFilterParams {
  domaine?: string;
  statut?: string;
  region?: string;
  search?: string;
}

export interface TalentStats {
  total: number;
  admis: number;
  preselectionne: number;
  en_revue: number;
  rejete: number;
  soumis: number;
  steam: number;
  lp: number;
  mcc: number;
  filles: number;
  garcons: number;
  regionsCount: number;
}

export type ActualitePhase = "avant" | "pendant" | "apres";

export interface Actualite {
  id: number;
  titre: string;
  slug: string;
  phase: ActualitePhase;
  badge_label: string;
  resume: string;
  contenu: string;
  image_principale?: string | null;
  publie: boolean;
  date_publication: string;
  temps_lecture: number;
  created_at?: string;
}

export interface ActualiteFilterParams {
  phase?: string;
  publie?: boolean | string;
  search?: string;
}

export type MembreSection = string;

export interface MembreEquipe {
  id: number;
  nom: string;
  role: string;
  section: string;
  description?: string;
  photo?: string | null;
  email?: string;
  linkedin?: string;
  ordre: number;
  actif: boolean;
}

export interface MembreEquipeFilterParams {
  section?: string;
  actif?: boolean | string;
  search?: string;
}

export interface MessageContact {
  id: number;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  traite?: boolean;
  reponse_interne?: string;
  created_at?: string;
}

export interface CreateMessageContactDTO {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}

export type MediaCategorie = "steam" | "local" | "citoyen" | "ambiance";

export interface MediaGalerie {
  id: number;
  titre: string;
  categorie: MediaCategorie;
  image: string;
  video_url?: string;
  mis_en_avant: boolean;
  ordre: number;
  created_at?: string;
}

export interface MediaGalerieFilterParams {
  categorie?: string;
  mis_en_avant?: boolean | string;
  search?: string;
}

export type PartenaireType = "pays" | "institution" | "ong" | "ambassade";

export interface Partenaire {
  id: number;
  nom: string;
  type: PartenaireType;
  logo?: string | null;
}

export interface PartenaireFilterParams {
  type?: string;
  search?: string;
}

