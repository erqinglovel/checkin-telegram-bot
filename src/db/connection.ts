import mongoose from 'mongoose'

const DB_URI: string = 'mongodb+srv://master_:benis30@checkinbotcluster0-6xftm.azure.mongodb.net/test?retryWrites=true'

mongoose.connect(`${DB_URI}`)

export const db = mongoose.connection
db.on('error', (error) => {
    console.error(new Error(error))
})
