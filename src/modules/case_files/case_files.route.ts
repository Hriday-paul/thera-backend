import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import req_validator from "../../middleware/req_validation";
import { caseFileControler } from "./case_files.controler";
import { createCaseFileValidator, statusUpdateCaseFileValidator } from "./case_files.validator";

const router = Router();

router.post(
    '/',
    createCaseFileValidator,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    caseFileControler.createcaseFile,
);

router.get("/by-patient/:id", auth(USER_ROLE.company, USER_ROLE.staf), caseFileControler.CaseFilesByPatient);
router.get("/by-patient", auth(USER_ROLE.patient), caseFileControler.CaseFilesByPatientProfile);
router.get("/by-company", auth(USER_ROLE.company), caseFileControler.CaseFilesCompany);

router.get("/stats/:id", auth(USER_ROLE.company, USER_ROLE.staf), caseFileControler.CaseFileStats);
router.get("/stats", auth(USER_ROLE.patient), caseFileControler.CaseFileStatsMyPatientPRofile);

router.get("/company/stats/:id", auth(USER_ROLE.admin), caseFileControler.CaseFileCountByCompany);

router.patch("/status/:id", statusUpdateCaseFileValidator, req_validator(), auth(USER_ROLE.company, USER_ROLE.staf), caseFileControler.updateCaseFileStatus);

export const CaseFileRouts = router;