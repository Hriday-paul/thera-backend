import { model, Schema } from 'mongoose';
import { IActivePackage } from './active_package.interface';


const Active_Package_Schema = new Schema<IActivePackage>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        last_purchase_package: {
            type: Schema.Types.ObjectId,
            ref: "packages"
        },
        expiredAt: {
            type: Date,
            default : new Date()
        }
    },
    {
        timestamps: true,
    },
);

const Active_Package = model<IActivePackage>('active_packages', Active_Package_Schema);

export default Active_Package;
