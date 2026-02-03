import express from "express";
import { body } from "express-validator";
import { loginAdmin, createAdmin } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/login",
  [
    body("username")
      .notEmpty()
      .withMessage("Username required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password").isLength({ min: 6 }).withMessage("Password required")
  ],
  validate,
  loginAdmin
);

router.post(
  "/register",
  [
    body("username")
      .notEmpty()
      .withMessage("Username required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .isAlphanumeric()
      .withMessage("Username must contain only letters and numbers"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  validate,
  createAdmin
);

export default router;
