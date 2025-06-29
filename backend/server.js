import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();

const PORT = process.env.PORT || 3000;
const JWTSECRET = process.env.JWTSECRET;
const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res
      .status(401)
      .json({ success: false, message: "access token not found" });
  jwt.verify(token, JWTSECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ success: false, message: "access token expired or denied" });
    req.user = user;
    next();
  });
}

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
