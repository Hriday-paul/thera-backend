import { Types } from "mongoose";

export interface IActivePackage {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    last_purchase_package : Types.ObjectId,
    expiredAt: Date,
}