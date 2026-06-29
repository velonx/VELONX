import express from "express";
import aiRoutes from "./routes/ai.routes";
import profileRoutes from "./routes/profile.routes";
import jobRoutes from "./routes/job.routes";

const app = express();
app.use(express.json());

app.use("/api/ai", aiRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/job", jobRoutes);

export default app;
