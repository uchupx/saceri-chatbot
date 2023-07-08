import { Model } from "./model";

export interface Contact {
  id: number,
  whatsapp_id: string,
  name: string,
  created_at: Date
};

export class ContactModel extends Model {
  async findById(id: number): any
  async findByWhatsappId(id: string): any
  async insert(contact: Contact): number
}