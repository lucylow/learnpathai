// backend/services/ktClient.js
const axios = require("axios");
const pino = require("pino");
const logger = pino();
const { KT_SERVICE_URL } = require("../config");

/**
 * callKT - calls the knowledge tracing microservice.
 * - retries with exponential backoff for transient errors
 * - returns mastery object { concept: prob }
 */
async function callKT({ user_id = "anon", recent_attempts = [], prior_mastery = {} } = {}) {
  const maxAttempts = 3;
  let attempt = 0;
  let lastErr = null;
  while (attempt < maxAttempts) {
    try {
      const resp = await axios.post(KT_SERVICE_URL, {
        user_id,
        recent_attempts,
        prior_mastery,
      }, { timeout: 5000 });
      if (resp?.data?.mastery) return resp.data.mastery;
      return resp.data || {};
    } catch (err) {
      lastErr = err;
      attempt += 1;
      const backoff = Math.pow(2, attempt) * 200; // ms
      logger.warn({ msg: "kt call failed, retrying", attempt, err: err?.message });
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  logger.error({ msg: "kt service unreachable", err: lastErr?.message });
  // fallback: return priors or empty (cold start)
  return prior_mastery || {};
}

module.exports = { callKT };

