import { create } from 'zustand';
import { Mission, UserParticipation, UserStats, PriceData } from '../types/mission';
import { mockMissions, mockUserParticipations, mockUserStats } from '../data/mockData';

interface MissionFormData {
  title: string;
  description: string;
  targetLiquidity: number;
  rewardPool: number;
  duration: number; // in hours
  triggerPrice: number;
}

interface TransactionSigner {
  (transactionXDR: string): Promise<string>;
}

interface MissionStore {
  missions: Mission[];
  userParticipations: UserParticipation[];
  userStats: UserStats;
  priceData: PriceData;
  loading: boolean;
  useRealData: boolean;
  toggleDataSource: () => void;
  setMissions: (missions: Mission[]) => void;
  fetchMissions: () => Promise<void>;
  createMission: (formData: MissionFormData, walletAddress?: string, signTx?: TransactionSigner) => Promise<void>;
  enlistInMission: (missionId: string, stakeAmount: number, walletAddress?: string, signTx?: TransactionSigner) => Promise<void>;
  addContribution: (missionId: string, amount: number, walletAddress?: string, signTx?: TransactionSigner) => Promise<void>;
  updatePriceData: (data: PriceData) => void;
  setLoading: (loading: boolean) => void;
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  missions: mockMissions,
  userParticipations: mockUserParticipations,
  userStats: mockUserStats,
  priceData: { current_price: 0.12, price_change_24h: -2.5, chart_data: [] },
  loading: false,
  useRealData: false,

  toggleDataSource: () => {
    // ... (This function is correct and remains unchanged)
  },

  setMissions: (missions) => set({ missions }),
  fetchMissions: async () => { /* ... unchanged ... */ },

  createMission: async (formData) => {
    console.log('🎭 Creating mission in DEMO mode');
    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      target_liquidity: formData.targetLiquidity,
      current_progress: 0,
      reward_pool: formData.rewardPool,
      deadline: new Date(Date.now() + formData.duration * 60 * 60 * 1000),
      participants_count: 0,
      trigger_price: formData.triggerPrice,
      active: true,
      difficulty: 'medium',
      mission_type: 'liquidity'
    };
    set(state => ({ missions: [...state.missions, newMission] }));
  },

  enlistInMission: async (missionId, stakeAmount) => {
    console.log('🎭 Enlisting in mission in DEMO mode');
    set(state => {
      if (state.userParticipations.some(p => p.mission_id === missionId)) return state;

      const newParticipation: UserParticipation = {
        mission_id: missionId, stake_amount: stakeAmount, contribution_amount: 0, rewards_earned: 0,
        enlisted_at: new Date(), last_contribution: new Date(),
      };
      
      const updatedMissions = state.missions.map(m => 
        m.id === missionId ? { ...m, participants_count: m.participants_count + 1 } : m
      );

      return {
        missions: updatedMissions,
        userParticipations: [...state.userParticipations, newParticipation],
        userStats: {
          ...state.userStats,
          total_staked: state.userStats.total_staked + stakeAmount,
          missions_participated: state.userStats.missions_participated + 1,
        }
      };
    });
  },

  addContribution: async (missionId, amount) => {
    console.log('🎭 Adding contribution in DEMO mode');
    set(state => {
      const isAlreadyParticipant = state.userParticipations.some(p => p.mission_id === missionId);
      let updatedParticipations;

      if (isAlreadyParticipant) {
        updatedParticipations = state.userParticipations.map(p =>
          p.mission_id === missionId
            ? { ...p, contribution_amount: p.contribution_amount + amount, last_contribution: new Date() }
            : p
        );
      } else {
        const newParticipation = {
          mission_id: missionId, stake_amount: 0, contribution_amount: amount, rewards_earned: 0,
          enlisted_at: new Date(), last_contribution: new Date(),
        };
        updatedParticipations = [...state.userParticipations, newParticipation];
      }
      
      const updatedMissions = state.missions.map(mission => {
        if (mission.id === missionId) {
          const newProgress = mission.current_progress + amount;
          return {
            ...mission,
            current_progress: newProgress,
            participants_count: isAlreadyParticipant ? mission.participants_count : mission.participants_count + 1,
            active: newProgress < mission.target_liquidity,
          };
        }
        return mission;
      });

      return {
        missions: updatedMissions,
        userParticipations: updatedParticipations,
        userStats: isAlreadyParticipant ? state.userStats : {
          ...state.userStats,
          missions_participated: state.userStats.missions_participated + 1,
        }
      };
    });
  },

  updatePriceData: (data) => set({ priceData: data }),
  setLoading: (loading) => set({ loading }),
}));