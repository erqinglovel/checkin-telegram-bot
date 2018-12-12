import http from 'http'
import moment from 'moment'
import TelegramBot from 'node-telegram-bot-api'
import { User } from '../db/'
// import { INote } from './interfaces/'
import { IUser } from './interfaces/user.interface'

const token = process.env.TG_TOKEN || '716071100:AAHUl79kfpuGGniwfKmi_dJ0qr0mW9TML-c'
const m = moment
const bot = new TelegramBot(token, { polling: true})
const workerState = ['checkin', 'checkout', 'pending']
// const notes: INote[] = []

// function getFromDb() {

  // }
bot.onText(/\/test (.+)/, (msg: TelegramBot.Message, match: RegExpExecArray) => {
      if (msg && match) {
        bot.sendMessage(msg.chat.id, `User @${msg.from.username} said ${match[1]}. There is parasites inside your guts`)
      }
    })

bot.onText(/\/start/, (msg: TelegramBot.Message) => {
  if (msg) {
    const user: IUser = {
      dates: [],
      day_total: 0,
      reg_date: m().utcOffset(120),
      status: workerState[2],
      telegram_id: msg.from.id,
      username: msg.from.username ? msg.from.username : msg.from.first_name,
      working_start: 0,
    }

    bot.sendMessage(msg.from.id, 'YoLo, check in or die')
    User.create({ ...user }, (err) => {
      if (err) {
        throw new Error(err)
      }
    })
  }
})

bot.onText(/\/checkin/, (msg: TelegramBot.Message) => {
  if (msg) {
    bot.sendMessage(msg.from.id, `@${msg.from.username} checkin at ${m(new Date()).format('HH:mm')}`)
    User.findOneAndUpdate({ 'telegram_id': msg.from.id, 'dates.month_num': {$nin: [m().format('MM')]}},
     { $addToSet: { dates: {
    month_num: m().format('MM'),
    month_total: 0,
    week_num: m().format('ww'),
    week_total: 0,
   }},
   status: workerState[0],
   working_start: Date.now(),
  }).exec()
    }
})

bot.onText(/\/checkout/, (msg: TelegramBot.Message) => {
  if (msg) {
    bot.sendMessage(msg.from.id, `@${msg.from.username} checkout at ${m(new Date()).format('HH:mm')}`)
    User.findOne({ telegram_id: `${msg.from.id}` }, (err, doc: IUser) => {
      if (err) {

        console.error(new Error(err))

      } else {

        const range = m(doc.working_start)
        const timeSpent = range.diff( m(new Date()),  'seconds')
        User.update({ telegram_id: `${msg.from.id}` }, {
           day_total: Math.abs(timeSpent),
           status: workerState[1],

        }).exec()
        User.update({ 'dates.week_num': m().format('ww') }, {
          $inc: {'dates.$.week_total' : Math.abs(timeSpent), 'dates.$.month_total' : Math.abs(timeSpent) },

       }).exec()
      }
    },
  ).exec()
  }
})

bot.onText(/\/today/, (msg: TelegramBot.Message) => {
  if (msg) {
    /* get from  db duration in hours-total for today*/
   User.findOne({ telegram_id: msg.from.id }, (err, usr, doc) => {
     if (err) {
       console.error(new Error(err.toString()))
     } else {
       console.info(doc)
       const user = {...usr._doc}
       bot.sendMessage(msg.from.id,
        `@${msg.from.username} time spent .::TODAY::. ${user.day_total}`)
     }
   })
  }
})

bot.onText(/\/week/, (msg: TelegramBot.Message) => {
  if (msg) {

    User.findOne({ telegram_id: msg.from.id }, (err, doc: IUser) => {
      if (err) {
        console.error(err)
      } else {
        let weekHours: number
        let date: any

        for (date of doc.dates) {
          if (date.week_num === parseInt(m().format('ww'), 0)) {
            weekHours = date.week_total
            bot.sendMessage(msg.from.id, `@${msg.from.username} time spent .::WEEK::. ${weekHours}`)
          }
        }
      }
    })
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
