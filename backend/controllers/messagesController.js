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
        SELECT * FROM messages WHERE game_id=$1 ORDER BY created_at
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

    await sql.query(
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
    });
  } catch (err) {
    await sql.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMessage = async (req, res) => {
  const { id, role } = req.user;
  const { gameId, messageId } = req.params;
  const { content } = req.body;

  if (role !== "player" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have permission to edit messages.",
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
          "Access denied: You do not have permission to edit message in this game.",
      });
    }

    const msgResult = await sql.query(
      `SELECT * FROM messages WHERE id = $1 AND game_id = $2`,
      [messageId, gameId]
    );

    const message = msgResult.rows[0];
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (role !== "admin" && message.sender_id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages.",
      });
    }

    await sql.query("BEGIN");

    await sql.query(
      `
      UPDATE messages
      SET
        content = $1,
        is_edited = true,
        edited_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND game_id = $3
      `,
      [content, messageId, gameId]
    );

    await sql.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Message edited",
    });
  } catch (err) {
    await sql.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  const { id, role } = req.user;
  const { gameId, messageId } = req.params;

  if (role !== "player" && role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to delete messages.",
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
          "Access denied: You do not have permission to delete message in this game.",
      });
    }

    const msgResult = await sql.query(
      `SELECT * FROM messages WHERE id = $1 AND game_id = $2`,
      [messageId, gameId]
    );

    const message = msgResult.rows[0];
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (role !== "admin" && message.sender_id !== id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages.",
      });
    }

    await sql.query("BEGIN");

    await sql.query(`DELETE FROM messages WHERE id = $1 AND game_id = $2`, [
      messageId,
      gameId,
    ]);

    await sql.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (err) {
    await sql.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllMessages = async (req, res) => {
  const { role } = req.user;
  if (role !== "admin")
    return res.status(403).json({
      success: false,
      message: "only admin can access chats",
    });
  try {
    // get games with messages
    const { rows: gamesWithChats } = await sql.query(`
      SELECT DISTINCT g.id AS game_id,
             g.player1_id, u1.username AS player1_username,
             g.player2_id, u2.username AS player2_username
      FROM messages m
      JOIN games g ON g.id = m.game_id
      LEFT JOIN users u1 ON g.player1_id = u1.id
      LEFT JOIN users u2 ON g.player2_id = u2.id
      ORDER BY g.id DESC
    `);

    // get all messages
    const { rows: messages } = await sql.query(`
      SELECT
        m.id,
        m.game_id,
        m.sender_id,
        u.username AS sender_username,
        m.content,
        m.created_at
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      ORDER BY m.created_at ASC
    `);

    // grouping messages for games
    const chats = gamesWithChats.map((game) => {
      const chatMessages = messages.filter(
        (msg) => msg.game_id === game.game_id
      );
      return {
        id: game.game_id,
        game_id: game.game_id,
        player1_id: game.player1_id,
        player2_id: game.player2_id,
        player1_username: game.player1_username || "Unknown",
        player2_username: game.player2_username || "Unknown",
        messages: chatMessages,
      };
    });

    return res.status(200).json(chats);
  } catch (err) {
    console.error("Admin chat fetch error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
