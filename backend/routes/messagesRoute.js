import express from "express";
import {
  getMessages,
  addMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/messagesController.js";

const router = express.Router();

router.get("/:gameId", getMessages);
router.post("/:gameId", addMessage);
router.put("/:gameId/:messageId", updateMessage);
router.delete("/:gameId/:messageId", deleteMessage);

export default router;
