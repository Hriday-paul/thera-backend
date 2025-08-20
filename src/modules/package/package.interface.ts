import { Types } from "mongoose";

export interface IPackage {
    _id: Types.ObjectId;
    title: string;
    description: string,
    duration_day: number
    price: number;
    features : string[]
    isDeleted ?: boolean
}