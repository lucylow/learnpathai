const { ethers } = require('ethers');
const IPFSService = require('./IPFSService');
const path = require('path');

/**
 * Blockchain Service for managing NFT badges and token rewards
 * Handles minting, verification, and querying blockchain state
 */
class BlockchainService {
  constructor() {
    // Initialize provider and signer
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_URL || 'http://127.0.0.1:8545'
    );
    
    this.signer = new ethers.Wallet(
      process.env.PRIVATE_KEY || '',
      this.provider
    );

    // Load contract ABIs and addresses
    try {
      const badgeABI = require('../contracts/LearnPathBadge.json');
      const tokenABI = require('../contracts/LearnPathToken.json');

      this.badgeContract = new ethers.Contract(
        process.env.BADGE_CONTRACT_ADDRESS || badgeABI.address,
        badgeABI.abi,
        this.signer
      );

      this.tokenContract = new ethers.Contract(
        process.env.TOKEN_CONTRACT_ADDRESS || tokenABI.address,
        tokenABI.abi,
        this.signer
      );

      console.log('✅ Blockchain service initialized');
      console.log(`   Badge Contract: ${this.badgeContract.address}`);
      console.log(`   Token Contract: ${this.tokenContract.address}`);
      console.log(`   Signer: ${this.signer.address}`);

    } catch (error) {
      console.warn('⚠️  Contract ABIs not found. Run deployment first.');
      console.warn('   Service will be in read-only mode until contracts are deployed.');
    }

