// backend/routes/status.js
const express = require("express");
const router = express.Router();
const { KT_SERVICE_URL } = require("../config");
const axios = require("axios");

router.get("/health", async (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

router.get("/ready", async (req, res) => {
  // check KT service up (non-blocking)
  try {
    const t = await axios.get(KT_SERVICE_URL.replace("/predict_mastery", "/health"), { timeout: 2000 }).catch(() => null);
    const ktUp = !!t?.data?.ok;
    res.json({ ok: true, ktUp });
  } catch (e) {
    res.json({ ok: true, ktUp: false });
  }
});

module.exports = router;

