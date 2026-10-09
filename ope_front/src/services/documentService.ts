import api from "./api";
import type { DocumentItem, DocumentFilterParams } from "./types";

class DocumentService {
  private endpoint = "documents/";

  public async getDocuments(filters?: DocumentFilterParams): Promise<DocumentItem[]> {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== "all") {
      params.append("type", filters.type);
    }
    if (filters?.annee && String(filters.annee) !== "all") {
      params.append("annee", String(filters.annee));
    }
    if (filters?.search?.trim()) {
      params.append("search", filters.search.trim());
    }
    const qs = params.toString();
    const url = qs ? `${this.endpoint}?${qs}` : this.endpoint;
    return api.get<DocumentItem[]>(url, { requiresAuth: false });
  }

  public async getDocument(id: number): Promise<DocumentItem> {
    return api.get<DocumentItem>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  public async createDocument(data: FormData | Partial<DocumentItem>): Promise<DocumentItem> {
    return api.post<DocumentItem>(this.endpoint, data, { requiresAuth: false });
  }

  public async updateDocument(id: number, data: FormData | Partial<DocumentItem>): Promise<DocumentItem> {
    return api.patch<DocumentItem>(`${this.endpoint}${id}/`, data, { requiresAuth: false });
  }

  public async deleteDocument(id: number): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }
}

export const documentService = new DocumentService();
export default documentService;
