import dotenv from "dotenv";

dotenv.config();

import app from "./app.mjs";
import connectDB from "./config/db.mjs";

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
