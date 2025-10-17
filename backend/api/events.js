// backend/api/events.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const EVENTS_FILE = path.join(__dirname, "..", "data", "events.log");

router.post("/", (req, res) => {
  const event = req.body;
  // in prod, store to DB or LRS; for hackathon just append to a file for demo
  fs.appendFile(EVENTS_FILE, JSON.stringify(event) + "\n", (err) => {
    if(err) console.error("event save failed", err);
  });
  res.json({ ok: true });
});

module.exports = router;

