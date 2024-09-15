import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

import userRoute from "./routes/user.route";
import restaurantRoute from "./routes/restaurant.route";
import logger from "./middleware/logger";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING!).then(() => console.log("Connected to database"));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(cors());
app.use(logger);

app.get("/health", async (req: Request, res: Response) => {
    res.send({ message: "health OK!" });
});

app.use("/api/user", userRoute);
app.use("/api/restaurant", restaurantRoute);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
