// backend/routes/ipfs.js
// web3.storage IPFS routes
const express = require("express");
const router = express.Router();
const {
  uploadJSON,
  uploadFileFromPath,
  uploadBuffer,
  uploadCertificateMetadata,
} = require("../services/web3StorageService");
const pino = require("pino");
const logger = pino();

/**
 * POST /api/ipfs/metadata
 * Upload JSON metadata to IPFS
 * 
 * Body: { <any JSON object> }
 * Returns: { ok: true, ipfsUri: "ipfs://...", httpUrl: "https://...", cid: "..." }
 */
router.post("/metadata", async (req, res) => {
  try {
    const metadata = req.body;

    if (!metadata || Object.keys(metadata).length === 0) {
      return res.status(400).json({
        ok: false,
        error: "metadata object is required",
      });
    }

    const result = await uploadJSON(metadata, "metadata.json");

    logger.info(`Uploaded metadata to IPFS: ${result.ipfsUri}`);

    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    logger.error("IPFS metadata upload error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ipfs/certificate
 * Upload certificate metadata to IPFS (OpenSea-compatible format)
 * 
 * Body: {
 *   name: "Certificate Name",
 *   description: "...",
 *   image: "ipfs://... or https://...",
 *   attributes: [{trait_type: "...", value: "..."}],
 *   studentAddress?: "0x...",
 *   issuedAt?: "2024-01-01"
 * }
 * Returns: { ok: true, ipfsUri: "ipfs://...", httpUrl: "https://...", cid: "..." }
 */
router.post("/certificate", async (req, res) => {
  try {
    const { name, description, image, attributes, studentAddress, issuedAt } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({
        ok: false,
        error: "name, description, and image are required",
      });
    }

    const result = await uploadCertificateMetadata({
      name,
      description,
      image,
      attributes: attributes || [],
      studentAddress,
      issuedAt: issuedAt || new Date().toISOString(),
    });

    logger.info(`Uploaded certificate metadata to IPFS: ${result.ipfsUri}`);

    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    logger.error("IPFS certificate upload error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ipfs/file
 * Upload a file to IPFS (provide file path on server)
 * 
 * Body: { filePath: "/path/to/file" }
 * Returns: { ok: true, ipfsUri: "ipfs://...", httpUrl: "https://...", cid: "..." }
 * 
 * Note: For production, use multipart/form-data upload instead
 */
router.post("/file", async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        ok: false,
        error: "filePath is required",
      });
    }

    const result = await uploadFileFromPath(filePath);

    logger.info(`Uploaded file to IPFS: ${result.ipfsUri}`);

    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    logger.error("IPFS file upload error:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;

