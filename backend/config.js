// backend/config.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  KT_SERVICE_URL: process.env.KT_SERVICE_URL || "http://kt-service:8001/predict_mastery",
  MASTERY_THRESHOLD: parseFloat(process.env.MASTERY_THRESHOLD || "0.75"),
  DB_FILE: process.env.DB_FILE || "./data/db.json",
  ENABLE_EMAIL: process.env.ENABLE_EMAIL === "true",
  SMTP_URL: process.env.SMTP_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
};

