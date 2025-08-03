
import { model, Schema } from 'mongoose';
import { ICaseFile } from './case_files.interface';

const CaseSchema: Schema<ICaseFile> = new Schema(
    {
        name: { type: String, required: true },
        file_id: { type: String, required: true },
        patient: { type: Schema.Types.ObjectId, ref: "users" },
        assign_stafs: [{ type: Schema.Types.ObjectId, ref: "users" }],
        isClosed: { type: Boolean, required: true, default: false },
        isDeleted: { type: Boolean, required: true, default: false },
        intake_date_time: { type: Date, required: true, default: new Date() }
    },
    { timestamps: true },
);

export const CaseFiles = model<ICaseFile>('case_files', CaseSchema);