import mongoose, { model } from "mongoose";
import { IInvoice } from "./invoices.interface";
import { insuranceSchema, SeviceSchema } from "../user/user.models";

const InvoiceSchema = new mongoose.Schema<IInvoice>({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    due_date: { type: Date },
    invoice_num: { type: String, required: true },
    total_amount: { type: Number, required: true },
    rendering_provider: { type: String, },
    primary_authorization: { type: String, },
    secondary_authorization: { type: String },
    billing_provider: { type: insuranceSchema },
    biller_location: { type: String },
    isStaffNpi: { type: Boolean, default: false },
    isOrgNpi: { type: Boolean, default: true },
    service: { type: SeviceSchema },
    note: { type: String },
    status: {
        type: String,
        enum: ["pending", "completed", "write-off"],
        default: "pending"
    },
    diagnostic_Code: { type: String },
    service_Code: { type: String },
    service_cost: { type: Number, default: 0 },
    service_quantity: { type: Number, default: 0 }
}, { timestamps: true });

export const Invoices = model<IInvoice>("invoices", InvoiceSchema);