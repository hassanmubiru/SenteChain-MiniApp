const StellarSdk = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Stellar configuration
const NETWORK = process.env.STELLAR_NETWORK || 'testnet';
const HORIZON_URL = NETWORK === 'testnet'
    ? 'https://horizon-testnet.stellar.org'
    : 'https://horizon.stellar.org';
const SOROBAN_RPC_URL = NETWORK === 'testnet'
    ? 'https://soroban-testnet.stellar.org'
    : 'https://soroban-rpc.stellar.org';
const NETWORK_PASSPHRASE = NETWORK === 'testnet'
    ? StellarSdk.Networks.TESTNET
    : StellarSdk.Networks.PUBLIC;

console.log(`🚀 Starting deployment to Stellar ${NETWORK}...\n`);

// Check for secret key
if (!process.env.STELLAR_SECRET_KEY) {
    console.error('❌ Error: STELLAR_SECRET_KEY not found in environment variables');
    console.log('\n💡 To deploy contracts, you need to:');
    console.log('1. Create a .env file in the project root');
    console.log('2. Add your Stellar secret key: STELLAR_SECRET_KEY=S...');
    console.log('3. Make sure your account is funded (use Friendbot for testnet)\n');
    process.exit(1);
}

const deployerKeyPair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
const deployerPublicKey = deployerKeyPair.publicKey();

console.log('📝 Deploying with account:', deployerPublicKey);

const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const sorobanServer = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);

