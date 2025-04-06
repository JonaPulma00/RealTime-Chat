import express from "express";
import { sanitizeData } from "../middlewares/sanitizeData.js";
import loginRoutes from "./loginRoutes.js";
import userRoutes from "./userRoutes.js";
import groupsRoutes from "./groupsRoutes.js";

const router = express.Router();

router.use(sanitizeData);

router.use(loginRoutes);
router.use(userRoutes);
router.use(groupsRoutes);

export default router;
