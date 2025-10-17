// backend/routes/contact.js
const express = require("express");
const router = express.Router();
const { db } = require("../db");
const Joi = require("joi");
const { validateBody } = require("../middleware/validate");
const nodemailer = require("nodemailer");
const { ENABLE_EMAIL, SMTP_URL } = require("../config");

const schema = Joi.object({
  email: Joi.string().email().required(),
  message: Joi.string().max(2000).required(),
  name: Joi.string().max(100).allow("", null),
});

router.post("/", validateBody(schema), async (req, res) => {
  const payload = req.validatedBody;
  const saved = { ...payload, receivedAt: new Date().toISOString() };
  db.get('contacts').push(saved).write();

  if (ENABLE_EMAIL && SMTP_URL) {
    try {
      const transporter = nodemailer.createTransport(SMTP_URL);
      await transporter.sendMail({
        from: "no-reply@learnpath.ai",
        to: payload.email,
        subject: "Thanks for contacting LearnPath AI",
        text: "Thanks — we received your message. We will respond shortly.",
      });
    } catch (e) {
      console.warn("email send failed", e?.message);
    }
  }

  res.json({ ok: true });
});

module.exports = router;

