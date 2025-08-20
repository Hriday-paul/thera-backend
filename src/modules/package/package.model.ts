import { Model, model, Schema } from 'mongoose';
import { IPackage } from './package.interface';

export interface IPackageModel extends Model<IPackage> { }

const PackageSchema = new Schema<IPackage>(
    {
        title: { type: String, required : true, enum : ["Free", "Standard"] },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        features: { type: [String] },
        duration_day: {
            type: Number,
            required: true,
            min: 1,
        },
        isDeleted: { type: Boolean, default: false },
    },
    {
        _id: true,
        timestamps: true,
    },
);

const Package = model<IPackage, IPackageModel>('packages', PackageSchema);

export default Package;
