import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export interface Web3State {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
  error: string | null;
}

const SUPPORTED_CHAIN_IDS = [
  1,      // Ethereum Mainnet
  137,    // Polygon Mainnet
  80001,  // Mumbai Testnet
  1337    // Local Hardhat
];

const CHAIN_NAMES: { [key: number]: string } = {
  1: 'Ethereum Mainnet',
  137: 'Polygon',
  80001: 'Mumbai Testnet',
  1337: 'Localhost'
};

/**
 * React hook for Web3 wallet integration
 * Handles MetaMask/wallet connection, account changes, and network switching
 */
export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    account: null,
    provider: null,
    signer: null,
    isConnected: false,
    chainId: null,
    isCorrectNetwork: false,
    error: null
  });

  /**
   * Connect to user's wallet (MetaMask, etc.)
   */
  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet!');
      }

      setState(prev => ({ ...prev, error: null }));

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      const network = await web3Provider.getNetwork();
      const signer = web3Provider.getSigner();
      const isCorrectNetwork = SUPPORTED_CHAIN_IDS.includes(network.chainId);

      setState({
        account: accounts[0],
        provider: web3Provider,
        signer,
        chainId: network.chainId,
        isConnected: true,
        isCorrectNetwork,
        error: isCorrectNetwork ? null : `Please switch to a supported network`
      });

      console.log('✅ Wallet connected:', accounts[0]);
      console.log('🌐 Network:', CHAIN_NAMES[network.chainId] || network.chainId);

      return accounts[0];

    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      const errorMessage = error.message || 'Failed to connect wallet';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isConnected: false
      }));

      throw error;
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    setState({
      account: null,
      provider: null,
      signer: null,
      isConnected: false,
      chainId: null,
      isCorrectNetwork: false,
      error: null
    });
    console.log('👋 Wallet disconnected');
  }, []);

  /**
   * Switch to a specific network
   */
  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet detected');
      }

      const chainIdHex = `0x${chainId.toString(16)}`;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });

      console.log(`✅ Switched to network ${chainId}`);

    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        console.error('Network not added to wallet');
        // Could implement adding network here
      }
      throw error;
    }
  }, []);

  /**
   * Get current account balance
   */
  const getBalance = useCallback(async () => {
    if (!state.provider || !state.account) {
      return null;
    }

    try {
      const balance = await state.provider.getBalance(state.account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }, [state.provider, state.account]);

  /**
   * Sign a message with the user's wallet
   */
  const signMessage = useCallback(async (message: string) => {
    if (!state.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await state.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }, [state.signer]);

  /**
   * Check if wallet is already connected on mount
   */
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await web3Provider.listAccounts();
          
          if (accounts.length > 0) {
            // Auto-connect if already authorized
            await connectWallet();
          }
        } catch (error) {
          console.log('Not previously connected');
        }
      }
    };

    checkConnection();
  }, [connectWallet]);

  /**
   * Listen for account and network changes
   */
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setState(prev => ({
          ...prev,
          account: accounts[0]
        }));
        console.log('🔄 Account changed:', accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      const isCorrectNetwork = SUPPORTED_CHAIN_IDS.includes(newChainId);
      
      setState(prev => ({
        ...prev,
        chainId: newChainId,
        isCorrectNetwork,
        error: isCorrectNetwork ? null : 'Please switch to a supported network'
      }));

      console.log('🔄 Network changed:', CHAIN_NAMES[newChainId] || newChainId);
      
      // Reload to ensure clean state
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, [disconnectWallet]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getBalance,
    signMessage,
    networkName: state.chainId ? CHAIN_NAMES[state.chainId] : null,
    supportedChains: SUPPORTED_CHAIN_IDS
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

