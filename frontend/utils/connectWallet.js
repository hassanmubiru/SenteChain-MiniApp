import { ethers } from 'ethers';
import { CELO_CONFIG, switchToCelo, isCelo, getCeloNetworkDetails } from './networkConfig';

let currentAccount = null;
let currentNetwork = null;

// Check if MetaMask is installed
export const isWalletInstalled = () => {
  if (typeof window === 'undefined') return false;
  return typeof window.ethereum !== 'undefined';
};

// Connect wallet (MetaMask for Celo)
export const connectWallet = async () => {
  try {
    console.log('connectWallet called');

    if (!isWalletInstalled()) {
      console.error('MetaMask not detected');
      throw new Error('MetaMask wallet is not installed. Please install it from https://metamask.io');
    }

    console.log('MetaMask detected, requesting access...');

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    if (!accounts || accounts.length === 0) {
      throw new Error('Failed to connect to MetaMask wallet');
    }

    currentAccount = accounts[0];
    console.log('Account connected:', currentAccount);

    // Get current network
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      currentNetwork = chainId;
      console.log('Current network:', currentNetwork);

      if (chainId !== CELO_CONFIG.chainId) {
        console.warn(`Connected to ${chainId}, but app expects Celo (${CELO_CONFIG.chainId})`);
        // Try to switch to Celo
        try {
          await switchToCelo();
          console.log('Switched to Celo network');
        } catch (switchError) {
          console.log('Could not auto-switch to Celo:', switchError.message);
        }
      }
    } catch (error) {
      console.warn('Could not get current network:', error.message);
    }

    return currentAccount;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Get current account
export const getCurrentAccount = async () => {
  try {
    if (!isWalletInstalled()) {
      return null;
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts && accounts.length > 0) {
      currentAccount = accounts[0];
      return currentAccount;
    }

    return null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Get current network
export const getCurrentNetwork = async () => {
  try {
    if (!isWalletInstalled()) {
      return null;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    currentNetwork = chainId;
    return chainId;
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
};

// Listen for account changes
export const onAccountsChanged = (callback) => {
  if (!isWalletInstalled()) {
    return;
  }

  window.ethereum.on('accountsChanged', (accounts) => {
    currentAccount = accounts.length > 0 ? accounts[0] : null;
    callback(currentAccount);
  });
};

// Listen for network changes
export const onNetworkChanged = (callback) => {
  if (!isWalletInstalled()) {
    return;
  }

  window.ethereum.on('chainChanged', (chainId) => {
    currentNetwork = chainId;
    callback(chainId);
  });
};

// Disconnect wallet
export const disconnectWallet = () => {
  currentAccount = null;
  currentNetwork = null;
  return true;
};

// Format address for display
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get CELO balance
export const getCeloBalance = async (address) => {
  try {
    const provider = new ethers.JsonRpcProvider(CELO_CONFIG.rpcUrls[0]);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting CELO balance:', error);
    return '0';
  }
};

// Get Celo network details
export const getCeloNetworkInfo = () => {
  return getCeloNetworkDetails();
};

// Legacy aliases for backwards compatibility
export const getXLMBalance = getCeloBalance;
export const getStellarNetworkDetails = getCeloNetworkInfo;
