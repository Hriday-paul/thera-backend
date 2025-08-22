import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { taskService } from "./task.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status"

const createTask = catchAsync(async (req: Request, res: Response) => {

    const result = await taskService.createTask(req.body, req?.user?._id, req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'New task created successfully',
        data: result,
    });
})

const allTasks = catchAsync(async (req: Request, res: Response) => {

    const result = await taskService.allTasks(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All tasks retrived successfully',
        data: result,
    });
})
const allTasksForAStaff = catchAsync(async (req: Request, res: Response) => {

    const result = await taskService.allTasksForAStaff(req?.user?._id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All tasks retrived successfully',
        data: result,
    });
})

const updatetask = catchAsync(async (req: Request, res: Response) => {

    const result = await taskService.updatetask(req.params?.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task updated successfully',
        data: result,
    });
})

export const taskControler = {
    createTask,
    allTasks,
    allTasksForAStaff,
    updatetask
}