import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { Task_occurence_service } from "./task_occurence.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"

const deletetaskOccurence = catchAsync(async (req: Request, res: Response) => {

    const result = await Task_occurence_service.deletetaskOccurence(req.params?.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task deleted successfully',
        data: result,
    });
});

const updatetaskOccurence = catchAsync(async (req: Request, res: Response) => {

    const result = await Task_occurence_service.updatetaskOccurence(req.params?.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task updated successfully',
        data: result,
    });
})

export const TaskOcurenceControler = {
    deletetaskOccurence,
    updatetaskOccurence
}