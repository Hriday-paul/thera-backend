import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  status: number; // 1 or 0
  name: string;
  email: string;
  // contact: string;
  password: string;
  image: string;
  isverified: boolean
  role: "patient" | "admin" | "company" | "staf";
  verification: {
    otp: string | number;
    expiresAt: Date;
    status: boolean;
  };
  isDeleted: boolean,
  company: ICompany | null,
  patient : IPatient | null,
  staf : IStaf | null
}

export interface ICompany {
  // title: string,
  // full_name: string,
  organization_name: string,
  site_short_name: string,
  legal_organization_name: string,
  business_type: string,
  company_type: string,
  tax_type: string,
  tax_id: string,
  organization_liscence: string,
  organization_npi?: string,
  facility_npi?: string,
  diagnostic_code: string,
  pregnancy_related_services: boolean,
  track_pqrs_measure: boolean,
  cfr_part2: boolean
}

export interface IStaf {
  name_title: string,
  f_name: string,
  middle_name?: string,
  last_name: string,
  preferred_name?: string,
  gender: string,
  sexual_orientation?: string,
  date_of_birth: Date,
  country: string,
  state: string,
  zip_code: string,
  street: string,
  phone: string,

  staf_role: string,
  services: string[],
  hired_date: Date,
  termination_date?: Date,
  degree_level: string,
  awarding_institution: string,
  contructor: string,
  exempt_status: string,
  service_area_zip_code: string,
  work_location?: string,
  office_email?: string,
  office_phone?: string,
  identification_type: string,
  licence_number: string,
  social_security_number?: string,
  tax_id: string,
  ama_cpt_code?: string,
  provider_npi?: string,
  provider_licence_number?: string,
  dea_number?: string,

  work_schedule: { day: string, willWork : boolean, times : Date[] }[],
  offDays: { reason: string, dates : Date[], repeat: boolean, repeat_type: string }[],

  staf_company: Types.ObjectId
}

export interface IPatient {
  name_title: string,
  f_name: string,
  middle_name?: string,
  last_name: string,
  preferred_name?: string,
  gender: string,
  sexual_orientation?: string,
  date_of_birth: Date,
  country: string,
  state: string,
  zip_code: string,
  street: string,
  phone: string,
  address: string,
  ssn: string,
  ethnicity: string,
  marital_status: string,
  religion: string,
  language: string,
  employment_status: string,
  employer: string,
  employer_email: string,
  employer_phone: string,
  assign_staf: Types.ObjectId[],
  contactPreferences: {
    mentionAgency: boolean,
    allowPhone: boolean,
    allowText: boolean,
    allowEmail: boolean
  }
}

// contact: {
//   name_title: string,
//   full_name: string,
//   relation: string,
//   country: string,
//   state: string,
//   zip_code: string,
//   street: string,
//   phones: string[],
//   emails : string[]
// }
export interface IIStaf extends IUser, IStaf{}
export interface IICompany extends IUser, ICompany{}