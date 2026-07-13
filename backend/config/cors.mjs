import dotenv from "dotenv";

dotenv.config();
const CLIENT_url = process.env.CLIENT_URL;

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://yebegena-sims.vercel.app",
    CLIENT_url,
  ],
  credentials: true,
};

export default corsOptions;
