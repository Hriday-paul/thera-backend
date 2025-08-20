import { ObjectId } from 'mongoose';

export interface ITask {
    _id : ObjectId,
    title: string,
    priority: "high" | "low" | "medium",
    associated_by: "appointment" | "patient",
    note: string,
    start_date: Date,
    isRepeat : boolean,
    repeat_type: "none" | "daily" | "weekly" | "monthly" | "yearly",
    repeat_count : number,
    staff_ids : ObjectId[],
    company_id : ObjectId,
    created : ObjectId,
    tags : string[]
}