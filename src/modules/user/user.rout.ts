import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "./user.constants";
import parseData from "../../middleware/parseData";
import { userController } from "./user.controller";
import { addPatientValidator, statusUpdateValidator, } from "./user.validator";
import req_validator from "../../middleware/req_validation";
import { StaffRouts } from "./staffs/staff.route";
import { image_Upload } from "../../utils/FileUpload";
import { PatientRouts } from "./patients/patient.rout";
import { CompanyRouts } from "./company/company.rout";

const router = Router();

const moduleRouts = [
    {
        path: '/staffs',
        route: StaffRouts,
    },
    {
        path: '/patients',
        route: PatientRouts,
    },
    {
        path: '/companies',
        route: CompanyRouts,
    },
]


router.get(
    '/',
    auth(USER_ROLE.admin),
    userController.all_users,
);

router.patch(
    '/update-my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    image_Upload.single('image'),
    parseData(),
    userController.updateProfile,
);

router.patch(
    '/status/:id',
    statusUpdateValidator,
    req_validator(),
    auth(USER_ROLE.admin, USER_ROLE.company),
    userController.update_user_status,
);

router.get(
    '/my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    userController.getMyProfile,
);

moduleRouts.forEach(route => router.use(route.path, route.route));

export const userRoutes = router;