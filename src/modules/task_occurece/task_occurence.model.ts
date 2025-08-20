import { Schema, model } from 'mongoose';
import { ITaskOccurrencce } from './task_occurence.interface';


const TaskOccurrenceSchema = new Schema<ITaskOccurrencce>({
    task: { type: Schema.Types.ObjectId, ref: 'Tasks' },
    start_datetime: {type : Date},
    status: { type: String, default: 'pending', enum : ["pending" , "completed" , "cancelled"] }
});

export const TaskOccurrence = model('taskOccurrences', TaskOccurrenceSchema);