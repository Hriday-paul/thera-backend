import { check, query } from "express-validator";

export const addPackageValidator = [
    check('title').trim().not().isEmpty().withMessage('title is required').isString().isLength({ min: 2 }).withMessage('title min length is 2').isIn(["Free", "Standard"]).withMessage("Title should be Free, Standard"),

    check('features')
        .isArray()
        .withMessage('features must me array'),


    check('duration_day').trim().escape().not().isEmpty().withMessage('duration day is required').isFloat().withMessage('invalid duration format'),
    check('price').trim().escape().not().isEmpty().withMessage('price is required').isFloat().withMessage('invalid price format'),
]

export const updatePackageValidator = [
    check('title').trim().not().isEmpty().withMessage('title is required').isString().isLength({ min: 2 }).withMessage('title min length is 2'),

    check('features')
        .isArray()
        .withMessage('features must me array'),


    check('duration_day').trim().escape().not().isEmpty().withMessage('duration day is required').isFloat().withMessage('invalid duration format'),
    check('price').trim().escape().not().isEmpty().withMessage('price is required').isFloat().withMessage('invalid price format')
]