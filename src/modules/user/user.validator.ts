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
