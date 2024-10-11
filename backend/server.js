import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import { errHandler } from "./controllers/error.js";
import cors from "cors";
dotenv.config();
const app = express();
import authRouter from "./routes/auth.js";
const PORT = process.env.PORT || 3030;

// connect to DB
connectDB();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
// Middleware để phân tích cookie
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);

app.use(errHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
