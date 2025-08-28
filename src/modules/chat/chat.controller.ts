import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { chatService } from './chat.service';
import { User } from '../user/user.models';
import { Types } from 'mongoose';
import AppError from '../../error/AppError';
import httpStatus from "http-status";

const createChat = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.createChat(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat created successfully',
    data: chat,
  });
});

const getMyChatList = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getMyChatList(req.user._id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat retrieved successfully',
    data: result,
  });
});

const getChatById = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getChatById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat retrieved successfully',
    data: result,
  });
});

const updateChat = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.updateChatList(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat updated successfully',
    data: result,
  });
});

const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.deleteChatList(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat deleted successfully',
    data: result,
  });
});

const allUserToMyCompanyNotInChat = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.allUserToMyCompanyNotInChat(req?.user?._id, req?.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrived successfully',
    data: result,
  });

});
const allCompaniesNotInChat_for_admin = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.allCompaniesNotInChat_for_admin(req?.user?._id, req?.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrived successfully',
    data: result,
  });
});

const allUserToMyCompanyNotInChat_asStaff = catchAsync(async (req: Request, res: Response) => {

  const result = await chatService.allStaffPatientToMyCompanyNotInChat_for_staff(req?.user?._id, req?.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrived successfully',
    data: result,
  });
});


const allUserToMyCompanyNotInChat_for_patient = catchAsync(async (req: Request, res: Response) => {

  const result = await chatService.allUserToMyCompanyNotInChat_for_patient(req?.user?._id, req?.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrived successfully',
    data: result,
  });
});

export const chatController = {
  createChat,
  getMyChatList,
  getChatById,
  updateChat,
  deleteChat,
  allUserToMyCompanyNotInChat,
  allCompaniesNotInChat_for_admin,
  allUserToMyCompanyNotInChat_asStaff,
  allUserToMyCompanyNotInChat_for_patient
};
