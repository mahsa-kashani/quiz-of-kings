import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import authRoute from "./routes/authRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import questionRoute from "./routes/questionRoute.js";
import gameRoute from "./routes/gameRoute.js";
import messagesRoute from "./routes/messagesRoute.js";
import userRoute from "./routes/userRoute.js";
import { sql } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const JWTSECRET = process.env.JWT_SECRET;
const app = express();

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res
      .status(401)
      .json({ success: false, message: "access token not found" });
  jwt.verify(token, JWTSECRET, async (err, decoded) => {
    if (err)
      return res
        .status(403)
        .json({ success: false, message: "access token expired or denied" });
    const result = await sql.query(`SELECT * FROM users WHERE id = $1`, [
      decoded.id,
    ]);
    const user = result.rows[0];

    if (!user || user.is_banned) {
      return res
        .status(403)
        .json({ success: false, message: "User does not exist or is banned" });
    }
    req.user = decoded;
    next();
  });
}

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoute);
app.use("/api/dashboard", authenticateToken, dashboardRoute);
app.use("/api/questions", authenticateToken, questionRoute);
app.use("/api/messages", authenticateToken, messagesRoute);
app.use("/api/game", authenticateToken, gameRoute);
app.use("/api/users", authenticateToken, userRoute);

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
