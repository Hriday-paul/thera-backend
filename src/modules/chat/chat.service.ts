import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import Chat from './chat.models';
import { IChat } from './chat.interface';
import Message from '../messages/messages.models';
import { User } from '../user/user.models';
import mongoose, { Types } from 'mongoose';
import { ICompany, IUser } from '../user/user.interface';

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

const allCompaniesNotInChat_for_admin = async (adminId: string, query: Record<string, any>) => {

  const adminObjId = new mongoose.Types.ObjectId(adminId);

  const { role, searchTerm } = query;

  const matchConditions: any = {
    isDeleted: false,
    isDisable: false,
    role: "company"
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
                  { $in: [adminObjId, "$participants"] },
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

interface IIUser extends Omit<IUser, "patient_company_id"> {
  patient_company_id: {
    _id: string
    company: ICompany
  }
}

const allUserToMyCompanyNotInChat_for_patient = async (patientId: string, query: Record<string, any>) => {

  const user = await User.findOne({ _id: new Types.ObjectId(patientId), role: "patient" }).populate({
    path: "patient_company_id", populate: {
      path: 'company',
    }
  }) as unknown as IIUser;

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found',
    );
  }

  if (!user?.patient_company_id) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Company not found',
    );
  };

  const allow_see_staffs = user?.patient_company_id?.company?.automations?.chat?.patient?.allow_see_staffs;

  if (!allow_see_staffs) {
    return []
  }

  const companyObjectId = new mongoose.Types.ObjectId(user?.patient_company_id?._id);

  const { searchTerm } = query;

  const matchConditions: any = {
    isDeleted: false,
    isDisable: false,
    staf_company_id: companyObjectId,
    role: "staf",
  };

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

interface IIStafUser extends Omit<IUser, "staf_company_id"> {
  staf_company_id: {
    _id: string
    company: ICompany
  }
}

const allStaffPatientToMyCompanyNotInChat_for_staff = async (staffId: string, query: Record<string, any>) => {

  const user = await User.findOne({ _id: new Types.ObjectId(staffId), role: "staf" }).populate({
    path: "staf_company_id", populate: {
      path: 'company',
    }
  }) as unknown as IIStafUser;

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found',
    );
  }

  if (!user?.staf_company_id) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Company not found',
    );
  };

  const allow_see_staffs = user?.staf_company_id?.company?.automations?.chat?.staff?.allow_chat_with_staff;

  const allow_see_patient = user?.staf_company_id?.company?.automations?.chat?.staff?.allow_see_patient_list;

  const companyObjectId = new mongoose.Types.ObjectId(user?.staf_company_id?._id);

  const { role, searchTerm } = query;

  const conditionsArray: any[] = [];

  // Push conditions only if allowed
  if (allow_see_staffs) {
    conditionsArray.push({ staf_company_id: companyObjectId });
  }

  if (allow_see_patient) {
    conditionsArray.push({ patient_company_id: companyObjectId });
  }

  // If no conditions allowed → return empty array early
  if (conditionsArray.length === 0) {
    return [];
  }

  const matchConditions: any = {
    isDeleted: false,
    isDisable: false,
    $or: conditionsArray
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
  allUserToMyCompanyNotInChat,
  allCompaniesNotInChat_for_admin,
  allUserToMyCompanyNotInChat_for_patient,
  allStaffPatientToMyCompanyNotInChat_for_staff
};
