import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db.js";

// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true // if using cookies/auth
// }));

app.use(cors());

connectDB();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to the Express API!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
