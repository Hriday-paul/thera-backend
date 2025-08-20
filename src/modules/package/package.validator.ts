import { check, query } from "express-validator";

export const addPackageValidator = [
    check('title').trim().not().isEmpty().withMessage('title is required').isString().isLength({ min: 2 }).withMessage('title min length is 2'),

     check('features')
        .isArray()
        .withMessage('features must me array'),

   
    check('duration_day').trim().escape().not().isEmpty().withMessage('duration day is required').isFloat().withMessage('invalid duration format'),
    check('price').trim().escape().not().isEmpty().withMessage('price is required').isFloat().withMessage('invalid price format'),
]

export const updatePackageValidator = [
    check('product_limit').trim().optional().isFloat().withMessage('invalid product_limit format'),
    check('duration_day').trim().optional().isFloat().withMessage('invalid duration format'),
    check('price').trim().optional().isNumeric().withMessage('invalid price format'),
]