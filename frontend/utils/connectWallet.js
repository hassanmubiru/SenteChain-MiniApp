import {
  connectFreighter,
  isFreighterInstalled,
  getPublicKey,
  getNetwork,
  STELLAR_CONFIG,
  fundTestnetAccount
} from './stellarConfig';
import * as StellarSdk from '@stellar/stellar-sdk';

let currentAccount = null;
let currentNetwork = null;

// Check if Freighter is installed
export const isWalletInstalled = () => {
  return isFreighterInstalled();
};

// Connect wallet (Freighter for Stellar)
export const connectWallet = async () => {
  try {
    console.log('connectWallet called');

    if (!isFreighterInstalled()) {
      console.error('Freighter not detected');
      throw new Error('Freighter wallet is not installed. Please install it from https://freighter.app');
    }

    console.log('Freighter detected, requesting access...');

    // Request access to Freighter
    const publicKey = await connectFreighter();

    if (!publicKey) {
      throw new Error('Failed to connect to Freighter wallet');
    }

    currentAccount = publicKey;
    console.log('Account connected:', currentAccount);

    // Get current network
    try {
      currentNetwork = await getNetwork();
      console.log('Current network:', currentNetwork);

      if (currentNetwork !== STELLAR_CONFIG.network) {
        console.warn(`Connected to ${currentNetwork}, but app expects ${STELLAR_CONFIG.network}`);
      }
    } catch (error) {
      console.warn('Could not get current network:', error.message);
    }

    // Try to fund account on testnet if needed
    if (STELLAR_CONFIG.network === 'testnet') {
      try {
        await fundTestnetAccount(publicKey);
        console.log('Testnet account funded successfully');
      } catch (error) {
        console.log('Account might already be funded or friendbot failed:', error.message);
      }
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
    if (!isFreighterInstalled()) {
      return null;
    }

    const publicKey = await getPublicKey();

    if (publicKey) {
      currentAccount = publicKey;
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
    if (!isFreighterInstalled()) {
      return null;
    }

    const network = await getNetwork();
    currentNetwork = network;
    return network;
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
};

// Listen for account changes (Freighter doesn't have this built-in, polling needed)
export const onAccountsChanged = (callback) => {
  if (!isFreighterInstalled()) {
    return;
  }

  // Poll for account changes every 2 seconds
  setInterval(async () => {
    try {
      const publicKey = await getPublicKey();
      if (publicKey !== currentAccount) {
        currentAccount = publicKey;
        callback(currentAccount);
      }
    } catch (error) {
      // Wallet might be locked
      if (currentAccount !== null) {
        currentAccount = null;
        callback(null);
      }
    }
  }, 2000);
};

// Listen for network changes (Freighter doesn't have this built-in, polling needed)
export const onNetworkChanged = (callback) => {
  if (!isFreighterInstalled()) {
    return;
  }

  // Poll for network changes every 2 seconds
  setInterval(async () => {
    try {
      const network = await getNetwork();
      if (network !== currentNetwork) {
        currentNetwork = network;
        callback(network);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  }, 2000);
};

// Disconnect wallet
export const disconnectWallet = () => {
  currentAccount = null;
  currentNetwork = null;
  return true;
};

// Format address for display (Stellar addresses are longer)
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Get XLM balance
export const getXLMBalance = async (address) => {
  try {
    const server = new StellarSdk.Horizon.Server(STELLAR_CONFIG.horizonUrl);
    const account = await server.loadAccount(address);

    const nativeBalance = account.balances.find(
      (balance) => balance.asset_type === 'native'
    );

    return nativeBalance ? nativeBalance.balance : '0';
  } catch (error) {
    console.error('Error getting XLM balance:', error);
    return '0';
  }
};

// Get Stellar network details
export const getStellarNetworkDetails = () => {
  return {
    network: STELLAR_CONFIG.network,
    horizonUrl: STELLAR_CONFIG.horizonUrl,
    sorobanRpcUrl: STELLAR_CONFIG.sorobanRpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
  };
};
