import express from "express";
import cors from "cors";

import corsOptions from "./config/cors.mjs";

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

export default app;
