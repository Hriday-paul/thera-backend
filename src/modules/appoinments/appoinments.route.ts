import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { appoinmentControler } from "./appoinments.controler";
import { AppointmentReminderValidate, AppointmentStatusValidate, createAppointmentValidate, validateMonthYear } from "./appoinments.validator";
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

router.patch("/update-status",
    AppointmentStatusValidate,
    req_validator(),
    auth(USER_ROLE.company),
    appoinmentControler.updateStatusOccurence
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
router.get(
    '/by-staff/:id',
    auth(USER_ROLE.company),
    appoinmentControler.allAppoinments_By_staff,
);

router.get(
    '/stats',
    validateMonthYear,
    req_validator(),
    auth(USER_ROLE.company),
    appoinmentControler.getMonthlyAppointmentStats,
);

router.get(
    '/chart-data',
    auth(USER_ROLE.company),
    appoinmentControler.appoinmentChart,
);

export const AppoinmentRouts = router;