import { Mission, PriceData, UserParticipation, UserStats } from '../types/mission';

export const mockMissions: Mission[] = [
  {
    id: 'mission-001',
    title: 'XLM/USDC Liquidity Crisis',
    description: 'Massive sell-off detected in XLM/USDC pair. Deploy emergency liquidity to prevent further market destabilization. Critical priority mission.',
    target_liquidity: 100000,
    current_progress: 67500,
    reward_pool: 50000,
    deadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours
    participants_count: 127,
    trigger_price: 0.08,
    active: true,
    difficulty: 'critical',
    mission_type: 'liquidity',
  },
  {
    id: 'mission-002',
    title: 'Stellar Network Stability',
    description: 'Network congestion threatening transaction throughput. Validators needed to maintain consensus and process backlog.',
    target_liquidity: 75000,
    current_progress: 32100,
    reward_pool: 35000,
    deadline: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours
    participants_count: 89,
    trigger_price: 0.082,
    active: true,
    difficulty: 'hard',
    mission_type: 'stability',
  },
  {
    id: 'mission-003',
    title: 'Community Defense Protocol',
    description: 'Coordinated attack detected on ecosystem tokens. Rally the community to defend key liquidity pools and maintain market confidence.',
    target_liquidity: 50000,
    current_progress: 43800,
    reward_pool: 28000,
    deadline: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    participants_count: 156,
    trigger_price: 0.075,
    active: true,
    difficulty: 'medium',
    mission_type: 'community',
  },
  {
    id: 'mission-004',
    title: 'Bridge Stabilization',
    description: 'Cross-chain bridge showing irregular activity patterns. Deploy monitoring and backup liquidity to ensure seamless transfers.',
    target_liquidity: 25000,
    current_progress: 19750,
    reward_pool: 15000,
    deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
    participants_count: 43,
    trigger_price: 0.083,
    active: true,
    difficulty: 'easy',
    mission_type: 'stability',
  },
];

export const mockUserParticipations: UserParticipation[] = [
  {
    mission_id: 'mission-001',
    stake_amount: 5000,
    contribution_amount: 2000,
    rewards_earned: 150,
    enlisted_at: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    last_contribution: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    mission_id: 'mission-003',
    stake_amount: 2500,
    contribution_amount: 1000,
    rewards_earned: 75,
    enlisted_at: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
    last_contribution: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

export const mockUserStats: UserStats = {
  total_staked: 7500,
  missions_participated: 2,
  total_rewards: 225,
  missions_completed: 0,
  success_rate: 0,
  average_contribution: 1500,
  rank: 'Scout',
};

export const mockPriceData: PriceData = {
  current_price: 0.0847,
  price_change_24h: -8.3,
  chart_data: [
    { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 0.0925 },
    { timestamp: Date.now() - 20 * 60 * 60 * 1000, price: 0.0918 },
    { timestamp: Date.now() - 16 * 60 * 60 * 1000, price: 0.0896 },
    { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 0.0875 },
    { timestamp: Date.now() - 8 * 60 * 60 * 1000, price: 0.0859 },
    { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 0.0851 },
    { timestamp: Date.now(), price: 0.0847 },
  ],
};
