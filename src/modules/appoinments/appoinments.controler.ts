import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { appoinmentsService } from "./appoinments.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"

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
        data: { user: result },
    });
})

export const appoinmentControler = {
    createAppointment,
}