import { ObjectId } from 'mongoose';
import { InsuranceType, IService } from '../user/user.interface';

export interface IInvoice {
    _id : ObjectId,
    patient : ObjectId,
    company : ObjectId,
    invoice_num : string,
    due_date : Date,
    total_amount : number,
    rendering_provider : string,
    primary_authorization : string,
    secondary_authorization : string,
    billing_provider : InsuranceType,
    biller_location : string,
    isStaffNpi : boolean,
    isOrgNpi : boolean,
    service : IService,
    note : string,

    diagnostic_Code : string,
    service_Code : string,
    service_quantity : number,
    service_cost : number,

    status : "pending" | "complete" | "write-off"
}