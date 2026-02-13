/**
 * Credit Service - Safe, atomic credit deduction
 * 
 * CRITICAL RULES:
 * 1. ALWAYS re-fetch user from DB before deduction
 * 2. Verify creditBalance >= amount
 * 3. Deduct and save atomically
 * 4. Throw error if insufficient credits
 * 5. Log all transactions
 */

import User from "../models/User.js";
import Admin from "../models/Admin.js";
import CreditTransaction from "../models/CreditTransaction.js";

/**
 * Find account by ID — checks User first, then Admin
 */
const findAccountById = async (id) => {
  let account = await User.findById(id);
  if (account) return { account, type: 'user' };
  account = await Admin.findById(id);
  if (account) return { account, type: 'admin' };
  return { account: null, type: null };
};

/**
 * Check if user has enough credits
 * 
 * @param {Object} user - User object from database
 * @param {Number} amount - Credits needed
 * @returns {boolean} - True if user has enough credits
 */
export const canConsumeCredits = async (user, amount) => {
  if (!user || !amount || amount < 0) {
    throw new Error("Invalid user or credit amount");
  }

  // Re-fetch from DB to ensure we have latest balance (check both User and Admin)
  const { account: freshUser } = await findAccountById(user._id);
  if (!freshUser) {
    throw new Error("User not found");
  }

  const currentBalance = freshUser.creditBalance || 0;
  return currentBalance >= amount;
};

/**
 * Atomically consume (deduct) credits from user account
 * 
 * SAFE DEDUCTION FLOW:
 * 1. Re-fetch user from DB (prevent stale reads)
 * 2. Verify creditBalance >= amount
 * 3. Update creditBalance
 * 4. Save user document
 * 5. Log transaction
 * 6. Return updated user
 * 
 * @param {String} userId - User ID
 * @param {Number} amount - Credits to deduct
 * @param {String} feature - Feature name (for logging)
 * @returns {Object} - Updated user object with new creditBalance
 * @throws {Error} - If deduction fails or insufficient credits
 */
export const consumeCredits = async (userId, amount, feature = "unknown") => {
  if (!userId || !amount || amount < 0) {
    throw new Error("Invalid userId or credit amount");
  }

  // ✅ STEP 1: Re-fetch fresh account from database (User OR Admin)
  const { account: user } = await findAccountById(userId);
  if (!user) {
    throw new Error("Account not found (checked User and Admin collections)");
  }
  console.log(`💳 Found account type for ${userId}: ${user.constructor.modelName}`);

  const currentBalance = user.creditBalance || 0;

  // ✅ STEP 2: Verify sufficient credits
  if (currentBalance < amount) {
    const error = new Error("Insufficient credits");
    error.statusCode = 403;
    error.currentBalance = currentBalance;
    error.required = amount;
    throw error;
  }

  // ✅ STEP 3: Calculate new balance
  const newBalance = currentBalance - amount;

  // ✅ STEP 4: Update and save user (atomic operation)
  user.creditBalance = newBalance;
  await user.save();

  // ✅ STEP 5: Log transaction
  try {
    await CreditTransaction.create({
      userId,
      amount,
      action: "deduct",
      feature,
      previousBalance: currentBalance,
      newBalance
    });
  } catch (logError) {
    // Log transaction failure but don't break credit deduction
    console.error(`⚠️ Failed to log credit transaction: ${logError.message}`);
  }

  console.log(`✅ Credits deducted for ${feature}: ${amount} (${currentBalance} → ${newBalance})`);

  return user;
};

/**
 * Add credits to user account (for top-ups)
 * 
 * @param {String} userId - User ID
 * @param {Number} amount - Credits to add
 * @param {String} reason - Reason for addition
 * @returns {Object} - Updated user object
 */
export const addCredits = async (userId, amount, reason = "top-up") => {
  if (!userId || !amount || amount < 0) {
    throw new Error("Invalid userId or credit amount");
  }

  // Check both User and Admin collections
  const { account: user } = await findAccountById(userId);
  if (!user) {
    throw new Error("Account not found (checked User and Admin collections)");
  }

  const previousBalance = user.creditBalance || 0;
  const newBalance = previousBalance + amount;

  user.creditBalance = newBalance;
  user.totalCreditsPurchased = (user.totalCreditsPurchased || 0) + amount;
  user.lastCreditTopupAt = new Date();
  
  await user.save();

  // Log transaction
  try {
    await CreditTransaction.create({
      userId,
      amount,
      action: "add",
      feature: reason,
      previousBalance,
      newBalance
    });
  } catch (logError) {
    console.error(`⚠️ Failed to log credit transaction: ${logError.message}`);
  }

  console.log(`✅ Credits added for ${reason}: ${amount} (${previousBalance} → ${newBalance})`);

  return user;
};

/**
 * Get user's current credit balance (fresh from DB)
 * 
 * @param {String} userId - User ID
 * @returns {Number} - Current credit balance
 */
export const getCreditBalance = async (userId) => {
  const { account: user } = await findAccountById(userId);
  if (!user) {
    throw new Error("Account not found (checked User and Admin collections)");
  }
  return user.creditBalance || 0;
};

export default {
  canConsumeCredits,
  consumeCredits,
  addCredits,
  getCreditBalance
};
