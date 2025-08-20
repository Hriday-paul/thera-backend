import { ISubTask } from "./subtask.interface";
import { Subtask } from "./subtask.model";

async function addSubTask(payload: ISubTask) {
    const res = await Subtask.insertOne(payload)
    return res;
}

async function deleteSubtask(subtaskId: string) {
    const res = await Subtask.deleteOne({ _id: subtaskId })
    return res;
}

export const subtaskService = {
    addSubTask,
    deleteSubtask
}