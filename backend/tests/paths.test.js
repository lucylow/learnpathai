// backend/tests/paths.test.js
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const pathsRoute = require("../routes/paths");
const { init, db } = require("../db");

let app;
beforeAll(async () => {
  await init();
  app = express();
  app.use(bodyParser.json());
  app.use("/api/paths", pathsRoute);
});

test("POST /api/paths/generate returns path", async () => {
  const resp = await request(app)
    .post("/api/paths/generate")
    .send({
      userId: "test_user",
      recentAttempts: [{ concept: "variables", correct: true }, { concept: "loops", correct: false }],
      targets: ["project"]
    })
    .expect(200);
  expect(resp.body).toHaveProperty("path");
  expect(Array.isArray(resp.body.path)).toBe(true);
});
