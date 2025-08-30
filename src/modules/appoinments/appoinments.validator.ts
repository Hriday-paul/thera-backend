import { check, query } from "express-validator";

export const createAppointmentValidate = [
    check("title")
        .notEmpty().withMessage("Title is required.")
        .isString().withMessage("Title must be a string."),

    check("appoinment_type")
        .isIn(["group", "individual"]).withMessage("Appointment type must be 'group' or 'individual'."),

    check("note")
        .optional()
        .isString().withMessage("Note must be a string."),

    check("location")
        .notEmpty().withMessage("Location is required."),

    check('location.isOnline')
        .notEmpty().withMessage("isOnline is required.")
        .isBoolean()
        .withMessage("isOnline should be boolean"),

    check('location.address')
        .notEmpty().withMessage("address is required.")
        .isString()
        .withMessage("address is required to location"),

    check("start_date")
        .notEmpty().withMessage("Start date is required.")
        .isISO8601().toDate().withMessage("Start date must be a valid ISO date."),

    // check("times")
    //     .isArray({ min: 2 }).withMessage("Times must be a non-empty array.")
    //     .custom((times) => {
    //         return times.every((time: any) => !isNaN(Date.parse(time)));
    //     }).withMessage("Each time must be a valid date string."),

    check('times')
        .isArray({ min: 2 })
        .withMessage('Time must be 2 times'),

    check('times.*')
        .isISO8601().toDate()
        .withMessage("Each time must be a valid date string."),

    check("repeat_type")
        .isIn(["none", "daily", "weekly", "monthly", "yearly"]).withMessage("Invalid repeat type."),

    check("repeat_count")
        .optional()
        .isInt({ min: 0 }).withMessage("Repeat count must be a non-negative integer."),

    check("staff_ids")
        .isArray({ min: 1 }).withMessage("Staff IDs must be a non-empty array."),

    check('staff_ids.*')
        .isMongoId()
        .withMessage("Each staff ID must be a valid ObjectId."),

    check("patient_id")
        .isMongoId().withMessage("Patient ID must be a valid ObjectId."),
];

export const updateAppointmentValidate = [
    check("title")
        .notEmpty().withMessage("Title is required.")
        .isString().withMessage("Title must be a string."),

    check("appoinment_type")
        .isIn(["group", "individual"]).withMessage("Appointment type must be 'group' or 'individual'."),

    check("note")
        .optional()
        .isString().withMessage("Note must be a string."),

    check("location")
        .notEmpty().withMessage("Location is required."),

    check('location.isOnline')
        .notEmpty().withMessage("isOnline is required.")
        .isBoolean()
        .withMessage("isOnline should be boolean"),

    check('location.address')
        .notEmpty().withMessage("address is required.")
        .isString()
        .withMessage("address is required to location"),

    check("start_date")
        .notEmpty().withMessage("Start date is required.")
        .isISO8601().toDate().withMessage("Start date must be a valid ISO date."),

    // check("times")
    //     .isArray({ min: 2 }).withMessage("Times must be a non-empty array.")
    //     .custom((times) => {
    //         return times.every((time: any) => !isNaN(Date.parse(time)));
    //     }).withMessage("Each time must be a valid date string."),

    check('times')
        .isArray({ min: 2 })
        .withMessage('Time must be 2 times'),

    check('times.*')
        .isISO8601().toDate()
        .withMessage("Each time must be a valid date string."),

    // check("repeat_type")
    //     .isIn(["none", "daily", "weekly", "monthly", "yearly"]).withMessage("Invalid repeat type."),

    // check("repeat_count")
    //     .optional()
    //     .isInt({ min: 0 }).withMessage("Repeat count must be a non-negative integer."),

    check("staff_ids")
        .isArray({ min: 1 }).withMessage("Staff IDs must be a non-empty array."),

    check('staff_ids.*')
        .isMongoId()
        .withMessage("Each staff ID must be a valid ObjectId."),

    check("appointment")
        .notEmpty().withMessage("appointment is required.")
        .isMongoId().withMessage("appointment ID must be a valid ObjectId."),
];

export const AppointmentReminderValidate = [
    check("occurenceId")
        .notEmpty().withMessage("appoinment is required.")
        .isMongoId().withMessage("Invalid appoinment"),
]

export const AppointmentStaffUnavailble = [
    check("occurrence_id")
        .notEmpty().withMessage("appoinment is required.")
        .isMongoId().withMessage("Invalid appoinment"),
]

export const validateMonthYear = [
    query("monthYear")
        .optional()
        .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
        .withMessage("monthYear must be in 'YYYY-MM' format (e.g., 2025-05)")
];

export const AppointmentStatusValidate = [
    check("occurenceId")
        .notEmpty().withMessage("appoinment is required.")
        .isMongoId().withMessage("Invalid appoinment"),

    check("status")
        .notEmpty().withMessage("status is required.")
        .isIn(["upcoming", "completed", "cancelled", "no_show"]).withMessage("Invalid status"),
]