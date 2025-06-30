import { Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { orderService } from "./order.service";
import { paymentsService } from "../payments/payments.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {

    const { res: order, product_names } = await orderService.createOrder(req.body, req.user._id);

    const stripeLink = await paymentsService.checkout(order, req.user._id, product_names);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: stripeLink,
        message: 'order created successful',
    });
});

const allOrders = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await orderService.allOrders(query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: result,
        message: 'All orders retrieved successfully',
    });
});

const myOrders = catchAsync(async (req: Request, res: Response) => {

    const result = await orderService.myOrders(req?.user?._id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: result,
        message: 'My orders retrieved successfully',
    });
});


const update_order_status: RequestHandler<{ id: string }, {}, { status: boolean }> = catchAsync(async (req, res) => {
    const result = await orderService.status_update_order(req.body, req.params.id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'status updated successfully',
        data: result,
    });
})

export const orderController = {
    createOrder,
    allOrders,
    myOrders,
    update_order_status
}