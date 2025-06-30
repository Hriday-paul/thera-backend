import { check } from "express-validator";

export const createOrderValidator = [
    check('contact').trim().escape().not().isEmpty().withMessage('contact is required').isString().isMobilePhone('any').withMessage('Invalid contact number'),
    check('address').trim().not().isEmpty().withMessage('address is required').isString(),

    check('products')
        .isArray({ min: 1 })
        .withMessage('Products must be a non-empty array'),

    check('products.*.id')
        .isMongoId()
        .withMessage('Each product must have a valid MongoDB ID'),

    check('products.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be an integer greater than 0'),
]



export const statusUpdateOrderValidator = [
    check('status').optional().trim().escape().isIn(['complete', 'cancel', 'pending']).withMessage('invalid status')
]
