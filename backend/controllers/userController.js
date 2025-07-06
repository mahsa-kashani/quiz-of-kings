import { sql } from "../config/db.js";

export const getUsers = async (req, res) => {
  const { role } = req.user;
  if (role !== "moderator" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have permission to view users.",
    });
  try {
    const result = await sql.query(
      `SELECT id, username, email, user_role, is_banned FROM users ORDER BY id`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const toggleBanStatus = async (req, res) => {
  const { role } = req.user;
  const { userId } = req.params;
  const { is_banned } = req.body;
  console.log(is_banned);
  if (role !== "moderator" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have permission to change user status.",
    });

  try {
    const result = await sql.query(`SELECT * FROM users WHERE id=$1`, [userId]);
    const user = result.rows[0];
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    if (user.user_role === "admin")
      return res
        .status(403)
        .json({ success: false, message: "You can't ban Admin!" });
    await sql.query(`BEGIN`);
    await sql.query(`UPDATE users SET is_banned = $1 WHERE id = $2`, [
      is_banned,
      userId,
    ]);
    await sql.query(`COMMIT`);
    return res.status(200).json({ success: true });
  } catch (err) {
    await sql.query(`ROLLBACK`);
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
