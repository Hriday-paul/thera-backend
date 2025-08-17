import AppError from "../../../error/AppError";
import { IICompany, IOrgLocation } from "../user.interface";
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

const updateCompany = async (companyId: string, payload: IICompany) => {

    const user = await User.findByIdAndUpdate({ _id: companyId }, { name: payload?.name, image: payload?.image ?? undefined }, { new: true })

    //check patient is exist or not
    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Company not found',
        );
    }

    if (!user?.company) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Company not found',
        );
    }

    const { _id, ...clonePayload } = payload

    const updatedStaff = await Company.updateOne({ _id: user?.company }, clonePayload);

    return updatedStaff;

}

export const companyService = {
    addCompanyLocation,
    myProfile,
    updateCompany
}