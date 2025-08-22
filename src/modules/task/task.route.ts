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
    auth(USER_ROLE.company, USER_ROLE.staf),
    taskControler.createTask
)
router.put("/:id",
    updateTaskValidate,
    req_validator(),
    auth(USER_ROLE.company, USER_ROLE.staf),
    taskControler.updatetask
)
router.get("/",
    auth(USER_ROLE.company),
    taskControler.allTasks
)
router.get("/for-staff",
    auth(USER_ROLE.staf),
    taskControler.allTasksForAStaff
)

export const TaskRouts = router;