import { Router } from "express";
import { addPackageValidator, updatePackageValidator } from "./package.validator";
import req_validator from "../../middleware/req_validation";
import { packageControler } from "./package.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
const router = Router();

router.post('/',
    addPackageValidator,
    req_validator(),
    auth(USER_ROLE.admin),
    packageControler.createPackage
);

router.patch('/:id',
    updatePackageValidator,
    req_validator(),
    auth(USER_ROLE.admin),
    packageControler.updatePackage
)

router.delete('/:id',
    auth(USER_ROLE.admin),
    packageControler.deletePackage
)

router.get('/',
    packageControler.getPackages_by_type
)

router.get('/:id',
    packageControler.getPackages_details
)

export const packageRouts = router