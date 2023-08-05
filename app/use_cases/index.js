// import { useCase as case_2 } from "./case2.js"
import { MESSAGES } from "./../messages.js";
import { ChatModel } from "./../model/chat.js";

export class UseCase {
  constructor(messsage, client, database) {
    this.messsage = messsage
    this.client = client
    this.database = database
  };

  messsage;
  client;
  database;

  case2(lastReceived, lasSent) {
    if (lasSent.tag == "#confirm") {

    } else {
      sendMessage(message.from, MESSAGES.CONFIRM, "#confirm")
    }
  }

  async sendMessage(to, body, tag, content = null) {
    let tmp = null
    if (content != null) {
      tmp = {
        media: content
      }
    }

    client.sendMessage(to, body, tmp)
    const chat = new ChatModel(database)

    try {
      let res = await chat.insert({
        contact_id: 0,
        to_wa: to,
        chat_type: "SEND",
        tags: tag,
        message: body.replace(/[\u0800-\uFFFF]/g, ''),
        message_type: "text",
        meta: "",
        created_at: Date()
      })

      return true
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}