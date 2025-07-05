import express from "express";
import { getMessages, addMessage } from "../controllers/messagesController.js";

const router = express.Router();

router.get("/:gameId/", getMessages);
router.post("/:gameId/", addMessage);

export default router;
