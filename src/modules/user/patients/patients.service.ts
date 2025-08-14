import { Types } from "mongoose";
import AppError from "../../../error/AppError";
import { IBilling, IContact, IFamilyGroup, IIPatient, InsuranceType } from "../user.interface";
import { Patient, User } from "../user.models"
import httpStatus from "http-status"
import { AppointmentOccurrence } from "../../appoinments/appoinments.model";

const patientprofile = async (patientId: string) => {
    const res = await User.findOne({ _id: patientId, role: "patient" }).select("-password").populate({
        path: "patient",
        populate: {
            path: "assign_stafs",
            select: "-password"
        }
    });
    return res;
}

const allPatientsByCompany = async (companyId: string) => {
    const res = await User.find({ patient_company_id: new Types.ObjectId(companyId), role: "patient" }).select("-password").populate({
        path: "patient",
        populate: {
            path: "assign_stafs",
            select: "-password"
        }
    });
    return res;
}

const updatePatient = async (patientId: string, payload: IIPatient) => {

    const user = await User.findByIdAndUpdate({ _id: patientId }, { name: payload?.f_name + " " + payload?.middle_name + " " + payload?.last_name, image: payload?.image ?? undefined }, { new: true })

    //check patient is exist or not
    if (!user) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Staff not found',
        );
    }

    if (!user?.patient) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Staff not found',
        );
    }

    const {_id, ...clonePayload} = payload

    const updatedStaff = await Patient.updateOne({ _id: user?.patient }, clonePayload);

    return updatedStaff;

}


export const patientsListsWithAppoinmentHistory = async (companyId: string, query: Record<string, any>) => {
    const page = query?.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const searchTerm = query?.searchTerm

    const searchFilter = searchTerm
        ? {
            $or: [
                { name: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
            ],
        }
        : {};


    const now = new Date();

    const res = await User.aggregate([
        {
            $match: {
                role: "patient",
                patient_company_id: new Types.ObjectId(companyId),
                ...searchFilter
            }
        },
        {
            $lookup: {
                from: "appointments",
                localField: "_id",
                foreignField: "patient_id",
                as: "appointments"
            }
        },
        { $unwind: { path: "$appointments", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "appointmentoccurrences",
                localField: "appointments._id",
                foreignField: "appointment",
                as: "occurrences"
            }
        },
        { $unwind: { path: "$occurrences", preserveNullAndEmptyArrays: true } },

        // Remove this $match:
        // {
        //   $match: {
        //     "occurrences.status": { $ne: "cancelled" },
        //     "occurrences.start_datetime": { $gt: now }
        //   }
        // },

        {
            $lookup: {
                from: "patients",
                localField: "patient",
                foreignField: "_id",
                as: "patient",
                pipeline: [
                    // Inside each appointment, lookup staff info
                    {
                        $lookup: {
                            from: "users",         // assuming staffs are users
                            localField: "assign_stafs",
                            foreignField: "_id",
                            as: "assign_stafs"
                        }
                    }
                ]
            }
        },
        { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },

        {
            $group: {
                _id: "$_id",
                name: { $first: "$name" },
                email: { $first: "$email" },
                image: { $first: "$image" },
                patient: { $first: "$patient" },
                nextAppointmentDate: {
                    $min: {
                        $cond: [
                            {
                                $and: [
                                    { $gt: ["$occurrences.start_datetime", now] },
                                    { $ne: ["$occurrences.status", "cancelled"] }
                                ]
                            },
                            "$occurrences.start_datetime",
                            null
                        ]
                    }
                },
                totalCompletedAppointments: {
                    $sum: {
                        $cond: [{ $eq: ["$occurrences.status", "completed"] }, 1, 0]
                    }
                }
            }
        },
        { $sort: { nextAppointmentDate: 1 } },
        {
            $project: {
                name: 1,
                email: 1,
                image: 1,
                patient: { assign_stafs: { name: 1, email: 1, image: 1 } },
                nextAppointmentDate: 1,
                totalCompletedAppointments: 1,
            }
        },
        // Add pagination stages:
        { $skip: skip },
        { $limit: limit }
    ]);

    const total = await User?.countDocuments({ role: "patient", patient_company_id: companyId })

    const meta = {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit)
    }

    return { data: res, meta };
}


const addFamilyGroup = async (userId: string, payload: IFamilyGroup) => {

    const { name, persons } = payload;

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Patient not found',
        );
    }

    const patientId = exist?.patient;

    const res = await Patient.updateOne({ _id: patientId }, { familyGroup: { name, persons } })

    return res;
}

const addNewPersonToFamily = async (userId: string, payload: { name: string, relation: string }) => {

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Patient not found',
        );
    }

    const patientId = exist?.patient;

    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $push: {
                'familyGroup.persons': payload
            }
        }
    );

    return res;
}

