// Stellar Testnet configuration
export const STELLAR_TESTNET_CONFIG = {
  network: 'testnet',
  networkPassphrase: 'Test SDF Network ; September 2015',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  friendbotUrl: 'https://friendbot.stellar.org',
};

// Stellar Mainnet configuration
export const STELLAR_MAINNET_CONFIG = {
  network: 'mainnet',
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  horizonUrl: 'https://horizon.stellar.org',
  sorobanRpcUrl: 'https://soroban-rpc.stellar.org',
};

// Default to testnet for development
export const STELLAR_CONFIG = STELLAR_TESTNET_CONFIG;

// Function to check if Freighter wallet is installed
export const isFreighterInstalled = () => {
  if (typeof window === 'undefined') return false;
  return window.freighter !== undefined;
};

// Function to check if user is connected
export const isConnected = async () => {
  if (!isFreighterInstalled()) return false;
  
  try {
    const result = await window.freighter.isConnected();
    return result;
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};

// Function to connect to Freighter wallet
export const connectFreighter = async () => {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet is not installed. Please install it from https://freighter.app');
  }

  try {
    const publicKey = await window.freighter.requestAccess();
    
    if (!publicKey) {
      throw new Error('Failed to get public key from Freighter');
    }

    return publicKey;
  } catch (error) {
    console.error('Error connecting to Freighter:', error);
    throw error;
  }
};

// Function to get current network
export const getNetwork = async () => {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet is not installed');
  }

  try {
    const network = await window.freighter.getNetwork();
    return network;
  } catch (error) {
    console.error('Error getting network:', error);
    throw error;
  }
};

// Function to get public key
export const getPublicKey = async () => {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet is not installed');
  }

  try {
    const publicKey = await window.freighter.getPublicKey();
    return publicKey;
  } catch (error) {
    console.error('Error getting public key:', error);
    throw error;
  }
};

// Function to sign transaction
export const signTransaction = async (xdr, networkPassphrase) => {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter wallet is not installed');
  }

  try {
    const signedXdr = await window.freighter.signTransaction(xdr, {
      networkPassphrase: networkPassphrase || STELLAR_CONFIG.networkPassphrase,
    });
    
    return signedXdr;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
};

// Get network configuration details
export const getStellarNetworkDetails = () => {
  return {
    networkName: STELLAR_CONFIG.network === 'testnet' ? 'Stellar Testnet' : 'Stellar Mainnet',
    horizonUrl: STELLAR_CONFIG.horizonUrl,
    sorobanRpcUrl: STELLAR_CONFIG.sorobanRpcUrl,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    friendbotUrl: STELLAR_CONFIG.friendbotUrl,
  };
};

// Fund testnet account using Friendbot
export const fundTestnetAccount = async (publicKey) => {
  if (STELLAR_CONFIG.network !== 'testnet') {
    throw new Error('Friendbot is only available on testnet');
  }

  try {
    const response = await fetch(
      `${STELLAR_CONFIG.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fund account');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error funding account:', error);
    throw error;
  }
};
