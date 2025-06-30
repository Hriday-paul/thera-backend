import { Model, ObjectId } from 'mongoose';

export interface IOrder {
    user: ObjectId;
    address : string,
    contact : string,
    isPaid : boolean,
    products : {id : ObjectId, quantity : number}[],
    total_amount : number,
    isDeleted : boolean,
    tranId : string,
    status : "pending" | "complete" | "cancel"
}