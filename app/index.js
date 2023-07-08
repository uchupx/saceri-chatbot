import WA from "whatsapp-web.js";
import { MESSAGES } from "./messages.js";
import { ChatModel } from "./model/chat.js";
import { ContactModel } from "./model/contact.js";

const testGroupId = '120363164246575661@g.us'
const saceriGroupID = '120363041516540587@g.us'
const { MessageTypes } = WA

let database
export async function handle(client, message, conn) {
  database = conn
  if (message.type != MessageTypes.TEXT) {
    return
  }

  if (message.from !== '6285313843602@c.us' && message.from !== '6281296428585@c.us' && message.from !== '6289604914960@c.us' && message.from !== '62895328681181@c.us' && message.from !== '6282297108701@c.us' && message.from !== '6289604304520@c.us' && message.from !== '6289529824707@c.us' && message.from !== '6282295753639@c.us') {
    return
  }

  let contact = await isContactSaved(message.from)
  if (contact.id === 0) {
    console.log("contact is not exist")
    contact = await createNewContact(message)
  }

  const lastChat = await getLastReceivedMessage(contact)

  if (lastChat.id > 0 && lastChat.message != "reset") {
    console.log("masuk.ga")
    console.log(message.body == "1")
    console.log(message.body == "2")
    console.log(message.body == "3")
    switch (message.body) {
      case "1":
        client.sendMessage(message.from, MESSAGES.UPDATE)
        break;
      case "2":
        client.sendMessage(message.from, MESSAGES.CONFIRM)
        break;
      case '3':
        client.sendMessage(message.from, MESSAGES.LIVE)
        client.sendMessage(testGroupId, "ada yg mau konsul niiii dari " + contact.name)
        client.sendMessage(saceriGroupID, "ada yg mau konsul niiii dari " + contact.name)
        break;
      case "reset":
        client.sendMessage(message.from, "WOKE TAK RESET COBA KIRIM LAGI")
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

  return contact
}

async function createNewContact(message) {
  const c = new ContactModel(database)
  const cc = await message.getContact()

  try {
    let payload = {
      whatsapp_id: message.from,
      name: cc.pushname,
      // created_at: message.from,
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
    })

    console.log(res)
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
    console.log(res)
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