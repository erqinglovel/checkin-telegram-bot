import http from 'http'
import moment from 'moment'
import TelegramBot from 'node-telegram-bot-api'
import { Dates, User } from '../db/'
// import { INote } from './interfaces/'
import { IUser } from './interfaces/user.interface'

const token = process.env.TG_TOKEN || '716071100:AAHUl79kfpuGGniwfKmi_dJ0qr0mW9TML-c'

// console.warn(`
//   hola world i am linted on precommit hook xD
//   telegram token: ${token}
// `,
// )
const m = moment

const bot = new TelegramBot(token, { polling: true})
const workers = {}
const workerState = ['checkin', 'checkout', 'paused']
// const notes: INote[] = []

// function getFromDb() {

// }

bot.onText(/\/start/, (msg: TelegramBot.Message) => {
  if (msg) {
    const user: IUser = {
      day_total: 0,
      reg_date: m().utcOffset(120),
      telegram_id: msg.from.id,
      username: msg.from.username ? msg.from.username : msg.from.first_name,
    }

    bot.sendMessage(msg.from.id, 'YoLo, check in or die')
    User.create({ ...user }, (err) => {
      if (err) {
        throw new Error(err)
      }
    })
  }
})

bot.onText(/\/test (.+)/, (msg: TelegramBot.Message, match: RegExpExecArray) => {
  if (msg && match) {
    bot.sendMessage(msg.chat.id, `User @${msg.from.username} said ${match[1]}. There is parasites inside your guts`)
  }
})

bot.onText(/\/checkin/, (msg: TelegramBot.Message) => {
  if (msg) {
    bot.sendMessage(msg.from.id, `@${msg.from.username} checkin at ${m(new Date()).format('HH:mm')}`)
    workers[`${msg.from.id}`] = { startAt: Date.now() }
    workers[`${msg.from.id}`].status = workerState[0]
    console.warn(workers)
  }
})

bot.onText(/\/checkout/, (msg: TelegramBot.Message) => {
  if (msg) {
    bot.sendMessage(msg.from.id, `@${msg.from.username} checkout at ${m(new Date()).format('HH:mm')}`)
    const range = m(workers[`${msg.from.id}`].startAt)
    const timeSpent = range.diff( m(new Date()),  'hours')
    User.findOneAndUpdate({ telegram_id: `${msg.from.id}` },
  { day_total: Math.abs(timeSpent) }).exec()
  }
})

bot.onText(/\/today/, (msg: TelegramBot.Message) => {
  if (msg) {
    /* get from  db duration in hours-total for today*/
   User.findOne({ telegram_id: msg.from.id }, (err, usr: IUser) => {
     if (err) {
       console.error(new Error(err.toString()))
     } else {
       console.warn(usr)
       const user = {...usr}

       bot.sendMessage(msg.from.id,
        `@${msg.from.username} time spent .::TODAY::. ${m().milliseconds(user.day_total)}`)
     }
   })
  }
})

bot.onText(/\/week/, (msg: TelegramBot.Message) => {
  if (msg) {
    bot.sendMessage(msg.from.id, `@${msg.from.username} time spent .::WEEK::. ${m(new Date()).format('HH:mm')}`)
  }
   /* get from  db duration */
})

bot.onText(/\/month/, (msg: TelegramBot.Message) => {
  if (msg) {
    bot.sendMessage(msg.from.id, `@${msg.from.username} time spent .::MONTH::. ${m(new Date()).format('HH:mm')}`)
  }
  /* get from  db duration */
})

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write('Hello World!')
  res.end()
}).listen(4200)

console.warn('listening port 4200')
