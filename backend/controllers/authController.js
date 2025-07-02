import { sql } from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.user_role,
    },
    process.env.JWT_SECRET
  );
}

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res
      .status(400)
      .json({ success: false, message: "All fields are required!" });
  try {
    const checkDuplicateUser = await sql.query(
      `SELECT * FROM users WHERE username=$1`,
      [username]
    );
    if (checkDuplicateUser.rows.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "user already exists!" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await sql.query(
      `INSERT INTO users(username , email , pass)
        VALUES ($1 , $2 , $3)
        RETURNING *
        `,
      [username, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ success: true, user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await sql.query(
      `SELECT * FROM users 
            WHERE username=$1`,
      [username]
    );
    const user = result.rows[0];
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "user not found!" });
    const match = await bcrypt.compare(password, user.pass);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    const token = generateToken(user);
    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
