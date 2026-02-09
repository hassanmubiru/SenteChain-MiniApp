import * as StellarSdk from '@stellar/stellar-sdk';
import contractsData from '../config/contracts.json';
import { STELLAR_CONFIG, signTransaction, getPublicKey } from './stellarConfig';

let server = null;
let sorobanServer = null;

// Initialize Stellar servers
export const initServers = () => {
    server = new StellarSdk.Horizon.Server(STELLAR_CONFIG.horizonUrl);
    sorobanServer = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
    return { server, sorobanServer };
};

// Get Stellar servers
export const getServers = () => {
    if (!server || !sorobanServer) {
        return initServers();
    }
    return { server, sorobanServer };
};

// Load account from Stellar network
export const loadAccount = async (publicKey) => {
    const { server } = getServers();
    try {
        const account = await server.loadAccount(publicKey);
        return account;
    } catch (error) {
        console.error('Error loading account:', error);
        throw new Error('Failed to load account. Make sure the account is funded.');
    }
};

// Get contract from address
export const getContract = (contractAddress) => {
    return new StellarSdk.Contract(contractAddress);
};

// Get token contract
export const getTokenContract = () => {
    if (!contractsData?.contracts?.SenteToken) {
        throw new Error('Token contract not deployed. Please deploy contracts first.');
    }
    return getContract(contractsData.contracts.SenteToken);
};

// Get vault contract
export const getVaultContract = () => {
    if (!contractsData?.contracts?.SenteVault) {
        throw new Error('Vault contract not deployed. Please deploy contracts first.');
    }
    return getContract(contractsData.contracts.SenteVault);
};

// Build and submit transaction
export const buildAndSubmitTransaction = async (operation, memo = null) => {
    try {
        const publicKey = await getPublicKey();
        const account = await loadAccount(publicKey);

        const txBuilder = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: STELLAR_CONFIG.networkPassphrase,
        });

        if (memo) {
            txBuilder.addMemo(StellarSdk.Memo.text(memo));
        }

        const transaction = txBuilder
            .addOperation(operation)
            .setTimeout(180)
            .build();

        // Sign with Freighter
        const signedXdr = await signTransaction(
            transaction.toXDR(),
            STELLAR_CONFIG.networkPassphrase
        );

        const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
            signedXdr,
            STELLAR_CONFIG.networkPassphrase
        );

        // Submit to network
        const { server } = getServers();
        const result = await server.submitTransaction(signedTransaction);

        return result;
    } catch (error) {
        console.error('Error building and submitting transaction:', error);
        throw error;
    }
};

// Invoke Soroban contract method
export const invokeContract = async (contract, method, params = []) => {
    try {
        const publicKey = await getPublicKey();
        const account = await loadAccount(publicKey);
        const { sorobanServer } = getServers();

        // Build contract call operation
        const operation = contract.call(method, ...params);

        // Build transaction
        const builtTransaction = new StellarSdk.TransactionBuilder(account, {
            fee: '100000', // Higher fee for Soroban
            networkPassphrase: STELLAR_CONFIG.networkPassphrase,
        })
            .addOperation(operation)
            .setTimeout(180)
            .build();

        // Simulate transaction
        const simulatedTx = await sorobanServer.simulateTransaction(builtTransaction);

        if (StellarSdk.SorobanRpc.Api.isSimulationError(simulatedTx)) {
            throw new Error(`Simulation failed: ${simulatedTx.error}`);
        }

        // Prepare transaction with simulation results
        const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(
            builtTransaction,
            simulatedTx
        ).build();

        // Sign with Freighter
        const signedXdr = await signTransaction(
            preparedTx.toXDR(),
            STELLAR_CONFIG.networkPassphrase
        );

        const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
            signedXdr,
            STELLAR_CONFIG.networkPassphrase
        );

        // Submit transaction
        const result = await sorobanServer.sendTransaction(signedTransaction);

        // Wait for confirmation
        if (result.status === 'PENDING') {
            let getResponse = await sorobanServer.getTransaction(result.hash);

            while (getResponse.status === 'NOT_FOUND') {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                getResponse = await sorobanServer.getTransaction(result.hash);
            }

            if (getResponse.status === 'SUCCESS') {
                return getResponse.returnValue;
            } else {
                throw new Error(`Transaction failed: ${getResponse.status}`);
            }
        }

        return result;
    } catch (error) {
        console.error('Error invoking contract:', error);
        throw error;
    }
};

// TOKEN CONTRACT FUNCTIONS

// Get token balance
export const getTokenBalance = async (address) => {
    try {
        const contract = getTokenContract();
        const addressParam = new StellarSdk.Address(address);

        const result = await invokeContract(contract, 'balance', [addressParam.toScVal()]);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error getting token balance:', error);
        return 0;
    }
};

// Get token name
export const getTokenName = async () => {
    try {
        const contract = getTokenContract();
        const result = await invokeContract(contract, 'name', []);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error getting token name:', error);
        return 'Unknown';
    }
};

// Get token symbol
export const getTokenSymbol = async () => {
    try {
        const contract = getTokenContract();
        const result = await invokeContract(contract, 'symbol', []);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error getting token symbol:', error);
        return 'UNK';
    }
};

// Transfer tokens
export const transferTokens = async (to, amount) => {
    try {
        const from = await getPublicKey();
        const contract = getTokenContract();

        const fromParam = new StellarSdk.Address(from).toScVal();
        const toParam = new StellarSdk.Address(to).toScVal();
        const amountParam = StellarSdk.nativeToScVal(amount, { type: 'i128' });

        await invokeContract(contract, 'transfer', [fromParam, toParam, amountParam]);
        return true;
    } catch (error) {
        console.error('Error transferring tokens:', error);
        throw error;
    }
};

