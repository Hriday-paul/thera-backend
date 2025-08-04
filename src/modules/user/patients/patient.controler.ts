import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { PatientService } from "./patients.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"

//get my patient profile
const patientprofile = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.patientprofile(req?.params?.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'patient profile retrived successfully',
        data: result,
    });
});

//add patient family group
const addFamilyGroup = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.addFamilyGroup(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'patient family group created successfully',
        data: result,
    });
});

//add new persons to family group
const addNewPersonToFamily = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.addNewPersonToFamily(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New person added to your family group',
        data: result,
    });
});


//update persons to family group
const updatePersonInFamily = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.updatePersonInFamily(req?.params?.id, req.body?.person, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Person updated to your family group',
        data: result,
    });
});

//delete persons to family group
const deletePersonFromFamily = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.deletePersonFromFamily(req?.params?.id, req.body?.person);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Person deleted to your family group',
        data: result,
    });
});

//add patient emergency contact
const addEmergencyPerson = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.addEmergencyPerson(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New emergency person added successfully',
        data: result,
    });

});
//update patient emergency contact
const updateEmergencyPerson = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.updateEmergencyContact(req?.params?.id, req.body.person, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Emergency person updated successfully',
        data: result,
    });
});

//delete patient emergency contact
const deleteEmergencyPerson = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.deleteEmergencyPerson(req?.params?.id, req.body?.person);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Person deleted to this patient emergency contact',
        data: result,
    });
});


//delete assign staff
const deleteAsignStaffs = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.deleteAsignStaffs(req?.params?.id, req.body?.person);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Person deleted to this patient assign staffs',
        data: result,
    });
});

export const PatientController = {
    patientprofile,
    addFamilyGroup,
    addNewPersonToFamily,
    updatePersonInFamily,
    deletePersonFromFamily,
    addEmergencyPerson,
    updateEmergencyPerson,
    deleteEmergencyPerson,
    deleteAsignStaffs
}