    this.ipfsService = new IPFSService();
  }

  /**
   * Issue a new achievement badge to a student
   */
  async issueBadge(badgeRequest) {
    try {
      const {
        recipientAddress,
        achievementName,
        achievementDescription,
        attributes = [],
        evidence = {},
        category = 'achievement',
        level = 'intermediate',
        rewardTokens = 0
      } = badgeRequest;

      console.log(`🎖️  Issuing badge: "${achievementName}" to ${recipientAddress}`);

      // Step 1: Generate badge image
      const imageURI = await this.ipfsService.generateBadgeImage(
        achievementName,
        category,
        level
      );

      // Step 2: Upload metadata to IPFS
      const { tokenURI, evidenceHash, metadata, ipfsCID } = await this.ipfsService.uploadBadgeMetadata({
        name: achievementName,
        description: achievementDescription,
        image: imageURI,
        attributes: [
          { trait_type: 'category', value: category },
          { trait_type: 'level', value: level },
          ...attributes
        ],
        recipient: recipientAddress,
        evidence
      });

      // Step 3: Mint NFT badge on-chain
      console.log('   Minting NFT on blockchain...');
      const tx = await this.badgeContract.mintBadge(
        recipientAddress,
        tokenURI,
        evidenceHash,
        {
          gasLimit: 500000 // Set reasonable gas limit
        }
      );

      console.log(`   Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`   ✅ Mined in block ${receipt.blockNumber}`);

      // Extract token ID from events
      const tokenId = await this.getMintedTokenId(receipt);

      // Step 4: Reward tokens if specified
      if (rewardTokens > 0) {
        console.log(`   Rewarding ${rewardTokens} tokens...`);
        await this.rewardTokens(
          recipientAddress,
          rewardTokens,
          `Achievement: ${achievementName}`
        );
      }

      return {
        success: true,
        tokenId: tokenId.toString(),
        tokenURI,
        evidenceHash,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        imageURI,
        ipfsCID,
        gasUsed: receipt.gasUsed.toString(),
        metadata
      };

    } catch (error) {
      console.error('❌ Error issuing badge:', error);
      throw new Error(`Failed to issue badge: ${error.message}`);
    }
  }

  /**
   * Batch issue multiple badges (gas-optimized)
   */
  async batchIssueBadges(badgeRequests) {
    try {
      console.log(`📦 Batch issuing ${badgeRequests.length} badges...`);

      const recipients = [];
      const tokenURIs = [];
      const proofHashes = [];

      // Prepare metadata for all badges
      for (const request of badgeRequests) {
        const imageURI = await this.ipfsService.generateBadgeImage(
          request.achievementName,
          request.category || 'achievement',
          request.level || 'intermediate'
        );

        const { tokenURI, evidenceHash } = await this.ipfsService.uploadBadgeMetadata({
          name: request.achievementName,
          description: request.achievementDescription,
          image: imageURI,
          attributes: request.attributes || [],
          recipient: request.recipientAddress,
          evidence: request.evidence || {}
        });

        recipients.push(request.recipientAddress);
        tokenURIs.push(tokenURI);
        proofHashes.push(evidenceHash);
      }

      // Single batch transaction
      const tx = await this.badgeContract.batchMintWithMerkle(
        recipients,
        tokenURIs,
        proofHashes,
        {
          gasLimit: 500000 * badgeRequests.length
        }
      );

      const receipt = await tx.wait();
      console.log(`✅ Batch minted ${badgeRequests.length} badges`);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        count: badgeRequests.length
      };

    } catch (error) {
      console.error('❌ Batch minting failed:', error);
      throw error;
    }
  }

  /**
   * Reward tokens to a student for achievements
   */
  async rewardTokens(recipient, amount, reason) {
    try {
      const tx = await this.tokenContract.rewardAchievement(
        recipient,
        amount,
        reason,
        {
          gasLimit: 200000
        }
      );

      const receipt = await tx.wait();
      console.log(`   ✅ Rewarded ${amount} tokens`);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        amount,
        recipient
      };

    } catch (error) {
      console.error('❌ Token reward failed:', error);
      throw error;
    }
  }

  /**
   * Verify a badge's authenticity
   */
  async verifyBadge(tokenId, expectedEvidence = {}) {
    try {
      // Compute expected hash if evidence provided
      let expectedHash = ethers.constants.HashZero;
      if (Object.keys(expectedEvidence).length > 0) {
        expectedHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(JSON.stringify(expectedEvidence))
        );
      }

      // Check on-chain verification
      const [details, isValid] = await Promise.all([
        this.badgeContract.getBadgeDetails(tokenId),
        expectedHash !== ethers.constants.HashZero 
          ? this.badgeContract.verifyProof(tokenId, expectedHash)
          : Promise.resolve(true)
      ]);

      const isRevoked = await this.badgeContract.isRevoked(tokenId);

      // Fetch metadata from IPFS
      let metadata = null;
      try {
        metadata = await this.ipfsService.fetchMetadata(details.uri);
      } catch (error) {
        console.warn('Could not fetch metadata:', error.message);
      }

      return {
        isValid: isValid && !isRevoked,
        isRevoked,
        owner: details.owner,
        tokenURI: details.uri,
        proofHash: details.proof,
        mintedAt: new Date(details.timestamp.toNumber() * 1000).toISOString(),
        tokenId: tokenId.toString(),
        metadata
      };

    } catch (error) {
      console.error('❌ Verification error:', error);
      return { 
        isValid: false, 
        error: error.message,
        tokenId: tokenId.toString()
      };
    }
  }

  /**
   * Get all badges owned by a student
   */
  async getStudentBadges(studentAddress) {
    try {
      const tokenIds = await this.badgeContract.getBadgesByOwner(studentAddress);
      const badges = [];

      for (const tokenId of tokenIds) {
        const details = await this.badgeContract.getBadgeDetails(tokenId);
        
        // Fetch metadata from IPFS
        let metadata = null;
        try {
          metadata = await this.ipfsService.fetchMetadata(details.uri);
        } catch (error) {
          console.warn(`Could not fetch metadata for token ${tokenId}:`, error.message);
        }

        badges.push({
          tokenId: tokenId.toString(),
          tokenURI: details.uri,
          metadata,
          proofHash: details.proof,
          isRevoked: details.revoked,
          mintedAt: new Date(details.timestamp.toNumber() * 1000).toISOString()
        });
      }

      return badges;

    } catch (error) {
      console.error('❌ Error fetching student badges:', error);
      return [];
    }
  }

  /**
   * Get student's token balance
   */
  async getTokenBalance(address) {
    try {
      const balance = await this.tokenContract.balanceOf(address);
      return {
        balance: balance.toString(),
        formatted: ethers.utils.formatEther(balance),
        decimals: 18
      };
    } catch (error) {
      console.error('❌ Error fetching token balance:', error);
      return { balance: '0', formatted: '0', decimals: 18 };
    }
  }

  /**
   * Revoke a badge (admin only)
   */
  async revokeBadge(tokenId, reason = '') {
    try {
      console.log(`⚠️  Revoking badge ${tokenId}: ${reason}`);
      
      const tx = await this.badgeContract.revoke(tokenId, {
        gasLimit: 150000
      });

      const receipt = await tx.wait();
      console.log(`✅ Badge ${tokenId} revoked`);

      return {
        success: true,
        tokenId: tokenId.toString(),
        transactionHash: receipt.transactionHash,
        reason
      };

    } catch (error) {
      console.error('❌ Revocation failed:', error);
      throw error;
    }
  }

  /**
   * Get blockchain network info
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      return {
        chainId: network.chainId,
        name: network.name,
        blockNumber,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei'
      };
    } catch (error) {
      console.error('❌ Network info error:', error);
      return null;
    }
  }

  /**
   * Extract token ID from mint transaction receipt
   */
  async getMintedTokenId(receipt) {
    const eventInterface = new ethers.utils.Interface([
      "event BadgeMinted(uint256 indexed tokenId, address indexed recipient, string tokenURI, bytes32 proofHash, uint256 timestamp)"
    ]);

    for (const log of receipt.logs) {
      try {
        const parsedLog = eventInterface.parseLog(log);
        if (parsedLog.name === "BadgeMinted") {
          return parsedLog.args.tokenId;
        }
      } catch (e) {
        // Not the event we're looking for
      }
    }
    
    throw new Error("Token ID not found in transaction logs");
  }

  /**
   * Estimate gas for badge minting
   */
  async estimateMintGas(recipientAddress, tokenURI, proofHash) {
    try {
      const gasEstimate = await this.badgeContract.estimateGas.mintBadge(
        recipientAddress,
        tokenURI,
        proofHash
      );

      const gasPrice = await this.provider.getGasPrice();
      const cost = gasEstimate.mul(gasPrice);

      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei',
        estimatedCost: ethers.utils.formatEther(cost) + ' ETH'
      };

    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  }
}

module.exports = BlockchainService;

