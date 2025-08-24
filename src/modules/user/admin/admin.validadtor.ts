
import { check } from "express-validator";

export const validateWeekFormat = [
    check("week")
        .notEmpty()
        .withMessage('week is required').isInt().withMessage("week should numeric"),
    check("year")
        .notEmpty()
        .withMessage('year is required').isInt().withMessage("year should numeric"),
];
