import { ethers } from 'ethers';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface BadgeRequest {
  recipientAddress: string;
  achievementName: string;
  achievementDescription: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  attributes?: Array<{ trait_type: string; value: string | number }>;
  evidence?: Record<string, any>;
  rewardTokens?: number;
}

export interface Badge {
  tokenId: string;
  tokenURI: string;
  metadata?: any;
  proofHash: string;
  isRevoked: boolean;
  mintedAt: string;
}

export interface VerificationResult {
  isValid: boolean;
  isRevoked: boolean;
  owner: string;
  tokenURI: string;
  proofHash: string;
  mintedAt: string;
  tokenId: string;
  metadata?: any;
}

/**
 * Frontend service for interacting with blockchain API
 */
class BlockchainService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Issue a new badge to a student
   */
  async issueBadge(badgeRequest: BadgeRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/blockchain/badges/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(badgeRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to issue badge');
      }

      return data.data;
    } catch (error: any) {
      console.error('Badge issuance error:', error);
      throw error;
    }
  }

  /**
   * Get all badges for a student address
   */
  async getStudentBadges(address: string): Promise<Badge[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/blockchain/badges/student/${address}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch badges');
      }

      return data.data.badges;
    } catch (error: any) {
      console.error('Error fetching badges:', error);
      throw error;
    }
  }

  /**
   * Verify a badge's authenticity
   */
  async verifyBadge(tokenId: string, evidence?: Record<string, any>): Promise<VerificationResult> {
    try {
      const url = new URL(`${this.baseURL}/blockchain/badges/verify/${tokenId}`);
      
      if (evidence) {
        url.searchParams.set('evidence', JSON.stringify(evidence));
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      return data.data;
    } catch (error: any) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  /**
   * Get badge details
   */
  async getBadgeDetails(tokenId: string): Promise<VerificationResult> {
    try {
      const response = await fetch(
        `${this.baseURL}/blockchain/badges/${tokenId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch badge details');
      }

      return data.data;
    } catch (error: any) {
      console.error('Error fetching badge details:', error);
      throw error;
    }
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(address: string): Promise<{
    balance: string;
    formatted: string;
    decimals: number;
  }> {
    try {
      const response = await fetch(
        `${this.baseURL}/blockchain/tokens/balance/${address}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch token balance');
      }

      return {
        balance: data.data.balance,
        formatted: data.data.formatted,
        decimals: data.data.decimals
      };
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
      return { balance: '0', formatted: '0', decimals: 18 };
    }
  }

  /**
   * Get blockchain network information
   */
  async getNetworkInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/blockchain/network`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch network info');
      }

      return data.data;
    } catch (error: any) {
      console.error('Network info error:', error);
      return null;
    }
  }

  /**
   * Convert IPFS URI to HTTP URL
   */
  ipfsToHTTP(ipfsURI: string, gateway = 'https://ipfs.io/ipfs/'): string {
    if (ipfsURI.startsWith('ipfs://')) {
      return ipfsURI.replace('ipfs://', gateway);
    }
    return ipfsURI;
  }

  /**
   * Format Ethereum address for display
   */
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Check if string is valid Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.utils.isAddress(address);
  }

  /**
   * Share badge on social media
   */
  async shareBadge(badge: Badge, platform: 'twitter' | 'linkedin' | 'copy') {
    const shareText = `I earned "${badge.metadata?.name}" on LearnPath AI! 🎓`;
    const shareUrl = `https://learnpath.ai/verify/${badge.tokenId}`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;

      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;

      case 'copy':
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          return 'Link copied to clipboard!';
        }
        break;
    }
  }

  /**
   * Download badge as image
   */
  async downloadBadgeImage(badge: Badge) {
    try {
      const imageUrl = this.ipfsToHTTP(badge.metadata?.image || '');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${badge.metadata?.name || 'badge'}-${badge.tokenId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading badge:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();

