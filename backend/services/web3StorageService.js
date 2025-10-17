// backend/services/web3StorageService.js
const { Web3Storage, File, Blob } = require("web3.storage");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const logger = pino();

/**
 * Get Web3Storage client instance
 */
function getClient() {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error("WEB3_STORAGE_TOKEN not configured");
  }
  return new Web3Storage({ token });
}

/**
 * uploadJSON - Upload JSON metadata to IPFS via web3.storage
 * Returns ipfs:// URI
 * 
 * @param {Object} obj - JSON object to upload
 * @param {string} filename - Filename for the JSON (default: metadata.json)
 * @returns {Promise<string>} - IPFS URI (ipfs://<cid>/<filename>)
 */
async function uploadJSON(obj, filename = "metadata.json") {
  try {
    const client = getClient();
    
    logger.info(`Uploading JSON to IPFS: ${filename}`);
    
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const file = new File([blob], filename);
    
    const cid = await client.put([file], {
      wrapWithDirectory: true,
    });
    
    const ipfsUri = `ipfs://${cid}/${filename}`;
    const httpUrl = `https://${cid}.ipfs.w3s.link/${filename}`;
    
    logger.info(`JSON uploaded to IPFS: ${ipfsUri}`);
    
    return {
      ipfsUri,
      httpUrl,
      cid,
    };
  } catch (error) {
    logger.error("web3.storage uploadJSON error:", error);
    throw new Error(`IPFS upload error: ${error.message}`);
  }
}

/**
 * uploadFileFromPath - Upload a file from local filesystem to IPFS
 * 
 * @param {string} filePath - Path to local file
 * @returns {Promise<{ipfsUri: string, httpUrl: string, cid: string}>}
 */
async function uploadFileFromPath(filePath) {
  try {
    const client = getClient();
    
    logger.info(`Uploading file to IPFS: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = await fs.promises.readFile(filePath);
    const filename = path.basename(filePath);
    const file = new File([content], filename);
    
    const cid = await client.put([file], {
      wrapWithDirectory: true,
    });
    
    const ipfsUri = `ipfs://${cid}/${filename}`;
    const httpUrl = `https://${cid}.ipfs.w3s.link/${filename}`;
    
    logger.info(`File uploaded to IPFS: ${ipfsUri}`);
    
    return {
      ipfsUri,
      httpUrl,
      cid,
    };
  } catch (error) {
    logger.error("web3.storage uploadFileFromPath error:", error);
    throw new Error(`IPFS upload error: ${error.message}`);
  }
}

/**
 * uploadBuffer - Upload a buffer (e.g., generated image or audio) to IPFS
 * 
 * @param {Buffer} buffer - Buffer to upload
 * @param {string} filename - Filename
 * @param {string} contentType - MIME type (e.g., 'image/png')
 * @returns {Promise<{ipfsUri: string, httpUrl: string, cid: string}>}
 */
async function uploadBuffer(buffer, filename, contentType = "application/octet-stream") {
  try {
    const client = getClient();
    
    logger.info(`Uploading buffer to IPFS: ${filename}`);
    
    const blob = new Blob([buffer], { type: contentType });
    const file = new File([blob], filename);
    
    const cid = await client.put([file], {
      wrapWithDirectory: true,
    });
    
    const ipfsUri = `ipfs://${cid}/${filename}`;
    const httpUrl = `https://${cid}.ipfs.w3s.link/${filename}`;
    
    logger.info(`Buffer uploaded to IPFS: ${ipfsUri}`);
    
    return {
      ipfsUri,
      httpUrl,
      cid,
    };
  } catch (error) {
    logger.error("web3.storage uploadBuffer error:", error);
    throw new Error(`IPFS upload error: ${error.message}`);
  }
}

/**
 * uploadCertificateMetadata - Upload certificate/badge metadata to IPFS
 * Follows OpenSea metadata standard
 * 
 * @param {Object} params
 * @param {string} params.name - Certificate name
 * @param {string} params.description - Description
 * @param {string} params.image - IPFS URI or HTTP URL to image
 * @param {Array} params.attributes - Array of {trait_type, value} objects
 * @returns {Promise<{ipfsUri: string, httpUrl: string, cid: string}>}
 */
async function uploadCertificateMetadata({
  name,
  description,
  image,
  attributes = [],
  studentAddress = null,
  issuedAt = null,
}) {
  const metadata = {
    name,
    description,
    image,
    attributes: [
      ...attributes,
      ...(studentAddress ? [{ trait_type: "Student", value: studentAddress }] : []),
      ...(issuedAt ? [{ trait_type: "Issued At", value: issuedAt }] : []),
    ],
    external_url: "https://learnpath.ai",
  };
  
  return uploadJSON(metadata, "certificate.json");
}

module.exports = {
  uploadJSON,
  uploadFileFromPath,
  uploadBuffer,
  uploadCertificateMetadata,
};

