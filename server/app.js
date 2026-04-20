import express from "express";
import publicRoutes from "./routes/public.routes.js";

const app = express();

app.use(express.json());
app.use("/api", publicRoutes);

export default app;
