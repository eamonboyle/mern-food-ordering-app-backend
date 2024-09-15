import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

class RestaurantController {
    public async createRestaurant(req: Request, res: Response) {
        try {
            const existingRestaurant = await Restaurant.find({
                user: req.userId,
            });

            if (existingRestaurant.length > 0) {
                return res.status(409).json({ message: "User restaurant already exists" });
            }

            const image = req.file as Express.Multer.File;
            const base64Image = Buffer.from(image.buffer).toString("base64");
            const dataUri = `data:${image.mimetype};base64,${base64Image}`;

            const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);

            const newRestaurant = new Restaurant(req.body);
            newRestaurant.imageUrl = uploadResponse.secure_url;
            newRestaurant.user = new mongoose.Types.ObjectId(req.userId);
            newRestaurant.lastUpdated = new Date();

            await newRestaurant.save();

            res.status(201).json(newRestaurant.toObject());
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error creating restaurant" });
        }
    }
}

export default new RestaurantController();
