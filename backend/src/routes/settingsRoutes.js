import express from "express";
import { getSettings, updateSettings, updateCompanyInfo } from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";
const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);
router.put("/company", protect, updateCompanyInfo);
export default router;
