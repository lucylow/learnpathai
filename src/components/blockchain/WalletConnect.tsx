import React, { useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { Wallet, AlertCircle, CheckCircle, Loader } from 'lucide-react';

/**
 * Wallet connection component with network detection
 */
export const WalletConnect: React.FC = () => {
  const {
    account,
    isConnected,
    chainId,
    isCorrectNetwork,
    networkName,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork
  } = useWeb3();

  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      // Switch to Polygon Mumbai testnet by default
      await switchNetwork(80001);
    } catch (error) {
      console.error('Network switch failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!window.ethereum) {
    return (
      <div className="wallet-connect-prompt bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900">Wallet Not Detected</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Please install{' '}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-yellow-900"
              >
                MetaMask
              </a>{' '}
              or another Web3 wallet to access blockchain features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="wallet-connect">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isConnecting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-connected space-y-3">
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-medium text-gray-900">
                {formatAddress(account!)}
              </span>
              {isCorrectNetwork && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs text-gray-600">
                {networkName || `Chain ${chainId}`}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={disconnectWallet}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Disconnect
        </button>
      </div>

      {!isCorrectNetwork && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 text-sm">Wrong Network</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Please switch to Polygon Mumbai testnet to use blockchain features.
              </p>
              <button
                onClick={handleSwitchNetwork}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors font-medium"
              >
                Switch Network
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

