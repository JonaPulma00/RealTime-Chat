import express from "express";
import { limiter } from "../middlewares/rateLimit.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  sendMessage,
  updateUserData,
  userData,
  getAllUsers,
} from "../controllers/userController.js";
import {
  validateUserUpdate,
  sanitizeData,
  handleValidationErrors,
  validateMessages,
} from "../middlewares/sanitizeData.js";

const router = express.Router();

router.get("/users/list", authenticateToken, getAllUsers);
router.post(
  "/user/messages",
  limiter,
  sanitizeData,
  validateMessages,
  handleValidationErrors,
  authenticateToken,
  sendMessage
);
router.put(
  "/users/:userId",
  authenticateToken,
  sanitizeData,
  validateUserUpdate,
  handleValidationErrors,
  updateUserData
);
router.get("/users/:userId", authenticateToken, userData);

export default router;
