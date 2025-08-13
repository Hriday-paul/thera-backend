import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { appoinmentControler } from "./appoinments.controler";
import { AppointmentReminderValidate, createAppointmentValidate } from "./appoinments.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.post("/",
    createAppointmentValidate,
    req_validator(),
    auth(USER_ROLE.company),
    appoinmentControler.createAppointment
)

router.post("/reminder",
    AppointmentReminderValidate,
    req_validator(),
    auth(USER_ROLE.company),
    appoinmentControler.sendNotificationReminder
)

router.patch("/cancel",
    AppointmentReminderValidate,
    req_validator(),
    auth(USER_ROLE.company),
    appoinmentControler.cancelOccurrence
)

router.get(
    '/by-company',
    auth(USER_ROLE.company),
    appoinmentControler.allAppointments_byCompany_WithStaffStatus,
);
router.get(
    '/by-patient/:id',
    auth(USER_ROLE.company),
    appoinmentControler.allAppoinments_By_patient,
);

export const AppoinmentRouts = router;