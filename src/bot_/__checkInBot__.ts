import http from 'http'
import moment from 'moment'
import TelegramBot from 'node-telegram-bot-api'
import { User } from '../db/'
import { IUser } from './interfaces/user.interface'

process.env.TG_TOKEN = '788852038:AAGbV2D2gokg5ZaucTZqBoZUAppwC2xdioo'

const token = process.env.TG_TOKEN
const m = moment
const bot = new TelegramBot(token, { polling: true})
const workerState = ['checkin', 'checkout', 'pending']

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

    bot.sendMessage(msg.from.id,
      `Yo, this is CheckInBot. Check in with \/checkin command.
When you will finish your work,just type \/checkout. Get total time for:
      \n \/today \n \/week \n \/month`)
    User.create({ ...user }, (error: object) => {
      if (error) {
        console.error(error)
        bot.sendMessage(msg.from.id, 'You already registred')
      }
    })
  }
})

bot.onText(/\/checkin/, (msg: TelegramBot.Message) => {
  if (msg) {
    User.findOneAndUpdate({ 'telegram_id': msg.from.id, 'dates.week_num': {$nin: [parseInt(m().format('ww'), 0)]},
  'status': workerState[2]},
    {
      $addToSet: {
        dates: {
          month_num: parseInt(m().format('MM'), 0),
          month_total: 0,
          week_num: parseInt(m().format('ww'), 0),
          week_total: 0,
   }},
   status: workerState[0],
   working_start: m(Date.now()).utcOffset(120).valueOf(),
  }).exec((err) => {
    if (err) {
      bot.sendMessage(msg.from.id, 'You already checkin\'d')
    } else {
      bot.sendMessage(msg.from.id, `@${msg.from.username} checkin at ${m(new Date()).utcOffset(120).format('HH:mm')}`)
    }
  })
    }
})

bot.onText(/\/checkout/, (msg: TelegramBot.Message) => {
  if (msg) {
    User.findOne({ telegram_id: `${msg.from.id}` }, (err, doc: IUser) => {
      if (err) {

        console.error(new Error(err))

      } else {

        const range = m(doc.working_start)
        const timeSpent = range.diff( m(new Date()),  'hours')
        User.update({ telegram_id: `${msg.from.id}` }, {
           day_total: Math.abs(timeSpent),
           status: workerState[2],
          }).exec()

        User.update( {$and: [{'dates.week_num': m().format('ww')}, {'dates.month_num': m().format('MM')}]},
    { $inc: {'dates.$.week_total' : Math.abs(timeSpent)}}).exec(
      User.aggregate([
        [
          {
            $unwind: {
              path: '$dates',
              preserveNullAndEmptyArrays: false,
            },
          }, {
            $group: {
              _id: '$dates.month_num',
              month_total: {
                $sum: '$dates.week_total',
              },
            },
          }, {
            $project: {
              month_total: '$month_total',
              _id: false,
            },
          },
        ],
      ]).exec((error, res) => {
        if (err) {
          bot.sendMessage('285942478', `Error occurred ${error}`)
        } else {
          User.update( {$and: [{'dates.week_num': m().format('ww')}, {'dates.month_num': m().format('MM')}]},
          { 'dates.$.month_total': res[0].month_total }).exec()
          bot.sendMessage(msg.from.id,
            `@${msg.from.username} checkout at ${m(new Date()).utcOffset(120).format('HH:mm')}`)
        }
      } ),
    )
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
          bot.sendMessage(msg.from.id,
            `Something went wrong`)
          console.error(err)
     } else {
       console.info(doc)
       const user = {...usr._doc}
       bot.sendMessage(msg.from.id,
        `@${msg.from.username} time spent .::TODAY::. ${user.day_total}h`)
     }
   })
  }
})

bot.onText(/\/week/, (msg: TelegramBot.Message) => {
  if (msg) {

    User.findOne({ telegram_id: msg.from.id }, (err, doc: IUser) => {
      if (err) {
        bot.sendMessage(msg.from.id,
          `Something went wrong`)
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
    /* get from  db duration */
    User.findOne({ telegram_id: msg.from.id }, (err, doc: IUser) => {
      if (err) {
        bot.sendMessage(msg.from.id,
          `Something went wrong`)
        console.error(err)
      } else {
        let monthHours: number
        let date: any

        for (date of doc.dates) {
          if (date.month_num === parseInt(m().format('MM'), 0)) {
            monthHours = date.month_total
            bot.sendMessage(msg.from.id, `@${msg.from.username} time spent .::MONTH::. ${monthHours}`)
          }
        }
      }
    })
  }
})

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write('Hello World!')
  res.end()
}).listen(4200)

console.warn('listening port 4200')
