import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IOrder } from '../order/order.interface';


export interface IPayment {
  _id?: ObjectId;
  user: ObjectId | IUser;
  order: ObjectId | IOrder;
  total_amount: number;
  tranId: string;
  isPaid: boolean;
  isDeleted: boolean;
}

export type ISubscriptionsModel = Model<IPayment, Record<string, unknown>>;
