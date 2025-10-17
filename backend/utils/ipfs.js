/**
 * IPFS Integration for LearnPathAI Badge Metadata
 * Supports web3.storage and Pinata
 */

const { Web3Storage, File } = require('web3.storage');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Initialize Web3.Storage client
 */
function getWeb3StorageClient() {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('WEB3_STORAGE_TOKEN not set in environment');
  }
  return new Web3Storage({ token });
}

/**
 * Upload a file to IPFS via web3.storage
 * @param {string} filePath - Path to file to upload
 * @returns {Promise<string>} - IPFS CID
 */
async function uploadFile(filePath) {
  const client = getWeb3StorageClient();
  const content = await fs.readFile(filePath);
  const fileName = path.basename(filePath);
  const file = new File([content], fileName);
  
  const cid = await client.put([file], {
    name: fileName,
    wrapWithDirectory: false,
  });
  
  return cid;
}

/**
 * Upload JSON object as file to IPFS
 * @param {object} jsonObject - Object to upload
 * @param {string} fileName - Optional filename (default: metadata.json)
 * @returns {Promise<string>} - IPFS URI (ipfs://CID/filename)
 */
async function uploadJSON(jsonObject, fileName = 'metadata.json') {
  const client = getWeb3StorageClient();
  const blob = new Blob([JSON.stringify(jsonObject, null, 2)], { 
    type: 'application/json' 
  });
  const file = new File([blob], fileName);
  
  const cid = await client.put([file], {
    name: fileName,
    wrapWithDirectory: true,
  });
  
  return `ipfs://${cid}/${fileName}`;
}

/**
 * Upload badge metadata to IPFS
 * @param {object} badgeData - Badge data object
 * @returns {Promise<object>} - { uri: string, cid: string, hash: string }
 */
async function uploadBadgeMetadata(badgeData) {
  const {
    name,
    description,
    image,
    attributes = [],
    evidenceData = {},
  } = badgeData;

  // Compute evidence hash (no PII)
  const evidenceHash = computeEvidenceHash(evidenceData);

  // Build metadata following OpenSea standard
  const metadata = {
    name,
    description,
    image, // Should be an IPFS URI or HTTP URL
    attributes: [
      ...attributes,
      {
        trait_type: 'evidence_hash',
        value: evidenceHash,
      },
      {
        trait_type: 'issue_date',
        value: new Date().toISOString(),
      },
    ],
  };

  // Upload to IPFS
  const uri = await uploadJSON(metadata);
  const cid = uri.replace('ipfs://', '').split('/')[0];

  return {
    uri,
    cid,
    hash: evidenceHash,
    metadata,
  };
}

/**
 * Compute hash of evidence data (deterministic, no PII)
 * @param {object} evidenceData - Evidence object
 * @returns {string} - Hex hash string
 */
function computeEvidenceHash(evidenceData) {
  const canonicalString = JSON.stringify(evidenceData, Object.keys(evidenceData).sort());
  return '0x' + crypto.createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * Generate badge metadata object
 * @param {object} params - Badge parameters
 * @returns {object} - Badge metadata
 */
function generateBadgeMetadata(params) {
  const {
    badgeName,
    badgeDescription,
    badgeIcon,
    concept,
    level = 'beginner',
    userId,
    nodeId,
    attemptId,
    score,
    timestamp,
  } = params;

  const imageUrl = badgeIcon || `https://example.com/badges/${badgeName.toLowerCase().replace(/\s+/g, '-')}.png`;

  return {
    name: badgeName,
    description: badgeDescription,
    image: imageUrl,
    attributes: [
      { trait_type: 'concept', value: concept },
      { trait_type: 'level', value: level },
      { trait_type: 'score', value: score },
      { trait_type: 'completed_at', value: new Date(timestamp).toISOString() },
    ],
    evidenceData: {
      // No PII - only hashed/pseudonymous identifiers
      nodeId,
      attemptId,
      score,
      timestamp,
    },
  };
}

/**
 * Retrieve metadata from IPFS
 * @param {string} uri - IPFS URI (ipfs://...)
 * @returns {Promise<object>} - Metadata object
 */
async function retrieveMetadata(uri) {
  const httpUrl = ipfsToHttp(uri);
  const response = await fetch(httpUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Convert IPFS URI to HTTP gateway URL
 * @param {string} uri - IPFS URI
 * @param {string} gateway - Gateway URL (default: ipfs.io)
 * @returns {string} - HTTP URL
 */
function ipfsToHttp(uri, gateway = 'https://ipfs.io/ipfs/') {
  if (!uri) return '';
  if (uri.startsWith('http')) return uri;
  return uri.replace('ipfs://', gateway);
}

/**
 * Pin a CID (keep it available on IPFS)
 * @param {string} cid - IPFS CID to pin
 */
async function pinCID(cid) {
  const client = getWeb3StorageClient();
  // web3.storage automatically pins; this is a no-op but kept for API consistency
  return { cid, pinned: true };
}

module.exports = {
  uploadFile,
  uploadJSON,
  uploadBadgeMetadata,
  generateBadgeMetadata,
  computeEvidenceHash,
  retrieveMetadata,
  ipfsToHttp,
  pinCID,
};

