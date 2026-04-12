import { Router } from "express";
import * as leaveRequestController from "../controllers/leaveRequestController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
	createLeaveRequestSchema,
	deleteLeaveRequestSchema,
	leaveActionSchema,
	updateLeaveRequestSchema,
} from "../validators/leaveRequestValidator.js";

const router = Router();

router.get("/", leaveRequestController.list);
router.post("/", upload.single("document"), validateRequest(createLeaveRequestSchema), leaveRequestController.create);
router.put("/:id", validateRequest(updateLeaveRequestSchema), leaveRequestController.update);
router.delete("/:id", validateRequest(deleteLeaveRequestSchema), leaveRequestController.remove);
router.patch("/:id/approve", requireRoles("MANAGER", "ADMIN"), validateRequest(leaveActionSchema), leaveRequestController.approve);
router.patch("/:id/reject", requireRoles("MANAGER", "ADMIN"), validateRequest(leaveActionSchema), leaveRequestController.reject);
router.patch("/:id/cancel", validateRequest(leaveActionSchema), leaveRequestController.cancel);

export default router;
