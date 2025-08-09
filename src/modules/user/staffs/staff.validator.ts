import { query } from "express-validator";

export const getfreestaffValidator = [
    query("date")
        .notEmpty()
        .withMessage("date is required")
        .isISO8601()
        .withMessage("date must be a valid date"),

    query("time")
        .notEmpty()
        .withMessage("time is required")
        .isISO8601()
        .withMessage("time must be a valid time")
];