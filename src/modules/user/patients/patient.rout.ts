import { Router } from "express";
import auth from "../../../middleware/auth";
import { USER_ROLE } from "../user.constants";
import { userController } from "../user.controller";
import { addPatientEmergencyPersonValidator, addPatientfamilyGroupValidator, addPatientValidator, familyGroupPersonAddValidator, familyGroupPersoUpdateValidator, PersonDeleteFamilyValidator, updatePatientEmergencyPersonValidator } from "../user.validator";
import req_validator from "../../../middleware/req_validation";
import { PatientController } from "./patient.controler";

const router = Router();

router.post(
    '/',
    addPatientValidator,
    req_validator(),
    auth(USER_ROLE.company),
    userController.add_new_Patient,
);

router.patch(
    '/family-group/:id',
    addPatientfamilyGroupValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.addFamilyGroup,
);
router.post(
    '/person-toFamily/:id',
    familyGroupPersonAddValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.addNewPersonToFamily,
);

router.patch(
    '/person-toFamily/:id',
    familyGroupPersoUpdateValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.updatePersonInFamily,
);

router.delete(
    '/person-toFamily/:id',
    PersonDeleteFamilyValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.deletePersonFromFamily,
);

router.post(
    '/emargency-person/:id',
    addPatientEmergencyPersonValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.addEmergencyPerson,
);

router.patch(
    '/emargency-person/:id',
    updatePatientEmergencyPersonValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.updateEmergencyPerson,
);

router.delete(
    '/emargency-person/:id',
    PersonDeleteFamilyValidator,
    req_validator(),
    auth(USER_ROLE.company),
    PatientController.deleteEmergencyPerson,
);

router.get(
    '/assign-staffs',
    auth(USER_ROLE.company),
    userController.add_new_Patient,
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
    auth(USER_ROLE.company),
    PatientController.patientprofile,
);

export const PatientRouts = router;