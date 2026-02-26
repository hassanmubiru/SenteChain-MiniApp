import { useState, useEffect } from 'react';
import {
  getUserBalance,
  getSavingsBalance,
  getUnlockTime,
  claimFaucet,
  canClaimFaucet,
  switchToCelo
} from '../utils/contract';
import toast from 'react-hot-toast';

export default function WalletCard({ userAddress, onBalanceUpdate }) {
  const [balance, setBalance] = useState('5.00'); // Demo balance - 5 sUSDT
  const [savingsBalance, setSavingsBalance] = useState('0');
  const [unlockTime, setUnlockTime] = useState(0);
  const [loading, setLoading] = useState(false); // Changed to false for demo
  const [claiming, setClaiming] = useState(false);

  // Load balances initially and set up auto-refresh
  useEffect(() => {
    if (userAddress) {
      loadBalances();

      // Set up automatic refresh every 10 seconds
      const refreshInterval = setInterval(loadBalances, 10000);

      // Listen for network changes
      if (window.ethereum) {
        window.ethereum.on('chainChanged', loadBalances);
        window.ethereum.on('accountsChanged', loadBalances);
      }

      // Cleanup
      return () => {
        clearInterval(refreshInterval);
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', loadBalances);
          window.ethereum.removeListener('accountsChanged', loadBalances);
        }
      };
    }
  }, [userAddress]);

  const loadBalances = async () => {
    try {
      // Only show loading on initial load
      if (balance === '0') {
        setLoading(true);
      }

      // Validate connection first
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      // Check if connected to correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xAEF3') { // Celo Alfajores
        // Don't auto-switch, just log it
        console.log('Not on Celo Alfajores network. Current chain:', chainId);
        // User can switch manually from settings
        return;
      }

      console.log('Fetching balances for:', userAddress);

      // Get all balances in parallel with cache busting
      const [bal, savBal, unlock] = await Promise.all([
        getUserBalance(userAddress),
        getSavingsBalance(userAddress),
        getUnlockTime(userAddress),
      ]);

      console.log('Fetched balances:', { balance: bal, savings: savBal, unlockTime: unlock });

      // Always update state with fresh values
      setBalance(bal);
      setSavingsBalance(savBal);
      setUnlockTime(unlock);

      if (onBalanceUpdate) {
        onBalanceUpdate(bal, savBal);
      }
    } catch (error) {
      console.error('Error loading balances:', error);

      // Don't show error toast for network-related issues (already handled above)
      if (!error.message?.includes('switch') && !error.message?.includes('network')) {
        toast.error(error.message || 'Failed to load balances');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFaucet = async () => {
    try {
      setClaiming(true);

      // Check if user can claim
      const canClaim = await canClaimFaucet(userAddress);
      if (!canClaim) {
        toast.error('Please wait 24 hours between claims');
        setClaiming(false);
        return;
      }

      toast.loading('Claiming 100 sUSDT from faucet...');

      const tx = await claimFaucet();

      toast.dismiss();
      toast.loading('Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await tx.wait();

      toast.dismiss();
      toast.success(
        <div>
          <p className="font-bold">🎉 Claimed 100 sUSDT!</p>
          <p className="text-xs mt-1">TX: {tx.hash.slice(0, 10)}...</p>
        </div>,
        { duration: 5000 }
      );

      console.log('Faucet claim confirmed:', receipt);

      // Trigger multiple balance refreshes
      loadBalances();
      setTimeout(() => {
        console.log('Refreshing balances after 1s...');
        loadBalances();
      }, 1000);
      setTimeout(() => {
        console.log('Final balance refresh after 3s...');
        loadBalances();
      }, 3000);
    } catch (error) {
      toast.dismiss();
      const errorMsg = error.message || error.reason || 'Unknown error';
      if (errorMsg.includes('24 hours')) {
        toast.error('Please wait 24 hours between claims');
      } else if (error.code === 4001) {
        toast.error('Transaction rejected');
      } else {
        toast.error('Failed to claim tokens: ' + errorMsg);
      }
      console.error('Faucet error:', error);
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const isLocked = unlockTime > Date.now() / 1000;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Wallet</h2>
        <button
          onClick={loadBalances}
          disabled={loading}
          className="text-primary hover:text-primary-dark"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 mb-4 text-white">
        <p className="text-sm opacity-90 mb-1">Available Balance</p>
        <p className="text-4xl font-bold mb-2">
          {loading ? '...' : parseFloat(balance).toFixed(2)} sUSDT
        </p>
        <p className="text-xs opacity-75">≈ ${loading ? '...' : parseFloat(balance).toFixed(2)} USD</p>
      </div>

      {/* Savings Balance */}
      <div className="bg-gradient-to-r from-accent to-yellow-500 rounded-lg p-4 mb-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-90 mb-1">Savings Vault</p>
            <p className="text-2xl font-bold">
              {loading ? '...' : parseFloat(savingsBalance).toFixed(2)} sUSDT
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Unlock Date</p>
            <p className="text-sm font-semibold">{formatDate(unlockTime)}</p>
            {isLocked && (
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded mt-1 inline-block">
                Locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Faucet Button */}
      <button
        onClick={handleClaimFaucet}
        disabled={claiming || loading}
        className="w-full btn-secondary text-sm"
      >
        {claiming ? 'Claiming...' : 'Claim 100 sUSDT (Testnet Faucet)'}
      </button>
    </div>
  );
}
