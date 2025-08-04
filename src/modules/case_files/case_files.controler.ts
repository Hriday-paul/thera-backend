import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CaseFileService } from "./case_files.service";
import sendResponse from "../../utils/sendResponse";

const createcaseFile = catchAsync(async (req: Request, res: Response) => {

    const result = await CaseFileService.createcaseFile(req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Case file create successfully',
        data: result,
    });
});

const CaseFilesByPatient = catchAsync(async (req: Request, res: Response) => {

    const result = await CaseFileService.CaseFilesByPatient(req.params.id, req.query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Case file retrived successfully',
        data: result,
    });
});

const updateCaseFileStatus = catchAsync(async (req: Request, res: Response) => {

    const result = await CaseFileService.updateCaseFileStatus(req.params.id, req.body.status);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Case file status updated successfully',
        data: result,
    });
});

export const caseFileControler = {
    createcaseFile,
    CaseFilesByPatient,
    updateCaseFileStatus
}