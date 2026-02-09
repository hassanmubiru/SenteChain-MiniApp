#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone)]
pub struct FaucetClaim {
    pub last_claim: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenInfo,
    Balance(Address),
    Allowance { from: Address, spender: Address },
    TotalSupply,
    FaucetClaim(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct TokenInfo {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
}

const FAUCET_AMOUNT: i128 = 100_000_000; // 100 tokens (6 decimals)
const CLAIM_COOLDOWN: u64 = 86400; // 24 hours in seconds

#[contract]
pub struct SenteToken;

#[contractimpl]
impl SenteToken {
    /// Initialize the token contract
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        decimals: u32,
        initial_supply: i128,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        admin.require_auth();

        // Store admin
        env.storage().instance().set(&DataKey::Admin, &admin);

        // Store token info
        let token_info = TokenInfo {
            name,
            symbol,
            decimals,
        };
        env.storage().instance().set(&DataKey::TokenInfo, &token_info);

        // Set initial supply
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &initial_supply);

        // Give initial supply to admin
        env.storage()
            .instance()
            .set(&DataKey::Balance(admin.clone()), &initial_supply);
    }

    /// Get token name
    pub fn name(env: Env) -> String {
        let token_info: TokenInfo = env
            .storage()
            .instance()
            .get(&DataKey::TokenInfo)
            .expect("Token not initialized");
        token_info.name
    }

    /// Get token symbol
    pub fn symbol(env: Env) -> String {
        let token_info: TokenInfo = env
            .storage()
            .instance()
            .get(&DataKey::TokenInfo)
            .expect("Token not initialized");
        token_info.symbol
    }

    /// Get token decimals
    pub fn decimals(env: Env) -> u32 {
        let token_info: TokenInfo = env
            .storage()
            .instance()
            .get(&DataKey::TokenInfo)
            .expect("Token not initialized");
        token_info.decimals
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Get balance of an account
    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Balance(account))
            .unwrap_or(0)
    }

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount < 0 {
            panic!("Amount must be positive");
        }

        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("Insufficient balance");
        }

        // Deduct from sender
        env.storage()
            .instance()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        // Add to receiver
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));
    }

    /// Approve spender
    pub fn approve(env: Env, from: Address, spender: Address, amount: i128) {
        from.require_auth();

        env.storage().instance().set(
            &DataKey::Allowance {
                from: from.clone(),
                spender: spender.clone(),
            },
            &amount,
        );
    }

    /// Get allowance
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Allowance {
                from: from.clone(),
                spender: spender.clone(),
            })
            .unwrap_or(0)
    }

    /// Transfer from (for approved spending)
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        if amount < 0 {
            panic!("Amount must be positive");
        }

        // Check allowance
        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("Insufficient allowance");
        }

        // Check balance
        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("Insufficient balance");
        }

        // Update allowance
        env.storage().instance().set(
            &DataKey::Allowance {
                from: from.clone(),
                spender: spender.clone(),
            },
            &(allowance - amount),
        );

        // Deduct from sender
        env.storage()
            .instance()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        // Add to receiver
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));
    }

    /// Mint new tokens (admin only)
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set");
        admin.require_auth();

        if amount < 0 {
            panic!("Amount must be positive");
        }

        // Update total supply
        let total_supply = Self::total_supply(env.clone());
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply + amount));

        // Add to recipient
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));
    }

    /// Claim tokens from faucet (once per day)
    pub fn claim_faucet(env: Env, claimer: Address) {
        claimer.require_auth();

        let current_time = env.ledger().timestamp();

        // Check last claim time
        let last_claim: u64 = env
            .storage()
            .instance()
            .get(&DataKey::FaucetClaim(claimer.clone()))
            .unwrap_or(0);

        if current_time < last_claim + CLAIM_COOLDOWN {
            panic!("Please wait 24 hours between claims");
        }

        // Update claim time
        env.storage()
            .instance()
            .set(&DataKey::FaucetClaim(claimer.clone()), &current_time);

        // Mint faucet amount to claimer
        let claimer_balance = Self::balance(env.clone(), claimer.clone());
        env.storage().instance().set(
            &DataKey::Balance(claimer.clone()),
            &(claimer_balance + FAUCET_AMOUNT),
        );

        // Update total supply
        let total_supply = Self::total_supply(env.clone());
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply + FAUCET_AMOUNT));
    }

    /// Check if user can claim from faucet
    pub fn can_claim_faucet(env: Env, user: Address) -> bool {
        let current_time = env.ledger().timestamp();
        let last_claim: u64 = env
            .storage()
            .instance()
            .get(&DataKey::FaucetClaim(user))
            .unwrap_or(0);

        current_time >= last_claim + CLAIM_COOLDOWN
    }
}

#[cfg(test)]
mod test;
