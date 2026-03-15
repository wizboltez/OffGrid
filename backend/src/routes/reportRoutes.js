import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/monthly", requireRoles("ADMIN", "MANAGER"), reportController.monthly);

export default router;
