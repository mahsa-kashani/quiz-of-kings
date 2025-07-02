import { sql } from "../config/db.js";

export const getUserStats = async (req, res) => {
  const { id, username, role } = req.user;
  try {
    const result = await sql.query(
      `SELECT * FROM user_statistics WHERE user_id=$1`,
      [id]
    );
    const userStats = result.rows[0];
    if (!userStats)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    const all_time_score = await sql.query(
      `SELECT all_time_score FROM leaderboard WHERE user_id=$1`,
      [id]
    );
    res
      .status(201)
      .json({
        success: true,
        userStats,
        user: req.user,
        all_time_score: all_time_score[0],
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
