# KALE Crisis Control 🚀

## Stellar Hackathon: KALE x Reflector Oracle Integration

**Coordinated DeFi Ecosystem Stability Through Decentralized Crisis Response**

KALE Crisis Control is an innovative mission-based DeFi protocol that leverages the power of **Stellar's KALE ecosystem** and **Reflector Oracle** to create an automated crisis response system. When market volatility threatens ecosystem stability, our protocol automatically deploys community-driven liquidity missions to restore balance.

---

## 🎯 Why KALE & Reflector Oracle Are Essential

### **KALE Integration**
- **Community-Driven Stability**: KALE tokens serve as the primary staking and reward mechanism
- **Decentralized Coordination**: Users stake KALE to participate in crisis response missions
- **Economic Incentives**: Reward pools distributed to successful mission participants
- **Ecosystem Health**: Direct contribution to Stellar DeFi stability through coordinated actions

### **Reflector Oracle Integration**
- **Real-Time Price Monitoring**: Continuous monitoring of asset prices for crisis detection
- **Automated Trigger System**: Smart contracts automatically create missions when price drops exceed thresholds
- **Multi-Asset Support**: Support for XLM, BTC, and other Stellar ecosystem tokens
- **Reliable Data Feed**: Enterprise-grade oracle infrastructure ensures accurate price data

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Frontend      │    │  Smart Contracts │    │  Reflector Oracle   │
│   (React/TS)    │◄──►│  (Soroban)       │◄──►│  (Price Feeds)      │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
         │                       │                        │
         │              ┌────────▼────────┐              │
         │              │ Mission Control │              │
         │              │   Controller    │              │
         │              └─────────────────┘              │
         │                       │                        │
         │              ┌────────▼────────┐              │
         └─────────────►│     KALE        │◄─────────────┘
                        │   Token Pool    │
                        └─────────────────┘
```

---

## 🚀 Deployed Contracts (Stellar Testnet)

```bash
Network: Stellar Testnet
Deployment Date: September 6, 2025

Mission Controller: CAYN6HSE7E6MH2PYKQ6VPRLOUUQVX735UUMM45Y76IJETJUWU6K67IOA
Reflector Reader:   CB2JLA7X5TE7KUC2CHSWUU2QJO6Q3HLVTD3BIK65HNE2NPHTS434VDCJ
KALE Token:         CD2F43R6Q2QYOCQGGWBDSC65YBCXPHJ5H4LZEYFGFGBFL65W3PPQUO34
Mock Oracle:        CD2F43R6Q2QYOCQGGWBDSC65YBCXPHJ5H4LZEYFGFGBFL65W3PPQUO34
Reflector Oracle:   CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63

Admin Address:      GCQBODNQY3G34VNETSXRSSWSSXPRCKSUE3OTTXRQCXXODZYUAYK7YYEW
```

---

## 🛠️ Tech Stack

### **Smart Contracts (Soroban)**
- **Language**: Rust
- **Framework**: Soroban SDK 23.0.2
- **Network**: Stellar Testnet
- **Oracle**: Reflector Protocol Integration

### **Frontend**
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts for price visualization
- **Wallet**: Stellar Wallets Kit (Freighter + xBull)
- **State Management**: Zustand

### **Infrastructure**
- **RPC**: Stellar Soroban RPC
- **Deployment**: Stellar CLI
- **Oracle**: Reflector Oracle Network

---

## 📋 Features

### **Automated Crisis Detection**
- Real-time price monitoring through Reflector Oracle
- Configurable threshold-based mission triggers
- Support for multiple assets (XLM, BTC, custom tokens)

### **Community-Driven Response**
- Stake KALE tokens to participate in missions
- Contribute liquidity to resolve crises
- Earn rewards based on participation and success

### **Mission Management**
- Automated mission creation based on market conditions
- Manual mission deployment by administrators
- Progress tracking and reward distribution

### **Dual-Mode Operation**
- **Live Mode**: Real blockchain transactions
- **Demo Mode**: Mock data for presentations and testing

---

## 🎮 How It Works

1. **Crisis Detection**: Reflector Oracle detects significant price drops
2. **Mission Creation**: Smart contract automatically creates emergency mission
3. **Community Response**: Users stake KALE and contribute liquidity
4. **Coordination**: Participants work together to meet liquidity targets
5. **Resolution**: Successful missions restore market stability
6. **Rewards**: Participants earn KALE rewards based on contribution

---

## 🔧 Smart Contract Documentation

### **Mission Controller Contract**

The core contract managing crisis response missions.

#### **Key Functions**

```rust
// Initialize the contract with admin and oracle addresses
pub fn initialize(
    env: Env, 
    admin: Address, 
    reflector_reader: Address, 
    kale_token: Address
)

// Automatically create mission when price threshold is exceeded
pub fn check_and_create_mission(env: Env, caller: Address) -> Option<u64>

// Manual mission creation by admin
pub fn create_mission(
    env: Env,
    caller: Address,
    target_liquidity: i128,
    reward_pool: i128,
    duration_hours: u64,
    trigger_price: i128
) -> u64

