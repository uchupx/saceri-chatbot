import { Model } from "./model.js"

const findLastReceiveChatQuery = "SELECT * FROM chats WHERE contact_id = ? and chat_type = 'RECEIVED' ORDER BY created_at desc"
const findLastSentChatQuery = "SELECT * FROM chats WHERE contact_id = ? and chat_type = 'SENT' ORDER BY created_at desc"
const insertQuery = "INSERT INTO chats(contact_id,to_wa,chat_type,tags,message,message_type,meta,created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?)"

export const Chat = {
  id: 0,
  contact_id: "",
  to_wa: "",
  chat_type: "",
  tags: "",
  message: "",
  message_type: "",
  meta: "",
  created_at: "",
}

export class ChatModel extends Model {

  async findLastChat(from) {
    let res = await this.database.execute(findLastReceiveChatQuery, [from])

    if (res != null && res.length > 0) {
      const rows = res[0]
      return {
        id: rows.id,
        contact_id: rows.contact_id,
        to_wa: rows.to_wa,
        chat_type: rows.chat_type,
        tags: rows.tags,
        message: rows.message,
        message_type: rows.message_type,
        meta: rows.meta,
        created_at: rows.created_at,
      }
    }

    return Chat
  }

  async insert(chat) {
    try {
      console.log(chat.message)
      let res = await this.database.execute(insertQuery, [chat.contact_id, chat.to_wa, chat.chat_type, chat.tags, chat.message, chat.message_type, chat.meta, chat.created_at])

      return res.lastID
    } catch (error) {
      return error
    }
  }
}