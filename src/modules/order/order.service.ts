import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../error/AppError";
import generateRandomString from "../../utils/generateRandomString";
import { Products } from "../products/products.model";
import { IOrder } from "./order.interface";
import Order from "./order.model";
import httpStatus from 'http-status'

const createOrder = async (payload: IOrder, userId: string) => {

    const tranId = generateRandomString(10);

    const productList = payload?.products;

    // Step 1: Get only product IDs
    const productIds = productList.map(item => item.id);

    // Step 2: Fetch product data
    const products = await Products.find({
        _id: { $in: productIds },
        isDeleted: false,
    });

    // Step 3: Check if all products were found
    if (products.length !== productIds.length) {
        throw new AppError(httpStatus.NOT_FOUND, 'Some product not found');
    }

    const quantityMap = new Map<string, number>(
        productList.map(item => [item.id.toString(), item.quantity])
    );

    const total_amount = products.reduce((sum, product) => {
        const quantity = quantityMap.get(product._id.toString()) || 1;
        return sum + product.price * quantity;
    }, 0);


    const product_names = products.map(item => {
        return item?.name
    }).join(' , ')

    const res = await Order.create({ products: payload?.products, user: userId, address: payload?.address, total_amount, tranId, contact: payload?.contact })

    return { res, product_names };
};

const allOrders = async (query: Record<string, any>) => {

    const orderModel = new QueryBuilder(Order?.find().populate("products.id").populate({
        path: "user",
        select: "-password -verification -isDeleted -role"
    }), query)
        .search(["address", "contact", "tranId"])
        .filter()
        .paginate()
        .sort();
    const data: any = await orderModel.modelQuery;
    const meta = await orderModel.countTotal();
    return {
        data,
        meta,
    };
}


const myOrders = async (userId: string) => {

    const result = await Order?.find({ user: userId }).populate("products.id").sort({ created: -1 });

    return result
}

//user status update
const status_update_order = async (payload: { status: boolean }, id: string) => {

    const result = await Order.updateOne({ _id: id }, { status: payload?.status })

    return result
}

export const orderService = {
    createOrder,
    allOrders,
    myOrders,
    status_update_order
}