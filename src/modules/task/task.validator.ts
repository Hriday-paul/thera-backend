import { check } from "express-validator";

export const createTaskValidate = [
    check("title")
        .notEmpty().withMessage("Title is required.")
        .isString().withMessage("Title must be a string."),

    check("priority")
        .notEmpty()
        .withMessage("Priority is required.")
        .isIn(["high", "low", "medium"]).withMessage("Priority type invalid"),

    check("note")
        .optional()
        .isString().withMessage("Note must be a string."),

    check("associated_by")
        .notEmpty()
        .withMessage("associated_by is required.")
        .isIn(["appointment", "patient"]).withMessage("associated_by type invalid"),

    check("start_date")
        .notEmpty().withMessage("Start date is required.")
        .isISO8601().toDate().withMessage("Start date must be a valid ISO date."),

    check("repeat_type")
        .isIn(["none", "daily", "weekly", "monthly", "yearly"]).withMessage("Invalid repeat type."),

    check("repeat_count")
        .notEmpty()
        .isInt({ min: 0 }).withMessage("Repeat count must be a non-negative integer."),

    check("staff_ids")
        .isArray({ min: 1 }).withMessage("Staff IDs must be a non-empty array."),

    check('staff_ids.*')
        .isMongoId()
        .withMessage("Each staff ID must be a valid ObjectId."),


    check('subtasks')
        .isArray()
        .withMessage('subtasks must be array'),

    check('subtasks.*.title')
        .notEmpty()
        .withMessage("Subtask title is required."),

    check('subtasks.*.start_date')
        .notEmpty()
        .withMessage("Subtask start_date is required.")
        .notEmpty().withMessage("Start date is required.")
        .isISO8601().toDate().withMessage("Start date must be a valid ISO date."),

    check('subtasks.*.isRepeat')
        .notEmpty()
        .isBoolean()
        .withMessage("Subtask isRepeat is required & boolean."),

    check('subtasks.*.repeat_type')
        .notEmpty()
        .isIn(["none", "daily", "weekly", "monthly", "yearly"]).withMessage("Invalid repeat type."),

    check("subtasks.*.repeat_count")
        .notEmpty()
        .isInt({ min: 0 }).withMessage("Repeat count must be a non-negative integer."),

];

export const updateTaskValidate = [
    check("title")
        .notEmpty().withMessage("Title is required.")
        .isString().withMessage("Title must be a string."),

    check("priority")
        .notEmpty()
        .withMessage("Priority is required.")
        .isIn(["high", "low", "medium"]).withMessage("Priority type invalid"),

    check("note")
        .optional()
        .isString().withMessage("Note must be a string."),

    check("associated_by")
        .notEmpty()
        .withMessage("associated_by is required.")
        .isIn(["appointment", "patient"]).withMessage("associated_by type invalid"),

    check("start_date")
        .notEmpty().withMessage("Start date is required.")
        .isISO8601().toDate().withMessage("Start date must be a valid ISO date."),

    check("repeat_type")
        .isIn(["none", "daily", "weekly", "monthly", "yearly"]).withMessage("Invalid repeat type."),

    check("repeat_count")
        .notEmpty()
        .isInt({ min: 0 }).withMessage("Repeat count must be a non-negative integer."),

    check("staff_ids")
        .isArray({ min: 1 }).withMessage("Staff IDs must be a non-empty array."),

    check('staff_ids.*')
        .isMongoId()
        .withMessage("Each staff ID must be a valid ObjectId."),

];