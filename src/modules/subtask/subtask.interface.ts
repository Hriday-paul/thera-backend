
import { ObjectId } from 'mongoose';

export interface ISubTask {
    // _id : ObjectId,
    title: string,
    description: string,
    start_date: Date,
    isRepeat : boolean,
    repeat_type: "none" | "daily" | "weekly" | "monthly" | "yearly",
    repeat_count : number,
    task_occurence : ObjectId
}