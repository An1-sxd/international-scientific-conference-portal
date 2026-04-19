import express from "express";

const app = express();

app.use(express.json());
// ::define routes::
// app.use("/users", userRoutes);

export default app;