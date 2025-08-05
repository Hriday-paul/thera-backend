import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { StaffService } from "./staff.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"

//delete insurances
const staffList = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffService.StaffsList(req?.user?._id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All staffs retrived successfully',
        data: result,
    });
});

export const StaffsController = {
    staffList
}