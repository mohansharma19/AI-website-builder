import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import communityRouter from './routes/communityRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';

const PORT = 4000;
const app = express();

// middlewares
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json({ limit: '1mb' }));

// db
connectDB();

// Routes
app.get("/", (req, res) => {
    res.send("API is working");
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/community", communityRouter);
app.use("/api/payments", paymentRouter);

app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
    console.log("API is working");
});