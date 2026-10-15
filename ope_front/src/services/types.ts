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

export type CategorieCandidature = "junior" | "senior";
export type MaisonCandidature = "steam" | "local_project" | "mouvement_citoyen";

export interface Candidature {
  id: number;
  reference: string;
  categorie: CategorieCandidature;
  maison?: MaisonCandidature | "";
  statut: StatutCandidature;

  // Communs
  nom: string;
  prenom: string;
  telephone?: string;
  region_ville?: string;

  // Junior
  classe?: string;
  etablissement?: string;
  telephone_tuteur?: string;
  nom_tuteur?: string;
  mascotte_nom?: string;
  mascotte_pourquoi?: string;
  mascotte_dessin?: string | null;
  mascotte_signification?: string;
  autorisation_parent?: boolean;
  accord_utilisation_dessin?: boolean;

  // Senior
  sexe?: "M" | "F" | "";
  email?: string;
  piece_identite?: string | null;
  photo_identite?: string | null;
  domaine_steam?: string;
  domaine_steam_autre?: string;
  innovation_nom?: string;
  innovation_description?: string;
  stade_developpement?: string;
  preuves_realisation?: string | null;
  lien_portfolio?: string;
  participe_defile?: boolean;
  oeuvre_defile?: string;
  facilitateur_juniors?: boolean;
  souhaite_stand?: boolean;
  concours_prix_innovation?: boolean;
  disponible_camps?: boolean;
  accepte_conditions?: boolean;

  // Admin / Suivi
  note_interne?: string;
  score_evaluation?: number;
  created_at?: string;
  updated_at?: string;

  // Compatibilité legacy
  domaine?: string;
  region?: string;
  ville_village?: string;
  house_visee?: string;
  telephone_candidat?: string;
  description_projet?: string;
  motivation?: string;
  biographie?: string;
  statut_projet?: string;
  filiere?: string;
  moyenne_recente?: string;
  bulletins_scolaires?: string | null;
  autorisation_parentale?: string | null;
  preuve_projet?: string | null;
  lettre_recommandation?: string | null;
  certification?: boolean;
  confirmation_parent?: boolean;
}

export interface TalentFilterParams {
  domaine?: string;
  maison?: MaisonCandidature | "all";
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
  MC2: number;
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
export type PartenaireCategorie = "platine" | "or" | "argent" | "bronze";

export interface Partenaire {
  id: number;
  nom: string;
  type: PartenaireType;
  categorie?: PartenaireCategorie;
  logo?: string | null;
}

export interface PartenaireFilterParams {
  type?: string;
  categorie?: string;
  search?: string;
}

export type DocumentType = "archive" | "talent" | "rapport";

export interface DocumentItem {
  id: number;
  titre: string;
  type: DocumentType;
  fichier: string;
  annee: number;
  created_at?: string;
}

export interface DocumentFilterParams {
  type?: string;
  annee?: number | string;
  search?: string;
}
