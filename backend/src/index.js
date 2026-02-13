import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("=== BlogSpeed Backend Environment ===");
console.log("  GOOGLE_CLOUD_PROJECT:", process.env.GOOGLE_CLOUD_PROJECT || "MISSING");
console.log("  GOOGLE_CLOUD_LOCATION:", process.env.GOOGLE_CLOUD_LOCATION || "MISSING");
console.log("  GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS || "MISSING");
console.log("  SERPAPI_KEY:", process.env.SERPAPI_KEY ? `OK (len=${process.env.SERPAPI_KEY.length})` : "MISSING");
console.log("  MONGO_URI:", process.env.MONGO_URI ? "OK" : "MISSING");
console.log("  JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "MISSING");
console.log("===================================");

import mongoose from "mongoose";
import app from "./app.js";
import Admin from "./models/Admin.js";
import { startAutoPublishWorker } from "./workers/autoPublishWorker.js";
const PORT = process.env.PORT || 5000;

const ensureDefaultAdmin = async () => {
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const existingAdmin = await Admin.findOne({ username: adminUsername });
  if (!existingAdmin) {
    await Admin.create({ username: adminUsername, password: adminPassword });
  }
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    return ensureDefaultAdmin();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Start the auto-publish worker (checks every 1 minute)
      startAutoPublishWorker(1);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });
