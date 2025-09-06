/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { INotification } from "./notification.inerface";
import Notification from "./notification.model";
import QueryBuilder from "../../builder/QueryBuilder";

const getNotificationFromDb = async (receiverId: string, query: Record<string, any>) => {
  const result = new QueryBuilder(Notification.find({ receiver: receiverId }), query)
    .search(["title", "message"])
    .sort()

  const data: any = await result.modelQuery;
  return data;
};
const getNotificationByDateGroup = async (receiverId: string, query: Record<string, any>) => {
  const searchTerm = query?.searchTerm || "";
  const regex = new RegExp(searchTerm, "i");

  const notifications = await Notification.aggregate([
    {
      $match: {
        receiver: new Types.ObjectId(receiverId),
        $or: [
          { title: regex },
          { message: regex }
        ]
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        notifications: { $push: "$$ROOT" }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  return notifications;
};

const updateNotification = async (
  id: string,
  payload: Partial<INotification>
) => {
  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const makeMeRead = async (id: string, user: string) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, receiver: user },
    { isRead: true },
    {
      new: true,
    }
  );
  return result;
};

const makeReadAll = async (user: string) => {
  const result = await Notification.updateMany(
    { receiver: user },
    { isRead: true },
  );
  return result;
};

const unreadNotificationCount = async (id: string) => {
  const result = await Notification.countDocuments({ receiver: new Types.ObjectId(id), isRead: false });
  return result;
};

const deleteNotification = async (id: string) => {
  const result = await Notification.deleteOne({ _id: id });
  return result;
};

export const notificationServices = {
  getNotificationFromDb,
  updateNotification,
  makeMeRead,
  makeReadAll,
  unreadNotificationCount,
  deleteNotification,
  getNotificationByDateGroup
};
