import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import mongoose from "mongoose";
import User from "./models/User.js";

async function testUserModel() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete test user if exists
    await User.deleteOne({ email: "test@example.com" });

    // Create a test user
    const user = await User.create({
      email: "Test@Example.com", // Will be lowercased
      password: "password123",
      plan: "pro",
      subscriptionStatus: "active",
      razorpayCustomerId: "cust_123456",
      razorpaySubscriptionId: "sub_789012",
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    console.log("\n✅ User created successfully!");
    console.log("📧 Email:", user.email);
    console.log("🔑 Password hashed:", user.password.startsWith("$2"));
    console.log("👤 Role:", user.role);
    console.log("📦 Plan:", user.plan);
    console.log("📊 Status:", user.subscriptionStatus);
    console.log("💳 Razorpay Customer ID:", user.razorpayCustomerId);
    console.log("🔄 Razorpay Subscription ID:", user.razorpaySubscriptionId);
    console.log("📅 Subscription Start:", user.subscriptionStartDate);
    console.log("📅 Subscription End:", user.subscriptionEndDate);
    console.log("🕐 Created At:", user.createdAt);
    console.log("🕐 Updated At:", user.updatedAt);

    // Test password matching
    const isMatch = await user.matchPassword("password123");
    console.log("\n✅ Password match test:", isMatch ? "PASSED" : "FAILED");

    // Clean up test user
    await User.deleteOne({ email: "test@example.com" });
    console.log("🧹 Test user cleaned up");

    await mongoose.disconnect();
    console.log("\n✅ All tests passed! User model is working correctly.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testUserModel();
