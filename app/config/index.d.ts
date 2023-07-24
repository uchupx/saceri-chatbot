
type config = {
  driver: String,
  host: String,
  user: String,
  password: String,
  database: String,
  env: String
}


export function getConfig(): config { }
