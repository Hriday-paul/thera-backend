
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"
import { subtaskService } from "./subtask.service";

const addSubTask = catchAsync(async (req: Request, res: Response) => {

    const result = await subtaskService.addSubTask(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New subtask created successfully',
        data: result,
    });
})
const deleteSubtask = catchAsync(async (req: Request, res: Response) => {

    const result = await subtaskService.deleteSubtask(req.params?.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Subtask deleted successfully',
        data: result,
    });
})

export const subtaskControler = {
    addSubTask,
    deleteSubtask
}