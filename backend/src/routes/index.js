import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import leaveTypeRoutes from "./leaveTypeRoutes.js";
import leaveRequestRoutes from "./leaveRequestRoutes.js";
import leaveBalanceRoutes from "./leaveBalanceRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import reportRoutes from "./reportRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", requireAuth, userRoutes);
router.use("/departments", requireAuth, departmentRoutes);
router.use("/leave-types", requireAuth, leaveTypeRoutes);
router.use("/leave-requests", requireAuth, leaveRequestRoutes);
router.use("/leave-balances", requireAuth, leaveBalanceRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/reports", requireAuth, reportRoutes);
router.use("/notifications", requireAuth, notificationRoutes);

export default router;
