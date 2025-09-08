import { create } from 'zustand';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { Mission, UserParticipation, UserStats, PriceData } from '../types/mission';
import { mockMissions, mockUserParticipations, mockUserStats } from '../data/mockData';
import { WalletState } from '@/lib/wallet';
import {
  handleCreateMission,
  handleEnlist,
  handleContribute
} from '@/utils/contractActions';

// Interface for form data when creating a mission
interface MissionFormData {
  title: string;
  description: string;
  targetLiquidity: number;
  rewardPool: number;
  duration: number; // in hours
  triggerPrice: number;
}

// Helper interface to group the wallet state and the kit for passing to actions
interface WalletInfo {
  wallet: WalletState;
  kit: StellarWalletsKit;
}

// The complete interface for the store's state and actions
interface MissionStore {
  missions: Mission[];
  userParticipations: UserParticipation[];
  userStats: UserStats;
  priceData: PriceData;
  loading: boolean;
  useRealData: boolean;
  toggleDataSource: () => void;
  fetchMissions: () => Promise<void>;
  createMission: (formData: MissionFormData, walletInfo: WalletInfo) => Promise<void>;
  enlistInMission: (missionId: string, stakeAmount: number, walletInfo: WalletInfo) => Promise<void>;
  addContribution: (missionId: string, amount: number, walletInfo: WalletInfo) => Promise<void>;
  updatePriceData: (data: PriceData) => void;
  setLoading: (loading: boolean) => void;
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  // --- INITIAL STATE ---
  missions: mockMissions,
  userParticipations: mockUserParticipations,
  userStats: mockUserStats,
  priceData: { current_price: 0.12, price_change_24h: -2.5, chart_data: [] },
  loading: false,
  useRealData: false,

  // --- ACTIONS ---

  toggleDataSource: () => {
    set(state => {
      const newModeIsLive = !state.useRealData;
      console.log(`Switching to ${newModeIsLive ? 'LIVE' : 'DEMO'} MODE`);
      if (newModeIsLive) {
        return {
          useRealData: true, loading: true, missions: [], userParticipations: [],
          userStats: { ...mockUserStats, total_staked: 0, missions_participated: 0, total_rewards: 0 },
        };
      }
      return { useRealData: false, loading: false, missions: mockMissions, userParticipations: mockUserParticipations, userStats: mockUserStats };
    });
    if (get().useRealData) {
      setTimeout(() => set({ loading: false }), 1000);
      get().fetchMissions();
    }
  },

  fetchMissions: async () => { /* Placeholder for live data fetching */ },
  updatePriceData: (data) => set({ priceData: data }),
  setLoading: (loading) => set({ loading }),

  createMission: async (formData, { wallet, kit }) => {
    const { useRealData, fetchMissions } = get();
    if (useRealData) {
      if (!wallet.connected || !wallet.address) throw new Error("Wallet not connected");
      set({ loading: true });
      try {
        await handleCreateMission(formData, { address: wallet.address, kit });
        await fetchMissions();
      } finally {
        set({ loading: false });
      }
    } else {
      const newMission: Mission = {
        id: `mission-${Date.now()}`, title: formData.title, description: formData.description,
        target_liquidity: formData.targetLiquidity, current_progress: 0, reward_pool: formData.rewardPool,
        deadline: new Date(Date.now() + formData.duration * 60 * 60 * 1000), participants_count: 0,
        trigger_price: formData.triggerPrice, active: true, difficulty: 'medium', mission_type: 'liquidity'
      };
      set(state => ({ missions: [...state.missions, newMission] }));
    }
  },

  enlistInMission: async (missionId, stakeAmount, { wallet, kit }) => {
    const { useRealData, fetchMissions } = get();
    if (useRealData) {
      if (!wallet.connected || !wallet.address) throw new Error("Wallet not connected");
      set({ loading: true });
      try {
        await handleEnlist(missionId, stakeAmount, { address: wallet.address, kit });
        await fetchMissions();
      } finally {
        set({ loading: false });
      }
    } else {
      set(state => {
        if (state.userParticipations.some(p => p.mission_id === missionId)) return state;
        const newParticipation = { mission_id: missionId, stake_amount: stakeAmount, contribution_amount: 0, rewards_earned: 0, enlisted_at: new Date(), last_contribution: new Date() };
        return {
          userParticipations: [...state.userParticipations, newParticipation],
          missions: state.missions.map(m => m.id === missionId ? { ...m, participants_count: m.participants_count + 1 } : m),
          userStats: { ...state.userStats, total_staked: state.userStats.total_staked + stakeAmount, missions_participated: state.userStats.missions_participated + 1 }
        };
      });
    }
  },

  addContribution: async (missionId, amount, { wallet, kit }) => {
    const { useRealData, fetchMissions } = get();
    if (useRealData) {
      if (!wallet.connected || !wallet.address) throw new Error("Wallet not connected");
      set({ loading: true });
      try {
        await handleContribute(missionId, amount, { address: wallet.address, kit });
        await fetchMissions();
      } finally {
        set({ loading: false });
      }
    } else {
      set(state => {
        const isParticipant = state.userParticipations.some(p => p.mission_id === missionId);
        const updatedParticipations = isParticipant
          ? state.userParticipations.map(p => p.mission_id === missionId ? { ...p, contribution_amount: p.contribution_amount + amount } : p)
          : [...state.userParticipations, { mission_id: missionId, stake_amount: 0, contribution_amount: amount, rewards_earned: 0, enlisted_at: new Date(), last_contribution: new Date() }];

        const updatedMissions = state.missions.map(mission => {
          if (mission.id === missionId) {
            const newProgress = mission.current_progress + amount;
            return { ...mission, current_progress: newProgress, participants_count: isParticipant ? mission.participants_count : mission.participants_count + 1, active: newProgress < mission.target_liquidity };
          }
          return mission;
        });
        
        const updatedUserStats = isParticipant ? state.userStats : { ...state.userStats, missions_participated: state.userStats.missions_participated + 1 };
        return { missions: updatedMissions, userParticipations: updatedParticipations, userStats: updatedUserStats };
      });
    }
  },
}));