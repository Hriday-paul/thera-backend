import { check } from "express-validator";

export const createSubTaskValidate = [

    check('title')
        .notEmpty()
        .withMessage("Subtask title is required."),

    check('start_date')
        .notEmpty()
        .withMessage("Subtask start_date is required.")
        .notEmpty().withMessage("Start date is required.")
        .isISO8601().toDate().withMessage("Start date must be a valid ISO date."),

    check('isRepeat')
        .notEmpty()
        .isBoolean()
        .withMessage("Subtask isRepeat is required & boolean."),

    check('repeat_type')
        .notEmpty()
        .isIn(["none", "daily", "weekly", "monthly", "yearly"]).withMessage("Invalid repeat type."),

    check("repeat_count")
        .notEmpty()
        .isInt({ min: 0 }).withMessage("Repeat count must be a non-negative integer."),

    check("task_occurence")
        .notEmpty()
        .isMongoId().withMessage("task_occurence must be valid"),

];