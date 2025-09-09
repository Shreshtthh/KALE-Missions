const { execSync } = require('child_process');

async function runFullIntegrationTest() {
    console.log('🚀 Starting full integration test...');
    
    try {
        // 1. Deploy contracts
        console.log('📦 Deploying contracts...');
        execSync('bash scripts/deploy.sh', { stdio: 'inherit' });
        
        // 2. Fund demo accounts
        console.log('💰 Funding demo accounts...');
        execSync('soroban keys fund alice --network testnet', { stdio: 'inherit' });
        execSync('soroban keys fund bob --network testnet', { stdio: 'inherit' });
        
        // 3. Test mission creation
        console.log('🎯 Testing mission creation...');
        const missionId = execSync(`
            soroban contract invoke \\
                --id $CONTRACT_ID \\
                --source admin \\
                --network testnet \\
                -- \\
                create_emergency_mission \\
                --caller $(soroban keys address admin) \\
                --target_liquidity 100000000000 \\
                --reward_pool 50000000000 \\
                --duration_hours 24 \\
                --trigger_price 100000
        `).toString().trim();
        
        console.log('Mission created with ID:', missionId);
        
        // 4. Test user enlistment
        console.log('👥 Testing user enlistment...');
        execSync(`
            soroban contract invoke \\
                --id $CONTRACT_ID \\
                --source alice \\
                --network testnet \\
                -- \\
                enlist_in_mission \\
                --user $(soroban keys address alice) \\
                --mission_id 1 \\
                --kale_stake 1000000000
        `, { stdio: 'inherit' });
        
        console.log('✅ Integration test completed successfully!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        process.exit(1);
    }
}

runFullIntegrationTest();
