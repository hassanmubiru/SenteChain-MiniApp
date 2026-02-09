const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Soroban Smart Contracts...\n');

const contracts = ['sente_token', 'sente_vault'];
const contractsDir = path.join(__dirname, '../soroban_contracts');
const buildDir = path.join(__dirname, '../soroban_build');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Check if Rust and Soroban CLI are installed
try {
    execSync('cargo --version', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Rust is not installed. Please install Rust from https://rustup.rs/');
    process.exit(1);
}

try {
    execSync('soroban --version', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Soroban CLI is not installed.');
    console.error('Install it with: cargo install --locked soroban-cli');
    process.exit(1);
}

// Build each contract
contracts.forEach((contract) => {
    console.log(`\n📦 Building ${contract}...`);
    const contractPath = path.join(contractsDir, contract);

    try {
        // Build the contract
        execSync('cargo build --target wasm32-unknown-unknown --release', {
            cwd: contractPath,
            stdio: 'inherit',
        });

        // Optimize the wasm file
        const wasmSource = path.join(
            contractPath,
            'target/wasm32-unknown-unknown/release',
            `${contract.replace('-', '_')}.wasm`
        );

        const wasmDest = path.join(buildDir, `${contract}.wasm`);

        // Optimize using soroban CLI
        console.log(`🔧 Optimizing ${contract}...`);
        execSync(`soroban contract optimize --wasm ${wasmSource} --wasm-out ${wasmDest}`, {
            stdio: 'inherit',
        });

        console.log(`✅ ${contract} built and optimized successfully`);
        console.log(`   Output: ${wasmDest}`);
    } catch (error) {
        console.error(`❌ Failed to build ${contract}:`, error.message);
        process.exit(1);
    }
});

console.log('\n🎉 All contracts built successfully!');
console.log(`📁 Build output directory: ${buildDir}\n`);
