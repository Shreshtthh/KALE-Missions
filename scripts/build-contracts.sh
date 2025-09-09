#!/bin/bash

# Clean Build Script for KALE Missions Contracts
# Ensures proper WASM compilation for Soroban

set -e

echo "🧹 Cleaning previous builds..."
cargo clean

echo "🔨 Building contracts with optimized settings..."

# Build each contract individually
for contract in mission-controller reflector-reader mock-oracle; do
    echo "Building $contract..."
    cd contracts/$contract
    
    # Ensure we have the right target
    rustup target add wasm32-unknown-unknown
    
    # Build with release profile
    cargo build --target wasm32-unknown-unknown --release
    
    # Check if WASM was generated
    if [ -f "target/wasm32-unknown-unknown/release/${contract//-/_}.wasm" ]; then
        echo "✅ $contract built successfully"
    else
        echo "❌ $contract build failed"
        exit 1
    fi
    
    cd ../..
done

echo "🎉 All contracts built successfully!"

# List the generated WASM files
echo "Generated WASM files:"
find contracts -name "*.wasm" -type f | sort
