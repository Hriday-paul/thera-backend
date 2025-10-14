import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { adminService } from "./admin.service";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status";
import excelJs from "exceljs"

const statCounts = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.statCounts();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Report retrived successfully',
        data: result,
    });
});

const exportStatCount = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.statCounts();

    const workbook = new excelJs.Workbook();
    const workSheet = workbook.addWorksheet("stats");

    workSheet.columns = [
        { header: "Total Revenue", key: "earning" },
        { header: "Total Companies", key: "company" },
        { header: "Total Subscription", key: "subscribe" },
        { header: "Total Appointment", key: "appointment" },
    ];

    workSheet.addRow(result);

    workSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", `attachement; filename=companies.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

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

const exportCompanies = catchAsync(async (req: Request, res: Response) => {

    const result = await adminService.allCompanies(req?.query);

    const workbook = new excelJs.Workbook();
    const workSheet = workbook.addWorksheet("companies");

    workSheet.columns = [
        { header: "ID", key: "_id" },
        { header: "Organization Name", key: "organization_name" },
        { header: "Site short name", key: "site_short_name" },
        { header: "Legal organization name", key: "legal_organization_name" },
        { header: "Email", key: "email" },
        { header: "Image", key: "image" },
        // { header: "status", key: "status" },
        { header: "Business type", key: "business_type" },
        { header: "Company type", key: "company_type" },
        { header: "Tax type", key: "tax_type" },
        { header: "Tax id", key: "tax_id" },
        { header: "Organization liscence", key: "organization_liscence" },
        { header: "Organization npi", key: "organization_npi" },
        { header: "Facility npi", key: "facility_npi" },
        { header: "Diagnostic code", key: "diagnostic_code" },
        { header: "Pregnancy related services", key: "pregnancy_related_services" },

        // staff-specific
        { header: "Track PQRS measure", key: "track_pqrs_measure" },
        { header: "42 CFR Part2", key: "cfr_part2" },
        { header: "Hide date creation for progress note", key: "hide_date_creation_progress_note" },
        { header: "Required diagnostic code", key: "required_diagnostic_code" },
        { header: "Enable telehealth", key: "enable_telehealth" },
        { header: "Org email", key: "org_email" },
        { header: "Appointment kept", key: "appointment_kept" },

        { header: "Locations", key: "locations" },
        { header: "Services", key: "services" },
        { header: "Currency", key: "currency" },
        { header: "Default billing place", key: "default_billing_place" },
        { header: "Billing Details", key: "billingDetails" },


        { header: "Appointment location in invoice", key: "use_appointment_location" },
        { header: "Auto set telehealth place", key: "use_appointment_location" },

    ];

    for (let user of result?.data) {
        const row = { ...user, ...user?.company }
        workSheet.addRow(row);
    }

    workSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
    });

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", `attachement; filename=companies.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

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
    exportStatCount,
    purchaseChart,
    purchasePieYearly,
    allCompanies,
    exportCompanies,
    companyStats,
    companyappoinmentStats
}