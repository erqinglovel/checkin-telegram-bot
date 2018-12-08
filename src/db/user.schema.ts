import mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
    dates: Array,
    day_total: Number,
    reg_date: String,
    telegram_id: {
        index: {
            unique: true,
        },
        type: Number,
    },
    username: String,
})

export const User = mongoose.model('user', userSchema)
