import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { appoinmentsService } from "./appoinments.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import AppError from "../../error/AppError";

const createAppointment = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.createAppointment(req?.user?._id, req.body);

    // let otptoken;

    // if (!result?.isverified) {
    //     otptoken = await otpServices.resendOtp(result?.email);
    // }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New appoinment created successfully',
        data: result,
    });
})

function isString(value: any): value is string {
    return typeof value === "string";
}

const getFreeStaff: RequestHandler<
    {},
    {},
    {},
    { date: string; time: string }
> = catchAsync(async (req, res: Response) => {

    const { date, time } = req.query;

    if (!isString(date) || !isString(time)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Query is invalid');
    }

    const result = await appoinmentsService.getFreeStaff(date, time, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Free staffs retrive successfully',
        data: result,
    });
})

export const appoinmentControler = {
    createAppointment,
    getFreeStaff
}