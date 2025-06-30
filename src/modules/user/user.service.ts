import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.models";
import httpStatus from 'http-status'


const updateProfile = async (payload: IUser, userId: string, image: string) => {
    const {  name } = payload

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


export const userService = {
    updateProfile,
    getUserById,
    allUsers,
    status_update_user
}