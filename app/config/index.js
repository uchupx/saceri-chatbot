import dotenv from 'dotenv'

var config = {
  driver: "",
  host: "",
  user: "",
  password: "",
  database: "",
  env: ""
}


export function getConfig() {
  dotenv.config()

  return {
    driver: process.env.DRIVER,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    env: process.env.ENV
  }
}