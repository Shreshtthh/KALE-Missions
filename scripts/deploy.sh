#!/bin/bash

# KALE Missions Deployment Script with Real Reflector Integration

set -e

echo "🚀 Deploying KALE Missions with Real Reflector Integration..."

# Configuration
NETWORK="testnet"
DEPLOYER="admin"   # use admin instead of default
# External CEX/DEX Oracle for global XLM prices
REFLECTOR_CONTRACT_ID="CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check tools
command -v stellar >/dev/null 2>&1 || { echo -e "${RED}Error: stellar CLI not installed${NC}"; exit 1; }
echo -e "${GREEN}✓ Stellar CLI found${NC}"

# 🔨 Building contracts...
echo "🔨 Building contracts..."

stellar contract build --package reflector-reader
stellar contract build --package mission-controller
stellar contract build --package mock-oracle

echo -e "${GREEN}✓ Contracts built successfully${NC}"

# Deploy Mock Oracle
echo "📦 Deploying Mock Oracle..."
MOCK_ORACLE_WASM="target/wasm32v1-none/release/mock_oracle.wasm"
MOCK_ORACLE_ID=$(stellar contract deploy \
    --wasm $MOCK_ORACLE_WASM \
    --network $NETWORK \
    --source-account $DEPLOYER)

# Initialize Mock Oracle
ADMIN_ADDRESS=$(stellar keys address $DEPLOYER)
stellar contract invoke \
    --id $MOCK_ORACLE_ID \
    --network $NETWORK \
    --source-account $DEPLOYER \
    -- initialize \
    --admin "$ADMIN_ADDRESS"
echo -e "${GREEN}✓ Mock Oracle initialized${NC}"

# Use Mock Oracle as KALE Token placeholder
KALE_TOKEN_ID=$MOCK_ORACLE_ID
echo -e "${GREEN}✓ Using Mock Oracle as KALE Token: $KALE_TOKEN_ID${NC}"

# Deploy Reflector Reader
echo "📦 Deploying Reflector Reader..."
REFLECTOR_READER_WASM="target/wasm32v1-none/release/reflector_reader.wasm"
REFLECTOR_READER_ID=$(stellar contract deploy \
    --wasm $REFLECTOR_READER_WASM \
    --network $NETWORK \
    --source-account $DEPLOYER)

# Initialize Reflector Reader
echo "⚙️  Initializing Reflector Reader..."
stellar contract invoke \
    --id $REFLECTOR_READER_ID \
    --network $NETWORK \
    --source-account $DEPLOYER \
    -- initialize \
    --reflector_oracle_address "$REFLECTOR_CONTRACT_ID"
echo -e "${GREEN}✓ Reflector Reader initialized${NC}"

# Deploy Mission Controller
echo "📦 Deploying Mission Controller..."
MISSION_CONTROLLER_WASM="target/wasm32v1-none/release/mission_controller.wasm"
MISSION_CONTROLLER_ID=$(stellar contract deploy \
    --wasm $MISSION_CONTROLLER_WASM \
    --network $NETWORK \
    --source-account $DEPLOYER)

# Initialize Mission Controller
echo "⚙️  Initializing Mission Controller..."
stellar contract invoke \
    --id $MISSION_CONTROLLER_ID \
    --network $NETWORK \
    --source-account $DEPLOYER \
    -- initialize \
    --admin "$ADMIN_ADDRESS" \
    --reflector_reader "$REFLECTOR_READER_ID" \
    --kale_token "$KALE_TOKEN_ID"
echo -e "${GREEN}✓ Mission Controller initialized${NC}"

# Create export script for easy testing
cat > export-contracts.sh << EOF
#!/bin/bash
export MOCK_ORACLE_ID="$MOCK_ORACLE_ID"
export KALE_TOKEN_ID="$KALE_TOKEN_ID"
export REFLECTOR_READER_ID="$REFLECTOR_READER_ID"
export MISSION_CONTROLLER_ID="$MISSION_CONTROLLER_ID"
export ADMIN_ADDRESS="$ADMIN_ADDRESS"
echo "✅ Contract addresses exported!"
echo "MOCK_ORACLE_ID: \$MOCK_ORACLE_ID"
echo "MISSION_CONTROLLER_ID: \$MISSION_CONTROLLER_ID"
EOF
chmod +x export-contracts.sh

# Frontend .env
echo "📝 Writing frontend/.env..."
mkdir -p frontend
cat > frontend/.env << EOF
REACT_APP_NETWORK=$NETWORK
REACT_APP_MISSION_CONTROLLER_ID=$MISSION_CONTROLLER_ID
REACT_APP_REFLECTOR_READER_ID=$REFLECTOR_READER_ID
REACT_APP_REFLECTOR_CONTRACT_ID=$REFLECTOR_CONTRACT_ID
REACT_APP_MOCK_ORACLE_ID=$MOCK_ORACLE_ID
REACT_APP_KALE_TOKEN_ID=$KALE_TOKEN_ID
REACT_APP_ADMIN_ADDRESS=$ADMIN_ADDRESS
EOF
echo -e "${GREEN}✓ frontend/.env created${NC}"

# Test integration
echo "🧪 Testing Integration..."

echo "Testing Mock Oracle XLM price..."
stellar contract invoke \
    --id $MOCK_ORACLE_ID \
    --network $NETWORK \
    --source-account $DEPLOYER \
    -- get_price \
    --asset "XLM" || echo -e "${YELLOW}⚠️ Mock Oracle test failed${NC}"

echo "Testing Reflector Reader BTC price..."
stellar contract invoke \
    --id $REFLECTOR_READER_ID \
    --network $NETWORK \
    --source-account $DEPLOYER \
    -- get_btc_price || echo -e "${YELLOW}⚠️ Reflector Reader test failed${NC}"

echo "Testing Mission Controller current price..."
stellar contract invoke \
    --id $MISSION_CONTROLLER_ID \
    --network $NETWORK \
    --source-account $DEPLOYER \
    -- get_current_price || echo -e "${YELLOW}⚠️ Mission Controller test failed${NC}"

# Save deployment info
cat > deployment-info.txt << EOF
Network: $NETWORK
Timestamp: $(date)
Mock Oracle: $MOCK_ORACLE_ID
KALE Token: $KALE_TOKEN_ID
Reflector Reader: $REFLECTOR_READER_ID
Mission Controller: $MISSION_CONTROLLER_ID
Reflector Oracle: $REFLECTOR_CONTRACT_ID
Admin Address: $ADMIN_ADDRESS
EOF
echo -e "${GREEN}✓ Deployment info saved${NC}"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📋 Check deployment-info.txt for all contract addresses${NC}"
echo -e "${GREEN}🔧 Run '. ./export-contracts.sh' to load addresses for testing${NC}"
