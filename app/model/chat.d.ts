import { Model } from "./model";

export interface Chat {
  id: number,
  contact_id: string,
  to: string,
  chat_type: string,
  tags: string,
  message: string,
  message_type: string,
  meta: string,
  created_at: Date,
}

export class ChatModel extends Model {
  findLastChat(from: string, date: string): Chat
  insert(chat: Chat): number
}