import express from "express";
import { body } from "express-validator";


import {
  listBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog
} from "../controllers/adminBlogController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const blogRules = [
  body("title").notEmpty().withMessage("Title required"),
  body("content").notEmpty().withMessage("Content required"),
  body("category").notEmpty().withMessage("Category required"),
  body("author").notEmpty().withMessage("Author required"),
  body("status")
    .optional()
    .isIn(["Published", "Draft", "Scheduled"])
    .withMessage("Invalid status"),
  body("publishAt")
    .optional({ values: "falsy" })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === "") {
        return true;
      }
      // If value exists, validate it's a valid ISO8601 date
      const date = new Date(value);
      return !isNaN(date.getTime()) && value.includes("T");
    })
    .withMessage("Invalid publishAt date format"),
  body("coverImage")
    .notEmpty()
    .withMessage("Cover image required"),
  body("coverImage")
    .isURL()
    .withMessage("Cover image must be a URL"),
  body("excerpt")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Excerpt too long (max 300 characters)")
];


router.use(protect);



// CRUD routes
router.get("/", listBlogs);
router.post("/", blogRules, validate, createBlog);


router.get("/:id", getBlog);
router.put("/:id", blogRules, validate, updateBlog);
router.delete("/:id", deleteBlog);

export default router;

