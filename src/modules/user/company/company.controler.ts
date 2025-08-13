import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { companyService } from "./company.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"

//add new location to company
const addCompanyLocation = catchAsync(async (req: Request, res: Response) => {
    const result = await companyService.addCompanyLocation(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New location added to your company',
        data: result,
    });
});


const myProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await companyService.myProfile(req?.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your company profile retrived successfully',
        data: result,
    });
});

export const companyControler = {
    addCompanyLocation,
    myProfile
}