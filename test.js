import { Database } from "./app/database/connection.js";
import { ContactModel } from "./app/model/contact.js";


var database = new Database("stringgggg")

var contact = new ContactModel(database)

console.log(await contact.insert({
  whatsapp_id: "asd",
  name: "asd",
}))