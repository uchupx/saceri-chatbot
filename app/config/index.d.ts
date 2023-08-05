
type config = {
  driver: String,
  host: String,
  user: String,
  password: String,
  database: String,
  testContact: String,
  targetTestContact: String,
  env: String
}


export function getConfig(): config { }
