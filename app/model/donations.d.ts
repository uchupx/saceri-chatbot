import { Model } from "./model";

export type Donation = {
  id: Number,
  event_id: String,
  meta: String,
  total: Number,
  created_at: Date,
}

export class DonationModel extends Model {
  public async getDonations(name: string): Promise<Donation>
  public async getDonation(id: number): Promise<Donation>
  public async createDonation(donation: Donation): Promise<Donation>
  public async countDonations(eventId: string): Promise<Number>
  public async getLast10Donations(eventId: string): Promise<Donation[]>
}