const updatePersonInFamily = async (
    userId: string,
    personId: string,
    payload: { name: string; relation: string }
) => {
    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist.patient;

    const res = await Patient.updateOne(
        {
            _id: patientId,
            "familyGroup.persons._id": personId, // match the person by id
        },
        {
            $set: {
                "familyGroup.persons.$.name": payload.name,
                "familyGroup.persons.$.relation": payload.relation,
            },
        }
    );

    return res;
};

const deletePersonFromFamily = async (userId: string, personId: string) => {
    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist.patient;

    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $pull: {
                "familyGroup.persons": { _id: personId },
            },
        }
    );

    return res;
};


const addEmergencyPerson = async (userId: string, payload: IContact) => {

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Patient not found',
        );
    }

    const patientId = exist?.patient;

    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $push: {
                'contacts': payload
            }
        }
    );

    return res;
}

const updateEmergencyContact = async (
    userId: string,
    contactId: string,
    payload: IContact
) => {
    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist.patient;

    const res = await Patient.updateOne(
        {
            _id: patientId,
            "contacts._id": contactId, // match the person by id
        },
        {
            $set: {
                "contacts.$.name_title": payload.name_title,
                "contacts.$.full_name": payload.full_name,
                "contacts.$.relation": payload.relation,
                "contacts.$.country": payload.country,
                "contacts.$.state": payload.state,
                "contacts.$.zip_code": payload.zip_code,
                "contacts.$.street": payload.street,
                "contacts.$.email": payload.email,
                "contacts.$.phone": payload.phone,
            },
        }
    );

    return res;
};


const deleteEmergencyPerson = async (userId: string, personId: string) => {

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist.patient;

    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $pull: {
                "contacts": { _id: personId },
            },
        }
    );

    return res;
};

const deleteAsignStaffs = async (userId: string, staffId: string) => {

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist.patient;

    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $pull: {
                assign_stafs: new Types.ObjectId(staffId)
            }
        }
    );

    return res;
};

const assignNewStaffToPatient = async (userId: string, staffId: string) => {
    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist?.patient;

    const patient = await Patient.findById(patientId);

    if (!patient) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient record not found");
    }

    const staffObjectId = new Types.ObjectId(staffId);

    // ✅ Check if staff already assigned
    const isAlreadyAssigned = patient.assign_stafs.some(
        (s: Types.ObjectId) => s.equals(staffObjectId)
    );

    if (isAlreadyAssigned) {
        throw new AppError(httpStatus.CONFLICT, "Staff is already assigned to this patient");
    }

    // ✅ Assign the staff if not already present
    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $push: {
                assign_stafs: staffObjectId,
            },
        }
    );

    return res;
};

const editBillingDetails = async (
    userId: string,
    payload: IBilling
) => {
    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist.patient;

    const res = await Patient.updateOne(
        {
            _id: patientId,
        },
        {
            $set: {
                "billing_details": payload,
            },
        }
    );

    return res;
};

const addInsurance = async (userId: string, payload: InsuranceType) => {

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Patient not found',
        );
    }

    const patientId = exist?.patient;

    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $push: {
                'insurances': payload
            }
        }
    );

    return res;
}

const editInsurance = async (userId: string, insuranceId: string, payload: InsuranceType) => {

    const { policy_number = "", approved_session = 0, sessionFrequency = null, therapy_type = null, group_number = "", copayment = 0, pocket_maximum_amount = 0, referral_number = "", plan_type = null } = payload

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Patient not found',
        );
    }

    const patientId = exist?.patient;

    const res = await Patient.updateOne(
        {
            _id: patientId,
            "insurances._id": insuranceId, // match the person by id
        },
        {
            $set: {
                "insurances.$.insurance_provider": payload.insurance_provider,
                "insurances.$.plan_type": plan_type,
                "insurances.$.policy_number": policy_number,
                "insurances.$.approved_session": approved_session,
                "insurances.$.sessionFrequency": sessionFrequency,
                "insurances.$.group_number": group_number,
                "insurances.$.copayment": copayment,
                "insurances.$.pocket_maximum_amount": pocket_maximum_amount,
                "insurances.$.from_date": payload.from_date,
                "insurances.$.to_date": payload.to_date,
                "insurances.$.referral_number": referral_number,
                "insurances.$.therapy_type": therapy_type,
            },
        }
    );

    return res;
}

const deleteInsurance = async (userId: string, insurancId: string) => {

    const exist = await User.findOne({ _id: userId, role: "patient" }).select("-password");

    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const patientId = exist.patient;

    const res = await Patient.updateOne(
        { _id: patientId },
        {
            $pull: {
                "insurances": { _id: insurancId },
            },
        }
    );

    return res;
};

export const PatientService = {
    patientprofile,
    updatePatient,
    allPatientsByCompany,
    addFamilyGroup,
    addNewPersonToFamily,
    updatePersonInFamily,
    deletePersonFromFamily,

    addEmergencyPerson,
    updateEmergencyContact,
    deleteEmergencyPerson,
    deleteAsignStaffs,
    assignNewStaffToPatient,
    editBillingDetails,
    addInsurance,
    editInsurance,
    deleteInsurance,
    patientsListsWithAppoinmentHistory
}