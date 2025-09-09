const { Contract, SorobanRpc, Keypair, Networks } = require('@stellar/stellar-sdk');

class OracleIntegration {
    constructor() {
        this.server = new SorobanRpc.Server('https://soroban-testnet.stellar.org:443');
        this.adminKeypair = Keypair.fromSecret(import.meta.env.ADMIN_SECRET_KEY);
    }

    async checkPriceAndTriggerMission(oracleContractId, missionContractId) {
        const oracleContract = new Contract(oracleContractId);
        const missionContract = new Contract(missionContractId);

        // Get current XLM price
        const priceResult = await this.server.simulateTransaction(
            oracleContract.call('get_price', 'XLM')
        );

        const currentPrice = priceResult.result.retval;
        const TRIGGER_PRICE = 100000; // $0.10 in micro units

        if (currentPrice < TRIGGER_PRICE) {
            console.log(`Price drop detected: ${currentPrice}. Triggering emergency mission...`);
            
            // Create emergency mission
            const createMissionTx = missionContract.call(
                'create_emergency_mission',
                this.adminKeypair.publicKey(),
                10000000000, // Target: 100K XLM liquidity
                5000000000,  // Reward: 50K KALE
                24,          // Duration: 24 hours
                currentPrice // Trigger price
            );

            // Submit transaction
            const result = await this.submitTransaction(createMissionTx);
            return result;
        }

        return null;
    }

    async submitTransaction(transaction) {
        transaction.sign(this.adminKeypair);
        const result = await this.server.sendTransaction(transaction);
        return result;
    }
}

module.exports = OracleIntegration;
