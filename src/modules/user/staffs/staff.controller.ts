import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { StaffService } from "./staff.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"

//staffList
const staffList = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffService.StaffsList(req?.user?._id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All staffs retrived successfully',
        data: result,
    });
});

const staffprofile = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffService.StaffProfile(req?.params?.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff profile retrived successfully',
        data: result,
    });
});

const updateStaff = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffService.updateStaff(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff profile updated successfully',
        data: result,
    });
});

export const StaffsController = {
    staffList,
    staffprofile,
    updateStaff
}