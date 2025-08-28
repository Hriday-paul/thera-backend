import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentsService } from './payments.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import config from '../../config';

const checkout = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.checkout(req.body?.package, req.user._id, config.success_url!);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'payment link get successful',
  });
});


const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { next } = req?.query;
  const result = await paymentsService.confirmPayment(req?.query);

  res.redirect(`${config.client_Url}${next ?? config.success_url}`);
  // sendResponse(res, {
  //   success: true,
  //   statusCode: httpStatus.OK,
  //   data: result,
  //   message: 'payment successful',
  // });
});

const getPaymentsByUserId = catchAsync(async (req: Request, res: Response) => {
  // const userId = req.user?.userId;
  // const result = await paymentsService.getPaymentsByUserId(userId, req.query);
  // if (!result) {
  //   return sendResponse(res, {
  //     success: false,
  //     statusCode: httpStatus.NOT_FOUND,
  //     message: 'Payment not found',
  //     data: {},
  //   });
  // }
  // sendResponse(res, {
  //   success: true,
  //   statusCode: httpStatus.OK,
  //   data: result,
  //   message: 'Payment retrieved successfully',
  // });
});

const myPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getPaymentsByUserId(req?.user?._id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Payment retrieved successfully',
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.getAllPayments(req.query); // Assume this service method exists
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'All payments retrieved successfully',
  });
});

const getPaymentsById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await paymentsService.getPaymentsById(id); // Assume this service method exists
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Payment not found',
      data: {},
    });
  }
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Payment retrieved successfully',
  });
});

const updatePayments = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const paymentData = req.body;
  const result = await paymentsService.updatePayments(id, paymentData); // Assume this service method exists
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Payment not found',
      data: {},
    });
  }
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Payment updated successfully',
  });
});

const deletePayments = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await paymentsService.deletePayments(id);
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Payment not found',
      data: {},
    });
  }
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.NO_CONTENT,
    message: 'Payment deleted successfully',
    data: result,
  });
});

const paymentAmount = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.paymentAmount(); // Assume this service method exists
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Payments amount retrieved successfully',
  });
});
const monthlyPaymentByCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.monthlyPaymentByCompany(req?.params?.id, req?.query); // Assume this service method exists
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Payments chart amount successfully',
  });
});

const purchaseStats = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.purchaseStats();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Payments stats amount retrived successfully',
  });
});

export const paymentsController = {
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
  confirmPayment,
  getPaymentsByUserId,
  myPayments,
  checkout,
  paymentAmount,

  monthlyPaymentByCompany,
  purchaseStats
};
