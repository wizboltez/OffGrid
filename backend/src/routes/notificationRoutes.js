import { Router } from "express";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();

router.get("/", notificationController.mine);
router.patch("/mark-as-read", notificationController.markAsRead);

export default router;
