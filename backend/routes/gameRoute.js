import express from "express";
import { findOrCreateGame } from "../controllers/gameController.js";

const router = express.Router();

router.post("/find-or-create", findOrCreateGame);

export default router;
