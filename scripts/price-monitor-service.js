#!/usr/bin/env node

// KALE Missions Price Monitor Service
// Monitors XLM price via Reflector and automatically creates missions on significant drops

const { Contract, SorobanRpc, Keypair, TransactionBuilder, Networks, Operation } = require('@stellar/stellar-sdk');
const fs = require('fs');

class PriceMonitor {
    constructor() {
        this.network = import.meta.env.REACT_APP_NETWORK || 'testnet';
        this.missionControllerId = import.meta.env.REACT_APP_MISSION_CONTROLLER_ID;
        this.reflectorReaderId = import.meta.env.REACT_APP_REFLECTOR_READER_ID;
        this.adminSecret = import.meta.env.ADMIN_SECRET_KEY; // Load from secure source

        this.server = new SorobanRpc.Server(
            this.network === 'testnet'
                ? 'https://soroban-testnet.stellar.org:443'
                : 'https://soroban-rpc.mainnet.stellar.org:443'
        );

        this.missionContract = new Contract(this.missionControllerId);
        this.reflectorReaderContract = new Contract(this.reflectorReaderId);

        this.priceHistory = [];
        this.monitoringInterval = 30000; // 30 seconds
        this.priceDropThreshold = 15; // 15%
        this.isRunning = false;
    }

    async initialize() {
        console.log('🚀 Initializing KALE Missions Price Monitor...');

        if (!this.adminSecret) {
            console.error('❌ ADMIN_SECRET_KEY not found in environment');
            process.exit(1);
        }

        this.adminKeypair = Keypair.fromSecret(this.adminSecret);
        console.log(`✅ Admin account: ${this.adminKeypair.publicKey()}`);

        // Load initial price
        await this.updatePriceHistory();
        console.log('✅ Price monitor initialized');
    }

    async updatePriceHistory() {
        try {
            const priceData = await this.server.simulateTransaction(
                this.reflectorReaderContract.call('get_price')
            );

            const [price, timestamp] = priceData.result;
            const priceInXLM = price / 10000000;

            this.priceHistory.push({
                price: priceInXLM,
                timestamp: timestamp,
                date: new Date(timestamp * 1000)
            });

            // Keep only last 100 entries
            if (this.priceHistory.length > 100) {
                this.priceHistory = this.priceHistory.slice(-100);
            }

            console.log(`📊 Price update: $${priceInXLM.toFixed(4)} (${new Date(timestamp * 1000).toLocaleTimeString()})`);

            return priceInXLM;
        } catch (error) {
            console.error('❌ Error updating price:', error.message);
            return null;
        }
    }

    checkPriceDrop(currentPrice) {
        if (this.priceHistory.length < 2) return false;

        const previousPrice = this.priceHistory[this.priceHistory.length - 2].price;
        const dropPercentage = ((previousPrice - currentPrice) / previousPrice) * 100;

        console.log(`📉 Price change: ${dropPercentage.toFixed(2)}% (${previousPrice.toFixed(4)} → ${currentPrice.toFixed(4)})`);

        return dropPercentage >= this.priceDropThreshold;
    }

    async createEmergencyMission(triggerPrice) {
        try {
            console.log('🚨 Creating emergency mission...');

            const targetLiquidity = 100000000000; // 100K XLM
            const rewardPool = 50000000000; // 50K KALE
            const duration = 24; // 24 hours

            // Build transaction
            const account = await this.server.getAccount(this.adminKeypair.publicKey());
            const transaction = new TransactionBuilder(account, {
                fee: '100000',
                networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
            })
                .addOperation(
                    Operation.invokeContractFunction({
                        contract: this.missionControllerId,
                        function: 'create_emergency_mission',
                        args: [
                            targetLiquidity,
                            rewardPool,
                            duration,
                            Math.floor(triggerPrice * 10000000) // Convert to stroops
                        ]
                    })
                )
                .setTimeout(300)
                .build();

            // Sign and submit
            transaction.sign(this.adminKeypair);
            const result = await this.server.sendTransaction(transaction);

            console.log(`✅ Emergency mission created! TX: ${result.hash}`);
            return result;
        } catch (error) {
            console.error('❌ Error creating mission:', error.message);
            return null;
        }
    }

    async monitor() {
        console.log('👀 Starting price monitoring...');

        this.isRunning = true;

        while (this.isRunning) {
            try {
                const currentPrice = await this.updatePriceHistory();

                if (currentPrice && this.checkPriceDrop(currentPrice)) {
                    console.log(`🚨 Price drop detected! Creating emergency mission...`);
                    await this.createEmergencyMission(currentPrice);
                }

                // Wait before next check
                await this.sleep(this.monitoringInterval);
            } catch (error) {
                console.error('❌ Monitoring error:', error.message);
                await this.sleep(5000); // Wait 5 seconds on error
            }
        }
    }

    stop() {
        console.log('🛑 Stopping price monitor...');
        this.isRunning = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            network: this.network,
            currentPrice: this.priceHistory.length > 0 ? this.priceHistory[this.priceHistory.length - 1] : null,
            historyLength: this.priceHistory.length,
            threshold: this.priceDropThreshold,
            interval: this.monitoringInterval
        };
    }

    async getCurrentMission() {
        try {
            const counter = await this.server.simulateTransaction(
                this.missionContract.call('get_mission_counter')
            );

            if (counter.result > 0) {
                const mission = await this.server.simulateTransaction(
                    this.missionContract.call('get_mission', counter.result)
                );
                return mission.result;
            }
        } catch (error) {
            console.log('No active mission');
        }
        return null;
    }
}

// CLI Interface
async function main() {
    const monitor = new PriceMonitor();

    // Parse command line arguments
    const command = process.argv[2];

    switch (command) {
        case 'start':
            await monitor.initialize();
            await monitor.monitor();
            break;

        case 'status':
            await monitor.initialize();
            const status = monitor.getStatus();
            console.log('\n📊 Monitor Status:');
            console.log(`Running: ${status.isRunning}`);
            console.log(`Network: ${status.network}`);
            console.log(`Current Price: $${status.currentPrice?.price?.toFixed(4) || 'N/A'}`);
            console.log(`History: ${status.historyLength} entries`);
            console.log(`Threshold: ${status.threshold}%`);
            console.log(`Interval: ${status.interval / 1000}s`);
            break;

        case 'test':
            await monitor.initialize();
            console.log('\n🧪 Testing price monitoring...');

            const testPrice = await monitor.updatePriceHistory();
            if (testPrice) {
                console.log(`✅ Price fetch successful: $${testPrice.toFixed(4)}`);
            }

            const mission = await monitor.getCurrentMission();
            if (mission) {
                console.log(`✅ Current mission: ID ${mission.id}, Active: ${mission.active}`);
            } else {
                console.log('ℹ️  No active mission');
            }
            break;

        case 'create-test-mission':
            await monitor.initialize();
            console.log('\n🎯 Creating test mission...');
            const result = await monitor.createEmergencyMission(0.1); // Test with $0.10
            if (result) {
                console.log('✅ Test mission created successfully');
            }
            break;

        default:
            console.log('Usage: node price-monitor-service.js <command>');
            console.log('Commands:');
            console.log('  start              - Start the price monitoring service');
            console.log('  status             - Show current monitor status');
            console.log('  test               - Test price fetching and mission status');
            console.log('  create-test-mission - Create a test emergency mission');
            break;
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    if (monitor) monitor.stop();
    process.exit(0);
});

if (require.main === module) {
    main().catch(console.error);
}

module.exports = PriceMonitor;
