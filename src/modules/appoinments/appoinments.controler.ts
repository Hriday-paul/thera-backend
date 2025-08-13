import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { appoinmentsService } from "./appoinments.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import AppError from "../../error/AppError";

const createAppointment = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.createAppointment(req?.user?._id, req.body);

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

const allAppointments_byCompany_WithStaffStatus = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.allAppointments_byCompany_WithStaffStatus(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinments retrived successfully',
        data: result,
    });
})

const sendNotificationReminder = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.sendNotificationReminder(req?.body?.occurenceId, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reminder sent successfully',
        data: result,
    });
})

const cancelOccurrence = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.cancelOccurrence(req?.body?.occurenceId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment canceled successfully',
        data: result,
    });
})

const allAppoinments_By_patient = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.allAppoinments_By_patient(req?.params?.id, req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinments retrived successfully',
        data: result,
    });
})

export const appoinmentControler = {
    createAppointment,
    getFreeStaff,
    allAppointments_byCompany_WithStaffStatus,
    sendNotificationReminder,
    cancelOccurrence,
    allAppoinments_By_patient
}