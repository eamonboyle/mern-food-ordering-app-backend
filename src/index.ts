import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

import userRoute from "./routes/user.route";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING!).then(() => console.log("Connected to database"));

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
    res.send({ message: "health OK!" });
});

app.use("/api/user", userRoute);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
