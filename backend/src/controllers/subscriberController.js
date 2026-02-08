import Subscriber from '../models/Subscriber.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure email transporter (use your email service)
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};


/**
 * @desc    Get all subscribers
 * @route   GET /api/subscribers
 * @access  Private/Admin
 */
export const getAllSubscribers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50, search } = req.query;
  
  const query = { user: req.admin.id }; // Always filter by user
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  const [subscribers, total] = await Promise.all([
    Subscriber.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-unsubscribeToken'),
    Subscriber.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: subscribers,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  });
});

/**
 * @desc    Get subscriber statistics
 * @route   GET /api/subscribers/stats
 * @access  Private/Admin
 */
export const getSubscriberStats = asyncHandler(async (req, res) => {
  const stats = await Subscriber.getSubscriberStats(req.admin.id);

  // Get recent subscribers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSubscribers = await Subscriber.countDocuments({
    subscribedAt: { $gte: thirtyDaysAgo },
    status: 'subscribed',
    user: req.admin.id
  });

  res.json({
    success: true,
    data: {
      ...stats,
      recentSubscribers
    }
  });
});

/**
 * @desc    Get single subscriber
 * @route   GET /api/subscribers/:id
 * @access  Private/Admin
 */
export const getSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findOne({ 
    _id: req.params.id,
    user: req.admin.id  // Ensure user can only access their own subscribers
  }).select('-unsubscribeToken');

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      error: 'Subscriber not found'
    });
  }

  res.json({
    success: true,
    data: subscriber
  });
});

/**
 * @desc    Create new subscriber
 * @route   POST /api/subscribers
 * @access  Public
 */
export const createSubscriber = asyncHandler(async (req, res) => {
  const { name, email, source = 'website' } = req.body;
  const app_id = req.params.app_id;

  // Check if subscriber already exists for this user
  const existingSubscriber = await Subscriber.findOne({ 
    email,
    user: app_id 
  });

  if (existingSubscriber) {
    // If unsubscribed, resubscribe them
    if (existingSubscriber.status === 'unsubscribed') {
      existingSubscriber.status = 'subscribed';
      existingSubscriber.subscribedAt = Date.now();
      existingSubscriber.unsubscribedAt = null;
      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        message: 'Resubscribed successfully',
        data: existingSubscriber
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Email already subscribed'
    });
  }

  // Create new subscriber
  const subscriber = await Subscriber.create({
    name,
    email,
    source,
    user: app_id,
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      referrer: req.get('referrer')
    }
  });

  // Generate unsubscribe token
  subscriber.generateUnsubscribeToken();
  await subscriber.save();

  // Send welcome email (optional)
  try {
    await sendWelcomeEmail(subscriber);
  } catch (error) {
    console.error('Welcome email failed:', error);
    // Don't fail the subscription if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Subscribed successfully',
    data: subscriber
  });
});

/**
 * @desc    Update subscriber
 * @route   PUT /api/subscribers/:id
 * @access  Private/Admin
 */
export const updateSubscriber = asyncHandler(async (req, res) => {
  const { name, email, status } = req.body;

  const subscriber = await Subscriber.findOne({
    _id: req.params.id,
    user: req.admin.id  // Ensure user can only update their own subscribers
  });

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      error: 'Subscriber not found'
    });
  }

  // Update fields
  if (name) subscriber.name = name;
  if (email) subscriber.email = email;
  
  if (status && status.toLowerCase() !== subscriber.status) {
    subscriber.status = status.toLowerCase();
    if (status === 'unsubscribed') {
      subscriber.unsubscribedAt = Date.now();
    } else if (status === 'subscribed') {
      subscriber.subscribedAt = Date.now();
      subscriber.unsubscribedAt = null;
    }
  }

  await subscriber.save();

  res.json({
    success: true,
    message: 'Subscriber updated successfully',
    data: subscriber
  });
});

/**
 * @desc    Delete subscriber
 * @route   DELETE /api/subscribers/:id
 * @access  Private/Admin
 */
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findOne({
    _id: req.params.id,
    user: req.admin.id  // Ensure user can only delete their own subscribers
  });

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      error: 'Subscriber not found'
    });
  }

  await subscriber.deleteOne();

  res.json({
    success: true,
    message: 'Subscriber deleted successfully'
  });
});

/**
 * @desc    Unsubscribe via token
 * @route   GET /api/subscribers/unsubscribe/:token
 * @access  Public
 */
export const unsubscribeByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

  if (!subscriber) {
    return res.status(404).json({
      success: false,
      error: 'Invalid unsubscribe link'
    });
  }

  if (subscriber.status === 'unsubscribed') {
    return res.json({
      success: true,
      message: 'Already unsubscribed'
    });
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = Date.now();
  await subscriber.save();

  res.json({
    success: true,
    message: 'Successfully unsubscribed from emails'
  });
});

