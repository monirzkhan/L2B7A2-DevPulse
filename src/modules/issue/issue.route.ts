import { Router } from "express";
import { issuecontroller } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router=Router();

router.post("", auth(USER_ROLE.maintainer, USER_ROLE.contributor), issuecontroller.createIssue)
router.get("", issuecontroller.getAllIssue)
router.get("/:id", issuecontroller.getSingleIssue)
export const issueRoute=router;