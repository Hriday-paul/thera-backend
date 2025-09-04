import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { PatientService } from "./patients.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"
import config from "../../../config";
import { User } from "../user.models";
import AppError from "../../../error/AppError";
import { Types } from "mongoose";
import excelJs from "exceljs"

//get patients profile
const patientprofile = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.patientprofile(req?.params?.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'patient profile retrived successfully',
        data: result,
    });
});

//get patients profile
const myPatientprofile = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.patientprofile(req?.user?._id);
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
const as_a_staf_allPatientsByCompany = catchAsync(async (req: Request, res: Response) => {

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

    const result = await PatientService.allPatientsByCompany(user?.staf_company_id as unknown as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'all patients retrived successfully',
        data: result,
    });
});

const updatePatient = catchAsync(async (req: Request, res: Response) => {

    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    req.body.image = image;

    const result = await PatientService.updatePatient(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient profile updated successfully',
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

//all patients by staff
const byStaff_patientsListsWithAppoinmentHistory = catchAsync(async (req: Request, res: Response) => {

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

    const result = await PatientService.patientsListsWithAppoinmentHistory(user?.staf_company_id.toString(), req.query);

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

const patientStats = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.patientStats(req?.params?.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient stat retrived successfully',
        data: result,
    });
});
const patientStatsForMyProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.patientStats(req?.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient stat retrived successfully',
        data: result,
    });
});
const reportKeyPerformance = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.reportKeyPerformance(req?.user?._id, req?.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient stat retrived successfully',
        data: result,
    });
});
const updatePatientNotificationStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.updatePatientNotificationStatus(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient status updated successfully',
        data: result,
    });
});

const exportPatients = catchAsync(async (req: Request, res: Response) => {


    const patients = await PatientService.allPatientsByCompany(req?.user?._id);

    const workbook = new excelJs.Workbook();
    const workSheet = workbook.addWorksheet("Patients");

    workSheet.columns = [
        { header: "ID", key: "_id" },
        { header: "Title", key: "name_title" },
        { header: "First Name", key: "f_name" },
        { header: "Middle Name", key: "middle_name" },
        { header: "Last Name", key: "last_name" },
        { header: "Preferred Name", key: "preferred_name" },
        { header: "Email", key: "email" },
        { header: "Image", key: "image" },
        { header: "status", key: "status" },
        { header: "Gender", key: "gender" },
        { header: "Sexual Orientation", key: "sexual_orientation" },
        { header: "Date of Birth", key: "date_of_birth" },
        { header: "Country", key: "country" },
        { header: "State", key: "state" },
        { header: "Zip Code", key: "zip_code" },
        { header: "Street", key: "street" },
        { header: "Phone", key: "phone" },
        { header: "Address", key: "address" },
        { header: "SSN", key: "ssn" },
        { header: "Ethnicity", key: "ethnicity" },
        { header: "Marital Status", key: "marital_status" },
        { header: "Religion", key: "religion" },
        { header: "Language", key: "language" },
        { header: "Employment Status", key: "employment_status" },
        { header: "Employer", key: "employer" },
        { header: "Employer Email", key: "employer_email" },
        { header: "Employer Phone", key: "employer_phone" },
        { header: "Assigned Staffs", key: "assign_stafs" },

        // contacts (flatten as string if array of objects)
        { header: "Contacts", key: "contacts" },

        // family group
        { header: "Family Group", key: "familyGroup" },

        // billing
        { header: "Billing Details", key: "billing_details" },

        // legal & directives
        { header: "Legal Date", key: "legal_date" },
        { header: "Living Will", key: "livingWill" },
        { header: "Advance Directives", key: "advanceDirectives" },
        { header: "Has DPOA", key: "hasDPOA" },
        { header: "DPOA Name", key: "dpoaName" },
        { header: "DPOA On File", key: "dpoaOnFile" },
        { header: "DPOA Address", key: "dpoaAddress" },
        { header: "DPOA Phone", key: "dpoaPhone" },
        { header: "Proxy Name", key: "proxyName" },
        { header: "Proxy Address", key: "proxyAddress" },
        { header: "Proxy Email", key: "proxyEmail" },
        { header: "Proxy Phone", key: "proxyPhone" },

        // physician info
        { header: "Clinic Name", key: "clinicName" },
        { header: "Primary Physician", key: "primaryPhysician" },
        { header: "Physician Address", key: "physicianAddress" },
        { header: "Physician Phone", key: "physicianPhone" },
        { header: "Visit Date", key: "visitDate" },

        // health info
        { header: "Chronic Illnesses", key: "chronicIllnesses" },
        { header: "Medications", key: "medications" },
        { header: "Health Care Providers", key: "healthCareProviders" },
        { header: "Medical Diagnoses", key: "medicalDiagnoses" },
        { header: "Date", key: "date" },

        // housing & family info
        { header: "Residence Type", key: "residenceType" },
        { header: "Family Type", key: "familyType" },
        { header: "Residence Ownership", key: "residenceOwnership" },
        { header: "Household Size", key: "householdSize" },
        { header: "Living With", key: "livingWith" },
        { header: "Support Services", key: "supportServices1" },
        { header: "Housing Notes", key: "housingNotes" },

        // ADL (activities of daily living)
        { header: "Light Housekeeping", key: "lightHousekeeping" },
        { header: "Heavy Housekeeping", key: "heavyHousekeeping" },
        { header: "General Shopping", key: "generalShopping" },
        { header: "Own Shopping", key: "ownShopping" },
        { header: "Drives", key: "drives" },
        { header: "Prepare Meal", key: "prepareMeal" },
        { header: "Manage Money", key: "manageMoney" },
        { header: "Use Telephone", key: "useTelephone" },
        { header: "Bathing", key: "bathing" },
        { header: "Toilet Use", key: "toiletUse" },
        { header: "ADL Shopping", key: "adlShopping" },

        // financial
        { header: "Family Income", key: "family_income" },
        { header: "Family Income Type", key: "family_income_type" },
        { header: "Payment Amount", key: "payment_amount" },

        // insurance
        { header: "Has Insurance", key: "hasInsurance" },
        { header: "Insurances", key: "insurances" },

        // preferences
        { header: "Contact Preferences", key: "contactPreferences" },
    ];

    for (let user of patients) {
        const row = { ...user, ...user?.patient }
        workSheet.addRow(row);
    }

    workSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", `attachement; filename=patients.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

});

export const PatientController = {
    patientprofile,
    myPatientprofile,
    updatePatient,
    allPatientsByCompany,
    as_a_staf_allPatientsByCompany,
    patientsListsWithAppoinmentHistory,
    byStaff_patientsListsWithAppoinmentHistory,
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
    deleteInsurance,
    patientStats,
    patientStatsForMyProfile,
    reportKeyPerformance,
    updatePatientNotificationStatus,

    exportPatients
}