#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceData {
    pub asset: String,
    pub price: i128, // Price in micro units (e.g., $0.12 = 120000)
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Price(String), // asset symbol -> PriceData
}

#[contract]
pub struct MockOracle;

#[contractimpl]
impl MockOracle {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        
        // Initialize XLM price at $0.12
        let xlm_price = PriceData {
            asset: String::from_str(&env, "XLM"),
            price: 120_000, // $0.12 in micro units
            timestamp: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&DataKey::Price(String::from_str(&env, "XLM")), &xlm_price);
    }

    pub fn update_price(env: Env, admin: Address, asset: String, new_price: i128) {
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic!("Only admin can update prices");
        }
        admin.require_auth();

        let price_data = PriceData {
            asset: asset.clone(),
            price: new_price,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Price(asset), &price_data);
    }

    pub fn get_price(env: Env, asset: String) -> PriceData {
        env.storage().persistent().get(&DataKey::Price(asset)).unwrap()
    }

    pub fn simulate_price_drop(env: Env, admin: Address, asset: String, drop_percentage: u32) -> i128 {
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic!("Only admin can simulate price drops");
        }
        admin.require_auth();

        let current_price: PriceData = env.storage().persistent().get(&DataKey::Price(asset.clone())).unwrap();
        let new_price = current_price.price * (100 - drop_percentage as i128) / 100;

        let updated_price = PriceData {
            asset: asset.clone(),
            price: new_price,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Price(asset), &updated_price);
        new_price
    }
}
