import { Types } from "mongoose";
import AppError from "../../../error/AppError";
import { IICompany, IMsgTemplate, IOrgLocation, IService } from "../user.interface";
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
        path: "company",
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

const updateCompanyAutomation = async (companyId: string, payload: IICompany) => {

    const user = await User.findOne({ _id: companyId });

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

    const { _id, ...body } = payload

    const res = await Company.updateOne(
        { _id: user?.company },
        {
            $set: body
        }
    );

    return res;
}

const updateCompanyReminderMessage = async (companyId: string, payload: IMsgTemplate) => {

    const user = await User.findOne({ _id: companyId })

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

    const res = await Company.updateOne(
        { _id: user?.company },
        {
            $set: payload
        }
    );

    return res;
}

const services = async (companyId: string, query: Record<string, any>) => {

    const search = query?.searchTerm || ""

    const user = await User.findOne({ _id: companyId, role: "company" }).select("company");

    if (!user?.company) throw new AppError(httpStatus.NOT_FOUND, "Company not found");

    const result = await Company.aggregate([
        { $match: { _id: user.company } },
        { $unwind: "$services" },
        {
            $match: {
                $or: [
                    { "services.service_category": { $regex: search, $options: "i" } },
                    { "services.service_code": { $regex: search, $options: "i" } },
                    { "services.service_offered": { $regex: search, $options: "i" } }
                ]
            }
        },
        { $replaceRoot: { newRoot: "$services" } }
    ]);

    return result;
}

const addNewService = async (companyId: string, payload: IService) => {

    const user = await User.findOne({ _id: companyId, role: "company" }).select("company");

    if (!user?.company) throw new AppError(httpStatus.NOT_FOUND, "Company not found");

    const res = await Company.updateOne(
        { _id: user?.company },
        {
            $push: {
                services: { $each: payload }
            }
        }
    );

    return res;
}

const editService = async (userId: string, serviceId: string, payload: IService) => {

    const exist = await User.findOne({ _id: userId, role: "company" }).select("company");

    if (!exist?.company) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Company not found',
        );
    }

    const companyid = exist?.company;

    const res = await Company.updateOne(
        {
            _id: companyid,
            "services._id": serviceId, // match the person by id
        },

        {
            $set: {
                "services.$.service_category": payload.service_category,
                "services.$.service_code": payload?.service_code,
                "services.$.service_offered": payload?.service_offered,
                "services.$.amount": payload?.amount,
                "services.$.service_period": payload?.service_period,
                "services.$.unit": payload?.unit,
                // "services.$.isArchived": payload?.isArchived,
            },
        }
    );

    return res;
}

const deleteService = async (userId: string, serviceId: string) => {

    const exist = await User.findOne({ _id: userId, role: "company" }).select("company");

    if (!exist?.company) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Company not found',
        );
    }

    const companyid = exist?.company;

    const res = await Company.updateOne(
        { _id: companyid },
        {
            $pull: {
                "services": { _id: serviceId },
            },
        }
    );

    return res;
};

const locations = async (companyId: string, query: Record<string, any>) => {

    const search = query?.searchTerm || ""

    const user = await User.findOne({ _id: companyId, role: "company" }).select("company");

    if (!user?.company) throw new AppError(httpStatus.NOT_FOUND, "Company not found");

    const result = await Company.aggregate([
        { $match: { _id: user.company } },
        { $unwind: "$locations" },
        {
            $match: {
                $or: [
                    { "locations.state": { $regex: search, $options: "i" } },
                    { "locations.street": { $regex: search, $options: "i" } },
                    { "locations.city": { $regex: search, $options: "i" } },
                    { "locations.zip_code": { $regex: search, $options: "i" } },
                    { "locations.email": { $regex: search, $options: "i" } },
                    { "locations.fax": { $regex: search, $options: "i" } },
                    { "locations.phone": { $regex: search, $options: "i" } },
                ]
            }
        },
        { $replaceRoot: { newRoot: "$locations" } }
    ]);

    return result;
}

const editLocation = async (userId: string, locationId: string, payload: IOrgLocation) => {

    const exist = await User.findOne({ _id: userId, role: "company" }).select("company");

    if (!exist?.company) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Company not found',
        );
    }

    const companyid = exist?.company;

    const res = await Company.updateOne(
        {
            _id: companyid,
            "locations._id": locationId,
        },
        {
            $set: {
                "locations.$.state": payload.state,
                "locations.$.street": payload?.street,
                "locations.$.city": payload?.city,
                "locations.$.zip_code": payload?.zip_code,
                "locations.$.email": payload?.email,
                "locations.$.fax": payload?.fax,
                "locations.$.phone": payload?.phone,
                "locations.$.rooms": payload?.rooms,
            },
        }
    );

    return res;
}

const deleteLocation = async (userId: string, locationId: string) => {

    const exist = await User.findOne({ _id: userId, role: "company" }).select("company");

    if (!exist?.company) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Company not found',
        );
    }

    const companyid = exist?.company;

    const res = await Company.updateOne(
        { _id: companyid },
        {
            $pull: {
                "locations": { _id: locationId },
            },
        }
    );

    return res;
};

export const companyService = {
    addCompanyLocation,
    myProfile,
    updateCompany,
    services,
    addNewService,
    editService,
    deleteService,
    locations,
    editLocation,
    deleteLocation,
    updateCompanyAutomation,
    updateCompanyReminderMessage
}