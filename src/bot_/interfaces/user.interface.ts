import { Moment } from 'moment'

export interface IUser {
    day_total: number
    reg_date: Moment
    telegram_id: number
    working_start: number,
    username: string
    status: string,
    dates: object[],
}
