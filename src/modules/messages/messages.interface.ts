import { Model, ObjectId } from 'mongoose';

export interface IMessages {
  _id?: ObjectId;
  id?: string;
  text?: string; 
  file?: {
    key: string;
    url: string;
    type : "image" | "document"
  }[];
  type : "text" | "file"
  seen: boolean;
  chat: ObjectId;
  sender: ObjectId;
  receiver: ObjectId;
}

export type IMessagesModel = Model<IMessages, Record<string, unknown>>;
