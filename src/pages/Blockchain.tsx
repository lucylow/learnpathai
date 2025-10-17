import React from 'react';
import { WalletConnect } from '../components/blockchain/WalletConnect';
import { BadgeViewer } from '../components/blockchain/BadgeViewer';
import { Shield, Award, Coins, Lock } from 'lucide-react';

/**
 * Blockchain achievements page
 * Displays wallet connection and student's NFT badges
 */
export const Blockchain: React.FC = () => {
  return (
    <div className="blockchain-page container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="hero-section mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
            <Shield className="w-10 h-10 text-indigo-600" />
            <span>Blockchain Achievements</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your learning achievements, verified on the blockchain. Earn NFT badges
            and tokens that prove your skills to the world.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <FeatureCard
            icon={<Award className="w-8 h-8 text-indigo-600" />}
            title="Verifiable Badges"
            description="NFT certificates that prove your achievements on-chain"
          />
          <FeatureCard
            icon={<Coins className="w-8 h-8 text-yellow-600" />}
            title="Token Rewards"
            description="Earn LPTH tokens for completing courses and milestones"
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8 text-green-600" />}
            title="Tamper-Proof"
            description="Cryptographically secured achievements that can't be forged"
          />
        </div>

        {/* Wallet Connection */}
        <div className="wallet-section bg-white rounded-xl shadow-md p-6 mb-10">
          <WalletConnect />
        </div>
      </div>

      {/* Badge Viewer */}
      <div className="badges-section">
        <BadgeViewer />
      </div>

      {/* Info Section */}
      <div className="info-section mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h3 className="font-semibold text-lg mb-2">1. Complete Achievements</h3>
            <p className="text-sm">
              Finish courses, master skills, and complete challenges in LearnPath AI.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">2. Receive NFT Badges</h3>
            <p className="text-sm">
              Get verifiable NFT certificates minted to your wallet automatically.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">3. Earn Token Rewards</h3>
            <p className="text-sm">
              Collect LPTH tokens that can be used for platform benefits and bragging rights.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">4. Share & Verify</h3>
            <p className="text-sm">
              Share your badges on social media and let anyone verify their authenticity on-chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="feature-card bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default Blockchain;

