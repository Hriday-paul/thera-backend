import { Types } from "mongoose";
import QueryBuilder from "../../../builder/QueryBuilder";
import { AppointmentOccurrence } from "../../appoinments/appoinments.model";
import { Invoices } from "../../invoices/invoices.models";
import Payment from "../../payments/payments.models"
import { User } from "../user.models";
import { startOfISOWeek, endOfISOWeek } from 'date-fns';


const statCounts = async () => {

    const total_earning_amount = await Payment.aggregate([
        {
            $match: {
                isPaid: true,
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$total_amount" }
            }
        }
    ]);

    const earning = total_earning_amount[0]?.total || 0;


    const company = await User.countDocuments({ role: "company", isverified: true });

    const subscribe_amount = await Payment.countDocuments({ isPaid: true });

    const appoinment_amount = await AppointmentOccurrence.countDocuments();

    return { earning, subscribe: subscribe_amount, company, appointment: appoinment_amount }

}

type MonthlyData = {
    day: number;
    count: number;
    totalAmount: number;
};


const purchaseChart = async (query: Record<string, any>) => {
    const year = Number(query?.year) || 2025;
    const week = Number(query?.week) || 1;

    // Get start and end of ISO week (Monday → Sunday)
    const startDate = startOfISOWeek(new Date(year, 0, 1 + (week - 1) * 7));
    const endDate = endOfISOWeek(startDate);

    // Aggregate payments grouped by package and day
    const result = await Payment.aggregate([
        {
            $match: {
                isPaid: true,
                isDeleted: false,
                startedAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                as: "packageInfo",
            },
        },
        { $unwind: "$packageInfo" },
        {
            $group: {
                _id: {
                    title: "$packageInfo.title",
                    day: { $isoDayOfWeek: "$startedAt" }, // 1=Monday, 7=Sunday
                },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: "$_id.title",
                dailyData: {
                    $push: {
                        day: "$_id.day",
                        count: "$count",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                name: "$_id",
                dailyData: 1,
            },
        },
    ]);

    // Map aggregation to 7-day array per package
    const chartData = result.map(pkg => {
        const dataMap: Record<number, number> = {};
        pkg.dailyData.forEach((d: MonthlyData) => {
            dataMap[d.day] = d.count;
        });

        // ISO week: Monday(1) → Sunday(7)
        const weekDays = [1, 2, 3, 4, 5, 6, 7];
        return {
            name: pkg.name,
            data: weekDays.map(d => dataMap[d] || 0),
        };
    });

    return chartData;
};

const purchasePieYearly = async (query: Record<string, any>) => {
    const year = Number(query?.year) || new Date().getFullYear();

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const result = await Payment.aggregate([
        {
            $match: {
                isPaid: true,
                isDeleted: false,
                startedAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $lookup: {
                from: "packages",
                localField: "package",
                foreignField: "_id",
                as: "packageInfo",
            },
        },
        { $unwind: "$packageInfo" },
        {
            $group: {
                _id: "$packageInfo.title",
                totalAmount: { $sum: "$total_amount" }, // sum of payments
            },
        },
        {
            $project: {
                _id: 0,
                label: "$_id",
                amount: "$totalAmount",
            },
        },
    ]);

    return result;
    // Example: [{ label: "Free", amount: 80 }, { label: "Pro", amount: 200 }]
};

const allCompanies = async (query: Record<string, any>) => {

    const stats = query?.status;
    const search = query?.search;
    const page = query?.page || 1;
    const limit = query?.limit || 10;

    const matchFilter: any = { role: "company", isverified: true };
    if (stats) {
        matchFilter.status = Number(stats);
    }

    if (search) {
        matchFilter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    const companiesWithCounts = await User.aggregate([
        { $match: matchFilter },

        {
            $lookup: {
                from: "companies",
                localField: "company", // field in User schema
                foreignField: "_id",
                as: "company"
            }
        },

        { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "active_packages",
                let: { userId: "$_id", now: new Date() },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$user", "$$userId"] },
                                    { $gt: ["$expiredAt", "$$now"] } // not expired
                                ]
                            }
                        }
                    }
                ],
                as: "active_package"
            }
        },
        {
            $unwind: {
                path: "$active_package",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "packages",
                localField: "active_package.last_purchase_package",
                foreignField: "_id",
                as: "package"
            }
        },
        {
            $unwind: {
                path: "$package",
                preserveNullAndEmptyArrays: true
            }
        },

        // Lookup total staff per company
        {
            $lookup: {
                from: "users",
                let: { companyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$staf_company_id", "$$companyId"] },
                                    { $eq: ["$role", "staf"] },
                                    { $eq: ["$isDeleted", false] }
                                ]
                            }
                        }
                    },
                    { $count: "staffCount" }
                ],
                as: "staff"
            }
        },
        // Lookup total patients per company
        {
            $lookup: {
                from: "users",
                let: { companyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$patient_company_id", "$$companyId"] },
                                    { $eq: ["$role", "patient"] },
                                    { $eq: ["$isDeleted", false] }
                                ]
                            }
                        }
                    },
                    { $count: "patientCount" }
                ],
                as: "patients"
            }
        },
        // Lookup total appointments per company
        {
            $lookup: {
                from: "appointmentoccurrences",
                let: { companyId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$company_id", "$$companyId"] } } },
                    { $count: "appointmentCount" }
                ],
                as: "appointments"
            }
        },

        // Add the counts as fields
        {
            $addFields: {
                totalStaff: { $arrayElemAt: ["$staff.staffCount", 0] },
                totalPatients: { $arrayElemAt: ["$patients.patientCount", 0] },
                totalAppointments: { $arrayElemAt: ["$appointments.appointmentCount", 0] }
            }
        },

        {
            $lookup: {
                from: "invoices",
                let: { companyId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$company", "$$companyId"] },
                                    { $eq: ["$status", "complete"] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalIncome: { $sum: "$total_amount" }
                        }
                    }
                ],
                as: "income"
            }
        },
        // Flatten the array and handle null
        {
            $addFields: {
                totalIncome: { $ifNull: [{ $arrayElemAt: ["$income.totalIncome", 0] }, 0] }
            }
        },

        // Remove lookup arrays
        { $project: { staff: 0, patients: 0, appointments: 0, password: 0, fcmToken: 0, income: 0 } },

        { $sort: { createdAt: -1 } },

        { $skip: (Number(page) - 1) * limit },
        { $limit: parseInt(limit) }
    ]);

    const totalCompanies = await User.countDocuments(matchFilter);
    const totalPages = Math.ceil(totalCompanies / limit);

    return {
        meta: {
            total: totalCompanies,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages
        },
        data: companiesWithCounts
    };
}

