import { Router } from "express";
import { notificationController } from "./notification.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";

const router = Router();

router.get(
  "/",
   auth(USER_ROLE.admin, USER_ROLE.staf, USER_ROLE.patient, USER_ROLE.company),
  notificationController.getAllNotification
);
router.get(
  "/activities",
   auth(USER_ROLE.admin, USER_ROLE.staf, USER_ROLE.patient, USER_ROLE.company),
  notificationController.getNotificationByDateGroup
);

router.put(
  "/make-read/:id",
    auth(USER_ROLE.admin, USER_ROLE.staf, USER_ROLE.patient, USER_ROLE.company),
  notificationController.makeRead
);

router.get(
  "/count-notification",
  auth(USER_ROLE.admin, USER_ROLE.staf, USER_ROLE.patient, USER_ROLE.company),
  notificationController.unreadNotificationCount
);

router.put(
  "/make-read-all",
   auth(USER_ROLE.admin, USER_ROLE.staf, USER_ROLE.patient, USER_ROLE.company),
  notificationController.makeReadAll
);

router.delete(
  "/:id",
   auth(USER_ROLE.admin, USER_ROLE.staf, USER_ROLE.patient, USER_ROLE.company),
  notificationController.deleteNotification
);

export const notificationRoute = router;
