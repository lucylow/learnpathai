/**
 * Badge NFT API Routes
 * Endpoints for minting, verifying, and managing badges
 */

const express = require('express');
const router = express.Router();
const { 
  uploadBadgeMetadata, 
  generateBadgeMetadata,
  computeEvidenceHash,
  retrieveMetadata,
} = require('../utils/ipfs');
const {
  mintBadge,
  batchMintBadges,
  verifyBadgeProof,
  getBadgeInfo,
  getBadgesForOwner,
  revokeBadge,
  getContractStats,
  estimateMintGas,
} = require('../utils/blockchain');

/**
 * POST /api/badges/mint
 * Mint a new badge NFT
 * 
 * Body:
 * {
 *   recipient: "0x...",
 *   badgeName: "First Pass",
 *   badgeDescription: "Awarded for completing first node",
 *   concept: "loops",
 *   level: "beginner",
 *   userId: "u1",
 *   nodeId: "n1",
 *   attemptId: "a1",
 *   score: 100,
 *   timestamp: "2025-10-17T10:00:00Z"
 * }
 */
router.post('/mint', async (req, res) => {
  try {
    const {
      recipient,
      badgeName,
      badgeDescription,
      badgeIcon,
      concept,
      level,
      userId,
      nodeId,
      attemptId,
      score,
      timestamp,
    } = req.body;

    // Validate required fields
    if (!recipient || !badgeName || !badgeDescription || !concept) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipient, badgeName, badgeDescription, concept',
      });
    }

    // Generate badge metadata
    const badgeMetadata = generateBadgeMetadata({
      badgeName,
      badgeDescription,
      badgeIcon,
      concept,
      level: level || 'beginner',
      userId,
      nodeId,
      attemptId,
      score,
      timestamp: timestamp || new Date().toISOString(),
    });

    // Upload metadata to IPFS
    console.log('Uploading badge metadata to IPFS...');
    const { uri, cid, hash, metadata } = await uploadBadgeMetadata(badgeMetadata);
    console.log('Metadata uploaded:', { uri, cid, hash });

    // Mint badge on blockchain
    console.log('Minting badge on blockchain...');
    const mintResult = await mintBadge(
      recipient,
      uri,
      hash,
      badgeName
    );

    res.json({
      success: true,
      badge: {
        tokenId: mintResult.tokenId,
        recipient,
        badgeName,
        concept,
        metadata: {
          uri,
          cid,
          proofHash: hash,
        },
        blockchain: {
          transactionHash: mintResult.transactionHash,
          blockNumber: mintResult.blockNumber,
          gasUsed: mintResult.gasUsed,
        },
      },
    });
  } catch (error) {
    console.error('Error minting badge:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/badges/batch-mint
 * Mint multiple badges in one transaction
 * 
 * Body:
 * {
 *   badges: [
 *     { recipient, badgeName, badgeDescription, ... },
 *     ...
 *   ]
 * }
 */
router.post('/batch-mint', async (req, res) => {
  try {
    const { badges } = req.body;

    if (!badges || !Array.isArray(badges) || badges.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'badges array is required',
      });
    }

    // Process each badge: generate metadata and upload to IPFS
    const processedBadges = await Promise.all(
      badges.map(async (badge) => {
        const badgeMetadata = generateBadgeMetadata(badge);
        const { uri, hash } = await uploadBadgeMetadata(badgeMetadata);
        
        return {
          recipient: badge.recipient,
          tokenURI: uri,
          proofHash: hash,
          badgeType: badge.badgeName,
        };
      })
    );

    // Batch mint on blockchain
    const mintResult = await batchMintBadges(processedBadges);

    res.json({
      success: true,
      count: badges.length,
      blockchain: {
        transactionHash: mintResult.transactionHash,
        blockNumber: mintResult.blockNumber,
        gasUsed: mintResult.gasUsed,
      },
    });
  } catch (error) {
    console.error('Error batch minting badges:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/badges/:tokenId
 * Get badge information
 */
router.get('/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    const badgeInfo = await getBadgeInfo(tokenId);
    
    // Optionally fetch metadata from IPFS
    let metadata = null;
    try {
      metadata = await retrieveMetadata(badgeInfo.tokenURI);
    } catch (err) {
      console.warn('Could not fetch metadata from IPFS:', err.message);
    }

    res.json({
      success: true,
      badge: {
        tokenId,
        ...badgeInfo,
        metadata,
      },
    });
  } catch (error) {
    console.error('Error fetching badge info:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/badges/owner/:address
 * Get all badges owned by an address
 */
router.get('/owner/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const tokenIds = await getBadgesForOwner(address);

    // Optionally fetch full info for each badge
    const badges = await Promise.all(
      tokenIds.map(async (tokenId) => {
        try {
          const info = await getBadgeInfo(tokenId);
          return {
            tokenId,
            ...info,
          };
        } catch (err) {
          return { tokenId, error: err.message };
        }
      })
    );

    res.json({
      success: true,
      owner: address,
      count: tokenIds.length,
      badges,
    });
  } catch (error) {
    console.error('Error fetching owner badges:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/badges/verify
 * Verify a badge's proof
 * 
 * Body:
 * {
 *   tokenId: "1",
 *   proofHash: "0x...",
 *   metadata: { ... } (optional - for off-chain verification)
 * }
 */
router.post('/verify', async (req, res) => {
  try {
    const { tokenId, proofHash, metadata } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: 'tokenId is required',
      });
    }

    // On-chain verification
    let onChainValid = false;
    if (proofHash) {
      onChainValid = await verifyBadgeProof(tokenId, proofHash);
    }

    // Off-chain verification (compare computed hash with provided metadata)
    let offChainValid = false;
    if (metadata) {
      const computedHash = computeEvidenceHash(metadata.evidenceData || {});
      const storedHash = proofHash || (await getBadgeInfo(tokenId)).proofHash;
      offChainValid = computedHash === storedHash;
    }

    // Get badge info
    const badgeInfo = await getBadgeInfo(tokenId);

    res.json({
      success: true,
      verification: {
        tokenId,
        onChainValid,
        offChainValid: metadata ? offChainValid : null,
        isRevoked: badgeInfo.isRevoked,
        valid: onChainValid && !badgeInfo.isRevoked,
      },
      badge: badgeInfo,
    });
  } catch (error) {
    console.error('Error verifying badge:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/badges/:tokenId/revoke
 * Revoke a badge
 * 
 * Body:
 * {
 *   reason: "Certificate invalidated due to academic misconduct"
 * }
 */
router.post('/:tokenId/revoke', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'reason is required',
      });
    }

    const result = await revokeBadge(tokenId, reason);

    res.json({
      success: true,
      tokenId,
      ...result,
    });
  } catch (error) {
    console.error('Error revoking badge:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/badges/stats
 * Get contract statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getContractStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/badges/estimate-gas
 * Estimate gas for minting
 * 
 * Body:
 * {
 *   recipient: "0x...",
 *   tokenURI: "ipfs://...",
 *   proofHash: "0x...",
 *   badgeType: "First Pass"
 * }
 */
router.post('/estimate-gas', async (req, res) => {
  try {
    const { recipient, tokenURI, proofHash, badgeType } = req.body;

    if (!recipient || !tokenURI || !proofHash || !badgeType) {
      return res.status(400).json({
        success: false,
        error: 'All fields required: recipient, tokenURI, proofHash, badgeType',
      });
    }

    const gasEstimate = await estimateMintGas(
      recipient,
      tokenURI,
      proofHash,
      badgeType
    );

    res.json({
      success: true,
      gasEstimate,
    });
  } catch (error) {
    console.error('Error estimating gas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

