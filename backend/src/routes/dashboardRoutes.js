import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/employee", requireRoles("EMPLOYEE"), dashboardController.employee);
router.get("/manager", requireRoles("MANAGER"), dashboardController.manager);
router.get("/admin", requireRoles("ADMIN"), dashboardController.admin);

export default router;
