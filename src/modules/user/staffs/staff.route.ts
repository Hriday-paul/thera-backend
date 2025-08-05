import { Router } from "express";
import auth from "../../../middleware/auth";
import { USER_ROLE } from "../user.constants";
import { userController } from "../user.controller";
import parseData from "../../../middleware/parseData";
import { addStaffValidator } from "../user.validator";
import req_validator from "../../../middleware/req_validation";
import { image_Upload } from "../../../utils/FileUpload";
import { StaffsController } from "./staff.controller";

const router = Router();

router.get(
    '/',
    auth(USER_ROLE.company),
    userController.staffs,
);

router.get(
    '/list',
    auth(USER_ROLE.company),
    StaffsController.staffList,
);


router.post(
    '/',
    image_Upload.single('image'),
    parseData(),
    addStaffValidator,
    req_validator(),
    auth(USER_ROLE.company),
    userController.add_new_staff,
);

export const StaffRouts = router;