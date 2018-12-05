import * as mongoose from 'mongoose'

const DB_URI: string = 'mongodb+srv://master_:benis30@checkinbotcluster0-6xftm.azure.mongodb.net/test?retryWrites=true'

export const connection = mongoose.connect(`${DB_URI}`).then(
    () => {
        console.info(`Connection is established`)
    },
    (error) => {
        console.error(new Error(error))
    },
)
