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

//all patients
const allPatientsByCompany = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.allPatientsByCompany(req?.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all patients retrived successfully',
        data: result,
    });
});

//all patients
const patientsListsWithAppoinmentHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.patientsListsWithAppoinmentHistory(req?.user?._id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all patients retrived successfully',
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

//assign new staff to patient
const assignNewStaffToPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.assignNewStaffToPatient(req?.params?.id, req.body?.person);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New staff assigned to a patient',
        data: result,
    });
});

//assign new staff to patient
const editBillingDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.editBillingDetails(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Billing details updated to patient',
        data: result,
    });
});

//add new insurance to patient
const addInsurance = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.addInsurance(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New Insurance added to a patient',
        data: result,
    });
});

//edit insurance to patient
const editInsurance = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.editInsurance(req?.params?.id, req.body?.insurance, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Insurance updated to this patient',
        data: result,
    });
});

//delete insurances
const deleteInsurance = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.deleteInsurance(req?.params?.id, req.body?.insurance);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Insurance deleted successfully to this patient',
        data: result,
    });
});

export const PatientController = {
    patientprofile,
    allPatientsByCompany,
    patientsListsWithAppoinmentHistory,
    addFamilyGroup,
    addNewPersonToFamily,
    updatePersonInFamily,
    deletePersonFromFamily,
    addEmergencyPerson,
    updateEmergencyPerson,
    deleteEmergencyPerson,
    deleteAsignStaffs,
    assignNewStaffToPatient,

    editBillingDetails,
    addInsurance,
    editInsurance,
    deleteInsurance
}