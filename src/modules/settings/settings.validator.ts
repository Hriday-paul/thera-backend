
import { check } from "express-validator";

export const updateSettingsValidator = [
  check('key').trim().escape().not().isEmpty().withMessage('key is required').isString().isIn(['terms', 'privacy']).withMessage('invalid key'),
  check('value').trim().escape().not().isEmpty().withMessage('value is required').isString(),
]