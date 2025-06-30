
import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { dashboardControler } from "./dashboard.controler";

const router = Router();

router.get('/userChart',  dashboardControler.userChart);

router.get('/earningChart',  dashboardControler.earningChart);

router.get('/count', dashboardControler.countData);

export const dashboardRouts = router