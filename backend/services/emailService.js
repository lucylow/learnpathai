// backend/services/emailService.js
const sgMail = require("@sendgrid/mail");
const pino = require("pino");
const logger = pino();

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * sendEmail - Send a transactional email via SendGrid
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.text - Plain text content
 * @param {string} params.html - HTML content
 * @param {Array} params.attachments - Optional attachments
 * @returns {Promise<boolean>}
 */
async function sendEmail({ to, subject, text = "", html = "", attachments = [] }) {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    const from = process.env.EMAIL_SENDER || "no-reply@learnpath.ai";
    
    const msg = {
      to,
      from,
      subject,
      text,
      html,
      attachments,
    };

    logger.info(`Sending email to ${to}: ${subject}`);
    await sgMail.send(msg);
    logger.info(`Email sent successfully to ${to}`);
    
    return true;
  } catch (error) {
    logger.error("SendGrid error:", error.response?.body || error.message);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * sendCertificateEmail - Send certificate to student
 * 
 * @param {Object} params
 * @param {string} params.toEmail - Student email
 * @param {string} params.studentName - Student name
 * @param {string} params.certificateName - Certificate/badge name
 * @param {string} params.certificateUrl - URL to view/download certificate
 * @param {string} params.ipfsUri - Optional IPFS URI
 * @param {Array} params.attachments - Optional PDF attachments
 * @returns {Promise<boolean>}
 */
async function sendCertificateEmail({
  toEmail,
  studentName,
  certificateName,
  certificateUrl,
  ipfsUri = null,
  attachments = [],
}) {
  const subject = `🎉 Your ${certificateName} Certificate is Ready!`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Congratulations, ${studentName}!</h1>
    </div>
    <div class="content">
      <p>You've successfully completed <strong>${certificateName}</strong> on LearnPath AI!</p>
      
      <p>Your achievement has been recorded and your certificate is ready to view and share.</p>
      
      <p style="text-align: center;">
        <a href="${certificateUrl}" class="button">View Your Certificate</a>
      </p>
      
      ${ipfsUri ? `
      <p style="background: #e8f4f8; padding: 15px; border-radius: 5px; font-size: 14px;">
        <strong>🔗 Blockchain Verified:</strong><br>
        Your certificate is stored on IPFS for permanent, tamper-proof verification:<br>
        <code style="word-break: break-all;">${ipfsUri}</code>
      </p>
      ` : ''}
      
      <p>Share your achievement on:</p>
      <ul>
        <li>LinkedIn</li>
        <li>Twitter</li>
        <li>Your portfolio</li>
      </ul>
      
      <p>Keep learning and growing with LearnPath AI!</p>
    </div>
    <div class="footer">
      <p>LearnPath AI - Personalized Learning Paths Powered by AI</p>
      <p><a href="https://learnpath.ai">learnpath.ai</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Congratulations, ${studentName}!

You've successfully completed ${certificateName} on LearnPath AI!

View your certificate: ${certificateUrl}
${ipfsUri ? `\nBlockchain verified: ${ipfsUri}` : ''}

Keep learning!
LearnPath AI Team
  `.trim();

  return sendEmail({
    to: toEmail,
    subject,
    text,
    html,
    attachments,
  });
}

/**
 * sendWeeklySummary - Send weekly progress summary to student
 * 
 * @param {Object} params
 * @param {string} params.toEmail - Student email
 * @param {string} params.studentName - Student name
 * @param {Object} params.stats - Weekly stats {hoursLearned, completedResources, streak, nextGoals}
 * @returns {Promise<boolean>}
 */
async function sendWeeklySummary({ toEmail, studentName, stats }) {
  const subject = `📊 Your Weekly Learning Summary`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .stat-box { background: #f0f0f0; padding: 20px; margin: 10px 0; border-radius: 5px; text-align: center; }
    .stat-number { font-size: 36px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hi ${studentName}! 👋</h2>
    <p>Here's your learning summary for the past week:</p>
    
    <div class="stat-box">
      <div class="stat-number">${stats.hoursLearned || 0}h</div>
      <div class="stat-label">Hours Learned</div>
    </div>
    
    <div class="stat-box">
      <div class="stat-number">${stats.completedResources || 0}</div>
      <div class="stat-label">Resources Completed</div>
    </div>
    
    <div class="stat-box">
      <div class="stat-number">${stats.streak || 0} 🔥</div>
      <div class="stat-label">Day Streak</div>
    </div>
    
    <h3>Next Goals:</h3>
    <ul>
      ${(stats.nextGoals || []).map(goal => `<li>${goal}</li>`).join('')}
    </ul>
    
    <p>Keep up the great work! 🚀</p>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
}

/**
 * sendTeacherNotification - Notify teacher about student progress
 * 
 * @param {Object} params
 * @param {string} params.toEmail - Teacher email
 * @param {string} params.studentName - Student name
 * @param {string} params.notification - Notification message
 * @returns {Promise<boolean>}
 */
async function sendTeacherNotification({ toEmail, studentName, notification }) {
  const subject = `📢 Student Update: ${studentName}`;
  
  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <h3>Student Update</h3>
  <p><strong>Student:</strong> ${studentName}</p>
  <p>${notification}</p>
  <p><a href="https://learnpath.ai/dashboard">View Dashboard</a></p>
</body>
</html>
  `.trim();

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
}

module.exports = {
  sendEmail,
  sendCertificateEmail,
  sendWeeklySummary,
  sendTeacherNotification,
};

