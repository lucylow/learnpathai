import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { blockchainService, Badge } from '../../services/blockchainService';
import { 
  Award, 
  Share2, 
  Download, 
  Shield, 
  AlertTriangle,
  Loader,
  ExternalLink,
  CheckCircle,
  XCircle,
  Twitter,
  Linkedin,
  Copy
} from 'lucide-react';

/**
 * Badge viewer component to display student's NFT achievements
 */
export const BadgeViewer: React.FC = () => {
  const { account, isConnected, isCorrectNetwork } = useWeb3();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [verificationResult, setVerificationResult] = useState<{isValid: boolean; error?: string} | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string>('0');

  useEffect(() => {
    if (isConnected && isCorrectNetwork && account) {
      loadBadges();
      loadTokenBalance();
    }
  }, [isConnected, isCorrectNetwork, account]);

  const loadBadges = async () => {
    if (!account) return;

    setLoading(true);
    setError(null);

    try {
      const studentBadges = await blockchainService.getStudentBadges(account);
      setBadges(studentBadges);
      console.log(`✅ Loaded ${studentBadges.length} badges`);
    } catch (err: unknown) {
      console.error('Error loading badges:', err);
      setError(err instanceof Error ? err.message : 'Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const loadTokenBalance = async () => {
    if (!account) return;

    try {
      const balance = await blockchainService.getTokenBalance(account);
      setTokenBalance(balance.formatted);
    } catch (err) {
      console.error('Error loading token balance:', err);
    }
  };

  const verifyBadge = async (badge: Badge) => {
    try {
      setSelectedBadge(badge);
      const result = await blockchainService.verifyBadge(badge.tokenId);
      setVerificationResult(result);
    } catch (err: unknown) {
      console.error('Verification failed:', err);
      setVerificationResult({ isValid: false, error: err instanceof Error ? err.message : 'Verification failed' });
    }
  };

  const handleShare = async (badge: Badge, platform: 'twitter' | 'linkedin' | 'copy') => {
    try {
      const result = await blockchainService.shareBadge(badge, platform);
      if (result) {
        alert(result); // For copy action
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = async (badge: Badge) => {
    try {
      await blockchainService.downloadBadgeImage(badge);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download badge image');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isConnected) {
    return (
      <div className="badge-viewer-empty text-center py-12">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Connect your wallet to view your achievements and badges
        </p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="badge-viewer-error bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          Wrong Network
        </h3>
        <p className="text-yellow-800">
          Please switch to a supported network to view your badges
        </p>
      </div>
    );
  }

  return (
    <div className="badge-viewer">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Award className="w-7 h-7 text-indigo-600" />
            <span>My Achievements</span>
          </h2>
          <p className="text-gray-600 mt-1">
            {badges.length} badge{badges.length !== 1 ? 's' : ''} earned • {tokenBalance} LPTH tokens
          </p>
        </div>

        <button
          onClick={loadBadges}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </span>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {/* Verification Banner */}
      {verificationResult && selectedBadge && (
        <div className={`verification-banner mb-6 p-4 rounded-lg border ${
          verificationResult.isValid
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {verificationResult.isValid ? (
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-lg">
                {verificationResult.isValid ? 'Badge Verified ✅' : 'Invalid Badge ❌'}
              </h4>
              <p className="text-sm mt-1">
                Badge #{selectedBadge.tokenId} - {selectedBadge.metadata?.name}
              </p>
              {verificationResult.isRevoked && (
                <p className="text-sm text-red-700 mt-2 font-medium">
                  ⚠️ This badge has been revoked
                </p>
              )}
            </div>
            <button
              onClick={() => setVerificationResult(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && badges.length === 0 && (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your badges...</p>
        </div>
      )}

      {/* Badges Grid */}
      {!loading && badges.length > 0 && (
        <div className="badges-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <BadgeCard
              key={badge.tokenId}
              badge={badge}
              onVerify={() => verifyBadge(badge)}
              onShare={handleShare}
              onDownload={() => handleDownload(badge)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && badges.length === 0 && !error && (
        <div className="empty-state text-center py-16 bg-gray-50 rounded-lg">
          <Award className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Badges Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Complete courses and achievements to earn verifiable badges!
          </p>
          <a
            href="/paths"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Explore Learning Paths
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Individual badge card component
 */
interface BadgeCardProps {
  badge: Badge;
  onVerify: () => void;
  onShare: (badge: Badge, platform: 'twitter' | 'linkedin' | 'copy') => void;
  onDownload: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onVerify, onShare, onDownload }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const imageUrl = blockchainService.ipfsToHTTP(badge.metadata?.image || '');

  return (
    <div className="badge-card bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      {/* Badge Image */}
      <div className="badge-image relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
        {badge.metadata?.image ? (
          <img
            src={imageUrl}
            alt={badge.metadata.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent(`
                <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#4F46E5"/>
                  <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="48">🎓</text>
                </svg>
              `);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <Award className="w-20 h-20" />
          </div>
        )}

        {/* Revoked Badge Overlay */}
        {badge.isRevoked && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="text-center text-white">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold">REVOKED</p>
            </div>
          </div>
        )}
      </div>

      {/* Badge Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {badge.metadata?.name || 'Achievement Badge'}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {badge.metadata?.description || 'No description available'}
        </p>

        {/* Attributes */}
        {badge.metadata?.attributes && (
          <div className="flex flex-wrap gap-2 mb-4">
            {badge.metadata.attributes
              .filter((attr: {trait_type: string; value: string | number}) => !['evidence_hash', 'issuer'].includes(attr.trait_type))
              .slice(0, 3)
              .map((attr: {trait_type: string; value: string | number}, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium"
                >
                  {attr.value}
                </span>
              ))}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500 space-y-1 mb-4">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Token #{badge.tokenId}</span>
          </div>
          <div>Minted: {new Date(badge.mintedAt).toLocaleDateString()}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onVerify}
            className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Verify
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => { onShare(badge, 'twitter'); setShowShareMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => { onShare(badge, 'linkedin'); setShowShareMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </button>
                <button
                  onClick={() => { onShare(badge, 'copy'); setShowShareMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onDownload}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>

          <a
            href={`https://mumbai.polygonscan.com/token/${badge.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </a>
        </div>
      </div>
    </div>
  );
};

