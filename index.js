import WAWebJS from "whatsapp-web.js";
import qrcode from 'qrcode-terminal';
import { Database, DBTYPE } from "./app/database/connection.js";
import { handle } from "./app/index.js";
import * as Config from "./app/config/index.js";

const config = Config.getConfig()
const { Client, LocalAuth, Events } = WAWebJS;
const client = new Client({
  authStrategy: new LocalAuth()
});

let database = null
switch (config.driver) {
  case 'sqlite':
    database = new Database(config.host, DBTYPE.SQLITE)
    break;
  case 'mysql':
    database = new Database({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
    }, 'mysql')
    break;
  default:
    process.exit()
}

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