import express from "express";
import {
  findOrCreateGame,
  createRound,
} from "../controllers/gameController.js";

const router = express.Router();

router.post("/find-or-create", findOrCreateGame);
router.post("/:gameId/round", createRound);

export default router;