/**
 * @desc    Bulk import subscribers
 * @route   POST /api/subscribers/bulk-import
 * @access  Private/Admin
 */
export const bulkImportSubscribers = asyncHandler(async (req, res) => {
  const { subscribers } = req.body; // Array of {name, email}

  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an array of subscribers'
    });
  }

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const sub of subscribers) {
    try {
      const existing = await Subscriber.findOne({ 
        email: sub.email,
        user: req.admin.id  // Check within user's subscribers only
      });

      if (existing) {
        if (existing.status === 'subscribed') {
          results.skipped.push({ email: sub.email, reason: 'Already subscribed' });
        } else {
          // Resubscribe
          existing.status = 'subscribed';
          existing.subscribedAt = Date.now();
          existing.unsubscribedAt = null;
          await existing.save();
          results.success.push(sub.email);
        }
      } else {
        const newSub = await Subscriber.create({
          name: sub.name,
          email: sub.email,
          source: 'import',
          user: req.admin.id
        });
        newSub.generateUnsubscribeToken();
        await newSub.save();
        results.success.push(sub.email);
      }
    } catch (error) {
      results.failed.push({ email: sub.email, error: error.message });
    }
  }

  res.json({
    success: true,
    message: 'Bulk import completed',
    data: results
  });
});

/**
 * @desc    Send broadcast email to all subscribers
 * @route   POST /api/subscribers/broadcast
 * @access  Private/Admin
 */
export const sendBroadcastEmail = asyncHandler(async (req, res) => {
  try {
    const { subject, htmlContent, textContent } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Subject and HTML content are required'
      });
    }

    // Get all active subscribers for this user
    const subscribers = await Subscriber.getActiveSubscribers(req.admin.id);

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active subscribers found'
      });
    }

    // Validate email configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured. Please contact administrator.'
      });
    }

    let transporter;
    try {
      transporter = createEmailTransporter();
      // Verify transporter configuration
      await transporter.verify();
    } catch (transporterError) {
      console.error('Email transporter error:', transporterError);
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize email service',
        message: transporterError.message
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 50;
    
    try {
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        
        console.log(`📧 Sending batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(subscribers.length / batchSize)} (${batch.length} emails)...`);

        await Promise.all(
          batch.map(async (subscriber) => {
            try {
              // Validate subscriber has required fields
              if (!subscriber.email || !subscriber.unsubscribeToken) {
                throw new Error('Invalid subscriber data');
              }

              // Create unsubscribe link
              const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;

              // Add unsubscribe link to email
              const emailHtml = `
                ${htmlContent}
                <br><br>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                  You're receiving this email because you subscribed to our newsletter.<br>
                  <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> from future emails.
                </p>
              `;

              await transporter.sendMail({
                from: `"BlogSpeed" <${process.env.SMTP_USER}>`,
                to: subscriber.email,
                subject,
                text: textContent || htmlContent.replace(/<[^>]*>/g, ''),
                html: emailHtml
              });

              results.sent++;
              console.log(`✅ Sent to: ${subscriber.email}`);
              
            } catch (emailError) {
              results.failed++;
              results.errors.push({
                email: subscriber.email,
                error: emailError.message
              });
              console.error(`❌ Failed to send to ${subscriber.email}:`, emailError.message);
            }
          })
        );

        // Add delay between batches (1 second)
        if (i + batchSize < subscribers.length) {
          console.log('⏳ Waiting 1 second before next batch...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Broadcast complete: ${results.sent} sent, ${results.failed} failed`);

      res.json({
        success: true,
        message: `Broadcast email sent to ${results.sent} subscribers`,
        data: results
      });

    } catch (batchError) {
      console.error('Batch processing error:', batchError);
      
      // Return partial results if some emails were sent
      if (results.sent > 0) {
        return res.status(207).json({ // 207 Multi-Status
          success: false,
          message: `Broadcast partially completed. ${results.sent} sent, ${results.failed} failed`,
          data: results,
          error: batchError.message
        });
      }
      
      throw batchError; // Re-throw if no emails were sent
    }

  } catch (error) {
    console.error('Broadcast email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send broadcast email',
      message: error.message
    });
  }
});

/**
 * Helper function to send welcome email
 */
async function sendWelcomeEmail(subscriber) {
  const transporter = createEmailTransporter();
  const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;

  await transporter.sendMail({
    from: `"BlogSpeed" <${process.env.SMTP_USER}>`,
    to: subscriber.email,
    subject: 'Welcome! You\'re now subscribed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${subscriber.name}!</h2>
        <p>Thank you for subscribing to our newsletter. We're excited to have you on board!</p>
        <p>You'll receive updates, news, and exclusive content directly in your inbox.</p>
        <br>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> from future emails.
        </p>
      </div>
    `
  });
}