import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import req_validator from "../../middleware/req_validation";
import { settingsControler } from "./settings.controler";
import { updateSettingsValidator } from "./settings.validator";

const router = Router();

router.get('/:key', settingsControler.singleSettingItem);

router.patch(
    '/',
    auth(USER_ROLE.admin),
    updateSettingsValidator,
    req_validator(),
    settingsControler.updateSettingItem,
);

export const settingsRoutes = router;