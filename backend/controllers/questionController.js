import { sql } from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const userResults = await sql.query(
      `SELECT * FROM categories ORDER BY category_name`
    );
    return res
      .status(201)
      .json({ success: false, categories: userResults.rows });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const submitQuestion = async (req, res) => {
  const { id } = req.user;
  const {
    question_text,
    options,
    correct_option,
    category,
    category_id,
    difficulty,
  } = req.body;
  if (
    !question_text ||
    !options.A ||
    !options.B ||
    !options.C ||
    !options.D ||
    !correct_option ||
    !category ||
    !difficulty
  )
    return res
      .status(400)
      .json({ success: false, message: "All fields are required!" });
  try {
    const userResults = await sql.query(`SELECT * FROM users WHERE id=$1`, [
      id,
    ]);
    const checkUser = userResults.rows[0];
    if (!checkUser || checkUser.is_banned) {
      console.log("user not found in db");
      return res
        .status(403)
        .json({ success: false, message: "User not found or is banned!" });
    }
    const optionsResult = await sql.query(
      `INSERT INTO options(option_text) VALUES ($1),($2),($3),($4)
        RETURNING id`,
      [options.A, options.B, options.C, options.D]
    );
    const correct_option_index = { A: 0, B: 1, C: 2, D: 3 }[correct_option];
    const correct_option_id = optionsResult.rows[correct_option_index].id;
    const questionResult = await sql.query(
      `
        INSERT INTO questions(question_text,difficulty,correct_option_id,category_id,author_id)
        VALUES($1,$2,$3,$4,$5)
        RETURNING id
        `,
      [question_text, difficulty, correct_option_id, category_id, id]
    );
    const question_id = questionResult.rows[0].id;
    const result = await sql.query(
      `INSERT INTO question_option VALUES ($1,$2) , ($1,$3), ($1,$4), ($1,$5)`,
      [
        question_id,
        optionsResult.rows[0].id,
        optionsResult.rows[1].id,
        optionsResult.rows[2].id,
        optionsResult.rows[3].id,
      ]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getUserQuestions = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await sql.query(
      `SELECT
        q.id,
        q.question_text,
        q.difficulty,
        c.category_name,
        q.approval_status,
        q.rejection_reason,
        correct_option.id AS correct_option,
        json_agg(
          json_build_object('id', o.id, 'option_text', o.option_text)
          ORDER BY o.id
        ) AS options
      FROM questions q
      JOIN categories c ON q.category_id = c.id
      JOIN options correct_option ON q.correct_option_id = correct_option.id
      JOIN question_option qo ON qo.question_id = q.id
      JOIN options o ON o.id = qo.option_id
      WHERE q.author_id = $1
      GROUP BY
        q.id,
        q.question_text,
        q.difficulty,
        c.category_name,
        q.approval_status,
        q.rejection_reason,
        correct_option.id
      ORDER BY q.id DESC;

    `,
      [id]
    );
    return res.status(201).json({ success: true, questions: result.rows });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getQuestions = async (req, res) => {
  const { id, role } = req.user;
  if (role !== "reviewer" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have permission to view questions.",
    });
  try {
    const result = await sql.query(
      `SELECT
        q.id,
        q.question_text,
        q.difficulty,
        c.category_name,
        q.approval_status,
        q.rejection_reason,
        correct_option.id AS correct_option,
        json_agg(
          json_build_object('id', o.id, 'option_text', o.option_text)
          ORDER BY o.id
        ) AS options
      FROM questions q
      JOIN categories c ON q.category_id = c.id
      JOIN options correct_option ON q.correct_option_id = correct_option.id
      JOIN question_option qo ON qo.question_id = q.id
      JOIN options o ON o.id = qo.option_id
      GROUP BY
        q.id,
        q.question_text,
        q.difficulty,
        c.category_name,
        q.approval_status,
        q.rejection_reason,
        correct_option.id
      ORDER BY q.id DESC;

    `
    );
    return res.status(201).json(result.rows);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const approveQuestion = async (req, res) => {
  const { role } = req.user;
  const { questionId } = req.params;
  if (role !== "reviewer" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have permission to approve questions.",
    });
  try {
    await sql.query(`BEGIN`);
    await sql.query(
      `UPDATE questions SET approval_status = 'approved', rejection_reason=null WHERE id=$1`,
      [questionId]
    );
    await sql.query(`COMMIT`);
    return res.status(201).json({
      success: true,
      message: "Question approved successfully.",
    });
  } catch (err) {
    await sql.query(`ROLLBACK`);
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const rejectQuestion = async (req, res) => {
  const { role } = req.user;
  const { questionId } = req.params;
  const { reason } = req.body;
  if (role !== "reviewer" && role !== "admin")
    return res.status(403).json({
      success: false,
      message: "You don't have permission to reject questions.",
    });
  try {
    await sql.query(`BEGIN`);
    await sql.query(
      `UPDATE questions SET approval_status = 'rejected' , rejection_reason = $1 WHERE id=$2`,
      [reason, questionId]
    );
    await sql.query(`COMMIT`);
    return res.status(201).json({
      success: true,
      message: "Question rejected successfully.",
    });
  } catch (err) {
    await sql.query(`ROLLBACK`);
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
