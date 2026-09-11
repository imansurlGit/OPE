import api from "./api";
import type { Candidature, TalentFilterParams, TalentStats } from "./types";

class TalentService {
  private endpoint = "candidatures/";

  /**
   * Récupère la liste des talents/candidatures avec filtrage optionnel
   */
  public async getTalents(filters?: TalentFilterParams): Promise<Candidature[]> {
    const params = new URLSearchParams();
    if (filters?.domaine && filters.domaine !== "all") {
      params.append("domaine", filters.domaine);
    }
    if (filters?.statut && filters.statut !== "all") {
      params.append("statut", filters.statut);
    }
    if (filters?.region && filters.region !== "Toutes") {
      params.append("region", filters.region);
    }
    if (filters?.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

    return api.get<Candidature[]>(url, { requiresAuth: false });
  }

  /**
   * Récupère un talent/candidat par son ID
   */
  public async getTalentById(id: number | string): Promise<Candidature> {
    return api.get<Candidature>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  /**
   * Récupère les données publiques d'un badge/carte par sa référence (ex: CNCEIZ-2026-XXXXX)
   */
  public async getTalentCard(reference: string): Promise<Candidature> {
    return api.get<Candidature>(`${this.endpoint}card/${encodeURIComponent(reference)}/`, {
      requiresAuth: false,
    });
  }

  /**
   * Met à jour partiellement un talent (statut, note_interne, score, etc.)
   */
  public async updateTalent(
    id: number | string,
    data: Partial<Candidature>
  ): Promise<Candidature> {
    return api.patch<Candidature>(`${this.endpoint}${id}/`, data, {
      requiresAuth: false,
    });
  }

  /**
   * Supprime un talent/candidat
   */
  public async deleteTalent(id: number | string): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  /**
   * Calcule les statistiques complètes en temps réel à partir des candidatures réelles
   */
  public computeStats(candidatures: Candidature[]): TalentStats {
    const total = candidatures.length;
    const admis = candidatures.filter((c) => c.statut === "admis").length;
    const preselectionne = candidatures.filter((c) => c.statut === "preselectionne").length;
    const en_revue = candidatures.filter((c) => c.statut === "en_revue").length;
    const rejete = candidatures.filter((c) => c.statut === "rejete").length;
    const soumis = candidatures.filter((c) => c.statut === "soumis").length;

    const steam = candidatures.filter((c) => c.domaine === "STEAM").length;
    const lp = candidatures.filter((c) => c.domaine === "LP").length;
    const mcc = candidatures.filter((c) => c.domaine === "MCC").length;

    const filles = candidatures.filter((c) => c.sexe === "F").length;
    const garcons = candidatures.filter((c) => c.sexe === "M").length;

    const regionsSet = new Set(candidatures.map((c) => c.region).filter(Boolean));
    const regionsCount = regionsSet.size;

    return {
      total,
      admis,
      preselectionne,
      en_revue,
      rejete,
      soumis,
      steam,
      lp,
      mcc,
      filles,
      garcons,
      regionsCount,
    };
  }
}

export const talentService = new TalentService();
export default talentService;
