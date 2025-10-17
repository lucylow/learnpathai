const express = require('express');
const router = express.Router();
const BlockchainService = require('../services/BlockchainService');
const { body, param, validationResult } = require('express-validator');

// Initialize blockchain service
let blockchainService;
try {
  blockchainService = new BlockchainService();
} catch (error) {
  console.error('Failed to initialize blockchain service:', error);
}

/**
 * Middleware to check if blockchain service is available
 */
const requireBlockchain = (req, res, next) => {
  if (!blockchainService) {
    return res.status(503).json({
      success: false,
      error: 'Blockchain service unavailable. Please ensure contracts are deployed.'
    });
  }
  next();
};

/**
 * POST /api/blockchain/badges/issue
 * Issue a new achievement badge to a student
 */
router.post('/badges/issue', requireBlockchain, [
  body('recipientAddress').isEthereumAddress().withMessage('Invalid Ethereum address'),
  body('achievementName').notEmpty().withMessage('Achievement name is required'),
  body('achievementDescription').notEmpty().withMessage('Description is required'),
  body('category').optional().isString(),
  body('level').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('attributes').optional().isArray(),
  body('evidence').optional().isObject(),
  body('rewardTokens').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const result = await blockchainService.issueBadge(req.body);
    
    res.json({
      success: true,
      message: 'Badge issued successfully',
      data: result
    });

  } catch (error) {
    console.error('Badge issuance error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/badges/batch-issue
 * Issue multiple badges in one transaction
 */
router.post('/badges/batch-issue', requireBlockchain, [
  body('badges').isArray({ min: 1 }).withMessage('Badges array is required'),
  body('badges.*.recipientAddress').isEthereumAddress(),
  body('badges.*.achievementName').notEmpty(),
  body('badges.*.achievementDescription').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const result = await blockchainService.batchIssueBadges(req.body.badges);
    
    res.json({
      success: true,
      message: `${result.count} badges issued successfully`,
      data: result
    });

  } catch (error) {
    console.error('Batch issuance error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/badges/verify/:tokenId
 * Verify a badge's authenticity
 */
router.get('/badges/verify/:tokenId', requireBlockchain, [
  param('tokenId').isInt({ min: 1 }).withMessage('Invalid token ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { tokenId } = req.params;
    const evidence = req.query.evidence ? JSON.parse(req.query.evidence) : {};

    const verification = await blockchainService.verifyBadge(tokenId, evidence);

    res.json({
      success: true,
      data: verification
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/badges/student/:address
 * Get all badges owned by a student
 */
router.get('/badges/student/:address', requireBlockchain, [
  param('address').isEthereumAddress().withMessage('Invalid Ethereum address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { address } = req.params;
    const badges = await blockchainService.getStudentBadges(address);

    res.json({
      success: true,
      data: {
        address,
        badges,
        totalBadges: badges.length
      }
    });

  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/badges/:tokenId
 * Get details for a specific badge
 */
router.get('/badges/:tokenId', requireBlockchain, [
  param('tokenId').isInt({ min: 1 }).withMessage('Invalid token ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { tokenId } = req.params;
    const details = await blockchainService.verifyBadge(tokenId);

    res.json({
      success: true,
      data: details
    });

  } catch (error) {
    console.error('Error fetching badge details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/badges/revoke/:tokenId
 * Revoke a badge (admin only)
 */
router.post('/badges/revoke/:tokenId', requireBlockchain, [
  param('tokenId').isInt({ min: 1 }).withMessage('Invalid token ID'),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // TODO: Add proper admin authentication
    // For now, check if user is authenticated
    if (!req.user?.isAdmin && !req.user?.isTeacher) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin or teacher access required' 
      });
    }

    const { tokenId } = req.params;
    const { reason } = req.body;
    
    const result = await blockchainService.revokeBadge(tokenId, reason);

    res.json({
      success: true,
      message: `Badge ${tokenId} revoked successfully`,
      data: result
    });

  } catch (error) {
    console.error('Revocation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/tokens/balance/:address
 * Get token balance for an address
 */
router.get('/tokens/balance/:address', requireBlockchain, [
  param('address').isEthereumAddress().withMessage('Invalid Ethereum address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { address } = req.params;
    const balance = await blockchainService.getTokenBalance(address);

    res.json({
      success: true,
      data: {
        address,
        ...balance
      }
    });

  } catch (error) {
    console.error('Error fetching token balance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/tokens/reward
 * Reward tokens to a student
 */
router.post('/tokens/reward', requireBlockchain, [
  body('recipient').isEthereumAddress().withMessage('Invalid recipient address'),
  body('amount').isInt({ min: 1 }).withMessage('Amount must be positive'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // TODO: Add proper authentication
    if (!req.user?.isTeacher && !req.user?.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: 'Teacher or admin access required' 
      });
    }

    const { recipient, amount, reason } = req.body;
    const result = await blockchainService.rewardTokens(recipient, amount, reason);

    res.json({
      success: true,
      message: 'Tokens rewarded successfully',
      data: result
    });

  } catch (error) {
    console.error('Token reward error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/blockchain/network
 * Get blockchain network information
 */
router.get('/network', requireBlockchain, async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();

    res.json({
      success: true,
      data: networkInfo
    });

  } catch (error) {
    console.error('Network info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/blockchain/estimate-gas
 * Estimate gas cost for minting
 */
router.post('/estimate-gas', requireBlockchain, [
  body('recipientAddress').isEthereumAddress(),
  body('tokenURI').notEmpty(),
  body('proofHash').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { recipientAddress, tokenURI, proofHash } = req.body;
    const estimate = await blockchainService.estimateMintGas(
      recipientAddress,
      tokenURI,
      proofHash
    );

    res.json({
      success: true,
      data: estimate
    });

  } catch (error) {
    console.error('Gas estimation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