// Approve spender
export const approveTokens = async (spender, amount) => {
    try {
        const from = await getPublicKey();
        const contract = getTokenContract();

        const fromParam = new StellarSdk.Address(from).toScVal();
        const spenderParam = new StellarSdk.Address(spender).toScVal();
        const amountParam = StellarSdk.nativeToScVal(amount, { type: 'i128' });

        await invokeContract(contract, 'approve', [fromParam, spenderParam, amountParam]);
        return true;
    } catch (error) {
        console.error('Error approving tokens:', error);
        throw error;
    }
};

// Claim from faucet
export const claimFaucet = async () => {
    try {
        const claimer = await getPublicKey();
        const contract = getTokenContract();

        const claimerParam = new StellarSdk.Address(claimer).toScVal();

        await invokeContract(contract, 'claim_faucet', [claimerParam]);
        return true;
    } catch (error) {
        console.error('Error claiming from faucet:', error);
        throw error;
    }
};

// Check if can claim faucet
export const canClaimFaucet = async (address) => {
    try {
        const contract = getTokenContract();
        const addressParam = new StellarSdk.Address(address).toScVal();

        const result = await invokeContract(contract, 'can_claim_faucet', [addressParam]);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error checking faucet claim:', error);
        return false;
    }
};

// VAULT CONTRACT FUNCTIONS

// Get vault balance
export const getVaultBalance = async (address) => {
    try {
        const contract = getVaultContract();
        const addressParam = new StellarSdk.Address(address).toScVal();

        const result = await invokeContract(contract, 'balance', [addressParam]);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error getting vault balance:', error);
        return 0;
    }
};

// Get savings balance
export const getSavingsBalance = async (address) => {
    try {
        const contract = getVaultContract();
        const addressParam = new StellarSdk.Address(address).toScVal();

        const result = await invokeContract(contract, 'savings_balance', [addressParam]);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error getting savings balance:', error);
        return 0;
    }
};

// Get total balance (vault + savings)
export const getTotalBalance = async (address) => {
    try {
        const contract = getVaultContract();
        const addressParam = new StellarSdk.Address(address).toScVal();

        const result = await invokeContract(contract, 'total_balance', [addressParam]);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error getting total balance:', error);
        return 0;
    }
};

// Deposit to vault
export const depositToVault = async (amount) => {
    try {
        const user = await getPublicKey();
        const contract = getVaultContract();

        const userParam = new StellarSdk.Address(user).toScVal();
        const amountParam = StellarSdk.nativeToScVal(amount, { type: 'i128' });

        await invokeContract(contract, 'deposit', [userParam, amountParam]);
        return true;
    } catch (error) {
        console.error('Error depositing to vault:', error);
        throw error;
    }
};

// Withdraw from vault
export const withdrawFromVault = async (amount) => {
    try {
        const user = await getPublicKey();
        const contract = getVaultContract();

        const userParam = new StellarSdk.Address(user).toScVal();
        const amountParam = StellarSdk.nativeToScVal(amount, { type: 'i128' });

        await invokeContract(contract, 'withdraw', [userParam, amountParam]);
        return true;
    } catch (error) {
        console.error('Error withdrawing from vault:', error);
        throw error;
    }
};

// Transfer within vault
export const vaultTransfer = async (to, amount) => {
    try {
        const from = await getPublicKey();
        const contract = getVaultContract();

        const fromParam = new StellarSdk.Address(from).toScVal();
        const toParam = new StellarSdk.Address(to).toScVal();
        const amountParam = StellarSdk.nativeToScVal(amount, { type: 'i128' });

        await invokeContract(contract, 'transfer', [fromParam, toParam, amountParam]);
        return true;
    } catch (error) {
        console.error('Error transferring in vault:', error);
        throw error;
    }
};

// Save to vault (lock tokens)
export const saveToVault = async (amount, lockDurationDays) => {
    try {
        const user = await getPublicKey();
        const contract = getVaultContract();

        const userParam = new StellarSdk.Address(user).toScVal();
        const amountParam = StellarSdk.nativeToScVal(amount, { type: 'i128' });
        const durationParam = StellarSdk.nativeToScVal(lockDurationDays, { type: 'u32' });

        await invokeContract(contract, 'save_to_vault', [userParam, amountParam, durationParam]);
        return true;
    } catch (error) {
        console.error('Error saving to vault:', error);
        throw error;
    }
};

// Withdraw from savings vault
export const withdrawFromSavingsVault = async (amount) => {
    try {
        const user = await getPublicKey();
        const contract = getVaultContract();

        const userParam = new StellarSdk.Address(user).toScVal();
        const amountParam = StellarSdk.nativeToScVal(amount, { type: 'i128' });

        await invokeContract(contract, 'withdraw_from_vault', [userParam, amountParam]);
        return true;
    } catch (error) {
        console.error('Error withdrawing from savings vault:', error);
        throw error;
    }
};

// Get unlock time
export const getUnlockTime = async (address) => {
    try {
        const contract = getVaultContract();
        const addressParam = new StellarSdk.Address(address).toScVal();

        const result = await invokeContract(contract, 'unlock_time', [addressParam]);
        return StellarSdk.scValToNative(result);
    } catch (error) {
        console.error('Error getting unlock time:', error);
        return 0;
    }
};

// Helper function to format amounts with decimals
export const formatAmount = (amount, decimals = 6) => {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
};

// Helper function to parse amounts to contract format
export const parseAmount = (amount, decimals = 6) => {
    return Math.floor(amount * Math.pow(10, decimals));
};
