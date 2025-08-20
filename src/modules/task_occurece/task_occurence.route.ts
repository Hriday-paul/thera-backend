
import { Router } from "express";
import req_validator from "../../middleware/req_validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { TaskOcurenceControler } from "./task_occurence.controler";



const router = Router();

router.delete("/:id",
    auth(USER_ROLE.company),
    TaskOcurenceControler.deletetaskOccurence
)

// router.put("/:id",
//     auth(USER_ROLE.company),
//     updateSubTaskValidate,
//     req_validator(),
//     TaskOcurenceControler.updatetaskOccurence
// )

export const TaskOccurenece = router;