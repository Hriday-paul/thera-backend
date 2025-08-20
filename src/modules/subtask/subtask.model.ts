import mongoose, { Schema, model } from 'mongoose';
import { ISubTask } from './subtask.interface';

const SubtaskSchema = new Schema<ISubTask>({
    title: { type: String, required: true },
    description: { type: String },
    start_date: { type: Date,  required: true },
    isRepeat: { type: Boolean, default : false },
    repeat_type: { type: String, enum : ["none" , "daily" , "weekly" , "monthly" , "yearly"],  required: true },
    repeat_count: {type : Number,  required: true, default : 0},
    task_occurence: { type: Schema.Types.ObjectId, ref: 'TaskOccurrences',  required: true }
});

export const Subtask = model('subtasks', SubtaskSchema);