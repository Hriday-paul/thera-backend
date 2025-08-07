
import { ObjectId } from 'mongoose';

export interface IAppoinment {
    _id : ObjectId,
    title: string,
    appoinment_type: "group" | "individual",
    note: string,
    location: string,
    start_date: Date,
    times: Date[],
    repeat_type: "none" | "daily" | "weekly" | "monthly" | "yearly",
    repeat_count : number,
    staff_ids : ObjectId[],
    patient_id : ObjectId
    company_id : ObjectId
}

export interface IOccurrencce{
    appointment : ObjectId,
    start_datetime : Date,
    end_datetime : Date,
    staff_ids : ObjectId[],
    status : "upcoming" | "completed" | "cancelled"
}

export interface IStaffUnavilibility{
    staff_id : ObjectId,
    occurrence_id : ObjectId,
    reason : string
}