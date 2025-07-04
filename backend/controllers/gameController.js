import { sql } from "../config/db.js";

export const findOrCreateGame = async (req, res) => {
  const { id, username, role } = req.user;
  if (role !== "player") {
    return res
      .status(403)
      .json({ success: false, message: "Only players can start a game" });
  }
  let game = {};

  try {
    await sql.query(`BEGIN`);
    const result = await sql.query(
      `SELECT * FROM games WHERE game_status='waiting' AND player2_id IS NULL AND player1_id <> $1
      ORDER BY created_at 
      LIMIT 1
      FOR UPDATE SKIP LOCKED`,
      [id]
    );
    //found game
    if (result.rows.length > 0) {
      game = await sql.query(
        `UPDATE games SET player2_id = $1 , game_status='active' , started_at = CURRENT_TIMESTAMP WHERE id = $2 
        RETURNING *`,
        [id, result.rows[0].id]
      );
      await sql.query(`COMMIT`);
      res
        .status(201)
        .json({ success: true, game: game.rows[0], isFirstPlayer: false });
    }
    //create new game
    game = await sql.query(
      `INSERT INTO games(player1_id) VALUES ($1) RETURNING *`,
      [id]
    );
    await sql.query(`COMMIT`);
    return res
      .status(201)
      .json({ success: true, game: game.rows[0], isFirstPlayer: true });
  } catch (err) {
    await sql.query(`ROLLBACK`);
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createRound = async (req, res) => {
  const { id, username, role } = req.user;
  if (role !== "player") {
    return res
      .status(403)
      .json({ success: false, message: "Only players can play a round" });
  }
};
