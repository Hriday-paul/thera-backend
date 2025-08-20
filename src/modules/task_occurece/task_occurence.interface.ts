import { ObjectId } from 'mongoose';

export interface ITaskOccurrencce{
    // _id : ObjectId,
    task : ObjectId,
    start_datetime : Date,
    status : "pending" | "completed" | "cancelled"
}