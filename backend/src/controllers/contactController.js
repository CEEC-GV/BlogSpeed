import nodemailer from 'nodemailer';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create email transporter with provided SMTP credentials
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || true, // 465 requires secure
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * @desc    Send Start Free Trial request email
 * @route   POST /api/contact/start-trial
 * @access  Public
 */
export const startTrial = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  try {
    const transporter = createEmailTransporter();

    // Format email body
    const emailBody = `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Message: ${message}
    `.trim();

    // Send email
    await transporter.sendMail({
      from: `"BlogSpeeds" <${process.env.SMTP_USER}>`,
      to: 'kaush2306@gmail.com',
      subject: 'New Start Free Trial Request',
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            New Start Free Trial Request
          </h2>
          <div style="margin-top: 20px; line-height: 1.6;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
});

