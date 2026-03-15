import { Router } from "express";
import * as departmentController from "../controllers/departmentController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createDepartmentSchema, idParamSchema, updateDepartmentSchema } from "../validators/adminValidator.js";

const router = Router();

router.get("/", departmentController.list);
router.post("/", requireRoles("ADMIN"), validateRequest(createDepartmentSchema), departmentController.create);
router.put("/:id", requireRoles("ADMIN"), validateRequest(updateDepartmentSchema), departmentController.update);
router.delete("/:id", requireRoles("ADMIN"), validateRequest(idParamSchema), departmentController.remove);

export default router;
