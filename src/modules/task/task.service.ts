import { ObjectId, Types } from 'mongoose';
import { ITaskOccurrencce } from '../task_occurece/task_occurence.interface';
import { ITask } from './task.interface';
import { ISubTask } from '../subtask/subtask.interface';
import { Task } from './task.model';
import { TaskOccurrence } from '../task_occurece/task_occurence.model';
import { Subtask } from '../subtask/subtask.model';
import AppError from '../../error/AppError';
import httpStatus from "http-status";

// Generate task occurrences based on repeat settings
function generateTaskOccurrences(task: ITask): ITaskOccurrencce[] {
    const occurrences: ITaskOccurrencce[] = [];
    const start = new Date(task.start_date);

    for (let i = 0; i < task.repeat_count; i++) {
        const occurrenceDate = new Date(start);

        switch (task.repeat_type) {
            case "daily":
                occurrenceDate.setDate(start.getDate() + i);
                break;
            case "weekly":
                occurrenceDate.setDate(start.getDate() + i * 7);
                break;
            case "monthly":
                occurrenceDate.setMonth(start.getMonth() + i);
                break;
            case "yearly":
                occurrenceDate.setFullYear(start.getFullYear() + i);
                break;
        }

        occurrences.push({
            task: task._id,
            start_datetime: occurrenceDate,
            status: "pending", // default status,
        });
    }

    return occurrences;
}


function generateSubtaskOccurrences(
    subtasks: ISubTask[],
    taskOccurrenceId: ObjectId,
    occurrenceDate: Date
): ISubTask[] {
    const subtaskOccurrences: ISubTask[] = [];

    for (const subtask of subtasks) {
        // If subtask repeats, generate multiple occurrences
        if (subtask.isRepeat && subtask.repeat_type !== "none") {
            for (let i = 0; i < subtask.repeat_count; i++) {
                const subtaskDate = new Date(occurrenceDate);

                switch (subtask.repeat_type) {
                    case "daily":
                        subtaskDate.setDate(occurrenceDate.getDate() + i);
                        break;
                    case "weekly":
                        subtaskDate.setDate(occurrenceDate.getDate() + i * 7);
                        break;
                    case "monthly":
                        subtaskDate.setMonth(occurrenceDate.getMonth() + i);
                        break;
                    case "yearly":
                        subtaskDate.setFullYear(occurrenceDate.getFullYear() + i);
                        break;
                }

                subtaskOccurrences.push({
                    ...subtask,
                    // _id: new Types.ObjectId(), // fresh ID
                    task_occurence: taskOccurrenceId,
                    start_date: subtaskDate
                });
            }
        } else {
            // Non-repeating subtask
            subtaskOccurrences.push({
                ...subtask,
                // _id: new Types.ObjectId(),
                task_occurence: taskOccurrenceId,
                start_date: occurrenceDate
            });
        }
    }

    return subtaskOccurrences;
}


interface IITask {
    subtasks: ISubTask[]
}

async function createTask(payload: IITask, companyId: string, userId: string) {
    const task = await Task.create({ ...payload, company_id: companyId, created: userId });

    const taskObj = task.toObject();

    const occurrences = generateTaskOccurrences(taskObj);

    const taskOccurences = await TaskOccurrence.insertMany(occurrences) as unknown as { _id: ObjectId, start_datetime: Date }[];

    const allSubtaskOccurrences: ISubTask[] = [];

    for (const occ of taskOccurences) {
        const subtasksForOcc = generateSubtaskOccurrences(payload?.subtasks, occ?._id, occ.start_datetime);
        allSubtaskOccurrences.push(...subtasksForOcc);
    }

    await Subtask.insertMany(allSubtaskOccurrences)

    return null;

}

const allTasks = async (companyId: string) => {

    // const occurrences = await TaskOccurrence.aggregate([
    //     // Join with Task collection
    //     {
    //         $lookup: {
    //             from: "tasks",
    //             localField: "task_id",
    //             foreignField: "_id",
    //             as: "task",
    //         },
    //     },
    //     { $unwind: "$task" },

    //     // Filter by company_id
    //     {
    //         $match: {
    //             "task.company_id": new Types.ObjectId(companyId),
    //         },
    //     },

    //     // Join with Subtasks
    //     {
    //         $lookup: {
    //             from: "subtasks",
    //             let: { occId: "$_id" },
    //             pipeline: [
    //                 {
    //                     $match: {
    //                         $expr: { $eq: ["$task_occurrence_id", "$$occId"] },
    //                     },
    //                 },
    //             ],
    //             as: "subtasks",
    //         },
    //     },

    //     // Optional: project only required fields
    //     {
    //         $project: {
    //             _id: 1,
    //             start_datetime: 1,
    //             end_datetime: 1,
    //             "task._id": 1,
    //             "task.title": 1,
    //             "task.description": 1,
    //             subtasks: 1,
    //         },
    //     },
    // ]);

    const occurrences = await TaskOccurrence.aggregate([
        // 🔹 Match only occurrences where the parent task belongs to the company
        {
            $lookup: {
                from: "tasks",
                localField: "task",
                foreignField: "_id",
                as: "task",
                pipeline: [
                    { $match: { company_id: new Types.ObjectId(companyId) } },

                    // 🔹 Populate created user
                    {
                        $lookup: {
                            from: "users",
                            localField: "created",
                            foreignField: "_id",
                            as: "created",
                            pipeline: [
                                { $project: { password: 0 } }
                            ]
                        },
                    },
                    { $unwind: { path: "$created", preserveNullAndEmptyArrays: true } },

                    {
                        $lookup: {
                            from: "users",
                            localField: "staff_ids",
                            foreignField: "_id",
                            as: "staff_ids",
                            pipeline: [
                                { $project: { password: 0 } }
                            ]
                        },
                    }

                ],
            },
        },
        { $unwind: "$task" },

        // 🔹 Lookup subtasks for each occurrence
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task_occurence",
                as: "subtasks",
            },
        },
    ]);

    return occurrences;
}

async function updatetask(taskId: string, payload: ITask) {
    const task = await Task.findOne({ _id: new Types.ObjectId(taskId) });

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, 'Task not found');
    }

    const res = await Task.updateOne({ _id: new Types.ObjectId(taskId) }, payload)
    return res;
}

export const taskService = {
    createTask,
    allTasks,
    updatetask
}