import { sql } from "../config/db.js";

export const getUserStats = async (req, res) => {
  const { id } = req.user;
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
    const leaderboard = await sql.query(
      `SELECT user_id, user_rank, all_time_score
        FROM (
        SELECT user_id, all_time_score,
                RANK() OVER (ORDER BY all_time_score DESC) AS user_rank
        FROM leaderboard
        ) ranked
        WHERE user_id = $1;
        `,
      [id]
    );
    const { user_rank, all_time_score } = leaderboard.rows[0];
    console.log(user_rank);

    res.status(201).json({
      success: true,
      userStats,
      user: req.user,
      all_time_score,
      user_rank,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLeaderboardGlobal = async (req, res) => {
  try {
    const result = await sql.query(
      `SELECT * FROM leaderboard ORDER BY score DESC`
    );
    res.status(201).json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLeaderboardWeekly = async (req, res) => {
  try {
    const result = await sql.query(`SELECT * FROM leaderboard_weekly`);
    res.status(201).json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLeaderboardMonthly = async (req, res) => {
  try {
    const result = await sql.query(`SELECT * FROM leaderboard_monthly`);
    res.status(201).json({ success: true, leaderboard: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
