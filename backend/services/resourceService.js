// backend/services/resourceService.js
const { readFileSync } = require("fs");
const { join } = require("path");

const KG_FILE = join(__dirname, "..", "data", "knowledge_graph.json");
const RES_FILE = join(__dirname, "..", "data", "resources.json");

function loadKG() {
  return JSON.parse(readFileSync(KG_FILE, "utf8"));
}

function loadResources() {
  return JSON.parse(readFileSync(RES_FILE, "utf8"));
}

/**
 * Given targets and mastery map, return ordered remediation path.
 * Uses DFS respecting prerequisites; only returns concepts below threshold.
 */
function buildPath(targets = [], mastery = {}, threshold = 0.75) {
  const kg = loadKG();
  const visited = new Set();
  const path = [];

  function dfs(c) {
    if (!kg[c]) return;
    if (visited.has(c)) return;
    for (const pre of kg[c].prereqs || []) dfs(pre);
    const m = mastery[c] ?? 0;
    if (m < threshold) {
      path.push({
        concept: c,
        mastery: m,
        resources: kg[c].resources || [],
      });
    }
    visited.add(c);
  }

  const t = targets.length ? targets : Object.keys(kg).slice(0, 1);
  for (const tar of t) dfs(tar);
  // dedupe (preserve order)
  const seen = new Set();
  return path.filter((p) => {
    if (seen.has(p.concept)) return false;
    seen.add(p.concept);
    return true;
  });
}

module.exports = { loadKG, loadResources, buildPath };

