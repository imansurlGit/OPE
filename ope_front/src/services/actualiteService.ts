import api from "./api";
import type { Actualite, ActualiteFilterParams } from "./types";

class ActualiteService {
  private endpoint = "actualites/";

  /**
   * Récupère la liste des actualités avec filtrage optionnel
   */
  public async getArticles(filters?: ActualiteFilterParams): Promise<Actualite[]> {
    const params = new URLSearchParams();
    if (filters?.phase && filters.phase !== "all") {
      params.append("phase", filters.phase);
    }
    if (filters?.publie !== undefined && filters.publie !== "all") {
      params.append("publie", String(filters.publie));
    }
    if (filters?.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

    return api.get<Actualite[]>(url, { requiresAuth: false });
  }

  /**
   * Récupère un article par son ID
   */
  public async getArticleById(id: number | string): Promise<Actualite> {
    return api.get<Actualite>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  /**
   * Crée un nouvel article
   */
  public async createArticle(
    data: FormData | Partial<Actualite>
  ): Promise<Actualite> {
    return api.post<Actualite>(this.endpoint, data, { requiresAuth: false });
  }

  /**
   * Met à jour un article (partiel ou complet)
   */
  public async updateArticle(
    id: number | string,
    data: FormData | Partial<Actualite>
  ): Promise<Actualite> {
    return api.patch<Actualite>(`${this.endpoint}${id}/`, data, {
      requiresAuth: false,
    });
  }

  /**
   * Supprime un article
   */
  public async deleteArticle(id: number | string): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }
}

export const actualiteService = new ActualiteService();
export default actualiteService;
