import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { userService } from "./user.service";
import { IUser } from "./user.interface";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'
import { User } from "./user.models";
import AppError from "../../error/AppError";
import config from "../../config";

//get all users
const all_users = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await userService.allUsers(query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users retrive successfully',
        data: result,
    });
})

const updateProfile = catchAsync(async (req: Request<{}, {}, IUser>, res: Response) => {
    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    const result = await userService.updateProfile(req.body, req.user._id, image || '')

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'profile updated successfully',
        data: result,
    });

})

//get my profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getUserById(req?.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'profile fetched successfully',
        data: result,
    });
});

// status update user
const update_user_status: RequestHandler<{ id: string }, {}, { status: boolean }> = catchAsync(async (req, res) => {
    const result = await userService.status_update_user(req.body, req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'status updated successfully',
        data: result,
    });
})


export const userController = {
    updateProfile,
    getMyProfile,
    update_user_status,
    all_users,

}