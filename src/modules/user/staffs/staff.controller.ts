import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { StaffService } from "./staff.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status"
import config from "../../../config";
import excelJs from "exceljs"
import { IUser } from "../user.interface";
import { otpServices } from "../../otp/otp.service";

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

const myProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await StaffService.StaffProfile(req?.user?._id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your Staff profile retrived successfully',
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

const StaffResetPassowrd = catchAsync(async (req: Request, res: Response) => {
    const result = await otpServices.StaffResetPassowrd(req?.body?.staff);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff Reset Password send successfully',
        data: result,
    });
});

const updateStaff = catchAsync(async (req: Request, res: Response) => {

    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    req.body.image = image;

    const result = await StaffService.updateStaff(req?.params?.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff profile updated successfully',
        data: result,
    });
});

const updateMyStaffProfile = catchAsync(async (req: Request, res: Response) => {

    let image;

    image = req.file?.filename && (config.BASE_URL + '/images/' + req.file.filename);

    req.body.image = image;

    const result = await StaffService.updateStaff(req?.user?._id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Staff profile updated successfully',
        data: result,
    });
});

const exportstaffs = catchAsync(async (req: Request, res: Response) => {

    const staffs = await StaffService.allStaff(req?.user?._id, { limit: 99999999 });

    const workbook = new excelJs.Workbook();
    const workSheet = workbook.addWorksheet("Staffs");

    workSheet.columns = [
        { header: "ID", key: "_id" },
        { header: "Title", key: "name_title" },
        { header: "First Name", key: "f_name" },
        { header: "Middle Name", key: "middle_name" },
        { header: "Last Name", key: "last_name" },
        { header: "Email", key: "email" },
        { header: "Image", key: "image" },
        { header: "status", key: "status" },
        { header: "Preferred Name", key: "preferred_name" },
        { header: "Gender", key: "gender" },
        { header: "Sexual Orientation", key: "sexual_orientation" },
        { header: "Date of Birth", key: "date_of_birth" },
        { header: "Country", key: "country" },
        { header: "State", key: "state" },
        { header: "Zip Code", key: "zip_code" },
        { header: "Street", key: "street" },
        { header: "Phone", key: "phone" },

        // staff-specific
        { header: "Staff Role", key: "staf_role" },
        { header: "Services", key: "services" },
        { header: "Hired Date", key: "hired_date" },
        { header: "Termination Date", key: "termination_date" },
        { header: "Degree Level", key: "degree_level" },
        { header: "Awarding Institution", key: "awarding_institution" },
        { header: "Constructor", key: "contructor" },
        { header: "Exempt Status", key: "exempt_status" },
        { header: "Service Area Zip Code", key: "service_area_zip_code" },
        { header: "Work Location", key: "work_location" },
        { header: "Office Email", key: "office_email" },
        { header: "Office Phone", key: "office_phone" },
        { header: "Identification Type", key: "identification_type" },
        { header: "Licence Number", key: "licence_number" },
        { header: "Social Security Number", key: "social_security_number" },
        { header: "Tax ID", key: "tax_id" },
        { header: "AMA CPT Code", key: "ama_cpt_code" },
        { header: "Provider NPI", key: "provider_npi" },
        { header: "Provider Licence Number", key: "provider_licence_number" },
        { header: "DEA Number", key: "dea_number" },

        // arrays (flatten as string if needed)
        { header: "Work Schedule", key: "work_schedule" },
        { header: "Off Days", key: "offDays" },
    ];

    for (let user of staffs?.data) {
        const row = { ...user, ...user?.staf }
        workSheet.addRow(row);
    }

    workSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", `attachement; filename=staffs.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

});

export const StaffsController = {
    staffList,
    staffprofile,
    updateStaff,
    myProfile,
    updateMyStaffProfile,
    exportstaffs,
    StaffResetPassowrd
}