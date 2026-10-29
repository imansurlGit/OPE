import api from "./api";
import type { ActeurPage, ActeurPageFilterParams } from "./types";

class ActeurService {
  private endpoint = "acteurs-page/";

  public async getActeurs(filters?: ActeurPageFilterParams): Promise<ActeurPage[]> {
    const params = new URLSearchParams();
    if (filters?.actif !== undefined && filters.actif !== "all")
      params.append("actif", String(filters.actif));
    if (filters?.search?.trim()) params.append("search", filters.search.trim());

    const qs = params.toString();
    const url = qs ? `${this.endpoint}?${qs}` : this.endpoint;
    return api.get<ActeurPage[]>(url, { requiresAuth: false });
  }

  public async getActeurById(id: number): Promise<ActeurPage> {
    return api.get<ActeurPage>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  public async createActeur(data: FormData | Partial<ActeurPage>): Promise<ActeurPage> {
    return api.post<ActeurPage>(this.endpoint, data, { requiresAuth: false });
  }

  public async updateActeur(
    id: number,
    data: FormData | Partial<ActeurPage>
  ): Promise<ActeurPage> {
    return api.patch<ActeurPage>(`${this.endpoint}${id}/`, data, { requiresAuth: false });
  }

  public async deleteActeur(id: number): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }
}

export const acteurService = new ActeurService();
export default acteurService;

