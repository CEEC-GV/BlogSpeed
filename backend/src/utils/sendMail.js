import nodemailer from "nodemailer";

// Validate SMTP configuration
const validateSMTPConfig = () => {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing SMTP configuration: ${missing.join(', ')}`);
  }
};

// Create transporter with validation
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    validateSMTPConfig();
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== 'false', // Default to true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Add connection timeout
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }
  
  return transporter;
};

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email content
 * @param {string} [options.text] - Plain text email content (optional)
 * @returns {Promise<Object>} - Nodemailer send result
 */
export const sendMail = async ({ to, subject, html, text }) => {
  // Validate inputs
  if (!to || !subject || !html) {
    throw new Error('Missing required email fields: to, subject, or html');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error(`Invalid email address: ${to}`);
  }

  try {
    const mailTransporter = getTransporter();
    
    const mailOptions = {
      from: `"BlogSpeed" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      ...(text && { text }) // Include text if provided
    };

    const result = await mailTransporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    // Enhanced error logging
    console.error(`[SENDMAIL] Failed to send email to ${to}:`, {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};
