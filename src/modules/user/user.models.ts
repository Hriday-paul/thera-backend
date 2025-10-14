import { Schema, model } from 'mongoose';
import { IAutomation, IBilling, ICompany, IContact, IFamilyGroup, IMsgTemplate, InsuranceType, IOrgLocation, IPatient, Ipatienttag, IPerson, IReminder, IService, IStaf, IUser } from './user.interface';

const OrgLocationSchema = new Schema<IOrgLocation>({
  state: { type: String },
  street: { type: String },
  city: { type: String },
  zip_code: { type: String },
  email: { type: String },
  fax: { type: String },
  phone: { type: String },
  rooms: [{ type: String }],

});

export const SeviceSchema = new Schema<IService>({
  service_category: { type: String },
  service_code: { type: String },
  service_offered: { type: String },
  amount: { type: Number },
  service_period: { type: String },
  unit: { type: String },
  isArchived: { type: Boolean, default: false }
});

const billingSchema = new Schema({
  state: { type: String },
  street: { type: String },
  zip_code: { type: String },
  email: { type: String },
  fax: { type: String },
  phone: { type: String },
})
const reminderSchema = new Schema<IReminder>({
  msg_type: { type: String, required: true, enum: ["Email", "SMS"] },
  long_ago: { type: Number, required: true },
  time_type: { type: String, required: true, enum: ["Hours", "Minutes", "Days"] },
})
const MsgTemplateSchema = new Schema<IMsgTemplate>({
  sms: {
    isActive: { type: Boolean, default: false },
    message: { type: String, default: "Your appointment reminder for {{organisation Name}}. Reply with 1 to confirm or 2 cancel. Call\nYou have an appointment with us scheduled for {{orgCallbackNumber}} to reschedule." },
  },
  email: {
    isActive: { type: Boolean, default: true },
    message: { type: String, default: "Your appointment reminder for {{organisation Name}}. Reply with 1 to confirm or 2 cancel. Call\nYou have an appointment with us scheduled for {{orgCallbackNumber}} to reschedule." },
  },
})

const AutomationsSchema: Schema<IAutomation> = new Schema({
  claim_service: { type: Boolean, default: true },

  eligibility: {
    new_patient_Check: { type: Boolean, default: true },
    batchCheck: { type: Boolean, default: true },
    primary_secondary_bill: { type: Boolean, default: true },
  },

  others: {
    invoice_creaton: { type: Boolean, default: true },
    invoice_process: { type: Boolean, default: true },
    claim_submission: { type: Boolean, default: true },
    era_process: { type: Boolean, default: false },
    urchive_unmatch_era_claim: { type: Boolean, default: false },
  },

  chat: {
    staff: {
      allow_see_patient_list: { type: Boolean, default: true },
      allow_chat_by_all_patients: { type: Boolean, default: true },
      allow_chat_with_staff: { type: Boolean, default: true },
    },
    patient: {
      allow_see_staffs: { type: Boolean, default: true },
      allow_chat_with_staff: { type: Boolean, default: true },
    },
  },
}, { _id: false });

const patienttagSchema = new Schema<Ipatienttag>({
  name: { type: String, required: true },
})

const organizationSchema: Schema<ICompany> = new Schema<ICompany>(
  {
    // title: { type: String, required: true },
    // full_name: { type: String, required: true },
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

    hide_date_creation_progress_note: { type: Boolean, default: false },
    required_diagnostic_code: { type: Boolean, default: false },
    enable_telehealth: { type: Boolean, default: false },

    city: { type: String },
    state: { type: String },
    country: { type: String },
    fax_num: { type: String },
    org_email: { type: String },
    org_phone: { type: String },
    street: { type: String },
    zip_code: { type: String },
    billingDetails: { type: billingSchema },

    locations: { type: [OrgLocationSchema] },
    services: { type: [SeviceSchema] },

    currency: { type: String },
    default_billing_place: { type: OrgLocationSchema },

    appointment_kept: { type: Boolean, default: false },

    automations: {
      type: AutomationsSchema, default: {
        claim_service: true,

        eligibility: {
          new_patient_Check: true,
          batchCheck: true,
          primary_secondary_bill: true,
        },

        others: {
          invoice_creaton: true,
          invoice_process: true,
          claim_submission: true,
          era_process: false,
          urchive_unmatch_era_claim: false,
        },

        chat: {
          staff: {
            allow_see_patient_list: true,
            allow_chat_by_all_patients: true,
            allow_chat_with_staff: true,
          },
          patient: {
            allow_see_staffs: true,
            allow_chat_with_staff: true,
          },
        },
      }
    },

    reminderTypes: {
      type: [reminderSchema], default: [{
        msg_type: "Email",
        long_ago: 30,
        time_type: "Minutes"
      }]
    },

    msg_templates: {
      type: MsgTemplateSchema, default: {
        sms: {
          isActive: false,
          message: "Your appointment reminder for {{OrganisationName}}. You have an appointment with us scheduled for {{Date}} {{Time}}. We hope you will attend this appointment. Contact us, {{OrgCallbackNumber}} for rechedule."
        },
        email: {
          isActive: true,
          message: "Your appointment reminder for {{OrganisationName}}. You have an appointment with us scheduled for {{Date}} {{Time}}. We hope you will attend this appointment. Contact us, {{OrgCallbackNumber}} for rechedule.",
        },
      }
    },
    patient_tags: { type: [patienttagSchema] },

    use_appointment_location: { type: Boolean, default: false },
    auto_set_telehealth_place: { type: Boolean, default: false }

  }
);

