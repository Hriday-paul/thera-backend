import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import multer from "multer";
import path from 'node:path';
import parseData from "../../middleware/parseData";
import req_validator from "../../middleware/req_validation";
import { blogControler } from "./blog.controler";
import { createBlogValidator } from "./blog.validator";

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
    limits: { fileSize: 1024 * 1024 * 20 /* 20 mb */ },
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

router.get('/', blogControler.allBlogs);

router.get('/:id', blogControler.singleBlog);

router.post(
    '/',
    // auth(USER_ROLE.admin),
    single_image_Upload,
    createBlogValidator,
    req_validator(),
    parseData(),
    blogControler.createBlog,
);

router.patch(
    '/:id',
    auth(USER_ROLE.admin),
    single_image_Upload,
    parseData(),
    blogControler.updateBlog,
);

router.delete(
    '/:id',
    auth(USER_ROLE.admin),
    blogControler.deleteBlog,
);

export const blogRoutes = router;