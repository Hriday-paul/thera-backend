
import { check } from "express-validator";

export const createBlogValidator = [
  check('name').trim().not().isEmpty().withMessage('name is required').isString(),
  // check('image').notEmpty().withMessage('Image is requires'),
  check('description').trim().not().isEmpty().withMessage('description is required').isString(),
]