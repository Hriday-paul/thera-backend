import { check } from "express-validator";

export const editPatientBillingValidator = [
    check('email')
        .notEmpty().withMessage('email is required')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email format'),

    check('phone')
        .notEmpty()
        .withMessage('Phone number is required'),

    check('country')
        .notEmpty()
        .withMessage('Country is required'),

    check('state')
        .notEmpty()
        .withMessage('State is required'),

    check('zip_code')
        .notEmpty()
        .withMessage('ZIP code is required'),

    check('street')
        .notEmpty()
        .withMessage('Street address is required'),
]


export const insuranceValidator = [
  check("insurance_provider")
    .notEmpty()
    .withMessage("Insurance provider is required"),

//   check("plan_type")
//     .notEmpty()
//     .withMessage("Plan type is required"),

//   check("therapy_type")
//     .notEmpty()
//     .withMessage("Therapy type is required"),

//   check("policy_number")
//     .notEmpty()
//     .withMessage("Policy number is required"),

//   check("approved_session")
//     .isInt({ min: 1 })
//     .withMessage("Approved session must be a positive integer"),

//   check("sessionFrequency")
//     .notEmpty()
//     .withMessage("Session frequency is required"),

//   check("group_number")
//     .notEmpty()
//     .withMessage("Group number is required"),

//   check("copayment")
//     .isNumeric()
//     .withMessage("Copayment must be a number"),

//   check("pocket_maximum_amount")
//     .isNumeric()
//     .withMessage("Pocket maximum amount must be a number"),

  check("from_date")
    .isISO8601()
    .withMessage("From date must be a valid date"),

  check("to_date")
    .isISO8601()
    .withMessage("To date must be a valid date"),

//   check("referral_number")
//     .notEmpty()
//     .withMessage("Referral number is required"),
];

export const editInsuranceValidator = [
    check("insurance")
    .notEmpty()
    .withMessage("Insurance is required")
    .isMongoId().withMessage("Insurance is invalid"),

  check("insurance_provider")
    .notEmpty()
    .withMessage("Insurance provider is required"),

//   check("plan_type")
//     .notEmpty()
//     .withMessage("Plan type is required"),

//   check("therapy_type")
//     .notEmpty()
//     .withMessage("Therapy type is required"),

//   check("policy_number")
//     .notEmpty()
//     .withMessage("Policy number is required"),

//   check("approved_session")
//     .isInt({ min: 1 })
//     .withMessage("Approved session must be a positive integer"),

//   check("sessionFrequency")
//     .notEmpty()
//     .withMessage("Session frequency is required"),

//   check("group_number")
//     .notEmpty()
//     .withMessage("Group number is required"),

//   check("copayment")
//     .isNumeric()
//     .withMessage("Copayment must be a number"),

//   check("pocket_maximum_amount")
//     .isNumeric()
//     .withMessage("Pocket maximum amount must be a number"),

  check("from_date")
    .isISO8601()
    .withMessage("From date must be a valid date"),

  check("to_date")
    .isISO8601()
    .withMessage("To date must be a valid date"),

//   check("referral_number")
//     .notEmpty()
//     .withMessage("Referral number is required"),
];

export const deleteInsuranceValidator = [
    check("insurance")
    .notEmpty()
    .withMessage("Insurance is required")
    .isMongoId().withMessage("Insurance is invalid")
];