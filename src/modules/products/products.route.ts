import { Router } from "express";
import { productControler } from "./products.controler";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import multer from "multer";
import path from 'node:path';
import req_validator from "../../middleware/req_validation";
import parseData from "../../middleware/parseData";
import { addProductValidator } from "./products.validator";

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

const multiple_image_Upload = multer({
    storage: file_upload_config,
    limits: { fileSize: 1024 * 1024 * 5 /* 5 mb */ },
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
}).array('images');

router.get('/', productControler.allProducts);

router.get('/:id', productControler.singleProduct);

router.post(
    '/',
    auth(USER_ROLE.admin),
    multiple_image_Upload,
    addProductValidator,
    req_validator(),
    parseData(),
    productControler.addProduct,
);

router.patch(
    '/:id',
    auth(USER_ROLE.admin),
    multiple_image_Upload,
    parseData(),
    productControler.updateProduct,
);

router.delete(
    '/:id',
    auth(USER_ROLE.admin),
    productControler.deleteProduct
);


export const productRoutes = router;

