import { Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import { IInvoice } from "./invoices.interface";
import { Invoices } from "./invoices.models";

const createinvoices = async (payload: IInvoice, companyId: string) => {
  const { status, ...newpayload } = payload
  const res = await Invoices.insertOne({ ...newpayload, company: companyId });
  return res;
};

const getAllinvoicesByPatient = async (userId: string, query: Record<string, any>) => {
  const paymentModel = new QueryBuilder(Invoices.find({ patient: new Types.ObjectId(userId) }), query)
    .search(['invoice_num'])
    .filter()
    .sort();
  const data: any = await paymentModel.modelQuery;

  return data;
};

const getAllinvoicesByCompany = async (companyId: string, query: Record<string, any>) => {
  const paymentModel = new QueryBuilder(Invoices.find({ company: new Types.ObjectId(companyId) }), query)
    .search(['invoice_num'])
    .filter()
    .sort();
  const data: any = await paymentModel.modelQuery;
  const meta = await paymentModel.countTotal();

  return { data, meta };
};

const updateinvoiceStatus = async (invoiceId: string, status: string) => {
  const res = await Invoices.updateOne({ _id: invoiceId }, { status });
  return res;
};

const getinvoicesById = async () => { };
const updateinvoices = async () => { };
const deleteinvoices = async () => { };

export const invoicesService = {
  createinvoices,
  getAllinvoicesByPatient,
  getinvoicesById,
  updateinvoices,
  deleteinvoices,
  updateinvoiceStatus,
  getAllinvoicesByCompany
};