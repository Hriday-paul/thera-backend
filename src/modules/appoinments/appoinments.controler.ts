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

const updateStatusOccurence = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.updateStatusOccurence(req?.body?.occurenceId, req?.body?.status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment status updated successfully',
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

const allAppoinments_By_staff = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.allAppoinments_By_staff(req?.params?.id, req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinments retrived successfully',
        data: result,
    });
})

const getMonthlyAppointmentStats = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.getMonthlyAppointmentStats(req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment stats retrived successfully',
        data: result,
    });
})

const appoinmentChart = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.appoinmentChart(req?.user?._id, req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment chart data retrived successfully',
        data: result,
    });
})

export const appoinmentControler = {
    createAppointment,
    getFreeStaff,
    allAppointments_byCompany_WithStaffStatus,
    sendNotificationReminder,
    updateStatusOccurence,
    allAppoinments_By_patient,
    allAppoinments_By_staff,
    getMonthlyAppointmentStats,
    appoinmentChart
}