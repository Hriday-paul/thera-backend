import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import req_validator from "../../middleware/req_validation";
import { caseFileControler } from "./case_files.controler";
import { createCaseFileValidator } from "./case_files.validator";

const router = Router();

router.post(
    '/',
    auth(USER_ROLE.company),
    createCaseFileValidator,
    req_validator(),
    caseFileControler.createcaseFile,
);

router.get("/by-patient/:id", auth(USER_ROLE.company), caseFileControler.CaseFilesByPatient);

export const CaseFileRouts = router;