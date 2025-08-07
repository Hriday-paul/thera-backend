import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { appoinmentControler } from "./appoinments.controler";
import { createAppointmentValidate } from "./appoinments.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.post("/",
    createAppointmentValidate,
    req_validator(),
    auth(USER_ROLE.company),
    appoinmentControler.createAppointment
)

export const AppoinmentRouts = router;