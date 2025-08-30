import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { appoinmentsService } from "./appoinments.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import AppError from "../../error/AppError";
import { User } from "../user/user.models";
import { Types } from "mongoose";

const createAppointment = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.createAppointment(req?.user?._id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New appoinment created successfully',
        data: result,
    });
})

const updateAppointment = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.updateAppointment(req.body?.appointment, req.body, req?.params?.id, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment updated successfully',
        data: result,
    });
})

const createAppointmentForStaff = catchAsync(async (req: Request, res: Response) => {

    const staff = await User.findById(req?.user?._id);

    if (!staff) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (!staff?.staf_company_id) {
        throw new AppError(httpStatus.NOT_FOUND, "Staff company not exist found")
    }

    const result = await appoinmentsService.createAppointment(staff?.staf_company_id as unknown as string, req.body);

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

const getFreeStaff: RequestHandler<{}, {}, {}, { date: string; time: string }> = catchAsync(async (req, res: Response) => {

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

const as_a_staff_getFreeStaffMyCompany: RequestHandler<{}, {}, {}, { date: string; time: string }> = catchAsync(async (req, res: Response) => {

    const { date, time } = req.query;

    if (!isString(date) || !isString(time)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Query is invalid');
    }

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

    const result = await appoinmentsService.getFreeStaff(date, time, user?.staf_company_id as unknown as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Free staffs retrive successfully',
        data: result,
    });
})


const allAppointments_byCompany_WithStaffStatus = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.allAppointments_byCompany_WithStaffStatus(req?.user?._id, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinments retrived successfully',
        data: result,
    });
});

const allAppointments_bystaff_WithStaffStatus = catchAsync(async (req: Request, res: Response) => {


    const result = await appoinmentsService.allAppointments_byStaff_WithStaffStatus(req?.user?._id, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinments retrived successfully',
        data: result,
    });
});

const allAppointments_byPatient_WithStaffStatus = catchAsync(async (req: Request, res: Response) => {


    const result = await appoinmentsService.allAppointments_byPatient_WithStaffStatus(req?.user?._id, req.query);

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
const markStaffUnavailable = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.markStaffUnavailable(req?.user?._id, req?.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff unaivalable successfully',
        data: result,
    });
})

const updateStatusOccurence = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.updateStatusOccurence(req?.body?.occurenceId, req?.body?.status, req?.user?._id);

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
const allAppoinments_my_patient_profile = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.allAppoinments_By_patient(req?.user?._id, req?.query);

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
const allAppoinments_staff_profile = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.allAppoinments_By_staff(req?.user?._id, req?.query);

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
const getMonthlyAppointmentStats_by_staff = catchAsync(async (req: Request, res: Response) => {

    req.query.staff = req?.user?._id;

    const result = await appoinmentsService.getMonthlyAppointmentStats(req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment stats retrived successfully',
        data: result,
    });
})
const getMonthlyAppointmentStats_by_patient = catchAsync(async (req: Request, res: Response) => {

    req.query.patient = req?.user?._id;

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

const appoinmentChartByStaff = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.appoinmentChartByStaff(req?.user?._id, req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment chart data retrived successfully',
        data: result,
    });
})
const appoinmentChartByPatient = catchAsync(async (req: Request, res: Response) => {

    const result = await appoinmentsService.appoinmentChartByPatient(req?.user?._id, req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment chart data retrived successfully',
        data: result,
    });
})

export const appoinmentControler = {
    createAppointment,
    updateAppointment,
    createAppointmentForStaff,
    getFreeStaff,
    as_a_staff_getFreeStaffMyCompany,
    allAppointments_byCompany_WithStaffStatus,
    allAppointments_bystaff_WithStaffStatus,
    allAppointments_byPatient_WithStaffStatus,
    sendNotificationReminder,
    updateStatusOccurence,
    markStaffUnavailable,
    allAppoinments_By_patient,
    allAppoinments_By_staff,
    allAppoinments_my_patient_profile,
    allAppoinments_staff_profile,
    getMonthlyAppointmentStats,
    getMonthlyAppointmentStats_by_staff,
    getMonthlyAppointmentStats_by_patient,
    appoinmentChart,
    appoinmentChartByStaff,
    appoinmentChartByPatient
}