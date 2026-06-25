import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import specs from "./config/swagger.mjs";
import corsOptions from "./config/cors.mjs";
import authRoutes from "./routes/authRoutes.mjs";
import kflatRoutes from "./routes/kflatRoutes.mjs";
import kflatRoleRoutes from "./routes/kflatRoleRoutes.mjs";
import teacherRoutes from "./routes/teacherRoutes.mjs";
import classRoutes from "./routes/classRoutes.mjs";
import studentRoutes from "./routes/studentRoutes.mjs";
import paymentRoutes from "./routes/paymentRoutes.mjs";
import notificationRoutes from "./routes/notificationRoutes.mjs";
import scheduleRoutes from "./routes/scheduleRoutes.mjs";
import examRoutes from "./routes/examRoutes.mjs";
import promotionRoutes from "./routes/promotionRoutes.mjs";
import classChangeRoutes from "./routes/classChangeRoutes.mjs";
import dashboaredRouters from "./routes/dashboaredRouters.mjs";
import systemSettingRouter from "./routes/systemSettingRoutes.mjs";

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

app.use("/api", authRoutes); //
app.use("/api/kflats", kflatRoutes); //
app.use("/api/kflat-roles", kflatRoleRoutes); //
app.use("/api/teachers", teacherRoutes); //
app.use("/api/classes", classRoutes); //
app.use("/api/students", studentRoutes); //
app.use("/api/payments", paymentRoutes); //
app.use("/api/notifications", notificationRoutes); //
app.use("/api/schedules", scheduleRoutes); //
app.use("/api/exams", examRoutes); //
app.use("/api/promotions", promotionRoutes); //
app.use("/api/class-change", classChangeRoutes); //
app.use("/api/setting", systemSettingRouter);
app.use("/api/dashboard", dashboaredRouters);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,

    customSiteTitle: "Yebegena SIMS API",

    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);
export default app;
