import { Router } from "express";
import req_validator from "../../middleware/req_validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { active_package_controler } from "./active_package.controler";

const router = Router();

router.get("/", auth(USER_ROLE.company), active_package_controler.getActivePackageByCompany);


export const Active_pack_router = router;