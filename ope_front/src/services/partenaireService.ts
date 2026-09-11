import api from "./api";
import type { Partenaire, PartenaireFilterParams } from "./types";

class PartenaireService {
  private endpoint = "partenaires/";

  public async getPartenaires(filters?: PartenaireFilterParams): Promise<Partenaire[]> {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== "all") {
      params.append("type", filters.type);
    }
    if (filters?.search?.trim()) {
      params.append("search", filters.search.trim());
    }
    const qs = params.toString();
    const url = qs ? `${this.endpoint}?${qs}` : this.endpoint;
    return api.get<Partenaire[]>(url, { requiresAuth: false });
  }

  public async getPartenaire(id: number): Promise<Partenaire> {
    return api.get<Partenaire>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  public async createPartenaire(data: FormData | Partial<Partenaire>): Promise<Partenaire> {
    return api.post<Partenaire>(this.endpoint, data, { requiresAuth: false });
  }

  public async updatePartenaire(id: number, data: FormData | Partial<Partenaire>): Promise<Partenaire> {
    return api.patch<Partenaire>(`${this.endpoint}${id}/`, data, { requiresAuth: false });
  }

  public async deletePartenaire(id: number): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }
}

export const partenaireService = new PartenaireService();
export default partenaireService;
