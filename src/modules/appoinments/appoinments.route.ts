import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { appoinmentControler } from "./appoinments.controler";
import { AppointmentReminderValidate, AppointmentStaffUnavailble, AppointmentStatusValidate, createAppointmentValidate, validateMonthYear } from "./appoinments.validator";
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
    auth(USER_ROLE.company, USER_ROLE.staf, USER_ROLE.patient),
    appoinmentControler.sendNotificationReminder
)

router.post("/unavailable",
    AppointmentStaffUnavailble,
    req_validator(),
    auth(USER_ROLE.staf),
    appoinmentControler.markStaffUnavailable
)

router.patch("/update-status",
    AppointmentStatusValidate,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf, USER_ROLE.patient),
    appoinmentControler.updateStatusOccurence
)

router.get(
    '/by-company',
    auth(USER_ROLE.company),
    appoinmentControler.allAppointments_byCompany_WithStaffStatus,
);
router.get(
    '/by-staff',
    auth(USER_ROLE.staf),
    appoinmentControler.allAppointments_bystaff_WithStaffStatus,
);
router.get(
    '/by-patient',
    auth(USER_ROLE.patient),
    appoinmentControler.allAppointments_byPatient_WithStaffStatus,
);

router.get(
    '/by-patient/:id',
    auth(USER_ROLE.company, USER_ROLE.staf),
    appoinmentControler.allAppoinments_By_patient,
);
router.get(
    '/list/by-patient',
    auth(USER_ROLE.patient),
    appoinmentControler.allAppoinments_my_patient_profile,
);

router.get(
    '/by-staff/:id',
    auth(USER_ROLE.company),
    appoinmentControler.allAppoinments_By_staff,
);
router.get(
    '/for-staf',
    auth(USER_ROLE.staf),
    appoinmentControler.allAppoinments_staff_profile,
);

router.get(
    '/stats',
    validateMonthYear,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    appoinmentControler.getMonthlyAppointmentStats,
);
router.get(
    '/stats/by-staf',
    validateMonthYear,
    req_validator(),
    auth(USER_ROLE.staf),
    appoinmentControler.getMonthlyAppointmentStats_by_staff,
);
router.get(
    '/stats/by-patient',
    validateMonthYear,
    req_validator(),
    auth(USER_ROLE.patient),
    appoinmentControler.getMonthlyAppointmentStats_by_patient,
);

router.get(
    '/chart-data',
    auth(USER_ROLE.company),
    appoinmentControler.appoinmentChart,
);

router.get(
    '/chart-data/by-staf',
    auth(USER_ROLE.staf),
    appoinmentControler.appoinmentChartByStaff,
);
router.get(
    '/chart-data/by-patient',
    auth(USER_ROLE.patient),
    appoinmentControler.appoinmentChartByPatient,
);

export const AppoinmentRouts = router;