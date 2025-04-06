import express from "express";
import { strictLimiter } from "../middlewares/rateLimit.js";
import {
  registerUsers,
  loginUsers,
  refreshToken,
} from "../controllers/loginController.js";
import {
  validateRegistration,
  sanitizeData,
  handleValidationErrors,
} from "../middlewares/sanitizeData.js";
const router = express.Router();

router.post(
  "/register",
  strictLimiter,
  sanitizeData,
  validateRegistration,
  handleValidationErrors,
  registerUsers
);
router.post("/login", strictLimiter, sanitizeData, loginUsers);
router.post("/refresh", sanitizeData, refreshToken);

export default router;
