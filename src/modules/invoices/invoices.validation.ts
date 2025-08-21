import { check } from "express-validator";

export const updateInvoiceValidate = [
    check("status")
        .notEmpty().withMessage("status is required.").isIn(["pending", "complete", "write-off"]).withMessage("status not valid")
];