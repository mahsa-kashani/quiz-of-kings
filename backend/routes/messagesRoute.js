import express from "express";
import { getMessages } from "../controllers/messagesController.js";

const router = express.Router({ mergeParams: true });

router.get("/", getMessages);

export default router;
