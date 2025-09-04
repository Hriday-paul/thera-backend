import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { userService } from "./user.service";
import { IIPatient, IIStaf, IUser } from "./user.interface";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status'
import config from "../../config";
import { User } from "./user.models";
import { Types } from "mongoose";
import AppError from "../../error/AppError";
import path from "path";
import { sendEmail } from "../../utils/mailSender";
import fs from 'fs';

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

const deletePatient: RequestHandler<{ id: string }, {}, { status: boolean }> = catchAsync(async (req, res) => {
    const result = await userService.deletePatient(req.params.id, req?.user?._id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient Deleted successfully',
        data: result,
    });
})


//create staff
const add_new_staff = catchAsync(async (req: Request<{}, {}, IIStaf>, res: Response) => {

    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    const user = await userService.add_new_staff(req.body, image || "", req?.user?._id);

    const otpEmailPath = path.join(
        __dirname,
        // '../../public/view/otp_mail.html',
        '../../public/view/new_account.html',
    );

    if (user) {
        sendEmail(
            user?.email,
            'New account created',
            fs
                .readFileSync(otpEmailPath, 'utf8')
                .replace('{{email}}', user?.email)
                .replace('{{role}}', user?.role)
                .replace('{{password}}', req.body?.password)
                .replace('{{link}}', config.staff_client_url + "/auth/login")
        );
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Staff created successfully',
        data: { user },
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

//as a staff get my company another staffs;
const staf_CompanyStaffs = catchAsync(async (req: Request, res: Response) => {

    const user = await User.findOne({ _id: new Types.ObjectId(req?.user?._id), role: "staf" });

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

    const result = await userService.staffs(user?.staf_company_id as unknown as string);

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

    const user = await userService.add_new_Patient(req.body, image || "", req?.user?._id);

    // let otptoken;

    // if (!result?.isverified) {
    //     otptoken = await otpServices.resendOtp(result?.email);
    // }

    const otpEmailPath = path.join(
        __dirname,
        // '../../public/view/otp_mail.html',
        '../../public/view/new_account.html',
    );

    if (user) {
        sendEmail(
            user?.email,
            'New account created',
            fs
                .readFileSync(otpEmailPath, 'utf8')
                .replace('{{email}}', user?.email)
                .replace('{{role}}', user?.role)
                .replace('{{password}}', req.body?.password)
                .replace('{{link}}', config.patient_client_url + "/auth/login")
        );
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Patient created successfully',
        data: { user },
    });
})

export const userController = {
    updateProfile,
    getMyProfile,
    update_user_status,
    deletePatient,
    all_users,
    add_new_staff,
    staffs,
    staf_CompanyStaffs,
    add_new_Patient
}