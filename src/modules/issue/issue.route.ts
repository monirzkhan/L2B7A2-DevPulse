import { Router } from "express";
import { issuecontroller } from "./issue.controller";
import auth from "../../middleware/auth";

const router=Router();

router.post("", auth(), issuecontroller.createIssue)
export const issueRoute=router;