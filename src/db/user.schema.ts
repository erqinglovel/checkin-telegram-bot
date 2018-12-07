import mongoose from 'mongoose'

export const userSchema = new mongoose.Schema({
    day_total: Number,
    reg_date: String,
    telegram_id: Number,
    username: String,
})

export const User = mongoose.model('user', userSchema)
