import { Router } from "express";
import auth from "../../../middleware/auth";
import { USER_ROLE } from "../user.constants";
import { adminControler } from "./admin.controler";
import { dashboardControler } from "../../dasboard/dashboard.controler";
import { validateWeekFormat } from "./admin.validadtor";
import req_validator from "../../../middleware/req_validation";

const router = Router();

router.get(
    '/stats',
    auth(USER_ROLE.admin),
    adminControler.statCounts,
);
router.post(
    '/stats/export',
    auth(USER_ROLE.admin),
    adminControler.exportStatCount,
);

router.get(
    '/userChart',
    auth(USER_ROLE.admin),
    dashboardControler.userChart,
);
router.get(
    '/purchaseChart',
    validateWeekFormat,
    req_validator(),
    auth(USER_ROLE.admin),
    adminControler.purchaseChart,
);
router.get(
    '/purchasePie',
    auth(USER_ROLE.admin),
    adminControler.purchasePieYearly,
);
router.get(
    '/companies',
    auth(USER_ROLE.admin),
    adminControler.allCompanies,
);
router.post(
    '/export/companies',
    auth(USER_ROLE.admin),
    adminControler.exportCompanies,
);
router.get(
    '/companies/stats/:id',
    auth(USER_ROLE.admin),
    adminControler.companyStats,
);
router.get(
    '/companies/appointment/stats/:id',
    auth(USER_ROLE.admin),
    adminControler.companyappoinmentStats,
);

export const adminRouter = router;