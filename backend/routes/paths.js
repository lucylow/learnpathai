// backend/routes/paths.js
const express = require("express");
const router = express.Router();
const { callKT } = require("../services/ktClient");
const { buildPath } = require("../services/resourceService");
const { db } = require("../db");
const Joi = require("joi");
const { validateBody } = require("../middleware/validate");
const { MASTERY_THRESHOLD } = require("../config");

// schema
const schema = Joi.object({
  userId: Joi.string().allow("").default("anon"),
  targets: Joi.array().items(Joi.string()).default([]),
  recentAttempts: Joi.array().items(Joi.object({ concept: Joi.string().required(), correct: Joi.boolean().required() })).default([]),
  priorMastery: Joi.object().pattern(Joi.string(), Joi.number().min(0).max(1)).default({}),
});

router.post("/generate", validateBody(schema), async (req, res) => {
  const { userId, targets, recentAttempts, priorMastery } = req.validatedBody;
  try {
    // call KT microservice
    const mastery = await callKT({ user_id: userId, recent_attempts: recentAttempts, prior_mastery: priorMastery });

    // build path using KG
    const path = buildPath(targets, mastery, MASTERY_THRESHOLD);

    // cache the result in lowdb for audit/demos
    db.get('kt_cache').push({ userId, createdAt: new Date().toISOString(), mastery, path, recentAttempts }).write();

    res.json({ userId, path, mastery, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("path generate error", err);
    res.status(500).json({ error: "Failed to generate path", detail: err.message || String(err) });
  }
});

module.exports = router;

