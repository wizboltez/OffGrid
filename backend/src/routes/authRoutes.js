import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { loginSchema } from "../validators/authValidator.js";

const router = Router();

router.post("/login", validateRequest(loginSchema), authController.login);

export default router;
