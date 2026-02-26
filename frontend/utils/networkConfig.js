// Celo Alfajores Testnet configuration
export const CELO_ALFAJORES_CONFIG = {
  chainId: '0xAEF3', // 44787
  chainName: 'Celo Alfajores Testnet',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
  blockExplorerUrls: ['https://alfajores.celoscan.io'],
};

// Celo Mainnet configuration
export const CELO_MAINNET_CONFIG = {
  chainId: '0xA4EC', // 42220
  chainName: 'Celo Mainnet',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18,
  },
  rpcUrls: ['https://forno.celo.org'],
  blockExplorerUrls: ['https://celoscan.io'],
};

// Default to Alfajores testnet for development
export const CELO_CONFIG = CELO_ALFAJORES_CONFIG;

// Function to switch to Celo network
export const switchToCelo = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to the network first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_CONFIG.chainId }],
      });
      return true;
    } catch (switchError) {
      // This error code means the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        // Chain not added, let's add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [CELO_CONFIG],
        });
        return true;
      } else if (switchError.code === 4001) {
        // User rejected the request
        const error = new Error('User rejected network switch');
        error.code = 4001;
        throw error;
      } else if (switchError.code === -32002) {
        // Request already pending
        const error = new Error('Network switch request already pending in MetaMask');
        error.code = -32002;
        throw error;
      } else {
        // Other errors
        throw switchError;
      }
    }
  } catch (error) {
    console.error('Failed to switch network:', error);
    // Re-throw the original error with its code
    throw error;
  }
};

// Function to check if currently on Celo network
export const isCelo = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId === CELO_CONFIG.chainId;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// Get network configuration details for manual setup
export const getCeloNetworkDetails = () => {
  return {
    networkName: CELO_CONFIG.chainName,
    rpcUrl: CELO_CONFIG.rpcUrls[0],
    chainId: parseInt(CELO_CONFIG.chainId, 16), // Convert hex to decimal
    chainIdHex: CELO_CONFIG.chainId,
    currencySymbol: CELO_CONFIG.nativeCurrency.symbol,
    blockExplorer: CELO_CONFIG.blockExplorerUrls[0],
  };
};

// Legacy aliases for backwards compatibility
export const BASE_SEPOLIA_CONFIG = CELO_ALFAJORES_CONFIG;
export const switchToBaseSepolia = switchToCelo;
export const isBaseSepolia = isCelo;
export const getBaseSepoliaNetworkDetails = getCeloNetworkDetails;