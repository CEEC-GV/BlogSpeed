import express from "express";
import { startTrial } from '../controllers/contactController.js';

const router = express.Router();

// POST /api/contact/start-trial
router.post("/start-trial", startTrial);

export default router;

