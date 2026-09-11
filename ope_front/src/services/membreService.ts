import api from "./api";
import type { MembreEquipe, MembreEquipeFilterParams } from "./types";

class MembreService {
  private endpoint = "membres/";

  public async getMembres(filters?: MembreEquipeFilterParams): Promise<MembreEquipe[]> {
    const params = new URLSearchParams();
    if (filters?.section && filters.section !== "all") params.append("section", filters.section);
    if (filters?.actif !== undefined && filters.actif !== "all")
      params.append("actif", String(filters.actif));
    if (filters?.search?.trim()) params.append("search", filters.search.trim());

    const qs = params.toString();
    const url = qs ? `${this.endpoint}?${qs}` : this.endpoint;
    return api.get<MembreEquipe[]>(url, { requiresAuth: false });
  }

  public async getMembreById(id: number): Promise<MembreEquipe> {
    return api.get<MembreEquipe>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  public async createMembre(data: FormData | Partial<MembreEquipe>): Promise<MembreEquipe> {
    return api.post<MembreEquipe>(this.endpoint, data, { requiresAuth: false });
  }

  public async updateMembre(
    id: number,
    data: FormData | Partial<MembreEquipe>
  ): Promise<MembreEquipe> {
    return api.patch<MembreEquipe>(`${this.endpoint}${id}/`, data, { requiresAuth: false });
  }

  public async deleteMembre(id: number): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }
}

export const membreService = new MembreService();
export default membreService;
