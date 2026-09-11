import api from "./api";
import type { MediaGalerie, MediaGalerieFilterParams } from "./types";

class GalerieService {
  private endpoint = "galerie/";

  public async getMedias(filters?: MediaGalerieFilterParams): Promise<MediaGalerie[]> {
    const params = new URLSearchParams();
    if (filters?.categorie && filters.categorie !== "all") {
      params.append("categorie", filters.categorie);
    }
    if (filters?.mis_en_avant !== undefined && filters.mis_en_avant !== "all") {
      params.append("mis_en_avant", String(filters.mis_en_avant));
    }
    if (filters?.search?.trim()) {
      params.append("search", filters.search.trim());
    }

    const qs = params.toString();
    const url = qs ? `${this.endpoint}?${qs}` : this.endpoint;
    return api.get<MediaGalerie[]>(url, { requiresAuth: false });
  }

  public async getMediaById(id: number): Promise<MediaGalerie> {
    return api.get<MediaGalerie>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  public async createMedia(data: FormData | Partial<MediaGalerie>): Promise<MediaGalerie> {
    return api.post<MediaGalerie>(this.endpoint, data, { requiresAuth: false });
  }

  public async updateMedia(
    id: number,
    data: FormData | Partial<MediaGalerie>
  ): Promise<MediaGalerie> {
    return api.patch<MediaGalerie>(`${this.endpoint}${id}/`, data, { requiresAuth: false });
  }

  public async deleteMedia(id: number): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }
}

export const galerieService = new GalerieService();
export default galerieService;
