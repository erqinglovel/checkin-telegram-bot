import { Moment } from 'moment'

export interface IUser {
    day_total: number
    reg_date: Moment
    telegram_id: number
    username: string
}
