import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const uploadImage = async (file: Express.Multer.File) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
};

class RestaurantController {
    public async getRestaurant(req: Request, res: Response) {
        try {
            const restaurant = await Restaurant.findOne({ user: req.userId });

            if (!restaurant) {
                return res.status(404).json({ message: "Restaurant not found" });
            }

            res.status(200).json(restaurant.toObject());
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error getting restaurant" });
        }
    }

    public async getRestaurantById(req: Request, res: Response) {
        try {
            const restaurantId = req.params.restaurantId;
            const restaurant = await Restaurant.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({ message: "Restaurant not found" });
            }

            res.status(200).json(restaurant);
        } catch (error) {
            console.log(error);

            res.status(500).json({ message: "Something went wrong" });
        }
    }

    public async createRestaurant(req: Request, res: Response) {
        try {
            const existingRestaurant = await Restaurant.findOne({ user: req.userId });

            if (existingRestaurant) {
                return res.status(409).json({ message: "User restaurant already exists" });
            }

            const imageUrl = await uploadImage(req.file as Express.Multer.File);

            const restaurant = new Restaurant(req.body);
            restaurant.imageUrl = imageUrl;
            restaurant.user = new mongoose.Types.ObjectId(req.userId);
            restaurant.lastUpdated = new Date();
            await restaurant.save();

            res.status(201).send(restaurant);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Something went wrong" });
        }
    }

    public async updateRestaurant(req: Request, res: Response) {
        try {
            const restaurant = await Restaurant.findOne({
                user: req.userId,
            });

            if (!restaurant) {
                return res.status(404).json({ message: "restaurant not found" });
            }

            restaurant.restaurantName = req.body.restaurantName;
            restaurant.city = req.body.city;
            restaurant.country = req.body.country;
            restaurant.deliveryPrice = req.body.deliveryPrice;
            restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
            restaurant.cuisines = req.body.cuisines;
            restaurant.menuItems = req.body.menuItems;
            restaurant.lastUpdated = new Date();

            if (req.file) {
                const imageUrl = await uploadImage(req.file as Express.Multer.File);
                restaurant.imageUrl = imageUrl;
            }

            await restaurant.save();
            res.status(200).send(restaurant);
        } catch (error) {
            console.log("error", error);
            res.status(500).json({ message: "Something went wrong" });
        }
    }

    public async searchRestaurant(req: Request, res: Response) {
        try {
            const city = req.params.city;

            const searchQuery = (req.query.searchQuery as string) || "";
            const selectedCuisines = (req.query.selectedCuisines as string) || "";
            const sortOption = (req.query.sortOption as string) || "lastUpdated";
            const page = parseInt(req.query.page as string) || 1;

            let query: any = {};

            query["city"] = new RegExp(city, "i");
            const cityCheck = await Restaurant.countDocuments(query);

            if (cityCheck === 0) {
                return res.status(404).json({
                    data: [],
                    pagination: {
                        total: 0,
                        page: 1,
                        pages: 1,
                    },
                });
            }

            if (selectedCuisines) {
                const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"));
                query["cuisines"] = { $all: cuisinesArray };
            }

            if (searchQuery) {
                const searchRegex = new RegExp(searchQuery, "i");
                query["$or"] = [{ restaurantName: searchRegex }, { cuisines: { $in: [searchRegex] } }];
            }

            const pageSize = 10;
            const skip = (page - 1) * pageSize;

            // sortOption = "lastUpdated"
            const restaurants = await Restaurant.find(query)
                .sort({ [sortOption]: 1 })
                .skip(skip)
                .limit(pageSize)
                .lean();

            const total = await Restaurant.countDocuments(query);

            const response = {
                data: restaurants,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / pageSize),
                },
            };

            res.json(response);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Something went wrong" });
        }
    }
}

export default new RestaurantController();
