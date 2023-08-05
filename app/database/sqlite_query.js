const createContacts = `CREATE TABLE IF NOT EXISTS contacts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  whatsapp_id varchar(255) not null,
  name varchar(255),
  created_at datetime
);`

const createChats = `CREATE TABLE IF NOT EXISTS chats(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id int(11) not null,
  to_wa varchar(255) not null,
  chat_type varchar(255) not null,
  tags varchar(255),
  message text,
  message_type varchar(255),
  meta text,
  created_at datetime
);`

const createEvents = `CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name varchar(255) not null,
  image_url varchar(255),
  status varchar(255),
  created_at datetime
);`

const createDonations = `CREATE TABLE IF NOT EXISTS donations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id varchar(255) not null,
  total int(11),
  meta text,
  created_at datetime
);`


const createTemplates = `CREATE TABLE IF NOT EXISTS templates(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag varchar(255) not null,
  message varchar(255),
  is_active int(1) not null,
  created_at datetime
);`

export const SQLITE = {
  chat: createChats,
  contact: createContacts,
  event: createEvents,
  donation: createDonations,
  template: createTemplates,
}