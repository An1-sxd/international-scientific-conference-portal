import express from "express";
import cors from "cors";
import publicRoutes from "./routes/public.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// ✅ MUST be first middleware
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));

app.use(cors())

app.use(express.json());

// routes
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

export default app;