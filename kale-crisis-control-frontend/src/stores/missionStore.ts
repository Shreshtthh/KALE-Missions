import { create } from 'zustand';
import { Mission, UserParticipation, UserStats, PriceData } from '../types/mission';
import { mockMissions, mockUserParticipations, mockUserStats } from '../data/mockData';

// Define proper types for function parameters
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
  // State
  missions: Mission[];
  userParticipations: UserParticipation[];
  userStats: UserStats;
  priceData: PriceData;
  loading: boolean;
  useRealData: boolean; // Toggle for live vs demo mode
  
  // Actions
  toggleDataSource: () => void;
  setMissions: (missions: Mission[]) => void;
  fetchMissions: () => Promise<void>;
  createMission: (
    formData: MissionFormData, 
    walletAddress?: string, 
    signTx?: TransactionSigner
  ) => Promise<void>;
  enlistInMission: (
    missionId: string, 
    stakeAmount: number, 
    walletAddress?: string, 
    signTx?: TransactionSigner
  ) => Promise<void>;
  addContribution: (
    missionId: string, 
    amount: number, 
    walletAddress?: string, 
    signTx?: TransactionSigner
  ) => Promise<void>;
  updatePriceData: (data: PriceData) => void;
  setLoading: (loading: boolean) => void;
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  // Initial state
  missions: mockMissions,
  userParticipations: mockUserParticipations,
  userStats: mockUserStats,
  priceData: {
    current_price: 0.12,
    price_change_24h: -2.5,
    chart_data: [],
  },
  loading: false,
  useRealData: false,

  // --- Other functions (toggleDataSource, fetchMissions, createMission) remain the same ---
  toggleDataSource: () => {
    const currentMode = get().useRealData;
    const newMode = !currentMode;
    set({ useRealData: newMode, loading: true });
    if (newMode) {
      console.log('🔴 Switching to LIVE MODE - Blockchain data');
      get().fetchMissions().then(() => set({ loading: false }));
    } else {
      console.log('🟢 Switching to DEMO MODE - Mock data');
      setTimeout(() => set({ missions: mockMissions, userParticipations: mockUserParticipations, userStats: mockUserStats, loading: false }), 500);
    }
  },
  setMissions: (missions) => set({ missions }),
  fetchMissions: async () => { /* ... unchanged ... */ },
  createMission: async (formData) => { /* ... unchanged ... */ },

  // FIXED: enlistInMission
  enlistInMission: async (missionId, stakeAmount, walletAddress, signTx) => {
    const { useRealData } = get();
    if (useRealData && walletAddress && signTx) {
      // Live mode logic...
    } else {
      console.log('🎭 Enlisting in mission in DEMO mode');
      set(state => {
        const alreadyEnlisted = state.userParticipations.some(p => p.mission_id === missionId);
        if (alreadyEnlisted) {
          console.warn("User already enlisted, cannot enlist again.");
          return state; // Do not modify state if already enlisted
        }

        const newParticipation: UserParticipation = {
          mission_id: missionId,
          stake_amount: stakeAmount,
          contribution_amount: 0,
          rewards_earned: 0,
          enlisted_at: new Date(),
          last_contribution: new Date(),
        };

        return {
          userParticipations: [...state.userParticipations, newParticipation],
          missions: state.missions.map(mission =>
            mission.id === missionId
              ? { ...mission, participants_count: mission.participants_count + 1 }
              : mission
          ),
          userStats: {
            ...state.userStats,
            total_staked: state.userStats.total_staked + stakeAmount,
            missions_participated: state.userStats.missions_participated + 1,
          }
        };
      });
    }
  },

  // FIXED: addContribution
addContribution: async (missionId, amount, walletAddress, signTx) => {
    const { useRealData } = get();
    if (useRealData && walletAddress && signTx) {
        // Live mode logic...
    } else {
        console.log('🎭 Adding contribution in DEMO mode');
        set(state => {
            const existingParticipation = state.userParticipations.find(p => p.mission_id === missionId);
            let updatedParticipations;
            let isNewParticipant = false;

            if (existingParticipation) {
                updatedParticipations = state.userParticipations.map(p =>
                    p.mission_id === missionId
                        ? { ...p, contribution_amount: p.contribution_amount + amount, last_contribution: new Date() }
                        : p
                );
            } else {
                isNewParticipant = true;
                const newParticipation: UserParticipation = {
                    mission_id: missionId,
                    stake_amount: 0,
                    contribution_amount: amount,
                    rewards_earned: 0,
                    enlisted_at: new Date(),
                    last_contribution: new Date(),
                };
                updatedParticipations = [...state.userParticipations, newParticipation];
            }

            const totalContributions = updatedParticipations.reduce((sum, p) => sum + p.contribution_amount, 0);

            return {
                userParticipations: updatedParticipations,
                // THIS IS THE FIX: This block correctly updates the mission's progress
                missions: state.missions.map(mission => {
                    if (mission.id === missionId) {
                        const newProgress = mission.current_progress + amount;
                        return { 
                            ...mission, 
                            current_progress: newProgress,
                            participants_count: isNewParticipant ? mission.participants_count + 1 : mission.participants_count,
                            // Deactivate mission if goal is met
                            active: newProgress < mission.target_liquidity,
                        };
                    }
                    return mission;
                }),
                userStats: {
                    ...state.userStats,
                    missions_participated: isNewParticipant ? state.userStats.missions_participated + 1 : state.userStats.missions_participated,
                    average_contribution: totalContributions / updatedParticipations.length
                }
            };
        });
    }
  },

  updatePriceData: (data) => set({ priceData: data }),
  setLoading: (loading) => set({ loading }),
}));