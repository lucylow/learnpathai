const { Web3Storage, File } = require('web3.storage');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

/**
 * IPFS Service for storing badge metadata and images
 * Uses Web3.Storage for decentralized storage
 */
class IPFSService {
  constructor() {
    this.client = new Web3Storage({ 
      token: process.env.WEB3_STORAGE_TOKEN 
    });
  }

  /**
   * Upload badge metadata with W3C Verifiable Credentials format
   */
  async uploadBadgeMetadata(badgeData) {
    const { 
      name, 
      description, 
      image, 
      attributes, 
      recipient,
      evidence,
      issuer = "LearnPath AI"
    } = badgeData;

    // Create evidence hash (non-PII - only achievement data)
    const evidenceObject = {
      achievement: name,
      completedAt: new Date().toISOString(),
      criteria: evidence?.criteria || '',
      skillsVerified: evidence?.skills || []
    };
    
    const evidenceHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(evidenceObject))
    );

    // Create comprehensive metadata with OpenSea compatibility
    const metadata = {
      name,
      description,
      image,
      external_url: `https://learnpath.ai/badges/${recipient}`,
      attributes: [
        ...attributes,
        {
          trait_type: "evidence_hash",
          value: evidenceHash,
          display_type: "text"
        },
        {
          trait_type: "issuer",
          value: issuer
        },
        {
          trait_type: "issuance_date",
          value: new Date().toISOString(),
          display_type: "date"
        },
        {
          trait_type: "category",
          value: evidence?.category || "achievement"
        }
      ],
      
      // W3C Verifiable Credentials compatible structure
      credential: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/blockcerts/v3"
        ],
        type: ["VerifiableCredential", "AchievementCredential"],
        issuer: {
          id: `did:web:learnpath.ai`,
          name: issuer,
          url: "https://learnpath.ai"
        },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: `did:ethr:${recipient}`,
          type: "AchievementSubject",
          achievement: {
            id: `https://learnpath.ai/achievements/${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            description,
            criteria: {
              narrative: evidence?.criteria || description
            },
            image
          }
        },
        proof: {
          type: "EthereumAttestationRegistry2019",
          proofPurpose: "assertionMethod",
          verificationMethod: "blockchain",
          evidenceHash
        }
      }
    };

    // Upload to IPFS
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    const file = new File([blob], 'badge-metadata.json');
    
    const cid = await this.client.put([file], {
      name: `LearnPath-Badge-${name.replace(/\s+/g, '-')}-${Date.now()}`,
      maxRetries: 3
    });

    const tokenURI = `ipfs://${cid}/badge-metadata.json`;
    
    console.log(`✅ Metadata uploaded to IPFS: ${tokenURI}`);
    
    return {
      tokenURI,
      evidenceHash,
      metadata,
      ipfsCID: cid
    };
  }

  /**
   * Upload a file (image, document, etc.) to IPFS
   */
  async uploadFile(fileBuffer, fileName, mimeType = 'application/octet-stream') {
    const file = new File([fileBuffer], fileName, { type: mimeType });
    const cid = await this.client.put([file], {
      name: `LearnPath-${fileName}-${Date.now()}`,
      maxRetries: 3
    });
    
    const ipfsURI = `ipfs://${cid}/${fileName}`;
    console.log(`✅ File uploaded to IPFS: ${ipfsURI}`);
    
    return ipfsURI;
  }

  /**
   * Generate a beautiful SVG badge image
   */
  async generateBadgeImage(achievementName, achievementCategory = 'achievement', level = 'intermediate') {
    // Color schemes based on category
    const colorSchemes = {
      python: { bg: '#4B8BBE', accent: '#FFD43B', text: '#306998' },
      javascript: { bg: '#F7DF1E', accent: '#000000', text: '#000000' },
      ai: { bg: '#FF6B6B', accent: '#4ECDC4', text: '#FFFFFF' },
      web: { bg: '#E44D26', accent: '#264DE4', text: '#FFFFFF' },
      data: { bg: '#3776AB', accent: '#FFD43B', text: '#FFFFFF' },
      achievement: { bg: '#4F46E5', accent: '#10B981', text: '#FFFFFF' }
    };

    const colors = colorSchemes[achievementCategory.toLowerCase()] || colorSchemes.achievement;

    // Create a modern, attractive badge
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.8" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="500" height="500" fill="url(#bgGradient)" rx="20"/>
  
  <!-- Decorative circles -->
  <circle cx="250" cy="250" r="180" fill="white" opacity="0.1"/>
  <circle cx="250" cy="250" r="140" fill="white" opacity="0.15"/>
  <circle cx="250" cy="250" r="100" fill="white" opacity="0.2"/>
  
  <!-- Badge icon/shield -->
  <path d="M 250 120 L 320 150 L 320 260 C 320 300, 250 340, 250 340 C 250 340, 180 300, 180 260 L 180 150 Z" 
        fill="${colors.text}" opacity="0.2" filter="url(#shadow)"/>
  
  <!-- Star decoration -->
  <path d="M 250 180 L 265 220 L 305 220 L 275 245 L 290 285 L 250 260 L 210 285 L 225 245 L 195 220 L 235 220 Z"
        fill="white" opacity="0.9"/>
  
  <!-- Text container -->
  <foreignObject x="75" y="320" width="350" height="150">
    <div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center; color:${colors.text}; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; margin-bottom: 8px;">
        LearnPath AI
      </div>
      <div style="font-size: 22px; font-weight: bold; margin-bottom: 8px; line-height: 1.2; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        ${this.truncateText(achievementName, 30)}
      </div>
      <div style="font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">
        ${level} • ${achievementCategory}
      </div>
    </div>
  </foreignObject>
  
  <!-- Bottom decoration -->
  <rect x="150" y="460" width="200" height="4" fill="white" opacity="0.3" rx="2"/>
</svg>`;

    const buffer = Buffer.from(svg);
    return this.uploadFile(buffer, `badge-${Date.now()}.svg`, 'image/svg+xml');
  }

  /**
   * Fetch metadata from IPFS
   */
  async fetchMetadata(ipfsURI) {
    try {
      const url = this.ipfsToHTTP(ipfsURI);
      const response = await fetch(url, { timeout: 10000 });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching metadata from ${ipfsURI}:`, error);
      throw error;
    }
  }

  /**
   * Convert IPFS URI to HTTP gateway URL
   */
  ipfsToHTTP(ipfsURI, gateway = 'https://ipfs.io/ipfs/') {
    if (ipfsURI.startsWith('ipfs://')) {
      return ipfsURI.replace('ipfs://', gateway);
    }
    return ipfsURI;
  }

  /**
   * Helper: Truncate text for display
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Validate IPFS CID format
   */
  isValidCID(cid) {
    // Basic CID validation (CIDv0 or CIDv1)
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44,}$|^b[A-Za-z2-7]{58,}$/.test(cid);
  }

  /**
   * Create contract-level metadata (for OpenSea collection)
   */
  async uploadContractMetadata(collectionInfo) {
    const metadata = {
      name: collectionInfo.name || "LearnPath Achievements",
      description: collectionInfo.description || "Verifiable learning achievements from LearnPath AI",
      image: collectionInfo.image || "ipfs://QmLearnPathLogo",
      external_link: "https://learnpath.ai",
      seller_fee_basis_points: 0, // No royalties for education
      fee_recipient: collectionInfo.feeRecipient || ethers.constants.AddressZero
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    const file = new File([blob], 'contract-metadata.json');
    
    const cid = await this.client.put([file], {
      name: 'LearnPath-Contract-Metadata'
    });

    return `ipfs://${cid}/contract-metadata.json`;
  }
}

module.exports = IPFSService;

