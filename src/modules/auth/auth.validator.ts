import { check } from 'express-validator';

export const createAccountValidator = [
    check('name')
        .notEmpty().withMessage('Name is required'),

    check('email')
        .notEmpty().withMessage('email is required')
        .isEmail()
        .normalizeEmail({ all_lowercase: true })
        .withMessage('Invalid email format'),


    check('password')
        .notEmpty().withMessage('password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    check('organization_name')
        .notEmpty().withMessage('Organization name is required'),

    check('site_short_name')
        .notEmpty().withMessage('Site short name is required'),

    check('legal_organization_name')
        .notEmpty().withMessage('Legal organization name is required'),

    check('business_type')
        .notEmpty().withMessage('Business type is required'),

    check('company_type')
        .notEmpty().withMessage('Company type is required'),

    check('tax_type')
        .notEmpty().withMessage('Tax type is required'),

    check('tax_id')
        .notEmpty().withMessage('Tax ID is required'),

    check('organization_liscence')
        .notEmpty().withMessage('Organization license is required'),

    check('organization_npi')
        .optional()
        .isString().withMessage('Organization NPI must be a string'),

    check('facility_npi')
        .optional()
        .isString().withMessage('Facility NPI must be a string'),

    check('diagnostic_code')
        .optional()
        .isString().withMessage('Diagnostic code must be a string'),

    check('pregnancy_related_services')
        .optional()
        .isBoolean().withMessage('Pregnancy related services must be boolean'),

    check('track_pqrs_measure')
        .optional()
        .isBoolean().withMessage('Track PQRS measure must be boolean'),

    check('cfr_part2')
        .optional()
        .isBoolean().withMessage('CFR Part 2 must be boolean'),
]

export const loginAccountValidator = [
    check('email').trim().escape().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
    check('password').trim().escape().not().isEmpty().withMessage('password is required').isString(),
]

export const refreshTokenValidator = [
    check('refreshToken').trim().escape().not().isEmpty().withMessage('refreshToken is required').isString(),
]

export const forgotPasswordValidator = [
    check('email').trim().escape().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
]

export const resetPasswordValidator = [
    check('newPassword').trim().escape().not().isEmpty().withMessage('newPassword is required'),
    check('confirmPassword').trim().escape().not().isEmpty().withMessage('confirmPassword is required'),
]

export const guestUserCreateValidator = [
    check('email').trim().escape().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
]

export const changePasswordValidator = [
    check('oldPassword').trim().escape().not().isEmpty().withMessage('oldPassword is required').isString(),
    check('newPassword').trim().escape().not().isEmpty().withMessage('newPassword is required').isString(),
    check('confirmPassword').trim().escape().not().isEmpty().withMessage('confirmPassword is required').isString(),
]

export const sendAdminRegisterEmailValidator = [
    check('firstName').trim().escape().not().isEmpty().withMessage('firstName is required').isString().isLength({ min: 2 }).withMessage('firstName min length is 2'),
    check('lastName').trim().escape().not().isEmpty().withMessage('lastName is required').isString().isLength({ min: 2 }).withMessage('lastName min length is 2'),
    check('email').trim().escape().not().isEmpty().withMessage('Email is required').isEmail().normalizeEmail({ all_lowercase: true }).withMessage('Invalid Email'),
]