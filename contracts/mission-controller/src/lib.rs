#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Bytes, Symbol, symbol_short, vec, IntoVal};
use soroban_sdk::token::Client;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Mission {
    pub id: u64,
    pub target_liquidity: i128,
    pub current_progress: i128,
    pub reward_pool: i128, 
    pub deadline: u64,
    pub active: bool,
    pub trigger_price: i128,
    pub participants_count: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserStake {
    pub user: Address,
    pub mission_id: u64,
    pub kale_staked: i128,
    pub contribution: i128,
    pub enlisted_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceData {
    pub price: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    MissionCounter,
    Mission(u64),
    UserStake(Address, u64),
    ReflectorReader,
    PriceThreshold,
    KaleToken,
}

#[contract]
pub struct MissionController;

#[contractimpl]
impl MissionController {
    pub fn initialize(env: Env, admin: Address, reflector_reader: Address, kale_token: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ReflectorReader, &reflector_reader);
        env.storage().instance().set(&DataKey::KaleToken, &kale_token);
        env.storage().instance().set(&DataKey::MissionCounter, &0u64);
        env.storage().instance().set(&DataKey::PriceThreshold, &15u32);
    }

    pub fn check_and_create_mission(env: Env, caller: Address) -> Option<u64> {
        caller.require_auth();

        let threshold: u32 = env.storage().instance().get(&DataKey::PriceThreshold).unwrap_or(15);
        let reflector: Address = env.storage().instance().get(&DataKey::ReflectorReader).unwrap();

        // Fixed: Use into_val() without unwrap since it doesn't return Result
        let args = vec![&env, threshold.into_val(&env)];
        let exceeded: bool = env.invoke_contract(&reflector, &symbol_short!("chk_drop"), args);

        if !exceeded {
            return None;
        }

        // Fixed: Use into_val() without unwrap for Symbol conversion
        let xlm_symbol = Symbol::new(&env, "XLM");
        let args = vec![&env, xlm_symbol.into_val(&env)];
        let current_price: PriceData = env.invoke_contract(&reflector, &symbol_short!("get_price"), args);

        let mut counter: u64 = env.storage().instance().get(&DataKey::MissionCounter).unwrap_or(0);
        counter += 1;

        let mission = Mission {
            id: counter,
            target_liquidity: 100_000_000_000,
            current_progress: 0,
            reward_pool: 50_000_000_000,
            deadline: env.ledger().timestamp() + 24 * 3600,
            active: true,
            trigger_price: current_price.price,
            participants_count: 0,
        };

        env.storage().persistent().set(&DataKey::Mission(counter), &mission);
        env.storage().instance().set(&DataKey::MissionCounter, &counter);

        Some(counter)
    }

    pub fn create_mission(env: Env, caller: Address, target_liquidity: i128, reward_pool: i128, duration_hours: u64, trigger_price: i128) -> u64 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("Unauthorized");
        }

        caller.require_auth();

        let mut counter: u64 = env.storage().instance().get(&DataKey::MissionCounter).unwrap_or(0);
        counter += 1;

        let mission = Mission {
            id: counter,
            target_liquidity,
            current_progress: 0,
            reward_pool,
            deadline: env.ledger().timestamp() + duration_hours * 3600,
            active: true,
            trigger_price,
            participants_count: 0,
        };

        env.storage().persistent().set(&DataKey::Mission(counter), &mission);
        env.storage().instance().set(&DataKey::MissionCounter, &counter);

        counter
    }

    pub fn enlist(env: Env, user: Address, mission_id: u64, kale_amount: i128) {
        user.require_auth();

        let kale_token: Address = env.storage().instance().get(&DataKey::KaleToken).unwrap();
        let client = Client::new(&env, &kale_token);

        client.transfer(&user, &env.current_contract_address(), &kale_amount);

        let mut mission: Mission = env.storage().persistent().get(&DataKey::Mission(mission_id)).unwrap();

        if !mission.active {
            panic!("Mission inactive");
        }

        if env.ledger().timestamp() > mission.deadline {
            panic!("Mission expired");
        }

        let existing: Option<UserStake> = env.storage().persistent().get(&DataKey::UserStake(user.clone(), mission_id));
        if existing.is_some() {
            panic!("User already enlisted");
        }

        let stake = UserStake {
            user: user.clone(),
            mission_id,
            kale_staked: kale_amount,
            contribution: 0,
            enlisted_at: env.ledger().timestamp(),
        };

        mission.participants_count += 1;

        env.storage().persistent().set(&DataKey::UserStake(user, mission_id), &stake);
        env.storage().persistent().set(&DataKey::Mission(mission_id), &mission);
    }

    pub fn add_contribution(env: Env, user: Address, mission_id: u64, amount: i128, _proof: Bytes) {
        user.require_auth();

        // TODO: Validate proof

        let mut mission: Mission = env.storage().persistent().get(&DataKey::Mission(mission_id)).unwrap();
        let mut stake: UserStake = env.storage().persistent().get(&DataKey::UserStake(user.clone(), mission_id)).unwrap();

        if !mission.active {
            panic!("Mission inactive");
        }

        mission.current_progress += amount;
        stake.contribution += amount;

        env.storage().persistent().set(&DataKey::Mission(mission_id), &mission);
        env.storage().persistent().set(&DataKey::UserStake(user, mission_id), &stake);

        if mission.current_progress >= mission.target_liquidity {
            Self::complete_mission(&env, mission_id);
        }
    }

    fn complete_mission(env: &Env, mission_id: u64) {
        let mut mission: Mission = env.storage().persistent().get(&DataKey::Mission(mission_id)).unwrap();
        mission.active = false;
        env.storage().persistent().set(&DataKey::Mission(mission_id), &mission);

        // TODO: Distribute rewards
    }

    pub fn get_mission(env: Env, mission_id: u64) -> Mission {
        env.storage().persistent().get(&DataKey::Mission(mission_id)).unwrap()
    }

    pub fn get_user_stake(env: Env, user: Address, mission_id: u64) -> UserStake {
        env.storage().persistent().get(&DataKey::UserStake(user, mission_id)).unwrap()
    }

    // Fixed: Use into_val() consistently for Symbol to Val conversion
    pub fn get_current_price(env: Env) -> PriceData {
        let reflector_reader: Address = env.storage().instance().get(&DataKey::ReflectorReader).unwrap();
        let xlm_symbol = Symbol::new(&env, "XLM");
        let args = vec![&env, xlm_symbol.into_val(&env)];
        env.invoke_contract(&reflector_reader, &symbol_short!("get_price"), args)
    }
}
