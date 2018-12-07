import mongoose from 'mongoose'

export const dateSchema = new mongoose.Schema({
    dates: Object,
})

export const Dates = mongoose.model('date', dateSchema)
