import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import httpStatus from "http-status"
import { invoicesService } from './invoices.service';
import sendResponse from '../../utils/sendResponse';

const createinvoices = catchAsync(async (req: Request, res: Response) => {
  const result = await invoicesService.createinvoices(req.body, req?.user?._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'New invoices created successfully',
    data: result,
  });
});


const updateinvoiceStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await invoicesService.updateinvoiceStatus(req.params?.id, req.body?.status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoice status updated successfully',
    data: result,
  });
});


const getAllinvoicesByPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await invoicesService.getAllinvoicesByPatient(req.params?.id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoices retrived successfully',
    data: result,
  });
});
const getAllinvoicesByCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await invoicesService.getAllinvoicesByCompany(req.user?._id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoices retrived successfully',
    data: result,
  });
});

const getinvoicesById = catchAsync(async (req: Request, res: Response) => { });
const updateinvoices = catchAsync(async (req: Request, res: Response) => { });
const deleteinvoices = catchAsync(async (req: Request, res: Response) => { });

export const invoicesController = {
  createinvoices,
  getAllinvoicesByPatient,
  getinvoicesById,
  updateinvoices,
  deleteinvoices,
  updateinvoiceStatus,
  getAllinvoicesByCompany
};