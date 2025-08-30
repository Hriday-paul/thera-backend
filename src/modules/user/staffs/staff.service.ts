import { Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import AppError from "../../../error/AppError";
import { IIStaf } from "../user.interface";
import { Staf, User } from "../user.models";
import httpStatus from "http-status";

// const StaffsList = async (company: string, query: Record<string, any>) => {

//     const staffModel = new QueryBuilder(User.find({ role: "staf", staf_company_id: company, isDeleted: false }).select("-password").populate({
//         path: "staf",
//         select: "-_id"
//     }), query)
//         .search(["name", "email"])
//         .filter()
//         .sort()
//         .paginate();

//     const data: any = await staffModel.modelQuery;
//     const meta = await staffModel.countTotal();

//     return { meta, data };
// };

const StaffsList = async (companyId: string, query: Record<string, any>) => {
    const page = query?.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const search = query?.searchTerm;

    const status = query?.status

    const isOnline = query?.isOnline

    const now = new Date();

    const isOnlineFilter =
        typeof isOnline !== "undefined"
            ? { isOnline: isOnline === "true" || isOnline === true } // handle query strings too
            : {};

    const matchStage: any = {
        role: "staf",
        staf_company_id: new Types.ObjectId(companyId),
        isDisable: false,
        ...isOnlineFilter
    };

    if (status !== undefined && status !== "") {
        matchStage.status = Number(query.status);
    }

    if (search) {
        matchStage.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const staffs = await User.aggregate([
        { $match: matchStage },

        // Populate staf field
        {
            $lookup: {
                from: "stafs",
                localField: "staf",
                foreignField: "_id",
                as: "staf",
            },
        },
        { $unwind: "$staf" },

        // Lookup appointment occurrences for this staff
        {
            $lookup: {
                from: "appointmentoccurrences",
                let: { staffId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $in: ["$$staffId", "$staff_ids"] } } },
                    // { $sort: { start_datetime: 1 } },
                ],
                as: "appointments",
            },
        },

        // Add nextAppointment and totalCompleted
        {
            $addFields: {
                nextAppointment: {
                    $ifNull: [
                        {
                            $first: {
                                $filter: {
                                    input: "$appointments",
                                    as: "app",
                                    cond: { $gte: ["$$app.start_datetime", now] },
                                },
                            },
                        },
                        null,
                    ],
                },
                totalCompleted: {
                    $size: {
                        $filter: {
                            input: "$appointments",
                            as: "app",
                            cond: { $eq: ["$$app.status", "completed"] },
                        },
                    },
                },
            },
        },

        // Project only required fields
        {
            $project: {
                name: 1,
                email: 1,
                image: 1,
                staf: 1,
                isOnline: 1,
                isDisable: 1,
                status: 1,
                nextAppointment: 1,
                totalCompleted: 1,
                createdAt: 1,
            },
        },

        { $sort: { totalCompleted: -1 } },

        // Pagination
        { $skip: skip },
        { $limit: limit },
    ]);

    const total = await User.countDocuments(matchStage);

    const meta = {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit)
    }

    return { data: staffs, meta }

}

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

    const { _id, ...clonePayload } = payload

    const updatedStaff = await Staf.updateOne({ _id: user?.staf }, clonePayload);

    return updatedStaff;

}


export const StaffService = {
    StaffsList,
    StaffProfile,
    updateStaff
}