// backend/index.js
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const pino = require("pino");
const logger = pino();
const { init, db } = require("./db");
const config = require("./config");

// routes
const pathsRoute = require("./routes/paths");
const eventsRoute = require("./routes/events");
const contactRoute = require("./routes/contact");
const statusRoute = require("./routes/status");

async function main() {
  await init();
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("tiny"));
  app.use((req, res, next) => { req.db = db; next(); });

  app.use("/api/paths", pathsRoute);
  app.use("/api/events", eventsRoute);
  app.use("/api/contact", contactRoute);
  app.use("/api/status", statusRoute);

  // health check root
  app.get("/", (req, res) => res.json({ ok: true, service: "learnpathai-backend", ts: new Date().toISOString() }));

  app.listen(config.PORT, () => {
    logger.info(`Backend listening on http://0.0.0.0:${config.PORT}`);
  });
}

main().catch((err) => {
  console.error("startup failure", err);
  process.exit(1);
});
