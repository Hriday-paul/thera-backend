import { Schema, model } from 'mongoose';
import { ICompany, IPatient, IStaf, IUser } from './user.interface';


// Mongoose schema definition
const userSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // contact: {
    //   type: String,
    //   required: false,
    // },
    password: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ["patient", "admin", "company", "staf"],
      required: true,
      default: "company"
    },
    isverified: {
      type: Boolean,
      default: false
    },
    status: {
      type: Number,
      default: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    verification: {
      otp: {
        type: Schema.Types.Mixed,
        default: 0,
      },
      expiresAt: {
        type: Date,
      },
      status: {
        type: Boolean,
        default: false,
      },
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'userType',
    collection: 'users',
    _id: true
  },
);

// User model creation
export const User = model<IUser>('users', userSchema);

const organizationSchema : Schema<ICompany> = new Schema<ICompany>(
  {
    title: { type: String, required: true },
    full_name: { type: String, required: true },
    organization_name: { type: String, required: true },
    site_short_name: { type: String, required: true },
    legal_organization_name: { type: String, required: true },
    business_type: { type: String, required: true },
    company_type: { type: String, required: true },
    tax_type: { type: String, required: true },
    tax_id: { type: String, required: true },
    organization_liscence: { type: String, required: true },
    organization_npi: { type: String, default: null },
    facility_npi: { type: String, default: null },
    diagnostic_code: { type: String, required: true },
    pregnancy_related_services: { type: Boolean, default: false },
    track_pqrs_measure: { type: Boolean, default: false },
    cfr_part2: { type: Boolean, default: false },
  }
);

export const Organization = User.discriminator("company", organizationSchema);


const workScheduleSchema = new Schema({
  day: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
}, { _id: false });

const offDaySchema = new Schema({
  reason: { type: String, required: true },
  start_date: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isRepeat: { type: Boolean, default: false },
  repeatType: { type: String, default: '' },
}, { _id: false });

const staffSchema :  Schema<IStaf> = new Schema<IStaf>({
  name_title: { type: String, required: true },
  f_name: { type: String, required: true },
  middle_name: { type: String },
  last_name: { type: String, required: true },
  preferred_name: { type: String },
  gender: { type: String, required: true },
  sexual_orientation: { type: String },
  date_of_birth: { type: Date, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  street: { type: String, required: true },
  phone: { type: String, required: true },
  staf_role: { type: String, required: true },
  services: { type: [String], default: [] },
  hired_date: { type: Date, required: true },
  termination_date: { type: Date },
  degree_level: { type: String, required: true },
  awarding_institution: { type: String, required: true },
  contructor: { type: String, required: true },
  exempt_status: { type: String, required: true },
  service_area_zip_code: { type: String, required: true },
  work_location: { type: String },
  office_email: { type: String },
  office_phone: { type: String },
  identification_type: { type: String, required: true },
  licence_number: { type: String, required: true },
  social_security_number: { type: String },
  tax_id: { type: String, required: true },
  ama_cpt_code: { type: String },
  provider_npi: { type: String },
  provider_licence_number: { type: String },
  dea_number: { type: String },
  work_schedule: { type: [workScheduleSchema], default: [] },
  offDays: { type: [offDaySchema], default: [] },
});

export const Staff = User.discriminator('staff', staffSchema);


const patientSchema : Schema<IPatient> = new Schema<IPatient>(
  {
    name_title: { type: String, required: true },
    f_name: { type: String, required: true },
    middle_name: String,
    last_name: { type: String, required: true },
    preferred_name: String,
    gender: { type: String, required: true },
    sexual_orientation: String,
    date_of_birth: { type: Date, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    street: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    ssn: { type: String, required: true },
    ethnicity: { type: String, required: true },
    marital_status: { type: String, required: true },
    religion: { type: String, required: true },
    language: { type: String, required: true },
    employment_status: { type: String, required: true },
    employer: { type: String, required: true },
    employer_email: { type: String, required: true },
    employer_phone: { type: String, required: true },
    assign_staf: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  }
);

export const Patient = User.discriminator('patient', patientSchema);