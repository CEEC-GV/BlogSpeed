import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export const checkCredits = (requiredCredits = 1) => async (req, res, next) => {
  try {
    console.log(`🔍 checkCredits: Required=${requiredCredits}, Path=${req.path}`);
    
    // Check if admin is already authenticated (from protect middleware)
    let account = req.admin || req.user;
    
    console.log(`👤 Account found: ${account ? 'YES' : 'NO'}`);
    if (account) {
      console.log(`💰 Credit Balance: ${account.creditBalance || 0}`);
    }

    // If not authenticated, try x-user-token header (legacy)
    if (!account) {
      const token = req.headers["x-user-token"];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          account = user;
        }
      }
    }

    // Not authenticated - this is an auth failure
    if (!account) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Authenticated but insufficient credits - this is NOT an auth failure
    if ((account.creditBalance || 0) < requiredCredits) {
      return res.status(403).json({ 
        message: "Insufficient credits",
        required: requiredCredits,
        available: account.creditBalance || 0
      });
    }

    // Deduct credits after successful response
    res.on("finish", () => {
      if (res.statusCode < 400) {
        account.creditBalance = Math.max(
          0,
          (account.creditBalance || 0) - requiredCredits
        );
        account.save().catch((err) => {
          console.error("Failed to deduct credits:", err);
        });
      }
    });

    return next();
  } catch (err) {
    // Token verification failed - this is an auth failure
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
