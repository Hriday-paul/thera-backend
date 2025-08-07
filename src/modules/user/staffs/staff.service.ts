import QueryBuilder from "../../../builder/QueryBuilder";
import AppError from "../../../error/AppError";
import { IIStaf } from "../user.interface";
import { Staf, User } from "../user.models";
import httpStatus from "http-status";

const StaffsList = async (company: string, query: Record<string, any>) => {

    const staffModel = new QueryBuilder(User.find({ role: "staf", staf_company_id: company, isDeleted: false }).select("-password").populate({
        path: "staf",
        select: "-_id"
    }), query)
        .search(["name", "email"])
        .filter()
        .sort()
        .paginate();

    const data: any = await staffModel.modelQuery;
    const meta = await staffModel.countTotal();

    return { meta, data };
};

const StaffProfile = async (staffId: string) => {

    const res = await User.findOne({ _id: staffId, isDeleted: false }).select("-password").populate({
        path: "staf",
        select: "-_id"
    });

    //check StaffProfile is exist or not
    if (!res) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Staff not found',
        );
    }

    return res;
};

const updateStaff = async (staffId: string, payload: IIStaf) => {

    const user = await User.findByIdAndUpdate({ _id: staffId }, { name: payload?.f_name + " " + payload?.middle_name + " " + payload?.last_name, image: payload?.image ?? undefined }, { new: true })

    //check StaffProfile is exist or not
    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Staff not found',
        );
    }

    if (!user?.staf) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Staff not found',
        );
    }

    const {_id, ...clonePayload} = payload

    const updatedStaff = await Staf.updateOne({ _id: user?.staf }, clonePayload);

    return updatedStaff;

}


export const StaffService = {
    StaffsList,
    StaffProfile,
    updateStaff
}