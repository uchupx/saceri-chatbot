import dotenv from 'dotenv'

var config = {
  driver: "",
  host: "",
  user: "",
  password: "",
  database: "",
  testContact: "",
  targetTestContact: "",
  env: "",
}


export function getConfig() {
  dotenv.config()

  return {
    driver: process.env.DRIVER,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    testContact: process.env.TEST_CONTACT,
    targetTestContact: process.env.TEST_TARGET_CONTACT,
    env: process.env.ENV
  }
}