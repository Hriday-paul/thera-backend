import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { userService } from "./user.service";
import { IIPatient, IIStaf, IUser } from "./user.interface";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'
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


//create staff
const add_new_staff = catchAsync(async (req: Request<{}, {}, IIStaf>, res: Response) => {

    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    const result = await userService.add_new_staff(req.body, image || "", req?.user?._id);

    // let otptoken;

    // if (!result?.isverified) {
    //     otptoken = await otpServices.resendOtp(result?.email);
    // }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Staff created successfully',
        data: { user: result },
    });
})

//get my staffs;
const staffs = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.staffs(req?.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'my staffs fetched successfully',
        data: result,
    });
});



//create patient
const add_new_Patient = catchAsync(async (req: Request<{}, {}, IIPatient>, res: Response) => {

    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    const result = await userService.add_new_Patient(req.body, image || "", req?.user?._id);

    // let otptoken;

    // if (!result?.isverified) {
    //     otptoken = await otpServices.resendOtp(result?.email);
    // }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Patient created successfully',
        data: { user: result },
    });
})

export const userController = {
    updateProfile,
    getMyProfile,
    update_user_status,
    all_users,
    add_new_staff,
    staffs,
    add_new_Patient
}