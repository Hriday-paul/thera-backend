import { Router } from "express";
import { USER_ROLE } from "../user/user.constants";
import auth from "../../middleware/auth";
import { orderController } from "./order.controler";
import { createOrderValidator, statusUpdateOrderValidator } from "./order.validator";
import req_validator from "../../middleware/req_validation";

const router = Router();

router.post('/', createOrderValidator, req_validator(), auth(USER_ROLE.user), orderController?.createOrder);

router.get('/', auth(USER_ROLE.admin), orderController?.allOrders);

router.get('/my-orders', auth(USER_ROLE.user), orderController?.myOrders);

router.patch('/status/:id', statusUpdateOrderValidator, req_validator(), auth(USER_ROLE.admin), orderController?.update_order_status);

export const orderRoutes = router;