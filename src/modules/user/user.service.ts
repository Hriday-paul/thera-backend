import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IIStaf, IUser } from "./user.interface";
import { Staf, User } from "./user.models";
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

    const result = await User.updateOne({ _id: id }, { status: payload?.status })

    return result
}


// add new staff
const add_new_staff = async (payload: IIStaf, image : string, company_id: string) => {
    const {
        email,
        password = '',
        f_name = "",
        middle_name = "",
        last_name = "",
    } = payload;

    const name = f_name + middle_name + last_name

    let isExist = await User.findOne({ email })

    //check user is exist or not
    if (isExist && isExist?.isverified) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Another account found with this email',
        );
    }

    // creat encrypted password
    const hashedPassword = await bcrypt.hash(password, 15);

    const staff = await Staf.insertOne({ ...payload, staf_company: company_id });

    const user = await User.findOneAndUpdate({ email }, {
        name,
        email,
        password: hashedPassword,
        role: "staf",
        staf: staff?._id
    }, { upsert: true, new: true })

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Staff creation failed, try again');
    }

    return user;
}


export const userService = {
    updateProfile,
    getUserById,
    allUsers,
    status_update_user,
    add_new_staff
}