import express from "express";
import {
  findOrCreateGame,
  createRound,
  getGame,
  getRounds,
  submitAnswer,
  submitResult,
} from "../controllers/gameController.js";

const router = express.Router();

router.post("/find-or-create", findOrCreateGame);
router.post("/:gameId/round", createRound);
router.get("/:gameId", getGame);
router.get("/:gameId/rounds", getRounds);
router.post("/:gameId/round/:roundId/answer", submitAnswer);
router.post("/:gameId/result", submitResult);

export default router;
