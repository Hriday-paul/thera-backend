
import { check } from "express-validator";

export const createGameValidator = [
  check('name').trim().not().isEmpty().withMessage('name is required').isString(),
  // check('image').notEmpty().withMessage('Image is requires'),
  check('description').trim().escape().not().isEmpty().withMessage('description is required').isString(),
  check('link').trim().not().isEmpty().withMessage('link is required').isString(),
]