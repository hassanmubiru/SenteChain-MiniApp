#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    Balance(Address),
    SavingsBalance(Address),
    UnlockTime(Address),
}

const DAY_IN_LEDGERS: u64 = 17280; // Approximately 1 day (assuming 5 sec/ledger)
const YEAR_IN_LEDGERS: u64 = 6307200; // Approximately 365 days

#[contract]
pub struct SenteVault;

#[contractimpl]
impl SenteVault {
    /// Initialize the vault contract
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        admin.require_auth();

        // Store admin
        env.storage().instance().set(&DataKey::Admin, &admin);

        // Store token contract address
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
    }

    /// Get token contract address
    pub fn token_contract(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::TokenContract)
            .expect("Vault not initialized")
    }

    /// Get balance of user in vault
    pub fn balance(env: Env, user: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Balance(user))
            .unwrap_or(0)
    }

    /// Get savings balance of user
    pub fn savings_balance(env: Env, user: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::SavingsBalance(user))
            .unwrap_or(0)
    }

    /// Get unlock time for user's savings
    pub fn unlock_time(env: Env, user: Address) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::UnlockTime(user))
            .unwrap_or(0)
    }

    /// Deposit tokens into the vault
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than 0");
        }

        let token_contract: Address = Self::token_contract(env.clone());

        // Transfer tokens from user to vault using token contract
        // In Soroban, we call the token contract's transfer_from function
        let transfer_args = (user.clone(), env.current_contract_address(), amount);
        env.invoke_contract::<()>(&token_contract, &soroban_sdk::symbol_short!("transfer"), transfer_args);

        // Update user balance in vault
        let current_balance = Self::balance(env.clone(), user.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(user.clone()), &(current_balance + amount));

        // Emit event
        env.events().publish(
            (soroban_sdk::symbol_short!("deposit"), user),
            amount,
        );
    }

    /// Withdraw tokens from the vault
    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than 0");
        }

        let current_balance = Self::balance(env.clone(), user.clone());
        if current_balance < amount {
            panic!("Insufficient balance");
        }

        // Update balance
        env.storage()
            .instance()
            .set(&DataKey::Balance(user.clone()), &(current_balance - amount));

        let token_contract: Address = Self::token_contract(env.clone());

        // Transfer tokens from vault to user
        let transfer_args = (env.current_contract_address(), user.clone(), amount);
        env.invoke_contract::<()>(&token_contract, &soroban_sdk::symbol_short!("transfer"), transfer_args);

        // Emit event
        env.events().publish(
            (soroban_sdk::symbol_short!("withdraw"), user),
            amount,
        );
    }

    /// Transfer tokens to another user within the vault
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than 0");
        }

        let from_balance = Self::balance(env.clone(), from.clone());
        if from_balance < amount {
            panic!("Insufficient balance");
        }

        // Update balances
        env.storage()
            .instance()
            .set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        // Emit event
        env.events().publish(
            (soroban_sdk::symbol_short!("transfer"), from, to),
            amount,
        );
    }

    /// Lock tokens in savings vault
    pub fn save_to_vault(env: Env, user: Address, amount: i128, lock_duration_days: u32) {
        user.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than 0");
        }

        if lock_duration_days < 1 || lock_duration_days > 365 {
            panic!("Lock duration must be between 1 and 365 days");
        }

        let user_balance = Self::balance(env.clone(), user.clone());
        if user_balance < amount {
            panic!("Insufficient balance");
        }

        // Calculate unlock time in ledgers
        let lock_duration_ledgers = (lock_duration_days as u64) * DAY_IN_LEDGERS;
        let current_ledger = env.ledger().sequence();
        let unlock_ledger = current_ledger + lock_duration_ledgers;

        // Update balances
        env.storage()
            .instance()
            .set(&DataKey::Balance(user.clone()), &(user_balance - amount));

        let savings_balance = Self::savings_balance(env.clone(), user.clone());
        env.storage()
            .instance()
            .set(&DataKey::SavingsBalance(user.clone()), &(savings_balance + amount));

        // Set unlock time
        env.storage()
            .instance()
            .set(&DataKey::UnlockTime(user.clone()), &unlock_ledger);

        // Emit event
        env.events().publish(
            (soroban_sdk::symbol_short!("save"), user),
            (amount, unlock_ledger),
        );
    }

    /// Withdraw tokens from savings vault (only after unlock time)
    pub fn withdraw_from_vault(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than 0");
        }

        let savings_balance = Self::savings_balance(env.clone(), user.clone());
        if savings_balance < amount {
            panic!("Insufficient savings balance");
        }

        let unlock_time = Self::unlock_time(env.clone(), user.clone());
        let current_ledger = env.ledger().sequence();

        if current_ledger < unlock_time {
            panic!("Tokens are still locked");
        }

        // Update balances
        env.storage()
            .instance()
            .set(&DataKey::SavingsBalance(user.clone()), &(savings_balance - amount));

        let user_balance = Self::balance(env.clone(), user.clone());
        env.storage()
            .instance()
            .set(&DataKey::Balance(user.clone()), &(user_balance + amount));

        // Emit event
        env.events().publish(
            (soroban_sdk::symbol_short!("unsave"), user),
            amount,
        );
    }

    /// Get total balance (balance + savings)
    pub fn total_balance(env: Env, user: Address) -> i128 {
        let balance = Self::balance(env.clone(), user.clone());
        let savings = Self::savings_balance(env.clone(), user.clone());
        balance + savings
    }
}

#[cfg(test)]
mod test;
