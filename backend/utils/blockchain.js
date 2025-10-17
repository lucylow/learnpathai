/**
 * Blockchain utilities for LearnPathAI
 * Handles contract interactions, minting, verification
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load contract ABI
function loadContractABI() {
  const abiPath = path.join(
    __dirname,
    '../../blockchain/artifacts/contracts/LearnPathBadge.sol/LearnPathBadge.json'
  );
  
  if (!fs.existsSync(abiPath)) {
    throw new Error('Contract ABI not found. Please compile contracts first.');
  }
  
  const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  return artifact.abi;
}

/**
 * Get provider and signer
 */
function getProviderAndSigner() {
  const rpcUrl = process.env.RPC_URL || process.env.MUMBAI_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl) {
    throw new Error('RPC_URL not set in environment');
  }
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set in environment');
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  return { provider, signer };
}

/**
 * Get contract instance
 */
function getContract() {
  const contractAddress = process.env.BADGE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('BADGE_CONTRACT_ADDRESS not set in environment');
  }

  const { signer } = getProviderAndSigner();
  const abi = loadContractABI();
  
  return new ethers.Contract(contractAddress, abi, signer);
}

/**
 * Mint a badge NFT
 * @param {string} recipient - Ethereum address
 * @param {string} tokenURI - IPFS URI for metadata
 * @param {string} proofHash - Evidence hash (0x prefixed)
 * @param {string} badgeType - Type of badge
 * @returns {Promise<object>} - Transaction receipt with tokenId
 */
async function mintBadge(recipient, tokenURI, proofHash, badgeType) {
  const contract = getContract();
  
  console.log('Minting badge:', {
    recipient,
    tokenURI,
    proofHash,
    badgeType,
  });

  // Validate inputs
  if (!ethers.utils.isAddress(recipient)) {
    throw new Error('Invalid recipient address');
  }

  // Convert proofHash to bytes32 if needed
  let proofHashBytes32 = proofHash;
  if (!proofHash.startsWith('0x')) {
    proofHashBytes32 = '0x' + proofHash;
  }
  if (proofHashBytes32.length !== 66) {
    throw new Error('Invalid proof hash length (must be 32 bytes)');
  }

  // Send transaction
  const tx = await contract.mintBadge(
    recipient,
    tokenURI,
    proofHashBytes32,
    badgeType
  );

  console.log('Transaction sent:', tx.hash);
  console.log('Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log('Badge minted! Block:', receipt.blockNumber);

  // Extract token ID from event
  const event = receipt.events?.find(e => e.event === 'BadgeMinted');
  const tokenId = event ? event.args.tokenId.toString() : null;

  return {
    success: true,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
    tokenId,
    gasUsed: receipt.gasUsed.toString(),
  };
}

/**
 * Batch mint badges
 * @param {Array<object>} badges - Array of {recipient, tokenURI, proofHash, badgeType}
 * @returns {Promise<object>} - Transaction receipt
 */
async function batchMintBadges(badges) {
  const contract = getContract();

  const recipients = badges.map(b => b.recipient);
  const uris = badges.map(b => b.tokenURI);
  const proofHashes = badges.map(b => {
    let hash = b.proofHash;
    if (!hash.startsWith('0x')) hash = '0x' + hash;
    return hash;
  });
  const badgeTypes = badges.map(b => b.badgeType);

  const tx = await contract.batchMintBadges(
    recipients,
    uris,
    proofHashes,
    badgeTypes
  );

  const receipt = await tx.wait();

  return {
    success: true,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
    count: badges.length,
    gasUsed: receipt.gasUsed.toString(),
  };
}

/**
 * Verify a badge's proof
 * @param {string|number} tokenId - Token ID
 * @param {string} proofHash - Proof hash to verify
 * @returns {Promise<boolean>} - True if valid
 */
async function verifyBadgeProof(tokenId, proofHash) {
  const contract = getContract();
  
  let proofHashBytes32 = proofHash;
  if (!proofHash.startsWith('0x')) {
    proofHashBytes32 = '0x' + proofHash;
  }

  return contract.verifyProof(tokenId, proofHashBytes32);
}

/**
 * Get badge information
 * @param {string|number} tokenId - Token ID
 * @returns {Promise<object>} - Badge info
 */
async function getBadgeInfo(tokenId) {
  const contract = getContract();
  const info = await contract.getBadgeInfo(tokenId);

  return {
    owner: info.owner,
    tokenURI: info.uri,
    proofHash: info.proof,
    badgeType: info.bType,
    mintedAt: new Date(info.minted.toNumber() * 1000).toISOString(),
    isRevoked: info.revoked,
  };
}

/**
 * Get all badges owned by an address
 * @param {string} ownerAddress - Owner's Ethereum address
 * @returns {Promise<Array<string>>} - Array of token IDs
 */
async function getBadgesForOwner(ownerAddress) {
  const contract = getContract();
  const tokenIds = await contract.tokensOfOwner(ownerAddress);
  return tokenIds.map(id => id.toString());
}

/**
 * Revoke a badge
 * @param {string|number} tokenId - Token ID
 * @param {string} reason - Reason for revocation
 * @returns {Promise<object>} - Transaction receipt
 */
async function revokeBadge(tokenId, reason) {
  const contract = getContract();
  const tx = await contract.revokeBadge(tokenId, reason);
  const receipt = await tx.wait();

  return {
    success: true,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Get contract stats
 * @returns {Promise<object>} - Contract statistics
 */
async function getContractStats() {
  const contract = getContract();
  const totalSupply = await contract.totalSupply();

  return {
    totalBadgesMinted: totalSupply.toString(),
    contractAddress: contract.address,
  };
}

/**
 * Estimate gas for minting
 * @param {string} recipient - Recipient address
 * @param {string} tokenURI - Token URI
 * @param {string} proofHash - Proof hash
 * @param {string} badgeType - Badge type
 * @returns {Promise<string>} - Estimated gas
 */
async function estimateMintGas(recipient, tokenURI, proofHash, badgeType) {
  const contract = getContract();
  
  let proofHashBytes32 = proofHash;
  if (!proofHash.startsWith('0x')) {
    proofHashBytes32 = '0x' + proofHash;
  }

  const gasEstimate = await contract.estimateGas.mintBadge(
    recipient,
    tokenURI,
    proofHashBytes32,
    badgeType
  );

  return gasEstimate.toString();
}

module.exports = {
  getContract,
  mintBadge,
  batchMintBadges,
  verifyBadgeProof,
  getBadgeInfo,
  getBadgesForOwner,
  revokeBadge,
  getContractStats,
  estimateMintGas,
};

