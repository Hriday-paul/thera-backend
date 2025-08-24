import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { adminService } from "./admin.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";

const statCounts = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.statCounts();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});
const purchaseChart = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.purchaseChart(req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});
const purchasePieYearly = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.purchasePieYearly(req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});

const allCompanies = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.allCompanies(req?.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Companies retrived successfully',
        data: result,
    });
});
const companyStats = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.companyStats(req?.params?.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Companies stats retrived successfully',
        data: result,
    });
});

const companyappoinmentStats = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.companyappoinmentStats(req?.params?.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Companies stats retrived successfully',
        data: result,
    });
});

export const adminControler = {
    statCounts,
    purchaseChart,
    purchasePieYearly,
    allCompanies,
    companyStats,
    companyappoinmentStats
}