// Helper function to deploy a contract
async function deployContract(contractName, wasmPath) {
    try {
        console.log(`\n📦 Deploying ${contractName}...`);

        // Read the WASM file
        const wasmBuffer = fs.readFileSync(wasmPath);

        // Load deployer account
        const account = await server.loadAccount(deployerPublicKey);

        // Upload the contract code
        const uploadOperation = StellarSdk.Operation.uploadContractWasm({
            wasm: wasmBuffer,
        });

        const uploadTx = new StellarSdk.TransactionBuilder(account, {
            fee: '100000',
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(uploadOperation)
            .setTimeout(180)
            .build();

        uploadTx.sign(deployerKeyPair);

        console.log('   Uploading contract code...');
        const uploadResult = await sorobanServer.sendTransaction(uploadTx);

        // Wait for upload confirmation
        let getResponse = await sorobanServer.getTransaction(uploadResult.hash);
        while (getResponse.status === 'NOT_FOUND') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            getResponse = await sorobanServer.getTransaction(uploadResult.hash);
        }

        if (getResponse.status !== 'SUCCESS') {
            throw new Error(`Upload failed: ${getResponse.status}`);
        }

        // Extract wasm hash from result
        const wasmHash = getResponse.returnValue;
        console.log('   Contract code uploaded. Hash:', wasmHash.toString('hex'));

        // Deploy the contract instance
        const account2 = await server.loadAccount(deployerPublicKey);

        const deployOperation = StellarSdk.Operation.createContract({
            wasmHash: wasmHash,
            address: new StellarSdk.Address(deployerPublicKey),
        });

        const deployTx = new StellarSdk.TransactionBuilder(account2, {
            fee: '100000',
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(deployOperation)
            .setTimeout(180)
            .build();

        deployTx.sign(deployerKeyPair);

        console.log('   Creating contract instance...');
        const deployResult = await sorobanServer.sendTransaction(deployTx);

        // Wait for deployment confirmation
        let deployGetResponse = await sorobanServer.getTransaction(deployResult.hash);
        while (deployGetResponse.status === 'NOT_FOUND') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            deployGetResponse = await sorobanServer.getTransaction(deployResult.hash);
        }

        if (deployGetResponse.status !== 'SUCCESS') {
            throw new Error(`Deployment failed: ${deployGetResponse.status}`);
        }

        // Extract contract address
        const contractAddress = StellarSdk.StrKey.encodeContract(deployGetResponse.returnValue);
        console.log(`✅ ${contractName} deployed at:`, contractAddress);

        return contractAddress;
    } catch (error) {
        console.error(`❌ Error deploying ${contractName}:`, error.message);
        throw error;
    }
}

// Helper function to initialize a contract
async function initializeContract(contractAddress, method, params) {
    try {
        console.log(`   Initializing contract at ${contractAddress}...`);

        const account = await server.loadAccount(deployerPublicKey);
        const contract = new StellarSdk.Contract(contractAddress);

        const operation = contract.call(method, ...params);

        const tx = new StellarSdk.TransactionBuilder(account, {
            fee: '100000',
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(operation)
            .setTimeout(180)
            .build();

        // Simulate first
        const simulatedTx = await sorobanServer.simulateTransaction(tx);

        if (StellarSdk.SorobanRpc.Api.isSimulationError(simulatedTx)) {
            throw new Error(`Simulation failed: ${simulatedTx.error}`);
        }

        // Assemble and sign
        const preparedTx = StellarSdk.SorobanRpc.assembleTransaction(tx, simulatedTx).build();
        preparedTx.sign(deployerKeyPair);

        // Submit
        const result = await sorobanServer.sendTransaction(preparedTx);

        // Wait for confirmation
        let getResponse = await sorobanServer.getTransaction(result.hash);
        while (getResponse.status === 'NOT_FOUND') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            getResponse = await sorobanServer.getTransaction(result.hash);
        }

        if (getResponse.status !== 'SUCCESS') {
            throw new Error(`Initialization failed: ${getResponse.status}`);
        }

        console.log('   ✅ Contract initialized');
    } catch (error) {
        console.error('   ❌ Error initializing contract:', error.message);
        throw error;
    }
}

// Main deployment function
async function main() {
    try {
        // Check if account is funded
        try {
            const account = await server.loadAccount(deployerPublicKey);
            const balance = account.balances.find((b) => b.asset_type === 'native');
            console.log('💰 Account balance:', balance.balance, 'XLM\n');

            if (parseFloat(balance.balance) < 10) {
                console.warn('⚠️  Warning: Account balance is low. You need XLM for transaction fees.');
                if (NETWORK === 'testnet') {
                    console.log('💡 Fund your account at: https://friendbot.stellar.org/?addr=' + deployerPublicKey);
                }
            }
        } catch (error) {
            if (NETWORK === 'testnet') {
                console.log('Account not found. Funding via Friendbot...');
                const response = await fetch(`https://friendbot.stellar.org/?addr=${deployerPublicKey}`);
                if (response.ok) {
                    console.log('✅ Account funded successfully\n');
                } else {
                    throw new Error('Failed to fund account via Friendbot');
                }
            } else {
                throw new Error('Account not found. Please fund your account first.');
            }
        }

        const buildDir = path.join(__dirname, '../soroban_build');

        // Deploy SenteToken
        const tokenWasm = path.join(buildDir, 'sente_token.wasm');
        if (!fs.existsSync(tokenWasm)) {
            throw new Error('Token WASM file not found. Run: npm run build:soroban');
        }

        const tokenAddress = await deployContract('SenteToken', tokenWasm);

        // Initialize SenteToken
        const adminAddress = new StellarSdk.Address(deployerPublicKey);
        const tokenName = StellarSdk.nativeToScVal('Sente USD', { type: 'string' });
        const tokenSymbol = StellarSdk.nativeToScVal('sUSDT', { type: 'string' });
        const decimals = StellarSdk.nativeToScVal(6, { type: 'u32' });
        const initialSupply = StellarSdk.nativeToScVal(1000000000000, { type: 'i128' }); // 1M tokens with 6 decimals

        await initializeContract(
            tokenAddress,
            'initialize',
            [adminAddress.toScVal(), tokenName, tokenSymbol, decimals, initialSupply]
        );

        // Deploy SenteVault
        const vaultWasm = path.join(buildDir, 'sente_vault.wasm');
        if (!fs.existsSync(vaultWasm)) {
            throw new Error('Vault WASM file not found. Run: npm run build:soroban');
        }

        const vaultAddress = await deployContract('SenteVault', vaultWasm);

        // Initialize SenteVault
        const tokenContractAddress = new StellarSdk.Address(tokenAddress);
        await initializeContract(
            vaultAddress,
            'initialize',
            [adminAddress.toScVal(), tokenContractAddress.toScVal()]
        );

        // Save deployment info
        const deploymentInfo = {
            network: NETWORK,
            networkPassphrase: NETWORK_PASSPHRASE,
            horizonUrl: HORIZON_URL,
            sorobanRpcUrl: SOROBAN_RPC_URL,
            deployer: deployerPublicKey,
            contracts: {
                SenteToken: tokenAddress,
                SenteVault: vaultAddress,
            },
            timestamp: new Date().toISOString(),
        };

        // Save to frontend config
        const configPath = path.join(__dirname, '../frontend/config/contracts.json');
        const configDir = path.dirname(configPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify(deploymentInfo, null, 2));

        console.log('\n📄 Deployment info saved to frontend/config/contracts.json');
        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   Network:', NETWORK);
        console.log('   SenteToken:', tokenAddress);
        console.log('   SenteVault:', vaultAddress);
        console.log('\n💡 Next steps:');
        console.log('   1. Install Freighter wallet: https://freighter.app');
        console.log('   2. Import your account to Freighter');
        console.log('   3. Start the frontend application: npm run dev:frontend');
    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    }
}

main();
