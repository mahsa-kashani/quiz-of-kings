import express from "express";
import {
  getUserStats,
  getLeaderboardGlobal,
  getLeaderboardMonthly,
  getLeaderboardWeekly,
} from "../controllers/dashboardController.js";

const router = express.Router();
router.get("/stats", getUserStats);
router.get("/leaderboard/global", getLeaderboardGlobal);
router.get("/leaderboard/weekly", getLeaderboardWeekly);
router.get("/leaderboard/monthly", getLeaderboardMonthly);

export default router;
