import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
