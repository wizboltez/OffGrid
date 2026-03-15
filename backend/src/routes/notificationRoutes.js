import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();

router.get("/", notificationController.mine);

export default router;
