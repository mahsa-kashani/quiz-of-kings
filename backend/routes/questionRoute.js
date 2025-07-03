import express from "express";
import { getCategories } from "../controllers/questionController.js";

const router = express.Router();
router.get("/categories", getCategories);

export default router;
