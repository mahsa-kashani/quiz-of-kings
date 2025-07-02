import express from "express";
import { getUserStats } from "../controllers/dashboardController.js";

const router = express.Router();
router.get("/stats", getUserStats);

export default router;
