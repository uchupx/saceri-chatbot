import WA from "whatsapp-web.js";
import { MESSAGES } from "./messages.js";
import { ChatModel } from "./model/chat.js";
import { ContactModel } from "./model/contact.js";
import { UseCase } from "./use_cases/index.js";
import * as helper from './helper/helper.js'
import * as config from './config/index.js'

const saceriGroupID = '120363041516540587@g.us'
const { MessageTypes } = WA


let database
let client

export async function handle(cl, message, conn) {
  database = conn
  client = cl
  console.log(message)
  let media = null
  let from = message.from
  if (isDebug() && !isHasTestingContact(from)) {
    return
  }

  if (message.type != MessageTypes.TEXT && message.type != MessageTypes.IMAGE) {
    return
  }

  let contact = await isContactSaved(message.from)
  if (contact.id === 0) {
    console.log("contact is not exist")
    contact = await createNewContact(message)
  }

  const lastChat = await getLastReceivedMessage(contact)
  const lastSendChat = await getLastSentMessage(contact)

  const USECASE = new UseCase(message, client, database)
  if (lastChat.id > 0 && lastChat.message != "reset") {
    switch (findCase(lastChat, message, lastSendChat)) {
      case "1":
        sendMessage(from, MESSAGES.UPDATE, "#update")
        break;
      case "2":
        USECASE.case2(lastChat, lastSendChat)
        break;
      case '3':
        sendMessage(from, MESSAGES.LIVE, "#consul")
        break;
      case "reset":
        sendMessage(from, "WOKE TAK RESET COBA KIRIM LAGI", "#reset")
        break;
      default:
        client.sendMessage(from, MESSAGES.GREETINGS)
        break;
    }
  } else {
    client.sendMessage(from, MESSAGES.GREETINGS)
  }

  saveReceivedMessage(message, contact.id)
}

async function isContactSaved(id) {
  const contacts = new ContactModel(database)
  const contact = await contacts.findByWhatsappId(id)

  return contact
}

async function createNewContact(message) {
  const c = new ContactModel(database)
  const cc = await message.getContact()

  try {
    let payload = {
      whatsapp_id: message.from,
      name: cc.pushname,
      created_at: Date()
    }

    let res = await c.insert(payload)

    payload.id = res

    return payload
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function saveReceivedMessage(message, id) {
  const chat = new ChatModel(database)
  const meta = helper.json_stringify(message, false)

  try {
    await chat.insert({
      contact_id: id,
      to_wa: message.from,
      chat_type: "RECEIVED",
      tags: "#CHAT",
      message: message.body.replace(/[\u0800-\uFFFF]/g, ''),
      message_type: message.type,
      meta: meta,
      created_at: Date()
    })

    return true
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function getLastReceivedMessage(contact) {
  const chat = new ChatModel(database)
  let d = new Date()
  d.setHours(d.getHours() - 1)

  try {
    let res = await chat.findLastChat(contact.id, 'RECEIVED', helper.dateToString(d))
    return res
  } catch (error) {
    // console.log(error)
    throw error
  }
}

async function getLastSentMessage() {
  const chat = new ChatModel(database)
  let d = new Date()
  d.setHours(d.getHours() - 1)

  try {
    let res = await chat.findLastChat(0, 'SEND', helper.dateToString(d))
    return res
  } catch (error) {
    throw error
  }
}

async function sendMessage(to, body, tag, content = null) {
  if (content != null) {
    client.sendMessage(to, body, {
      media: content
    })
  } else {
    client.sendMessage(to, body)
  }

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

function isDebug() {
  return config.getConfig().env.toLowerCase == "debug"
}

function isHasTestingContact(from) {
  return from == config.getConfig().testContact
}



function findCase(lastChat, message, lastSendChat) {
  if (lastChat.message == "reset") {
    return "reset"
  }

  if (message.body == "1") {
    return "1"
  }

  if (lastSendChat.tags == "#confirm" || message.body == "2") {
    return "2"
  }

  if (message.body == "3") {
    return "3"
  }

  return "0"
}