import express from "express";
import { getUsers, toggleBanStatus } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.put("/:userId/ban", toggleBanStatus);

export default router;