const companyStats = async (companyId: string) => {

    const total_completed_amount = await Invoices.aggregate([
        {
            $match: {
                company: new Types.ObjectId(companyId),
                status: "complete",
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$total_amount" }
            }
        }
    ]);
    const total_earn = total_completed_amount[0]?.total || 0;

    const active_staff = await User.countDocuments({ staf_company_id: companyId, role: "staf", isDisable: false, isDeleted: false })
    const active_patient = await User.countDocuments({ patient_company_id: companyId, role: "patient", isDisable: false, isDeleted: false });

    const archived_staff = await User.countDocuments({ staf_company_id: companyId, role: "staf", isDisable: true, isDeleted: false })
    const archived_patient = await User.countDocuments({ patient_company_id: companyId, role: "patient", isDisable: true, isDeleted: false });

    // const totalAppoinment = await AppointmentOccurrence.countDocuments({ company_id: new Types.ObjectId(company_id) })

    return { total_earn, active_staff, active_patient, archived_staff, archived_patient }

}

const companyappoinmentStats = async (companyId: string) => {

    const totalAppoinment = await AppointmentOccurrence.countDocuments({ company_id: new Types.ObjectId(companyId) })
    const upcomingAppoinment = await AppointmentOccurrence.countDocuments({ company_id: new Types.ObjectId(companyId), status: "upcoming" })
    const completedAppoinment = await AppointmentOccurrence.countDocuments({ company_id: new Types.ObjectId(companyId), status: "completed" })
    const cancelAppoinment = await AppointmentOccurrence.countDocuments({ company_id: new Types.ObjectId(companyId), status: "cancelled" })

    return { total: totalAppoinment, upcoming: upcomingAppoinment, completed: completedAppoinment, cancel: cancelAppoinment }
}

export const adminService = {
    statCounts,
    purchaseChart,
    purchasePieYearly,
    allCompanies,
    companyStats,
    companyappoinmentStats
}