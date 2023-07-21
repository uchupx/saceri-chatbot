import WA from "whatsapp-web.js";
import { MESSAGES } from "./messages.js";
import { ChatModel } from "./model/chat.js";
import { ContactModel } from "./model/contact.js";

const testGroupId = '120363164246575661@g.us'
const saceriGroupID = '120363041516540587@g.us'
const { MessageTypes } = WA

let database
let client
export async function handle(cl, message, conn) {
  database = conn
  client = cl


  // && message.from !== '6288211263092@c.us' && message.from !== '6281296428585@c.us' && message.from !== '6289604914960@c.us' && message.from !== '62895328681181@c.us' && message.from !== '6282297108701@c.us' && message.from !== '6289604304520@c.us' && message.from !== '6289529824707@c.us' && message.from !== '6282295753639@c.us') 
  if (message.from !== '6285313843602@c.us') {
    return
  }
  console.log(message.type)
  console.log(message)
  if (message.type != MessageTypes.TEXT) {
    return
  }

  let contact = await isContactSaved(message.from)
  if (contact.id === 0) {
    console.log("contact is not exist")
    contact = await createNewContact(message)
  }

  const lastChat = await getLastReceivedMessage(contact)

  if (lastChat.id > 0 && lastChat.message != "reset") {
    switch (message.body) {
      case "1":
        sendMessage(message.from, MESSAGES.UPDATE, "#greeting")
        break;
      case "2":
        sendMessage(message.from, MESSAGES.CONFIRM, "#confirm")
        break;
      case '3':
        sendMessage(message.from, MESSAGES.LIVE, "#consul")
        sendMessage(testGroupId, "ada yg mau konsul niiii dari " + contact.name, "#consul")
        // sendMessage(saceriGroupID, "ada yg mau konsul niiii dari " + contact.name, "#consul")
        break;
      case "reset":
        sendMessage(message.from, "WOKE TAK RESET COBA KIRIM LAGI", "#reset")
      default:
        break;
    }
  } else {
    client.sendMessage(message.from, MESSAGES.GREETINGS)
  }

  saveReceivedMessage(message, contact.id)
}


async function isContactSaved(id) {
  const contacts = new ContactModel(database)
  const contact = await contacts.findByWhatsappId(id)
  console.log(contact)

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
    console.log(res)

    payload.id = res

    return payload
  } catch (error) {
    console.log(error)
    throw error
  }
}

async function saveReceivedMessage(message, id) {
  const chat = new ChatModel(database)
  const meta = JSON_stringify(message, false)

  try {
    let res = await chat.insert({
      contact_id: id,
      to_wa: message.from,
      chat_type: "RECEIVED",
      tags: "CHAT",
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

  try {
    let res = await chat.findLastChat(contact.id)
    return res
  } catch (error) {
    console.log(error)
    throw error
  }
}

function JSON_stringify(s, emit_unicode) {
  var json = JSON.stringify(s);
  return emit_unicode ? json : json.replace(/[\u007f-\uffff]/g,
    function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    }
  );
}


async function sendMessage(to, body, tag) {
  client.sendMessage(to, body)
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