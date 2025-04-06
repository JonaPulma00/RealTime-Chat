import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import {
  getAllGroupsData,
  getGroups,
  groupMessages,
  joinGroup,
  leaveGroup,
  getUserGroups,
} from "../controllers/groupsController.js";

const router = express.Router();

router.get("/groups", authenticateToken, getGroups);
router.get("/groups/:groupId/messages", authenticateToken, groupMessages);
router.get("/groups/all", authenticateToken, getAllGroupsData);
router.post("/groups/:groupId/join", authenticateToken, joinGroup);
router.delete("/groups/:groupId/leave", authenticateToken, leaveGroup);
router.get("/usuari/groups", authenticateToken, getUserGroups);

export default router;
