import mongoose from 'mongoose'

const DB_URI: string = 'mongodb+srv://master_:dtTlk8OCkAAK79Gy@cluster0-wfcpc.gcp.mongodb.net/test?retryWrites=true'

mongoose.connect(`${DB_URI}`, { useNewUrlParser: true })

export const db = mongoose.connection

db.on('connected', () => {
    console.info('Connected to DB')
})

db.on('disconnected',  () => {
    console.info('Mongoose default connection disconnected')
  })

db.on('error', (error) => {
    console.error(new Error(error))
})
