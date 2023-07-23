import WAWebJS from "whatsapp-web.js";
import qrcode from 'qrcode-terminal';
import { Database, DBTYPE } from "./app/database/connection.js";
import { handle } from "./app/index.js";


const { Client, LocalAuth, Events } = WAWebJS;
const client = new Client({
  authStrategy: new LocalAuth()
});

const database = new Database('app/database/saceri.db', 'sqlite')

client.on(Events.QR_RECEIVED, (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on(Events.READY, () => {
  console.log('Client is ready!');
});

client.on(Events.MESSAGE_RECEIVED, (message) => {
  handle(client, message, database)
  return
})

client.initialize();
