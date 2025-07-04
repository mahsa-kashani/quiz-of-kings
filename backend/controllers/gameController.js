import { sql } from "../config/db.js";

export const findOrCreateGame = async (req, res) => {
  const { id, role } = req.user;
  if (role !== "player") {
    return res
      .status(403)
      .json({ success: false, message: "Only players can start a game" });
  }
  let game = null;
  let players = null;

  try {
    await sql.query(`BEGIN`);
    const result = await sql.query(
      `SELECT * FROM games WHERE game_status='waiting' AND player2_id IS NULL AND player1_id <> $1
      ORDER BY created_at 
      LIMIT 1
      FOR UPDATE SKIP LOCKED`,
      [id]
    );
    const playersQuery = `SELECT 
        u.id,
        u.username,
        COALESCE(l.score, 0) AS score,
        us.xp,
        CASE 
            WHEN u.id = g.player1_id THEN 1
            ELSE 2
        END AS player_order
        FROM games g
        JOIN users u ON u.id = g.player1_id OR u.id = g.player2_id
        LEFT JOIN leaderboard l ON u.id = l.user_id
        LEFT JOIN user_statistics us ON u.id = us.user_id
        WHERE g.id = $1
        ORDER BY player_order ASC;`;
    //found game
    if (result.rows.length > 0) {
      game = await sql.query(
        `UPDATE games SET player2_id = $1 , game_status='active' WHERE id = $2 
        RETURNING *`,
        [id, result.rows[0].id]
      );
      players = await sql.query(playersQuery, [game.rows[0].id]);
      await sql.query(`COMMIT`);
      res.status(201).json({
        success: true,
        game: game.rows[0],
        isFirstPlayer: false,
        players: players.rows,
      });
    }
    //create new game
    game = await sql.query(
      `INSERT INTO games(player1_id) VALUES ($1) RETURNING *`,
      [id]
    );
    players = await sql.query(playersQuery, [game.rows[0].id]);
    await sql.query(`COMMIT`);
    return res.status(201).json({
      success: true,
      game: game.rows[0],
      isFirstPlayer: true,
      players: players.rows,
    });
  } catch (err) {
    await sql.query(`ROLLBACK`);
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createRound = async (req, res) => {
  const { id, role } = req.user;
  const { gameId } = req.params;
  const selectedCategory = req.body.category;
  if (role !== "player") {
    return res
      .status(403)
      .json({ success: false, message: "Only players can play a round" });
  }
  try {
    const result = await sql.query(
      `SELECT COUNT(*) FROM rounds WHERE game_id = $1`,
      [gameId]
    );
    const currentCount = Number(result.rows[0].count);
    const roundNumber = currentCount + 1;
    let question = await sql.query(
      `SELECT *
        FROM questions
        WHERE category_id = $1
        AND approval_status = 'approved'
        ORDER BY RANDOM()
        LIMIT 1;
        `,
      [selectedCategory.id]
    );
    if (question.rows.length === 0)
      return res.status(404).json({
        success: false,
        message: "No questions found for this category",
      });
    question = question.rows[0];
    let options = await sql.query(
      `
        SELECT o.id , o.option_text FROM options o JOIN question_option qo ON qo.option_id = o.id
        WHERE qo.question_id = $1
        `,
      [question.id]
    );
    if (options.rows.length === 0)
      return res.status(404).json({
        success: false,
        message: "No options found for this question",
      });
    options = options.rows;
    let round = await sql.query(
      `
        INSERT INTO rounds(game_id,round_number,question_id) VALUES ($1,$2,$3) RETURNING *
        `,
      [gameId, roundNumber, question.id]
    );
    round = round.rows[0];
    res
      .status(201)
      .json({ success: true, question, options, round, currentTurn: id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
