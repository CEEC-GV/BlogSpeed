import express from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protectUser } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { getMe, loginUser, registerUser } from "../controllers/userController.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validate,
  registerUser
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password required")
  ],
  validate,
  loginUser
);

router.get("/me", protectUser, getMe);

export default router;
