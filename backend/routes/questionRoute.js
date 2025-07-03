import express from "express";
import {
  getCategories,
  submitQuestion,
} from "../controllers/questionController.js";

const router = express.Router();
router.get("/categories", getCategories);
router.post("/new", submitQuestion);

export default router;
