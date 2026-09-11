import api from "./api";
import type { MessageContact, CreateMessageContactDTO } from "./types";

class ContactService {
  private endpoint = "contacts/";

  public async envoyerMessage(data: CreateMessageContactDTO): Promise<MessageContact> {
    return api.post<MessageContact>(this.endpoint, data);
  }

  public async getMessages(): Promise<MessageContact[]> {
    return api.get<MessageContact[]>(this.endpoint);
  }
}

export const contactService = new ContactService();
export default contactService;
