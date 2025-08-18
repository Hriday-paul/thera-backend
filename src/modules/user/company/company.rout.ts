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

router.patch(
    '/profile',
    image_Upload.single('image'),
    parseData(),
    auth(USER_ROLE.company),
    companyControler.updateCompany,
);



router.post(
    '/location',
    auth(USER_ROLE.company),
    companyControler.addCompanyLocation,
);

export const CompanyRouts = router;
