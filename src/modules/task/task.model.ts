
import mongoose, { Schema, model } from 'mongoose';
import { ITask } from './task.interface';

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    priority: { type: String, required: true, enum: ["high", "low", "medium"] },
    associated_by: { type: String, required: true, enum: ["appointment", "patient"] },
    note: { type: String },
    start_date: { type: Date },
    isRepeat: { type: Boolean, default: false },
    repeat_type: { type: String, required: true, enum: ["none", "daily", "weekly", "monthly", "yearly"] },
    repeat_count: { type: Number, default: 0 },
    staff_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    created: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    tags: { type: [String] }
});

export const Task = model('tasks', TaskSchema);
