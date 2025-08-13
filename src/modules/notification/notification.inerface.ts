import { Types } from "mongoose";




export interface INotification {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  receiverEmail: string;
  receiverRole: string;
  message: string;
  fcmToken?: string;
  type?: "message" | "accept" | "reject" | "cancelled" | "payment" | "product";
  title: string;
  isRead?: boolean;
  link?: string;
}

// export interface ISendNotification {
//   sender: string | undefined;
//   receiver: string | undefined;
//   receiverEmail: string | undefined;
//   receiverRole: string | undefined;
//   title: string;
//   link: string | null;
//   message: string;
//   type?: "hireRequest" | "accept" | "reject" | "cancelled" | "payment";
// }
