import { body, check, param } from "express-validator";

export const statusUpdateValidator = [
    check('status').trim().escape().not().isEmpty().withMessage('status is required').isBoolean().withMessage("status must be boolean"),
]

export const addStaffValidator = [
    body('email')
        .notEmpty().withMessage('email is required')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email format'),


    body('password')
        .notEmpty().withMessage('password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

export const addPatientValidator = [
    check('email')
        .notEmpty().withMessage('email is required')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email format'),


    check('password')
        .notEmpty().withMessage('password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

export const addPatientfamilyGroupValidator = [
    check('name')
        .notEmpty().withMessage('group name is required'),

    check('persons')
        .isArray()
        .withMessage('persons must be array'),

    check('persons.*.name')
        .notEmpty()
        .withMessage('Person name is required'),

    check('persons.*.relation')
        .notEmpty()
        .withMessage('Relation is required'),
]

export const familyGroupPersonAddValidator = [
    check('name')
        .notEmpty().withMessage('group name is required'),

    check('relation')
        .notEmpty()
        .withMessage('Relation is required'),
]

export const familyGroupPersoUpdateValidator = [
    check('name')
        .notEmpty().withMessage('group name is required'),
    check('person')
        .notEmpty().withMessage('person is required').isMongoId().withMessage("Invalid person provide"),

    check('relation')
        .notEmpty()
        .withMessage('Relation is required'),
]

export const PersonDeleteFamilyValidator = [
    check('person')
        .notEmpty().withMessage('person is required').isMongoId().withMessage("Invalid person provide"),
]

export const addPatientEmergencyPersonValidator = [
    check("name_title")
        .notEmpty().withMessage("Name title is required")
        .isString().withMessage("Name title must be a string"),

    check("full_name")
        .notEmpty().withMessage("Full name is required")
        .isString().withMessage("Full name must be a string"),

    check("relation")
        .notEmpty().withMessage("Relation is required")
        .isString().withMessage("Relation must be a string"),

    check("country")
        .notEmpty().withMessage("Country is required")
        .isString().withMessage("Country must be a string"),

    check("state")
        .notEmpty().withMessage("State is required")
        .isString().withMessage("State must be a string"),

    check("zip_code")
        .notEmpty().withMessage("Zip code is required")
        .isPostalCode("any").withMessage("Invalid zip code"),

    check("street")
        .notEmpty().withMessage("Street is required")
        .isString().withMessage("Street must be a string"),

    check("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email"),

    check("phone")
        .notEmpty().withMessage("Phone is required")
        .isMobilePhone("any").withMessage("Invalid phone number"),
];

export const updatePatientEmergencyPersonValidator = [
    check('person')
        .notEmpty().withMessage('person is required').isMongoId().withMessage("Invalid person provide"),

    check("name_title")
        .notEmpty().withMessage("Name title is required")
        .isString().withMessage("Name title must be a string"),

    check("full_name")
        .notEmpty().withMessage("Full name is required")
        .isString().withMessage("Full name must be a string"),

    check("relation")
        .notEmpty().withMessage("Relation is required")
        .isString().withMessage("Relation must be a string"),

    check("country")
        .notEmpty().withMessage("Country is required")
        .isString().withMessage("Country must be a string"),

    check("state")
        .notEmpty().withMessage("State is required")
        .isString().withMessage("State must be a string"),

    check("zip_code")
        .notEmpty().withMessage("Zip code is required")
        .isPostalCode("any").withMessage("Invalid zip code"),

    check("street")
        .notEmpty().withMessage("Street is required")
        .isString().withMessage("Street must be a string"),

    check("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email"),

    check("phone")
        .notEmpty().withMessage("Phone is required")
        .isMobilePhone("any").withMessage("Invalid phone number"),
];
