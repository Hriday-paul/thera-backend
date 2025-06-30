import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import { IProduct } from "./products.interface";
import { Products } from "./products.model";
import httpStatus from 'http-status'

const allProducts = async (query: Record<string, any>) => {
    const productModel = new QueryBuilder(Products.find({ isDeleted: false }), query)
        .search(['name'])
        .filter()
        .paginate()
        .sort();
    const data: any = await productModel.modelQuery;
    const meta = await productModel.countTotal();
    return {
        data,
        meta,
    };
}

const singleProduct = async (productId: string) => {
    const product = await Products.findOne({ _id: productId, isDeleted: false });

    if (!product) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    }

    return product
}

const addProduct = async (payload: IProduct, images: string[]) => {

    if (images?.length <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Minimum 1 image is required',
        );
    }

    const res = await Products.create({ ...payload, images: images })

    return res;
}

interface upPRod extends IProduct {
    existImages: string[]
}

const updateProduct = async (payload: upPRod, productId: string, newImages: string[]) => {

    const { details, name, price, stock, existImages } = payload

    const updateFields: Partial<IProduct> = { details, name, price, stock };


    // Remove undefined or null fields to prevent overwriting existing values with null
    Object.keys(updateFields).forEach((key) => {
        if (updateFields[key as keyof IProduct] === undefined || updateFields[key as keyof IProduct] === '' || updateFields[key as keyof IProduct] === null) {
            delete updateFields[key as keyof IProduct];
        }
    });

    if (Object.keys(updateFields).length === 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid field found',
        );
    }

    const isExist = await Products.findById(productId)

    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    }

    const existImg = JSON.parse(existImages as unknown as string)

    if (newImages) {
        updateFields.images = [...existImg, ...newImages];
    } else {
        updateFields.images = [...existImg];
    }
    

    const result = await Products.updateOne({ _id: productId }, updateFields)

    if (result?.modifiedCount <= 0) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product update failed, try again',
        );
    }

    return result

}


const deleteProduct = async (productId: string) => {

    const isExist = await Products.findById(productId)

    if (!isExist) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'Product not found',
        );
    }

    const res = await Products.updateOne({ _id: productId }, { isDeleted: true });

    return res;
};

export const productService = {
    allProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    singleProduct
}