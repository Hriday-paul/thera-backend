import { Router } from "express";
import auth from "../../../middleware/auth";
import { USER_ROLE } from "../user.constants";
import { userController } from "../user.controller";
import { addPatientEmergencyPersonValidator, addPatientfamilyGroupValidator, addPatientValidator, familyGroupPersonAddValidator, familyGroupPersoUpdateValidator, PersonDeleteFamilyValidator, updatePatientEmergencyPersonValidator } from "../user.validator";
import req_validator from "../../../middleware/req_validation";
import { PatientController } from "./patient.controler";
import { deleteInsuranceValidator, editInsuranceValidator, editPatientBillingValidator, insuranceValidator } from "./patient.validator";
import { image_Upload } from "../../../utils/FileUpload";
import parseData from "../../../middleware/parseData";

const router = Router();

router.post(
    '/',
    addPatientValidator,
    req_validator(),
    auth(USER_ROLE.company),
    userController.add_new_Patient,
);

router.put(
    '/:id',
    image_Upload.single('image'),
    parseData(),
    // addStaffValidator,
    // req_validator(),
    auth(USER_ROLE.company, USER_ROLE.patient),
    PatientController.updatePatient,
);

router.get(
    '/',
    auth(USER_ROLE.company),
    PatientController.patientsListsWithAppoinmentHistory,
);
router.get(
    '/by-staf',
    auth(USER_ROLE.staf),
    PatientController.byStaff_patientsListsWithAppoinmentHistory,
);

router.get(
    '/stats/:id',
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.patientStats,
);

router.patch(
    '/family-group/:id',
    addPatientfamilyGroupValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.addFamilyGroup,
);
router.post(
    '/person-toFamily/:id',
    familyGroupPersonAddValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.addNewPersonToFamily,
);

router.patch(
    '/person-toFamily/:id',
    familyGroupPersoUpdateValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.updatePersonInFamily,
);

router.delete(
    '/person-toFamily/:id',
    PersonDeleteFamilyValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.deletePersonFromFamily,
);

router.post(
    '/emargency-person/:id',
    addPatientEmergencyPersonValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.addEmergencyPerson,
);

router.patch(
    '/emargency-person/:id',
    updatePatientEmergencyPersonValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.updateEmergencyPerson,
);

router.delete(
    '/emargency-person/:id',
    PersonDeleteFamilyValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.deleteEmergencyPerson,
);

router.post(
    '/assign-staffs/:id',
    PersonDeleteFamilyValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.assignNewStaffToPatient,
);

router.delete(
    '/assign-staffs/:id',
    PersonDeleteFamilyValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.deleteAsignStaffs,
);

router.get(
    '/profile/:id',
    auth(USER_ROLE.company, USER_ROLE.staf),
    PatientController.patientprofile,
);

router.put(
    '/billing-details/:id',
    editPatientBillingValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.editBillingDetails,
);


router.post(
    '/insurance/:id',
    insuranceValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.addInsurance,
);
router.put(
    '/insurance/:id',
    editInsuranceValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.editInsurance,
);
router.delete(
    '/insurance/:id',
    deleteInsuranceValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.deleteInsurance,
);

export const PatientRouts = router;