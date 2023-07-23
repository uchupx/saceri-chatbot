import { Model } from "./model.js";

const findByIdQuery = "SELECT * FROM contacts WHERE id = ?"
const findByWhatsappIdQuery = "SELECT * FROM contacts WHERE whatsapp_id = ?"
const insertQuery = "INSERT INTO contacts(whatsapp_id, name, created_at) VALUES (?,?, datetime('now'))"

export const Contact = {
  id: 0,
  whatsapp_id: "",
  name: "",
  created_at: "",
};
export class ContactModel extends Model {
  async findById(id) {
    let res = await this.database.execute(findByIdQuery, [id])

    if (res != null && res.length > 0) {
      const rows = res[0]
      return {
        id: rows.id,
        whatsapp_id: rows.whatsapp_id,
        name: rows.name,
        created_at: rows.created_at,
      }
    }

    return {
      id: 0,
      whatsapp_id: "",
      name: "",
      created_at: "",
    }
  }

  async findByWhatsappId(id) {
    let res = await this.database.execute(findByWhatsappIdQuery, [id])
    if (res != null && res.length > 0) {
      const rows = res[0]
      return {
        id: rows.id,
        whatsapp_id: rows.whatsapp_id,
        name: rows.name,
        created_at: rows.created_at,
      }
    }

    return {
      id: 0,
      whatsapp_id: "",
      name: "",
      created_at: "",
    }
  }

  async insert(contact) {
    try {
      let res = await this.database.execute(insertQuery, [contact.whatsapp_id, contact.name])
      return res.lastID ? res.lastID : 0
    } catch (error) {
      return error
    }

  }
}