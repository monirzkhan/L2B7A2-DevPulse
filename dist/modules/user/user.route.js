import { Router } from "express";
import { usercontroller } from "./user.controller";
const router = Router();
router.post('', usercontroller.createUser);
export const userRoute = router;
//# sourceMappingURL=user.route.js.map