const workScheduleSchema = new Schema({
  day: { type: String, required: true },
  willWork: { type: Boolean, required: true },
  times: { type: [String], required: true },
}, { _id: false });


const offDaySchema = new Schema({
  reason: { type: String, required: true },
  dates: [{ type: Date, required: true }],
  repeat: { type: Boolean, default: false },
  repeat_type: { type: String, default: '' },
}, { _id: false });

const staffSchema: Schema<IStaf> = new Schema<IStaf>({
  name_title: { type: String, required: true },
  f_name: { type: String, required: true },
  middle_name: { type: String },
  last_name: { type: String },
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


const contactSchema: Schema<IContact> = new Schema<IContact>({
  name_title: { type: String, required: true },
  full_name: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  street: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  relation: { type: String, required: true },
});

export const insuranceSchema: Schema<InsuranceType> = new Schema<InsuranceType>({
  insurance_provider: { type: String },
  plan_type: { Type: String },
  therapy_type: { type: String },
  policy_number: { type: String },
  approved_session: { type: Number, default: 0 },
  sessionFrequency: { type: String },
  group_number: { type: String },
  copayment: { type: Number, default: 0 },
  pocket_maximum_amount: { type: Number, default: 0 },
  from_date: { type: Date },
  to_date: { type: Date },
  referral_number: { Type: String },
});

const PersonSchema: Schema<IPerson> = new Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
});

const FamilyGroupSchema: Schema<IFamilyGroup> = new Schema({
  name: { type: String, required: true },
  persons: { type: [PersonSchema], required: true },
});

const BillingSchema: Schema<IBilling> = new Schema({
  email: { type: String, required: true },
  phone: { type: String },
  country: { type: String },
  state: { type: String },
  zip_code: { type: String },
  street: { type: String },
});

const contactPrefrences: Schema = new Schema({
  mentionAgency: { type: Boolean, default: false, required: true },
  allowPhone: { type: Boolean, default: false, required: true },
  allowText: { type: Boolean, default: false, required: true },
  allowEmail: { type: Boolean, default: true, required: true },
});

const patientSchema: Schema<IPatient> = new Schema<IPatient>(
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
    state: { type: String },
    zip_code: { type: String },
    street: { type: String },
    phone: { type: String },
    address: { type: String },
    ssn: { type: String },
    ethnicity: { type: String },
    marital_status: { type: String },
    religion: { type: String },
    language: { type: String },
    employment_status: { type: String },
    employer: { type: String },
    employer_email: { type: String },
    employer_phone: { type: String },
    assign_stafs: [{ type: Schema.Types.ObjectId, ref: 'users' }],

    contacts: { type: [contactSchema], default: [] },

    familyGroup: { type: FamilyGroupSchema, default: null },

    billing_details: { type: BillingSchema, default: null },

    legal_date: { type: Date },
    livingWill: { type: String },
    advanceDirectives: { type: String },
    hasDPOA: { type: String },
    dpoaName: { type: String },
    dpoaOnFile: { type: String },
    dpoaAddress: { type: String },
    dpoaPhone: { type: String },
    proxyName: { type: String },
    proxyAddress: { type: String },
    proxyEmail: { type: String },
    proxyPhone: { type: String },
    clinicName: { type: String },
    primaryPhysician: { type: String },
    physicianAddress: { type: String },
    physicianPhone: { type: String },
    visitDate: { type: Date },
    chronicIllnesses: { type: String },
    medications: { type: String },
    healthCareProviders: { type: String },
    medicalDiagnoses: { type: String },
    date: { type: Date },
    residenceType: { type: String },
    familyType: { type: String },
    residenceOwnership: { type: String },
    householdSize: { type: String },
    livingWith: { type: String },
    supportServices1: { type: [String], default: [] },
    housingNotes: { type: String },
    lightHousekeeping: { type: String },
    heavyHousekeeping: { type: String },
    generalShopping: { type: String },
    ownShopping: { type: String },
    drives: { type: String },
    prepareMeal: { type: String },
    manageMoney: { type: String },
    useTelephone: { type: String },
    bathing: { type: String },
    toiletUse: { type: String },
    adlShopping: { type: String },

    family_income: { type: Number, default: 0 },
    family_income_type: { type: String },
    payment_amount: { type: Number, default: 0 },
    // contactPreferences: { type: String },
    hasInsurance: { type: String },
    insurances: { type: [insuranceSchema], default: [] },

    contactPreferences: {
      type: contactPrefrences
    }

  }
);





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
    isOnline: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isDisable: {
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
    },
    company: { type: Schema.Types.ObjectId, ref: "companies", default: null },
    patient: { type: Schema.Types.ObjectId, ref: "patients", default: null },
    staf: { type: Schema.Types.ObjectId, ref: "stafs", default: null },
    staf_company_id: { type: Schema.Types.ObjectId, ref: "users", default: null },
    patient_company_id: { type: Schema.Types.ObjectId, ref: "users", default: null },
  },
  {
    timestamps: true,
    _id: true
  },
);

// User model creation
export const User = model<IUser>('users', userSchema);

export const Company = model<ICompany>('companies', organizationSchema);
export const Staf = model<IStaf>('stafs', staffSchema);
export const Patient = model<IPatient>('patients', patientSchema);
