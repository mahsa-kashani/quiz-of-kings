import { sql } from "../config/db.js";

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

    //found game
    if (result.rows.length > 0) {
      game = await sql.query(
        `UPDATE games SET player2_id = $1 , game_status='active' WHERE id = $2 
        RETURNING *`,
        [id, result.rows[0].id]
      );
      await sql.query(`UPDATE rounds SET current_turn=$1 WHERE game_id=$2`, [
        id,
        game.rows[0].id,
      ]);
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
        INSERT INTO rounds(game_id,round_number,question_id,current_turn) VALUES ($1,$2,$3,$4) RETURNING *
        `,
      [gameId, roundNumber, question.id, id]
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
export const getGame = async (req, res) => {
  const { gameId } = req.params;

  try {
    const gameResult = await sql.query(`SELECT * FROM games WHERE id = $1`, [
      gameId,
    ]);

    if (gameResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    const game = gameResult.rows[0];

    const playersResult = await sql.query(playersQuery, [gameId]);

    return res.status(200).json({
      success: true,
      game,
      players: playersResult.rows,
    });
  } catch (err) {
    console.error("getGame error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getRounds = async (req, res) => {
  const { gameId } = req.params;

  try {
    const result = await sql.query(
      `
      SELECT 
        r.id,
        r.round_number,
        c.category_name,
        to_jsonb(q) AS question,
        (
            SELECT json_agg(json_build_object('id', o.id, 'option_text', o.option_text))
            FROM question_option qo
            JOIN options o ON o.id = qo.option_id
            WHERE qo.question_id = q.id
        ) AS options,
        r.current_turn AS "currentTurn",
        COALESCE(
            json_agg(
            json_build_object(
                'player_id', ra.player_id,
                'selected_option', ra.selected_option_id
            )
            ) FILTER (WHERE ra.round_id IS NOT NULL),
            '[]'
        ) AS answers
        FROM rounds r
        JOIN questions q ON q.id = r.question_id
        JOIN categories c ON q.category_id = c.id
        LEFT JOIN round_answers ra ON ra.round_id = r.id
        WHERE r.game_id = $1
        GROUP BY r.id, r.round_number, q.id, c.id
        ORDER BY r.round_number;

      `,
      [gameId]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("getRounds error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const submitAnswer = async (req, res) => {
  const { roundId, gameId } = req.params;
  const { selected_option_id, time_taken } = req.body;
  const player_id = req.user.id;

  try {
    await sql.query("BEGIN");

    // check if already answered
    const check = await sql.query(
      `SELECT * FROM round_answers WHERE round_id = $1 AND player_id = $2`,
      [roundId, player_id]
    );
    if (check.rows.length > 0) {
      await sql.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, message: "Already answered" });
    }

    // submit answer
    await sql.query(
      `INSERT INTO round_answers (round_id, player_id, selected_option_id, time_taken)
       VALUES ($1, $2, $3, $4)`,
      [roundId, player_id, selected_option_id, time_taken]
    );

    // get players_ids
    const players = await sql.query(
      `SELECT player1_id, player2_id FROM games WHERE id = $1`,
      [gameId]
    );
    const { player1_id, player2_id } = players.rows[0];
    const opponent_id = player_id === player1_id ? player2_id : player1_id;

    // check num of answers
    const answers = await sql.query(
      `SELECT COUNT(*) FROM round_answers WHERE round_id = $1`,
      [roundId]
    );
    const count = Number(answers.rows[0].count);

    if (count === 1) {
      // opponent turn
      await sql.query(`UPDATE rounds SET current_turn = $1 WHERE id = $2`, [
        opponent_id,
        roundId,
      ]);
    } else {
      // both answered
      await sql.query(`UPDATE rounds SET current_turn = NULL WHERE id = $1`, [
        roundId,
      ]);
    }

    await sql.query("COMMIT");
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    await sql.query("ROLLBACK");
    res.status(500).json({ message: "Internal server error" });
  }
};
