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
export const addMessage = async (req, res) => {
  const { id, role } = req.user;
  const { gameId } = req.params;
  const { content, receiver_id, reply_to_id } = req.body;

  if (role !== "player" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have permission to send messages.",
    });

  if (!content || content.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Message content is required.",
    });
  }

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
        message:
          "Access denied: You do not have permission to send message to this game.",
      });
    }

    await sql.query("BEGIN");

    const insertResult = await sql.query(
      `INSERT INTO messages 
        (game_id, sender_id, receiver_id, content, reply_to_id) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [gameId, id, receiver_id, content.trim(), reply_to_id || null]
    );

    await sql.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: insertResult.rows[0],
    });
  } catch (err) {
    await sql.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {};
