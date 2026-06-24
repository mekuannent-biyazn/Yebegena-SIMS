import express from "express";
import cors from "cors";

import corsOptions from "./config/cors.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import kflatRoutes from "./routes/kflatRoutes.mjs";
import kflatRoleRoutes from "./routes/kflatRoleRoutes.mjs";
import teacherRoutes from "./routes/teacherRoutes.mjs";
import classRoutes from "./routes/classRoutes.mjs";
import studentRoutes from "./routes/studentRoutes.mjs";

const app = express();

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Yebegena SIMS API Running",
  });
});

app.use("/api", authRoutes);
app.use("/api/kflats", kflatRoutes);
app.use("/api/kflat-roles", kflatRoleRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);

export default app;
