#!/bin/bash
set -e

echo "Deploying Mission Controller..."

# Build contract
cd contracts/mission-controller
soroban contract build

# Deploy
CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mission_controller.wasm \
  --source admin \
  --network testnet)

echo "Contract deployed: $CONTRACT_ID"

# Initialize contract
ADMIN_ADDRESS=$(soroban keys address admin)
ORACLE_ADDRESS=$ADMIN_ADDRESS # Using admin as oracle for demo

soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin \
  --network testnet \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --oracle $ORACLE_ADDRESS

echo "Contract initialized"
echo "CONTRACT_ID=$CONTRACT_ID" > ../../.env

cd ../..