// User enlists in a mission by staking KALE
pub fn enlist(env: Env, user: Address, mission_id: u64, kale_amount: i128)

// Add liquidity contribution to mission
pub fn add_contribution(
    env: Env,
    user: Address,
    mission_id: u64,
    amount: i128,
    proof: Bytes
)

// Get mission details
pub fn get_mission(env: Env, mission_id: u64) -> Mission

// Get user's stake in a mission
pub fn get_user_stake(env: Env, user: Address, mission_id: u64) -> UserStake

// Get current price from Reflector Oracle
pub fn get_current_price(env: Env) -> PriceData
```

#### **Data Structures**

```rust
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

pub struct UserStake {
    pub user: Address,
    pub mission_id: u64,
    pub kale_staked: i128,
    pub contribution: i128,
    pub enlisted_at: u64,
}
```

### **Reflector Reader Contract**

Interface to Reflector Oracle for price data.

#### **Key Functions**

```rust
// Initialize with Reflector Oracle address
pub fn initialize(env: Env, reflector_oracle_address: Address)

// Get current XLM price
pub fn get_xlm_price(env: Env) -> PriceData

// Get price for any supported asset
pub fn get_price(env: Env, asset_symbol: Symbol) -> PriceData

// Check if price drop exceeds threshold
pub fn check_price_drop_threshold(
    env: Env, 
    asset_symbol: Symbol, 
    threshold_percent: u32
) -> bool

// Get cross-rate between two assets
pub fn get_cross_price(
    env: Env,
    base_asset_symbol: Symbol,
    quote_asset_symbol: Symbol
) -> PriceData

// Get historical price data
pub fn get_price_history(
    env: Env,
    from_timestamp: u64,
    to_timestamp: u64
) -> Vec<(u64, i128)>
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+
- Rust 1.70+
- Stellar CLI
- Freighter or xBull wallet

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-org/kale-crisis-control
cd kale-crisis-control

# Install frontend dependencies
cd kale-crisis-control-frontend
npm install

# Build smart contracts
cd ../contracts
cargo build --target wasm32-unknown-unknown --release
```

### **Deployment**

```bash
# Deploy contracts to Stellar Testnet
cd contracts
./deploy.sh

# Start frontend development server
cd ../kale-crisis-control-frontend
npm run dev
```

### **Usage**

1. **Connect Wallet**: Use Freighter or xBull wallet
2. **View Missions**: Browse active crisis response missions
3. **Stake KALE**: Enlist in missions by staking tokens
4. **Contribute**: Add liquidity to help resolve crises
5. **Earn Rewards**: Claim rewards from successful missions

---

## 🎯 Mission Types

### **Liquidity Crisis**
- **Trigger**: Significant price drops in major assets
- **Goal**: Restore liquidity to affected markets
- **Difficulty**: Critical
- **Duration**: 24-48 hours

### **Network Stability**
- **Trigger**: High network congestion or validator issues
- **Goal**: Maintain consensus and transaction throughput
- **Difficulty**: Hard
- **Duration**: 12-72 hours

### **Community Defense**
- **Trigger**: Coordinated attacks on ecosystem
- **Goal**: Defend key liquidity pools
- **Difficulty**: Medium-Hard
- **Duration**: 8-24 hours

---

## 📊 Metrics & Analytics

- **Real-time mission progress tracking**
- **Community participation metrics**
- **Ecosystem health indicators**
- **Reward distribution analytics**
- **Price trend visualization**

---

## 🛣️ Roadmap

### **Phase 1: Foundation** ✅
- [x] Core smart contracts
- [x] Reflector Oracle integration
- [x] Basic frontend interface
- [x] Testnet deployment

### **Phase 2: Enhancement** 🔄
- [ ] Advanced mission types
- [ ] Cross-chain integration
- [ ] Mobile app
- [ ] Governance features

### **Phase 3: Expansion** 📅
- [ ] Mainnet deployment
- [ ] Multi-oracle support
- [ ] Institution partnerships
- [ ] DeFi protocol integrations

### **Phase 4: Ecosystem** 🌟
- [ ] Third-party mission creators
- [ ] API for external systems
- [ ] Analytics dashboard
- [ ] Community governance DAO

---

## 🤝 Contributing

We welcome contributions from the Stellar community!

```bash
# Fork the repository
# Create feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m 'Add amazing feature'

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Hackathon Submission

**Stellar Hackathon: KALE x Reflector Oracle**

This project demonstrates the powerful synergy between KALE's community-driven ecosystem and Reflector Oracle's reliable price feeds. By combining real-time market data with coordinated community response, we create a new paradigm for DeFi stability.

### **Innovation Highlights**
- First automated crisis response system on Stellar
- Novel use of oracle data for community coordination
- Gamified approach to ecosystem stability
- Real-world utility with immediate impact potential

### **Technical Excellence**
- Production-ready Soroban smart contracts
- Modern React/TypeScript frontend
- Comprehensive testing and documentation
- Live testnet deployment

---

<div align="center">

*Coordinating the future of DeFi stability*

</div>
