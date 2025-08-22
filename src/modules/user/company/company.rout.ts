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
    '/patients/by-staf',
    auth(USER_ROLE.staf),
    PatientController.as_a_staf_allPatientsByCompany,
);

router.get(
    '/profile',
    auth(USER_ROLE.company),
    companyControler.myProfile,
);

router.get(
    '/profile/by-staf',
    auth(USER_ROLE.staf),
    companyControler.asAStaffmyCompanyProfile,
);


router.get(
    '/services',
    auth(USER_ROLE.company),
    companyControler.services,
);
router.get(
    '/services/by-staf',
    auth(USER_ROLE.staf),
    companyControler.servicesByStaff,
);

router.post(
    '/services',
    auth(USER_ROLE.company),
    companyControler.addNewService,
);
router.post(
    '/services/by-staf',
    auth(USER_ROLE.staf),
    companyControler.addNewService_by_staff,
);

router.put(
    '/services/:id',
    auth(USER_ROLE.company),
    companyControler.editService,
);
router.put(
    '/services-by-staf/:id',
    auth(USER_ROLE.staf),
    companyControler.editServiceByStaff,
);
router.delete(
    '/services/:id',
    auth(USER_ROLE.company),
    companyControler.deleteService,
);
router.delete(
    '/services-by-staf/:id',
    auth(USER_ROLE.staf),
    companyControler.deleteService_byStaff,
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
router.patch(
    '/reminder/by-staf',
    auth(USER_ROLE.staf),
    companyControler.updateCompanyReminderMessage_by_staff,
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
