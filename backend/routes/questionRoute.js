import express from "express";
import {
  getCategories,
  submitQuestion,
  getUserQuestions,
  getQuestions,
  approveQuestion,
  rejectQuestion,
} from "../controllers/questionController.js";

const router = express.Router();
router.get("/categories", getCategories);
router.post("/new", submitQuestion);
router.get("/user", getUserQuestions);
router.get("/review", getQuestions);
router.put("/:questionId/approve", approveQuestion);
router.put("/:questionId/reject", rejectQuestion);

export default router;
