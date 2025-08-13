import { Router } from "express";
import auth from "../../../middleware/auth";
import { USER_ROLE } from "../user.constants";
import { PatientController } from "../patients/patient.controler";
import { companyControler } from "./company.controler";


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



router.post(
    '/location',
    auth(USER_ROLE.company),
    companyControler.addCompanyLocation,
);

export const CompanyRouts = router;
