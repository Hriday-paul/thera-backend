import AppError from "../../error/AppError";
import { IPackage } from "./package.interface"
import Package from "./package.model";
import httpStatus from 'http-status';

//create a new package
const create_Package = async (payload: IPackage) => {
    const packages = await Package.create(payload);
    if (!packages) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to create packages',
        );
    }
    return packages;
}

const update_Package = async (payload: IPackage, id: string) => {

    const exist = await Package.findById(id);

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Package not found',
        );
    }
    const packages = await Package.updateOne({ _id: id }, { ...payload });
    return packages;
}

const delete_Package = async (id: string) => {
    const exist = await Package.findById(id);

    if (!exist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Package not found',
        );
    }
    const packages = await Package.updateOne({ _id: id }, {isDeleted : true});
    return packages;
}

// get all packeges and filter by plan type
const getPackages_by_type = async () => {
    const query = { isDeleted: false };
    const packages = await Package.find(query);
    return packages;
}

// get packeges details
const getPackages_details = async (id : string) => {
    const packages = await Package.findOne({_id : id, isDeleted : false});
    return packages;
}

export const packageService = {
    create_Package,
    getPackages_by_type,
    update_Package,
    delete_Package,
    getPackages_details
}