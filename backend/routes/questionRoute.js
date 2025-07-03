import express from "express";
import {
  getCategories,
  submitQuestion,
  getUserQuestions,
} from "../controllers/questionController.js";

const router = express.Router();
router.get("/categories", getCategories);
router.post("/new", submitQuestion);
router.get("/user", getUserQuestions);

export default router;
