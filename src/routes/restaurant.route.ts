import { Router } from "express";
import multer from "multer";
import restaurantController from "../controllers/restaurant.controller";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateRestaurantRequest } from "../middleware/validation";
import { param } from "express-validator";

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

router.get(
    "/search/:city",
    param("city").isString().trim().notEmpty().withMessage("City parameter must be a valid string"),
    restaurantController.searchRestaurant
);

export default router;
