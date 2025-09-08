export interface Mission {
  id: string;
  title: string;
  description: string;
  target_liquidity: number;
  current_progress: number;
  reward_pool: number;
  deadline: Date;
  participants_count: number;
  trigger_price: number;
  active: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'critical';
  mission_type: 'liquidity' | 'stability' | 'emergency' | 'community';
}

export interface UserParticipation {
  mission_id: string;
  stake_amount: number;
  contribution_amount: number;
  rewards_earned: number;
  enlisted_at: Date;
  last_contribution: Date;
}

export interface UserStats {
  total_staked: number;
  missions_participated: number;
  total_rewards: number;
  missions_completed: number;
  success_rate: number;        
  average_contribution: number; 
  rank: string;               
}


export interface WalletState {
  connected: boolean;
  address: string | null;
  kale_balance: number;
  xlm_balance: number;
}

export interface PriceData {
  current_price: number;
  price_change_24h: number;
  chart_data: Array<{ timestamp: number; price: number }>;
}