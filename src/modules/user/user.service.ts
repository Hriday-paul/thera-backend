import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IIPatient, IIStaf, IUser } from "./user.interface";
import { Patient, Staf, User } from "./user.models";
import httpStatus from 'http-status'
import bcrypt from 'bcrypt'

const updateProfile = async (payload: IUser, userId: string, image: string) => {
    const { name } = payload

    const updateFields: Partial<IUser> = { name };

    if (image) updateFields.image = image;

    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IUser] === undefined || updateFields[key as keyof IUser] === '' || updateFields[key as keyof IUser] === null) {
            delete updateFields[key as keyof IUser];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const result = await User.updateOne({ _id: userId }, updateFields)

    return result
}

//get all users
const allUsers = async (query: Record<string, any>) => {
    const userModel = new QueryBuilder(User.find({ role: { $ne: "admin" } }, { password: 0 }), query)
        .search(['name', 'email', 'contact'])
        .filter()
        .paginate()
        .sort();
    const data: any = await userModel.modelQuery;
    const meta = await userModel.countTotal();
    return {
        data,
        meta,
    };
}


const getUserById = async (id: string) => {
    const result = await User.findById(id, { password: 0, verification: 0 });
    return result;
};

//user status update
const status_update_user = async (payload: { status: boolean }, id: string) => {

    let isExist = await User.findOne({ _id: id });

    //check user is exist or not
    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Account not found',
        );
    }

    const result = await User.updateOne({ _id: id }, { status: payload?.status })

    return result
}


// add new staff
const add_new_staff = async (payload: IIStaf, image: string, company_id: string) => {
    const {
        email,
        password = '',
        f_name = "",
        middle_name = "",
        last_name = "",
    } = payload;

    const name = f_name + " " + middle_name + " " + last_name;

    let isExist = await User.findOne({ email });

    //check user is exist or not
    if (isExist && isExist?.isverified) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Another account found with this email',
        );
    }

    // creat encrypted password
    const hashedPassword = await bcrypt.hash(password, 15);

    const staff = await Staf.insertOne(payload);

    const user = await User.findOneAndUpdate({ email }, {
        name,
        email,
        password: hashedPassword,
        image,
        role: "staf",
        staf: staff?._id,
        staf_company_id: company_id
    }, { upsert: true, new: true })

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Staff creation failed, try again');
    }

    return user;
}

// all staffs by company
const staffs = async (company_id: string) => {
    const res = await User.find({ role: "staf", staf_company_id: company_id, isDisable : false, isDeleted : false, status : 1 }).populate("staf");
    return res;
}

// add new patient
const add_new_Patient = async (payload: IIPatient, image: string, company_id: string) => {
    const {
        email,
        password = '',
        f_name = "",
        middle_name = "",
        last_name = "",
    } = payload;

    const name = f_name + middle_name + last_name

    let isExist = await User.findOne({ email });

    //check user is exist or not
    if (isExist && isExist?.isverified) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Another account found with this email',
        );
    }

    // creat encrypted password
    const hashedPassword = await bcrypt.hash(password, 15);

    const patient = await Patient.insertOne({ ...payload, billing_details: { email: payload?.email, phone: payload?.phone, country: payload?.country, state: payload?.state, zip_code: payload?.zip_code, street: payload?.street } });

    const user = await User.findOneAndUpdate({ email }, {
        name,
        email,
        password: hashedPassword,
        role: "patient",
        image,
        patient: patient?._id,
        patient_company_id: company_id
    }, { upsert: true, new: true })

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Patient creation failed, try again');
    }

    return user;
}


const deletePatient = async (patientid: string, company_id: string) => {
    const exist = await User.findOne({ _id: patientid, role: "patient" });
    if (!exist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }
    if (exist?.patient_company_id.toString() !== company_id) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not owner of this company")
    }
    const res = await User.updateOne({ _id: patientid }, { isDeleted: true })
    return res;
}



export const userService = {
    updateProfile,
    getUserById,
    allUsers,
    status_update_user,
    add_new_staff,
    staffs,
    add_new_Patient,
    deletePatient
}