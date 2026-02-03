import express from 'express';
import {
  getAllSubscribers,
  getSubscriberStats,
  getSubscriber,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
  unsubscribeByToken,
  bulkImportSubscribers,
  sendBroadcastEmail
} from '../controllers/subscriberController.js';

// Import your auth middleware (adjust path as needed)
// import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/subscribe', createSubscriber);
router.get('/unsubscribe/:token', unsubscribeByToken);

// Protected routes (add authentication middleware as needed)
// For now, these are open - add protect and adminOnly middleware in production

// Get stats
router.get('/stats', getSubscriberStats); // Add: protect, adminOnly

// Bulk operations
router.post('/bulk-import', bulkImportSubscribers); // Add: protect, adminOnly
router.post('/broadcast', sendBroadcastEmail); // Add: protect, adminOnly

// CRUD operations
router.route('/')
  .get(getAllSubscribers) // Add: protect, adminOnly
  .post(createSubscriber); // Public

router.route('/:id')
  .get(getSubscriber) // Add: protect, adminOnly
  .put(updateSubscriber) // Add: protect, adminOnly
  .delete(deleteSubscriber); // Add: protect, adminOnly

export default router;