import api from "./api";
import type { MessageContact, CreateMessageContactDTO } from "./types";

class ContactService {
  private endpoint = "contacts/";

  public async envoyerMessage(data: CreateMessageContactDTO): Promise<MessageContact> {
    return api.post<MessageContact>(this.endpoint, data, { requiresAuth: false });
  }

  public async getMessages(): Promise<MessageContact[]> {
    const data = await api.get<MessageContact[] | { results: MessageContact[] }>(this.endpoint, {
      requiresAuth: false,
    });
    return Array.isArray(data) ? data : data?.results || [];
  }

  public async getMessage(id: number): Promise<MessageContact> {
    return api.get<MessageContact>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }

  public async updateMessage(id: number, data: Partial<MessageContact>): Promise<MessageContact> {
    return api.patch<MessageContact>(`${this.endpoint}${id}/`, data, { requiresAuth: false });
  }

  public async marquerCommeTraite(id: number, traite = true): Promise<MessageContact> {
    return this.updateMessage(id, { traite });
  }

  public async deleteMessage(id: number): Promise<void> {
    return api.delete<void>(`${this.endpoint}${id}/`, { requiresAuth: false });
  }
}

export const contactService = new ContactService();
export default contactService;
