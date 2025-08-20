import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { companyService } from "./company.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"
import config from "../../../config";

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

const services = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.services(req?.user?._id, req.query);
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
const editService = catchAsync(async (req: Request, res: Response) => {

    const result = await companyService.editService(req?.user?._id, req?.params?.id, req.body);
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

export const companyControler = {
    addCompanyLocation,
    myProfile,
    updateCompany,
    services,
    addNewService,
    editService,
    deleteService,
    locations,
    editLocation,
    deleteLocation,
    updateCompanyAutomation,
    updateCompanyReminderMessage,
    addPatientTag,
    editpatienttags,
    deletepatienttags
}