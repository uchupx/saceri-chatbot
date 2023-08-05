import { Model } from "./model";

export type Event = {
  id: Number,
  event_name: String,
  image_url: String,
  status: String,
  created_at: Date,
}

export class EventModel extends Model {
  async getEvents(name: string): Promise<Event>
}