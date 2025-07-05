import { sql } from "../config/db.js";

export const getMessages = async (req, res) => {
  const { id, role } = req.user;
  const { gameId } = req.params;

  if (role !== "player" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have access to messages.",
    });
  try {
    const result = await sql.query("SELECT * FROM games WHERE id = $1", [
      gameId,
    ]);

    const game = result.rows[0];
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }
    if (id !== game.player1_id && id !== game.player2_id && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: You do not have permission to view this game.",
      });
    }
    const messages = await sql.query(
      `
        SELECT * FROM messages WHERE game_id=$1
        `,
      [gameId]
    );
    return res.status(200).json(messages.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
