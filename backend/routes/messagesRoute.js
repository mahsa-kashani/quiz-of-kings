import express from "express";
import {
  getMessages,
  addMessage,
  editMessage,
} from "../controllers/messagesController.js";

const router = express.Router();

router.get("/:gameId", getMessages);
router.post("/:gameId", addMessage);
router.put("/:gameId/:messageId", editMessage);

export default router;
