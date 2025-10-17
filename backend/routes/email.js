// backend/routes/email.js
// SendGrid email routes
const express = require("express");
const router = express.Router();
const {
  sendEmail,
  sendCertificateEmail,
  sendWeeklySummary,
  sendTeacherNotification,
} = require("../services/emailService");
const pino = require("pino");
const logger = pino();

/**
 * POST /api/email/send
 * Send a generic email
 * 
 * Body: { to: "...", subject: "...", html: "...", text?: "..." }
 * Returns: { ok: true }
 */
router.post("/send", async (req, res) => {
  try {
    const { to, subject, html, text, attachments } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        ok: false,
        error: "to, subject, and html are required",
      });
    }

    await sendEmail({ to, subject, html, text, attachments });

    logger.info(`Email sent to ${to}: ${subject}`);

    res.json({
      ok: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    logger.error("Email send error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/email/certificate
 * Send certificate email to student
 * 
 * Body: {
 *   toEmail: "...",
 *   studentName: "...",
 *   certificateName: "...",
 *   certificateUrl: "...",
 *   ipfsUri?: "ipfs://..."
 * }
 * Returns: { ok: true }
 */
router.post("/certificate", async (req, res) => {
  try {
    const { toEmail, studentName, certificateName, certificateUrl, ipfsUri } = req.body;

    if (!toEmail || !studentName || !certificateName || !certificateUrl) {
      return res.status(400).json({
        ok: false,
        error: "toEmail, studentName, certificateName, and certificateUrl are required",
      });
    }

    await sendCertificateEmail({
      toEmail,
      studentName,
      certificateName,
      certificateUrl,
      ipfsUri,
    });

    logger.info(`Certificate email sent to ${toEmail} for ${certificateName}`);

    res.json({
      ok: true,
      message: "Certificate email sent successfully",
    });
  } catch (error) {
    logger.error("Certificate email error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/email/weekly-summary
 * Send weekly progress summary to student
 * 
 * Body: {
 *   toEmail: "...",
 *   studentName: "...",
 *   stats: { hoursLearned, completedResources, streak, nextGoals: [...] }
 * }
 * Returns: { ok: true }
 */
router.post("/weekly-summary", async (req, res) => {
  try {
    const { toEmail, studentName, stats } = req.body;

    if (!toEmail || !studentName || !stats) {
      return res.status(400).json({
        ok: false,
        error: "toEmail, studentName, and stats are required",
      });
    }

    await sendWeeklySummary({ toEmail, studentName, stats });

    logger.info(`Weekly summary sent to ${toEmail}`);

    res.json({
      ok: true,
      message: "Weekly summary sent successfully",
    });
  } catch (error) {
    logger.error("Weekly summary error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/email/teacher-notification
 * Send notification to teacher about student progress
 * 
 * Body: {
 *   toEmail: "teacher@example.com",
 *   studentName: "...",
 *   notification: "..."
 * }
 * Returns: { ok: true }
 */
router.post("/teacher-notification", async (req, res) => {
  try {
    const { toEmail, studentName, notification } = req.body;

    if (!toEmail || !studentName || !notification) {
      return res.status(400).json({
        ok: false,
        error: "toEmail, studentName, and notification are required",
      });
    }

    await sendTeacherNotification({ toEmail, studentName, notification });

    logger.info(`Teacher notification sent to ${toEmail}`);

    res.json({
      ok: true,
      message: "Teacher notification sent successfully",
    });
  } catch (error) {
    logger.error("Teacher notification error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;

