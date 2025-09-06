#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Vec, Symbol};

// Import the Reflector Oracle interface
mod reflector {
    use soroban_sdk::{contracttype, Address, Symbol, Vec, Env};

    #[soroban_sdk::contractclient(name = "ReflectorClient")]
    pub trait Contract {
        fn base(env: Env) -> Asset;
        fn assets(env: Env) -> Vec<Asset>;
        fn decimals(env: Env) -> u32;
        fn lastprice(env: Env, asset: Asset) -> Option<PriceData>;
        fn x_last_price(env: Env, base_asset: Asset, quote_asset: Asset) -> Option<PriceData>;
        fn last_timestamp(env: Env) -> u64;
    }

    #[contracttype]
    #[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
    pub enum Asset {
        Stellar(Address),
        Other(Symbol),
    }

    #[contracttype]
    #[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
    pub struct PriceData {
        pub price: i128,
        pub timestamp: u64
    }
}

use reflector::{ReflectorClient, Asset as ReflectorAsset, PriceData};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    ReflectorOracle,
    LastPrice,
    PriceHistory(u64),
}

#[contract]
pub struct ReflectorReader;

#[contractimpl]
impl ReflectorReader {
    pub fn initialize(env: Env, reflector_oracle_address: Address) {
        env.storage().instance().set(&DataKey::ReflectorOracle, &reflector_oracle_address);
    }

    pub fn get_btc_price(env: Env) -> PriceData {
        let oracle_address: Address = match env.storage().instance().get(&DataKey::ReflectorOracle) {
            Some(addr) => addr,
            None => return PriceData { price: 0i128, timestamp: env.ledger().timestamp() }
        };
        
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        let btc_asset = ReflectorAsset::Other(Symbol::new(&env, "BTC"));

        let recent_price = reflector_client.lastprice(&btc_asset);

        match recent_price {
            Some(price_data) => {
                env.storage().persistent().set(&DataKey::LastPrice, &price_data);
                env.storage().persistent().set(
                    &DataKey::PriceHistory(price_data.timestamp),
                    &price_data.price,
                );
                price_data
            }
            None => PriceData {
                price: 0i128,
                timestamp: env.ledger().timestamp(),
            },
        }
    }

    // 🆕 NEW: XLM Price function for KALE Missions
    pub fn get_xlm_price(env: Env) -> PriceData {
        let oracle_address: Address = match env.storage().instance().get(&DataKey::ReflectorOracle) {
            Some(addr) => addr,
            None => return PriceData { price: 0i128, timestamp: env.ledger().timestamp() }
        };
        
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        let xlm_asset = ReflectorAsset::Other(Symbol::new(&env, "XLM"));

        match reflector_client.lastprice(&xlm_asset) {
            Some(price_data) => {
                env.storage().persistent().set(&DataKey::LastPrice, &price_data);
                env.storage().persistent().set(
                    &DataKey::PriceHistory(price_data.timestamp),
                    &price_data.price,
                );
                price_data
            }
            None => PriceData {
                price: 0i128,
                timestamp: env.ledger().timestamp(),
            },
        }
    }

    // 🆕 NEW: Generic price function (FIXES THE ERROR!)
    pub fn get_price(env: Env, asset_symbol: Symbol) -> PriceData {
        let oracle_address: Address = match env.storage().instance().get(&DataKey::ReflectorOracle) {
            Some(addr) => addr,
            None => return PriceData { price: 0i128, timestamp: env.ledger().timestamp() }
        };
        
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        let asset = ReflectorAsset::Other(asset_symbol);

        match reflector_client.lastprice(&asset) {
            Some(price_data) => {
                env.storage().persistent().set(&DataKey::LastPrice, &price_data);
                env.storage().persistent().set(
                    &DataKey::PriceHistory(price_data.timestamp),
                    &price_data.price,
                );
                price_data
            }
            None => PriceData {
                price: 0i128,
                timestamp: env.ledger().timestamp(),
            },
        }
    }

    // 🆕 NEW: Check price drop for any asset
    pub fn check_price_drop_threshold(env: Env, asset_symbol: Symbol, threshold_percent: u32) -> bool {
        let current_price_data = Self::get_price(env.clone(), asset_symbol);

        if current_price_data.price == 0 {
            return false;
        }

        let last_price_data: Option<PriceData> =
            env.storage().persistent().get(&DataKey::LastPrice);

        match last_price_data {
            Some(last_price) => {
                if last_price.price == 0 {
                    return false;
                }
                let price_drop_percentage =
                    ((last_price.price - current_price_data.price) * 100) / last_price.price;
                price_drop_percentage >= threshold_percent as i128
            }
            None => false,
        }
    }

    pub fn get_gbp_price(env: Env, forex_oracle_address: Address) -> PriceData {
        let reflector_client = ReflectorClient::new(&env, &forex_oracle_address);
        let gbp_asset = ReflectorAsset::Other(Symbol::new(&env, "GBP"));

        match reflector_client.lastprice(&gbp_asset) {
            Some(price_data) => price_data,
            None => PriceData {
                price: 0i128,
                timestamp: env.ledger().timestamp(),
            },
        }
    }

    pub fn get_cross_price(env: Env, base_asset_symbol: Symbol, quote_asset_symbol: Symbol) -> PriceData {
        let oracle_address: Address = match env.storage().instance().get(&DataKey::ReflectorOracle) {
            Some(addr) => addr,
            None => return PriceData { price: 0i128, timestamp: env.ledger().timestamp() }
        };
        
        let reflector_client = ReflectorClient::new(&env, &oracle_address);

        let base_asset = ReflectorAsset::Other(base_asset_symbol);
        let quote_asset = ReflectorAsset::Other(quote_asset_symbol);

        match reflector_client.x_last_price(&base_asset, &quote_asset) {
            Some(price_data) => price_data,
            None => PriceData {
                price: 0i128,
                timestamp: env.ledger().timestamp(),
            },
        }
    }

    pub fn chk_drop(env: Env, threshold_percentage: u32) -> bool {
        let current_price_data = Self::get_btc_price(env.clone());

        if current_price_data.price == 0 {
            return false;
        }

        let last_price_data: Option<PriceData> =
            env.storage().persistent().get(&DataKey::LastPrice);

        match last_price_data {
            Some(last_price) => {
                if last_price.price == 0 {
                    return false;
                }
                let price_drop_percentage =
                    ((last_price.price - current_price_data.price) * 100) / last_price.price;
                price_drop_percentage >= threshold_percentage as i128
            }
            None => false,
        }
    }

    pub fn get_oracle_decimals(env: Env) -> u32 {
        let oracle_address: Address = match env.storage().instance().get(&DataKey::ReflectorOracle) {
            Some(addr) => addr,
            None => return 0u32
        };
        
        let reflector_client = ReflectorClient::new(&env, &oracle_address);
        reflector_client.decimals()
    }

    pub fn get_price_history(env: Env, from_timestamp: u64, to_timestamp: u64) -> Vec<(u64, i128)> {
        let mut history = Vec::new(&env);

        let mut current_time = from_timestamp;
        while current_time <= to_timestamp {
            if let Some(price) =
                env.storage().persistent().get::<DataKey, i128>(&DataKey::PriceHistory(current_time))
            {
                history.push_back((current_time, price));
            }
            current_time += 300;
        }

        history
    }
}
