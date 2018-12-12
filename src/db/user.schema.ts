import mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
    dates: [{
        _id: false,
        month_num: Number,
        month_total: Number,
        week_num: Number,
        week_total: Number,
    }],
    day_total: Number,
    reg_date: String,
    status: String,
    telegram_id: {
        index: {
            unique: true,
        },
        type: Number,
    },
    username: String,
    working_start: Number,
})

export const User = mongoose.model('user', userSchema)
