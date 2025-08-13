import AppError from "../../../error/AppError";
import { IOrgLocation } from "../user.interface";
import { Company, User } from "../user.models";
import httpStatus from "http-status"

const addCompanyLocation = async (userId: string, payload: IOrgLocation) => {

    const exist = await User.findOne({ _id: userId, role: "company" }).select("-password");

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Company not found',
        );
    }

    const companyId = exist?.company;

    const res = await Company.updateOne({ _id: companyId },
        {
            $push: {
                'locations': payload
            }
        }
    )

    return res;
}

const myProfile = async (userId: string) => {

    const user = await User.findOne({ _id: userId, role: "company" }).select("-password").populate({
        path: "company"
    });

    return user;
}

export const companyService = {
    addCompanyLocation,
    myProfile
}