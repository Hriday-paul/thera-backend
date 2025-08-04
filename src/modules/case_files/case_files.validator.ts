import { check } from "express-validator";

export const createCaseFileValidator = [
    check('name').trim().not().isEmpty().withMessage('name is required').isString(),

    check('patient').trim().not().isEmpty().withMessage('patient is required').isMongoId().withMessage("patient id is invalid"),
    check('intake_date_time').trim().not().isEmpty().withMessage('intake_date_time is required').isISO8601().toDate()
        .withMessage("Invalid date received"),

    check('assign_stafs')
        .isArray({ min: 1 })
        .withMessage('At least one staff must be assigned'),

    check('assign_stafs.*')
        .isMongoId()
        .withMessage('Each staff ID must be a valid ID'),
]

export const statusUpdateCaseFileValidator = [
    check('status').trim().not().isEmpty().withMessage('status is required').isBoolean().withMessage("Invalid status"),
]