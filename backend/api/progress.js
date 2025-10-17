// backend/api/progress.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const PROGRESS_FILE = path.join(__dirname, "..", "data", "progress.log");

router.post("/", (req, res) => {
  const progress = req.body;
  // in prod, store to DB; for hackathon just append to a file for demo
  fs.appendFile(PROGRESS_FILE, JSON.stringify(progress) + "\n", (err) => {
    if(err) console.error("progress save failed", err);
  });
  res.json({ ok: true });
});

module.exports = router;

