import { Types } from "mongoose";



export interface ICaseFile {
    name: string;
    file_id : string,
    patient : Types.ObjectId,
    intake_date_time : Date,
    assign_stafs: Types.ObjectId[],
    isClosed : boolean,
    isDeleted : boolean
}