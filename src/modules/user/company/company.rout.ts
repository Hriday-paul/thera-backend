import { Router } from "express";
import auth from "../../../middleware/auth";
import { USER_ROLE } from "../user.constants";
import { PatientController } from "../patients/patient.controler";
import { companyControler } from "./company.controler";
import { image_Upload } from "../../../utils/FileUpload";
import parseData from "../../../middleware/parseData";


const router = Router();

router.get(
    '/patients',
    auth(USER_ROLE.company),
    PatientController.allPatientsByCompany,
);

router.get(
    '/profile',
    auth(USER_ROLE.company),
    companyControler.myProfile,
);
router.get(
    '/services',
    auth(USER_ROLE.company),
    companyControler.services,
);
router.post(
    '/services',
    auth(USER_ROLE.company),
    companyControler.addNewService,
);
router.put(
    '/services/:id',
    auth(USER_ROLE.company),
    companyControler.editService,
);
router.delete(
    '/services/:id',
    auth(USER_ROLE.company),
    companyControler.deleteService,
);

router.get(
    '/locations',
    auth(USER_ROLE.company),
    companyControler.locations,
);

router.post(
    '/location',
    auth(USER_ROLE.company),
    companyControler.addCompanyLocation,
);
router.put(
    '/locations/:id',
    auth(USER_ROLE.company),
    companyControler.editLocation,
);
router.delete(
    '/locations/:id',
    auth(USER_ROLE.company),
    companyControler.deleteLocation,
);

router.post(
    '/patient-tag',
    auth(USER_ROLE.company),
    companyControler.addPatientTag,
);
router.put(
    '/patient-tag/:id',
    auth(USER_ROLE.company),
    companyControler.editpatienttags,
);
router.delete(
    '/patient-tag/:id',
    auth(USER_ROLE.company),
    companyControler.deletepatienttags,
);

router.patch(
    '/profile',
    image_Upload.single('image'),
    parseData(),
    auth(USER_ROLE.company),
    companyControler.updateCompany,
);
router.patch(
    '/automation',
    auth(USER_ROLE.company),
    companyControler.updateCompanyAutomation,
);
router.patch(
    '/reminder',
    auth(USER_ROLE.company),
    companyControler.updateCompanyReminderMessage,
);

router.get(
    '/reports/user-count',
    auth(USER_ROLE.company),
    companyControler.reportUserCount,
);
router.get(
    '/reports/key-performance',
    auth(USER_ROLE.company),
    companyControler.reportKeyPerformance,
);

router.get(
    '/reports/gender-stats',
    auth(USER_ROLE.company),
    companyControler.gender_stats,
);
router.get(
    '/reports/age-stats',
    auth(USER_ROLE.company),
    companyControler.age_stats,
);

export const CompanyRouts = router;
