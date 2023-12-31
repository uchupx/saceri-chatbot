import { DonationModel } from "../model/donations.js";
import { MESSAGES } from "./../messages.js";
import { ChatModel } from "./../model/chat.js";
import { EventModel } from "./../model/event.js";
import * as helper from './../helper/helper.js'

const testGroupId = '120363164246575661@g.us'
const testGroupId2 = '120363162514069329@g.us'

export class UseCase {
  constructor(messsage, client, database) {
    this.messsage = messsage
    this.client = client
    this.database = database
  };

  messsage;
  client;
  database;

  async case2(lastReceived, lasSent) {
    const message = this.messsage
    const event = await this.findLastEvent()

    // if (event == null) {
    //   this.sendMessage(message.from, "Mohon maaf untuk saat ini belum ada event donasi yang tersedia", "#confirm")
    //   return
    // }

    if (lasSent.tags == "#confirm") {
      if (this.checkIsDonationTemplate(message.body)) {
        const phoneNumber = message.from.replace("@c.us", "")
        const total = this.getDonationInt(message.body)
        this.sendMessage(testGroupId2, "ada yg mau donasi ni dari " + phoneNumber, "#donasi")
        this.sendMessage(message.from, "Terimakasih telah melakukan konfirmasi donasi, mohon kesediannya untuk menunggu Minceri membalas pesan anda.", "#confirm")
      }
    } else {
      const from = this.messsage.from
      this.sendMessage(from, MESSAGES.CONFIRM, "#confirm")
    }
  }

  async sendMessage(to, body, tag, content = null) {
    if (content != null) {
      this.client.sendMessage(to, body, {
        media: content
      })
    } else {
      this.client.sendMessage(to, body)
    }

    const chat = new ChatModel(this.database)

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

  async insertDonation(message) {
    const donation = new DonationModel(this.database)

    try {
      let res = await donation.insert({
        event_id: 0,
        total: 0,
      })

      return res
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  checkIsDonationTemplate(body) {
    let regex = /- Nama Pendonasi :/g
    let res = regex.test(body)

    return res
  }

  async findLastEvent() {
    const event = new EventModel(this.database)

    try {
      let res = await event.findLastEvent()

      return res
    } catch (error) {
      throw error
    }
  }

  getIntFromString(str) {
    let regex = /\d+/g
    let res = str.match(regex)

    return res
  }

  getDonationInt(body) {
    const lines = helper.split_string_by_line(body)
    for (let i = 0; i < lines.length; i++) {
      const element = lines[i];
      if (element.includes("Donasi")) {
        return this.getIntFromString(element)
      }
    }
  }
}