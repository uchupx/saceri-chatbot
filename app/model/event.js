import { Model } from "./model.js";

const getEventsQuery = "SELECT * FROM events WHERE event_type = ? and created_at > ?  ORDER BY created_at desc"
const getLastEventQuery = "SELECT * FROM events ORDER BY created_at desc LIMIT 1"
const insertQuery = "INSERT INTO events(event_type,meta,created_at) VALUES(?, ?, datetime('now'))"


export const Event = {
  id: 0,
  event_name: "",
  image_url: "",
  status: "",
  created_at: "",
}

export class EventModel extends Model {
  async getEvents(type, date) {
    let res = await this.database.execute(getEventsQuery, [type, date])

    if (res != null && res.length > 0) {
      const rows = res[0]
      return {
        id: rows.id,
        event_type: rows.event_type,
        meta: rows.meta,
        created_at: rows.created_at,
      }
    }

    return null
  }

  async insert(event) {
    try {
      let res = await this.database.execute(insertQuery, [event.event_type, event.meta])
      return res.lastID
    } catch (error) {
      return error
    }
  }

  async findLastEvent() {
    let res = await this.database.execute(getLastEventQuery)

    if (res != null && res.length > 0) {
      const rows = res[0]
      return {
        id: rows.id,
        event_type: rows.event_type,
        meta: rows.meta,
        created_at: rows.created_at,
      }
    }

    return null
  }
}