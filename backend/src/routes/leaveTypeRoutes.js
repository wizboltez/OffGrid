import { Router } from "express";
import * as leaveTypeController from "../controllers/leaveTypeController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createLeaveTypeSchema, idParamSchema, updateLeaveTypeSchema } from "../validators/adminValidator.js";

const router = Router();

router.get("/", leaveTypeController.list);
router.post("/", requireRoles("ADMIN"), validateRequest(createLeaveTypeSchema), leaveTypeController.create);
router.put("/:id", requireRoles("ADMIN"), validateRequest(updateLeaveTypeSchema), leaveTypeController.update);
router.delete("/:id", requireRoles("ADMIN"), validateRequest(idParamSchema), leaveTypeController.remove);

export default router;
