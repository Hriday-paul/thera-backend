import { Router } from "express";
import multer, { memoryStorage } from "multer";
import auth from "../../middleware/auth";
import { USER_ROLE } from "./user.constants";
import parseData from "../../middleware/parseData";
import { userController } from "./user.controller";
import { addPatientValidator, addStaffValidator, statusUpdateValidator, } from "./user.validator";
import req_validator from "../../middleware/req_validation";
import path from 'node:path';

const router = Router();

export const file_upload_config = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('public', 'images'));
    },
    filename: function (req, file, cb) {
        //original name helps us to get the file extension
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const single_image_Upload = multer({
    storage: file_upload_config,
    limits: { fileSize: 1024 * 1024 * 3 /* 3 mb */ },
    fileFilter(req, file, cb) {
        // if file type valid
        if (['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.mimetype)) {
            cb(null, true)
        }
        else {
            cb(null, false);
            return cb(new Error('file type is not allowed'))
        }
    },
}).single('image');


router.get(
    '/',
    auth(USER_ROLE.admin),
    userController.all_users,
);

router.patch(
    '/update-my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    single_image_Upload,
    parseData(),
    userController.updateProfile,
);

router.patch(
    '/status/:id',
    statusUpdateValidator,
    req_validator(),
    auth(USER_ROLE.admin),
    userController.update_user_status,
);

router.get(
    '/my-profile',
    auth(USER_ROLE.admin, USER_ROLE.user),
    userController.getMyProfile,
);

router.post(
    '/staffs',
    single_image_Upload,
    parseData(),
    addStaffValidator,
    req_validator(),
    auth(USER_ROLE.company),
    userController.add_new_staff,
);

router.post(
    '/patients',
    addPatientValidator,
    req_validator(),
    auth(USER_ROLE.company),
    userController.add_new_Patient,
);

router.get(
    '/staffs',
    auth(USER_ROLE.company),
    userController.staffs,
);

export const userRoutes = router;