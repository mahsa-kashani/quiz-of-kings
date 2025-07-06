import { sql } from "../config/db.js";

export const getUserStats = async (req, res) => {
  const { id } = req.user;
  try {
    const result = await sql.query(
      `SELECT * FROM user_statistics WHERE user_id=$1`,
      [id]
    );
    const userStats = result.rows[0];
    if (!userStats) {
      console.log("user status not found in db");
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const leaderboard = await sql.query(
      `SELECT user_id, user_rank, score
        FROM (
        SELECT user_id, score,
                RANK() OVER (ORDER BY score DESC) AS user_rank
        FROM leaderboard
        ) ranked
        WHERE user_id = $1;
        `,
      [id]
    );
    const { user_rank, score } = leaderboard.rows[0];

    return res.status(201).json({
      success: true,
      userStats,
      user: req.user,
      all_time_score: score,
      user_rank,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getLeaderboardGlobal = async (req, res) => {
  try {
    const result = await sql.query(
      `SELECT l.user_id,l.score,u.username FROM leaderboard l JOIN users u ON l.user_id = u.id ORDER BY score DESC`
    );
    return res.status(201).json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getLeaderboardWeekly = async (req, res) => {
  try {
    const result = await sql.query(`SELECT * FROM leaderboard_weekly`);
    return res.status(201).json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getLeaderboardMonthly = async (req, res) => {
  try {
    const result = await sql.query(`SELECT * FROM leaderboard_monthly`);
    return res.status(201).json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
