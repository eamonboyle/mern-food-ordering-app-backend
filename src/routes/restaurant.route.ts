import { Router } from "express";
import multer from "multer";
import restaurantController from "../controllers/restaurant.controller";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateRestaurantRequest } from "../middleware/validation";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", jwtCheck, jwtParse, restaurantController.getRestaurant);

router.post(
    "/",
    upload.single("imageFile"),
    validateRestaurantRequest,
    jwtCheck,
    jwtParse,
    restaurantController.createRestaurant
);

router.put("/", upload.single("imageFile"), jwtCheck, jwtParse, restaurantController.updateRestaurant);

export default router;
