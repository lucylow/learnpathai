// backend/routes/events.js
const express = require("express");
const router = express.Router();
const { db } = require("../db");
const Joi = require("joi");
const { validateBody } = require("../middleware/validate");

// very permissive xAPI-like schema
const evtSchema = Joi.object({
  actor: Joi.object().required(),
  verb: Joi.object().required(),
  object: Joi.object().required(),
  result: Joi.object().optional(),
  timestamp: Joi.string().isoDate().optional(),
});

router.post("/", validateBody(evtSchema), async (req, res) => {
  const event = req.validatedBody;
  // add server-side metadata
  const entry = { ...event, receivedAt: new Date().toISOString() };
  db.get('events').push(entry).write();
  res.json({ ok: true });
});

module.exports = router;

