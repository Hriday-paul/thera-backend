import { check } from "express-validator";

export const createChatValidation = [
  check("participants")
    .isArray({ min: 2, max: 2 })
    .withMessage("participants must be an array with exactly 2 user IDs"),
  
  check("participants.*")
    .notEmpty()
    .withMessage("participant ID cannot be empty")
    .isMongoId()
    .withMessage("each participant ID must be a valid Mongo ID")
];