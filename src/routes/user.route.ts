import { Router } from "express";
import userController from "../controllers/user.controller";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateUserRequest } from "../middleware/validation";

const router = Router();

router.get("/", jwtCheck, jwtParse, userController.getUser);
router.post("/", jwtCheck, userController.createUser);
router.put("/", jwtCheck, jwtParse, validateUserRequest, userController.updateUser);

export default router;
