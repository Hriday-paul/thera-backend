import mongoose, { Types } from "mongoose";
import AppError from "../../../error/AppError";
import { IICompany, IMsgTemplate, IOrgLocation, Ipatienttag, IService } from "../user.interface";
import { Company, User } from "../user.models";
import httpStatus from "http-status"
import { CaseFiles } from "../../case_files/case_files.model";
import { Invoices } from "../../invoices/invoices.models";
import moment from "moment";

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


const addPatientTag = async (companyId: string, payload: IService) => {

    const user = await User.findOne({ _id: companyId, role: "company" }).select("company");

    if (!user?.company) throw new AppError(httpStatus.NOT_FOUND, "Company not found");

    const res = await Company.updateOne(
        { _id: user?.company },
        {
            $push: {
                patient_tags: payload
            }
        }
    );

    return res;
}

const editpatienttags = async (userId: string, tagId: string, payload: Ipatienttag) => {

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
            "patient_tags._id": tagId,
        },
        {
            $set: {
                "locations.$.name": payload?.name,

            },
        }
    );

    return res;
}

const deletepatienttags = async (userId: string, tagId: string) => {

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
                "patient_tags": { _id: tagId },
            },
        }
    );

    return res;
};

// ------------------reports api--------------
const reportUserCount = async (companyId: string) => {

    const active_staff = await User.countDocuments({ staf_company_id: companyId, role: "staf", isDisable: false, isDeleted: false })
    const active_patient = await User.countDocuments({ patient_company_id: companyId, role: "patient", isDisable: false, isDeleted: false });

    const archived_staff = await User.countDocuments({ staf_company_id: companyId, role: "staf", isDisable: true, isDeleted: false })
    const archived_patient = await User.countDocuments({ patient_company_id: companyId, role: "patient", isDisable: true, isDeleted: false });

    const open_case_file = await CaseFiles.countDocuments({ companyId: new Types.ObjectId(companyId), isClosed: false });
    const close_case_file = await CaseFiles.countDocuments({ companyId: new Types.ObjectId(companyId), isClosed: true });

    return { staff: { active: active_staff, archived: archived_staff }, patient: { active: active_patient, archived: archived_patient }, case_file: { open: open_case_file, close: close_case_file } };
};

const reportKeyPerformance = async (companyId: string, query: Record<string, any>) => {

    const year = query?.year ?? moment().year();
    const startOfUserYear = moment().year(year).startOf('year');
    const endOfUserYear = moment().year(year).endOf('year');

    const total_completed_amount = await Invoices.aggregate([
        {
            $match: {
                company: new mongoose.Types.ObjectId(companyId),
                status: "complete",
                createdAt: {
                    $gte: startOfUserYear.toDate(),
                    $lte: endOfUserYear.toDate(),
                },
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$total_amount" }
            }
        }
    ]);

    const total_due_amount = await Invoices.aggregate([
        {
            $match: {
                company: new mongoose.Types.ObjectId(companyId),
                status: "pending",
                createdAt: {
                    $gte: startOfUserYear.toDate(),
                    $lte: endOfUserYear.toDate(),
                },
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$total_amount" }
            }
        }
    ]);

    const total = total_completed_amount[0]?.total || 0;
    const due = total_due_amount[0]?.total || 0;

    return { total, due };
};

const gendersCountForCompany = async (companyId: string) => {

    const genderStats = await User.aggregate([
        {
            $match: {
                patient_company_id: new Types.ObjectId(companyId),
                role: "patient",
            },
        },
        {
            $lookup: {
                from: "patients", // 👈 collection name for Patient model
                localField: "patient",
                foreignField: "_id",
                as: "patient",
            },
        },
        { $unwind: "$patient" },
        {
            $group: {
                _id: "$patient.gender",
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$count" },
                genders: { $push: { gender: "$_id", count: "$count" } },
            },
        },
        {
            $project: {
                _id: 0,
                genders: {
                    $map: {
                        input: "$genders",
                        as: "g",
                        in: {
                            gender: "$$g.gender",
                            percentage: {
                                $round: [
                                    { $multiply: [{ $divide: ["$$g.count", "$total"] }, 100] },
                                    2,
                                ],
                            },
                        },
                    },
                },
            },
        },
    ])

    return genderStats;

};

const ageGroupsForCompany = async (companyId: string) => {
    const results = await User.aggregate([
        {
            $match: {
                patient_company_id: new Types.ObjectId(companyId),
                role: "patient",
            },
        },
        {
            $lookup: {
                from: "patients", // your patient collection name
                localField: "patient",
                foreignField: "_id",
                as: "patient",
            },
        },
        { $unwind: "$patient" },

        // ✅ calculate age
        {
            $addFields: {
                age: {
                    $dateDiff: {
                        startDate: "$patient.date_of_birth",
                        endDate: "$$NOW",
                        unit: "year",
                    },
                },
            },
        },

        // ✅ group into ranges
        {
            $bucket: {
                groupBy: "$age",
                boundaries: [0, 13, 18, 25, 35, 45, 55, 65, 200], // age ranges
                default: "Unknown",
                output: {
                    count: { $sum: 1 },
                },
            },
        },

        // ✅ calculate total patients (for percentages)
        {
            $group: {
                _id: null,
                buckets: { $push: { range: "$_id", count: "$count" } },
                total: { $sum: "$count" },
            },
        },

        // ✅ reshape for frontend (with percentage)
        {
            $project: {
                _id: 0,
                ageGroups: {
                    $map: {
                        input: "$buckets",
                        as: "b",
                        in: {
                            range: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$$b.range", 0] }, then: "0-12" },
                                        { case: { $eq: ["$$b.range", 13] }, then: "13-17" },
                                        { case: { $eq: ["$$b.range", 18] }, then: "18-24" },
                                        { case: { $eq: ["$$b.range", 25] }, then: "25-34" },
                                        { case: { $eq: ["$$b.range", 35] }, then: "35-44" },
                                        { case: { $eq: ["$$b.range", 45] }, then: "45-54" },
                                        { case: { $eq: ["$$b.range", 55] }, then: "55-64" },
                                        { case: { $eq: ["$$b.range", 65] }, then: "65+" },
                                    ],
                                    default: "Unknown",
                                },
                            },
                            count: "$$b.count",
                            percentage: {
                                $round: [
                                    { $multiply: [{ $divide: ["$$b.count", "$total"] }, 100] },
                                    1,
                                ],
                            },
                        },
                    },
                },
            },
        },
    ]);

    return results[0]?.ageGroups || [];
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
    updateCompanyReminderMessage,

    editpatienttags,
    deletepatienttags,
    addPatientTag,
    reportUserCount,
    reportKeyPerformance,
    gendersCountForCompany,
    ageGroupsForCompany
}