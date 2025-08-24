import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { companyService } from "./company.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"
import config from "../../../config";
import { User } from "../user.models";
import { Types } from "mongoose";
import AppError from "../../../error/AppError";

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

const asAStaffmyCompanyProfile = catchAsync(async (req: Request, res: Response) => {

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

    const result = await companyService.myProfile(user?.staf_company_id as unknown as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your company profile retrived successfully',
        data: result,
    });
});

const updateCompany = catchAsync(async (req: Request, res: Response) => {
    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    req.body.image = image

    const result = await companyService.updateCompany(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your company profile updated successfully',
        data: result,
    });
});
const updateCompanyById = catchAsync(async (req: Request, res: Response) => {
    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    req.body.image = image

    const result = await companyService.updateCompany(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your company profile updated successfully',
        data: result,
    });
});

const updateCompanyAutomation = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.updateCompanyAutomation(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your company automation updated successfully',
        data: result,
    });
});

const updateCompanyReminderMessage = catchAsync(async (req: Request, res: Response) => {
    const result = await companyService.updateCompanyReminderMessage(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment reminder message updated successfully',
        data: result,
    });
});
const updateCompanyReminderMessage_by_staff = catchAsync(async (req: Request, res: Response) => {

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

    const result = await companyService.updateCompanyReminderMessage(user?.staf_company_id as unknown as string, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Appoinment reminder message updated successfully',
        data: result,
    });
});

const services = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.services(req?.user?._id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your company services retrived successfully',
        data: result,
    });
});
const servicesByStaff = catchAsync(async (req: Request, res: Response) => {

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

    const result = await companyService.services(user?.staf_company_id as unknown as string, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your company services retrived successfully',
        data: result,
    });
});

const addNewService = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.addNewService(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New service added to your company',
        data: result,
    });
});
const addNewService_by_staff = catchAsync(async (req: Request, res: Response) => {

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

    const result = await companyService.addNewService(user?.staf_company_id as unknown as string, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New service added to your company',
        data: result,
    });
});

const editService = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.editService(req?.user?._id, req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Service updated successfully',
        data: result,
    });
});
const editServiceByStaff = catchAsync(async (req: Request, res: Response) => {

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

    const result = await companyService.editService(user?.staf_company_id as unknown as string, req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Service updated successfully',
        data: result,
    });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.deleteService(req?.user?._id, req?.params?.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Service deleted successfully',
        data: result,
    });
});
const deleteService_byStaff = catchAsync(async (req: Request, res: Response) => {

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

    const result = await companyService.deleteService(user?.staf_company_id as unknown as string, req?.params?.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Service deleted successfully',
        data: result,
    });
});

const locations = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.locations(req?.user?._id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New location added to your company',
        data: result,
    });
});

const editLocation = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.editLocation(req?.user?._id, req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Location updated successfully',
        data: result,
    });
});

const deleteLocation = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.deleteLocation(req?.user?._id, req?.params?.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Location deleted successfully',
        data: result,
    });
});

const addPatientTag = catchAsync(async (req: Request, res: Response) => {
    const result = await companyService.addPatientTag(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tag added to your company',
        data: result,
    });
});

const editpatienttags = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.editpatienttags(req?.user?._id, req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tag updated successfully',
        data: result,
    });
});

const deletepatienttags = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.deletepatienttags(req?.user?._id, req?.params?.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Tag deleted successfully',
        data: result,
    });
});
const reportUserCount = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.reportUserCount(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});
const reportKeyPerformance = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.reportKeyPerformance(req?.user?._id, req?.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});
const gender_stats = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.gendersCountForCompany(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});

const age_stats = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.ageGroupsForCompany(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});

export const companyControler = {
    addCompanyLocation,
    myProfile,
    asAStaffmyCompanyProfile,
    updateCompany,
    updateCompanyById,
    services,
    servicesByStaff,
    addNewService,
    addNewService_by_staff,
    editService,
    editServiceByStaff,
    deleteService,
    deleteService_byStaff,
    locations,
    editLocation,
    deleteLocation,
    updateCompanyAutomation,
    updateCompanyReminderMessage,
    updateCompanyReminderMessage_by_staff,
    addPatientTag,
    editpatienttags,
    deletepatienttags,
    reportUserCount,
    reportKeyPerformance,

    age_stats,
    gender_stats
}