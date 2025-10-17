// backend/api/paths.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const KT_SERVICE = process.env.KT_SERVICE_URL || "http://localhost:8001/predict_mastery";
const MASTERY_THRESHOLD = parseFloat(process.env.MASTERY_THRESHOLD || "0.75");

// simple knowledge graph file (JSON) path
const KG_PATH = path.join(__dirname, "..", "data", "knowledge_graph.json");
let knowledgeGraph = null;
function loadKG(){
  if(!knowledgeGraph){
    knowledgeGraph = JSON.parse(fs.readFileSync(KG_PATH, "utf8"));
  }
  return knowledgeGraph;
}

// helper: topological-like traversal to produce ordered prerequisites
function buildPathFromKG(targets, mastery){
  const kg = loadKG(); // {concept: {prereqs: []}}
  const visited = new Set();
  const path = [];
  function dfs(concept){
    if(visited.has(concept)) return;
    const node = kg[concept];
    if(node && node.prereqs){
      for(const pre of node.prereqs){
        dfs(pre);
      }
    }
    // include concept if mastery below threshold
    const m = mastery[concept] ?? 0.0;
    if(m < MASTERY_THRESHOLD){
      path.push({ concept, mastery: m, recommended: true, resourceIds: node?.resources ?? [] });
    }
    visited.add(concept);
  }
  for(const t of targets){
    dfs(t);
  }
  // dedupe while preserving order
  const dedup = [];
  const seen = new Set();
  for(const p of path){
    if(!seen.has(p.concept)){
      dedup.push(p);
      seen.add(p.concept);
    }
  }
  return dedup;
}

router.post("/generate", async (req, res) => {
  try {
    const { userId, targets = [] } = req.body;
    // For demo: pull recent attempts for user from DB; here we accept optional attempts in body
    const recentAttempts = req.body.recentAttempts || []; // {concept, correct}
    const priorMastery = req.body.priorMastery || {}; // optional prior map

    // call KT service
    const resp = await axios.post(KT_SERVICE, {
      user_id: userId || "anon",
      recent_attempts: recentAttempts,
      prior_mastery: priorMastery
    }, { timeout: 5000 });

    const mastery = resp.data.mastery || {};
    // if no targets provided, default to top-level topic from KG
    const kg = loadKG();
    const targetsToUse = (targets.length > 0) ? targets : Object.keys(kg).slice(0,1);

    const path = buildPathFromKG(targetsToUse, mastery);

    return res.json({
      userId,
      path,
      mastery,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("generate path error", err?.message || err);
    return res.status(500).json({ error: "Path generation failed", detail: err?.toString() });
  }
});

module.exports = router;

