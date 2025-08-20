import { Router } from "express";
import req_validator from "../../middleware/req_validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { taskControler } from "./task.controler";
import { createTaskValidate, updateTaskValidate } from "./task.validator";

const router = Router();

router.post("/",
    createTaskValidate,
    req_validator(),
    auth(USER_ROLE.company),
    taskControler.createTask
)
router.put("/:id",
    updateTaskValidate,
    req_validator(),
    auth(USER_ROLE.company),
    taskControler.updatetask
)
router.get("/",
    auth(USER_ROLE.company),
    taskControler.allTasks
)

export const TaskRouts = router;