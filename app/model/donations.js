import { Model } from "./model.js";

const getDonationsQuery = "SELECT * FROM donations WHERE .... ORDER BY created_at desc"
const getLast10DonationsQuery = "SELECT * FROM donations WHERE event_id = ? ORDER BY created_at desc LIMIT 10"
const countDonationsQuery = "SELECT COUNT(total) as count FROM donations WHERE event_id = ?"
const insertQuery = "INSERT INTO donations(event_id,total,created_at) VALUES(?, ?, datetime('now'))"

export class DonationModel extends Model {
  async getDonations(eventId) {
    let res = await this.database.execute(getDonationsQuery, [eventId]);
    if (res != null && res.length > 0) {
      const rows = res[0];
      return {
        id: rows.id,
        event_id: rows.event_id,
        total: rows.total,
        created_at: rows.created_at,
      };
    }
    return null;
  }

  async insert(donation) {
    try {
      let res = await this.database.execute(insertQuery, [donation.event_id, donation.total]);
      return res.lastID;
    }
    catch (error) {
      return error;
    }
  }

  async countDonations(eventId) {
    let res = await this.database.execute(countDonationsQuery, [eventId]);
    if (res != null && res.length > 0) {
      const rows = res[0];
      return rows.count;
    }
    return 0;
  }

  async getLast10Donations(eventId) {
    let arr = [];
    let res = await this.database.execute(getLast10DonationsQuery, [eventId]);

    if (res != null && res.length > 0) {
      const rows = res[0];
      arr.push({
        id: rows.id,
        event_id: rows.event_id,
        total: rows.total,
        created_at: rows.created_at,
      });
    }

    return arr;
  }
}