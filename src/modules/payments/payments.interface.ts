import { Model, ObjectId } from 'mongoose';
import { IUser } from '../user/user.interface';

export interface IPayment {
  _id?: ObjectId;
  user: ObjectId | IUser;
  package: ObjectId;
  total_amount: number;
  tranId: string;
  isPaid: boolean;
  isDeleted: boolean;
  startedAt: Date
  expiredAt: Date
}

export type ISubscriptionsModel = Model<IPayment, Record<string, unknown>>;
