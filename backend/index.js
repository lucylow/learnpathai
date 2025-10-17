// backend/index.js
const express = require("express");
const http = require("http");
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
const roomsRoute = require("./routes/rooms");
const rankingRoute = require("./routes/ranking");
const assessmentsRoute = require("./routes/assessments");

// Socket.IO collaboration server
const CollaborationServer = require("./sockets/collaboration");

async function main() {
  await init();
  const app = express();
  
  // Create HTTP server for Socket.IO
  const httpServer = http.createServer(app);
  
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("tiny"));
  app.use((req, res, next) => { req.db = db; next(); });

  app.use("/api/paths", pathsRoute);
  app.use("/api/events", eventsRoute);
  app.use("/api/contact", contactRoute);
  app.use("/api/status", statusRoute);
  app.use("/api/rooms", roomsRoute);
  app.use("/api/ranking", rankingRoute);
  app.use("/api/assessments", assessmentsRoute);

  // health check root
  app.get("/", (req, res) => res.json({ 
    ok: true, 
    service: "learnpathai-backend", 
    features: [
      "knowledge-tracing", 
      "adaptive-paths", 
      "collaborative-learning",
      "outcome-aware-ranking",
      "ai-generated-assessments",
      "explainable-recommendations"
    ],
    ts: new Date().toISOString() 
  }));

  // Initialize Socket.IO collaboration server
  const collaborationServer = new CollaborationServer(httpServer);
  app.locals.collaborationServer = collaborationServer;

  httpServer.listen(config.PORT, () => {
    logger.info(`🚀 Backend listening on http://0.0.0.0:${config.PORT}`);
    logger.info(`✅ Collaborative learning features enabled`);
    logger.info(`🔌 Socket.IO ready for real-time collaboration`);
  });
}

main().catch((err) => {
  console.error("startup failure", err);
  process.exit(1);
});
