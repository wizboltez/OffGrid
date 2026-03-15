import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { requireRoles } from "../middlewares/roleMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createUserSchema, idParamSchema, setUserStatusSchema, updateUserSchema } from "../validators/adminValidator.js";

const router = Router();

router.get("/me", userController.me);
router.get("/", requireRoles("ADMIN", "MANAGER"), userController.list);
router.post("/", requireRoles("ADMIN"), validateRequest(createUserSchema), userController.create);
router.put("/:id", requireRoles("ADMIN"), validateRequest(updateUserSchema), userController.update);
router.patch("/:id/status", requireRoles("ADMIN"), validateRequest(setUserStatusSchema), userController.setStatus);
router.delete("/:id", requireRoles("ADMIN"), validateRequest(idParamSchema), userController.remove);

export default router;
