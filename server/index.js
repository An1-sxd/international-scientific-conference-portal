import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import "./models/index.js";

connectDB();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome to the Express API!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
