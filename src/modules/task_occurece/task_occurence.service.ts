import { Types } from "mongoose";
import { Subtask } from "../subtask/subtask.model";
import { ITaskOccurrencce } from "./task_occurence.interface";
import { TaskOccurrence } from "./task_occurence.model";

async function deletetaskOccurence(occurenceId: string) {
    const res = await TaskOccurrence.deleteOne({ _id: occurenceId })
    await Subtask.deleteMany({ task_occurence: occurenceId })
    return res;
}
async function updatetaskOccurence(occurenceId: string, payload: ITaskOccurrencce) {
    const taskoccurence = await TaskOccurrence.findOne({ _id: new Types.ObjectId(occurenceId) });

    const res = await TaskOccurrence.updateOne({ _id: new Types.ObjectId(occurenceId) }, payload)
    return res;
}

export const Task_occurence_service = {
    deletetaskOccurence,
    updatetaskOccurence
}