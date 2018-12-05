import TelegramBot from 'node-telegram-bot-api'

const token = process.env.TG_TOKEN || '716071100:AAHUl79kfpuGGniwfKmi_dJ0qr0mW9TML-c'

console.warn(`
  hola world i am linted on precommit hook xD
  telegram token: ${token}
`,
)

const bot = new TelegramBot(token, { polling: true})

interface INote {
  username: string
  uid: number
  text: string
  time: string
}

const notes: INote[] = []

bot.onText(/\/echo (.+)/, (msg: TelegramBot.Message, match: RegExpExecArray) => {
  if (msg && match) {
    console.log(`Match: ${match} ::::: Msg:`, msg)
    bot.sendMessage(msg.chat.id, `User @${msg.from.username} said ${match[1]}`)
  }
})

bot.onText(/\/Нагадай (.+) в (.+)/, (msg: TelegramBot.Message, match: RegExpExecArray | null) => {

  console.warn(msg.text)

  if (!!msg && !!match) {

    const userId = msg.from.id
    const text = match[1]
    const time = match[2]

    notes.push({ uid: userId, time, text })
    bot.sendMessage(userId, 'Супра! обовʼязково нагадаю при попутному вітрі :)')
  } else if (!match[1]) {
    bot.sendMessage(msg.from.id, 'Не зрозумів')
  } else if (!match[2]) {
    bot.sendMessage(msg.from.id, 'Не зрозумів коли')
  }

})

setInterval( () => {
  for (let i = 0; i < notes.length; i++) {
    const curDate = new Date().getHours() + ':' + new Date().getMinutes()
    if (notes[i].time === curDate) {
      bot.sendMessage(notes[i].uid, 'Братан, не забудь: ' + notes[i].text )
      notes.splice(i, 1)
    }
  }
}, 1000)

import http from 'http'
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.write('Hello World!')
  res.end()
}).listen(4200)

console.warn('listening port 4200')
