import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import Chat from './chat.models';
import { IChat } from './chat.interface';
import Message from '../messages/messages.models';
import { User } from '../user/user.models';
import mongoose from 'mongoose';

// Create chat
const createChat = async (payload: IChat) => {
  const user1 = await User.findById(payload?.participants[0]);

  if (!user1) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid user');
  }

  const user2 = await User.findById(payload?.participants[1]);

  if (!user2) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid user');
  }

  const alreadyExists = await Chat.findOne({
    participants: { $all: payload.participants },
  }).populate(['participants']);

  if (alreadyExists) {
    return alreadyExists;
  }

  const result = Chat.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat creation failed');
  }
  return result;
};

// Get my chat list
const getMyChatList = async (userId: string, searchText?: string) => {

  const searchTerm = searchText ?? ""

  const chats = await Chat.find({
    participants: { $all: userId },
  }).populate({
    path: 'participants',
    select: 'email name role _id image',
    // match: { _id: { $ne: userId } },
    match: {
      _id: { $ne: userId }, // exclude yourself
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    },
  });

  if (!chats) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat list not found');
  }

  const data = [];
  for (const chatItem of chats) {
    const chatId = chatItem?._id;

    if (chatItem?.participants?.length <= 0) {
      break;
    }

    // Find the latest message in the chat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message: any = await Message.findOne({ chat: chatId }).sort({
      updatedAt: -1,
    });

    const unreadMessageCount = await Message.countDocuments({
      chat: chatId,
      seen: false,
      sender: { $ne: userId },
    });

    if (message) {
      data.push({ chat: chatItem, message: message, unreadMessageCount });
    }
  }
  data.sort((a, b) => {
    const dateA = (a.message && a.message.createdAt) || 0;
    const dateB = (b.message && b.message.createdAt) || 0;
    return dateB - dateA;
  });

  return data;
};

// Get chat by ID
const getChatById = async (id: string) => {
  const result = await Chat.findById(id).populate({
    path: 'participants',
    select: 'name email image role _id phoneNumber ',
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
  }
  return result;
};

// Update chat list
const updateChatList = async (id: string, payload: Partial<IChat>) => {
  const result = await Chat.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
  }
  return result;
};

// Delete chat list
const deleteChatList = async (id: string) => {
  const result = await Chat.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
  }
  return result;
};

const allUserToMyCompanyNotInChat = async (companyId: string, query: Record<string, any>) => {
  const companyObjectId = new mongoose.Types.ObjectId(companyId);

  const { role, searchTerm } = query;

  const matchConditions: any = {
    isDeleted: false,
    isDisable: false,
    $or: [
      { staf_company_id: companyObjectId },
      { patient_company_id: companyObjectId }
    ]
  };

  // Add role filter if provided
  if (role) {
    matchConditions.role = role;
  }

  // Add search filter if provided
  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    matchConditions.$and = [
      {
        $or: [
          { name: regex },
          { email: regex }
        ]
      }
    ];
  }

  const users = await User.aggregate([
    { $match: matchConditions },

    // Lookup existing chats where company is a participant
    {
      $lookup: {
        from: "chats",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: [companyObjectId, "$participants"] },
                  { $in: ["$$userId", "$participants"] }
                ]
              }
            }
          }
        ],
        as: "existingChat"
      }
    },

    // Only users without a chat with this company
    {
      $match: {
        existingChat: { $size: 0 }
      }
    },

    // Exclude sensitive fields
    {
      $project: {
        password: 0,
        existingChat: 0,
        fcmToken: 0,
        verification: 0
      }
    }
  ]);

  return users;
};

export const chatService = {
  createChat,
  getMyChatList,
  getChatById,
  updateChatList,
  deleteChatList,
  allUserToMyCompanyNotInChat
};
