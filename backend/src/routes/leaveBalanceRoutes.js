import { Router } from "express";
import * as leaveBalanceController from "../controllers/leaveBalanceController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/me", leaveBalanceController.myBalances);
router.patch("/adjust", requireRoles("ADMIN"), leaveBalanceController.adjust);

export default router;
