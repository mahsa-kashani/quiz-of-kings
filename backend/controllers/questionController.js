import { sql } from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const result = await sql.query(
      `SELECT * FROM categories ORDER BY category_name`
    );
    res.status(201).json({ success: false, categories: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
