import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import publicRoutes from "./routes/public.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// ✅ CORS with credentials for cookie-based auth
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

export default app;