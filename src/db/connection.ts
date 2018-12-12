import mongoose from 'mongoose'

const DB_URI: string = 'mongodb+srv://master_:dtTlk8OCkAAK79Gy@cluster0-wfcpc.gcp.mongodb.net/test?retryWrites=true'

mongoose.connect(`${DB_URI}`, { useNewUrlParser: true })

export const db = mongoose.connection
db.on('error', (error) => {
    console.error(new Error(error))
})
