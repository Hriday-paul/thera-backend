import { Router } from "express";
import req_validator from "../../middleware/req_validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { subtaskControler } from "./subtask.controler";
import { createSubTaskValidate } from "./subtask.validator";

const router = Router();

router.post("/",
    createSubTaskValidate,
    req_validator(),
    auth(USER_ROLE.company),
    subtaskControler.addSubTask
)
router.delete("/:id",
    auth(USER_ROLE.company),
    subtaskControler.deleteSubtask
)

export const SubtaskRout = router;