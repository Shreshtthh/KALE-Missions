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

  // Enhanced toggle between mock and real data
  toggleDataSource: () => {
    const currentMode = get().useRealData;
    const newMode = !currentMode;
    
    set({ useRealData: newMode, loading: true });
    
    if (newMode) {
      // Switching to LIVE mode - fetch from blockchain
      console.log('🔴 Switching to LIVE MODE - Blockchain data');
      get().fetchMissions().then(() => {
        // Also reset price data for live mode
        set({ 
          priceData: {
            current_price: 0.0847, // Real-time price will be fetched
            price_change_24h: -8.3,
            chart_data: [], // Will be populated by price service
          },
          loading: false 
        });
      });
    } else {
      // Switching to DEMO mode - use mock data
      console.log('🟢 Switching to DEMO MODE - Mock data');
      setTimeout(() => {
        set({ 
          missions: mockMissions,
          userParticipations: mockUserParticipations,
          userStats: mockUserStats,
          priceData: {
            current_price: 0.12,
            price_change_24h: -2.5,
            chart_data: [
              { timestamp: Date.now() - 6 * 60 * 60 * 1000, price: 0.125 },
              { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 0.122 },
              { timestamp: Date.now() - 2 * 60 * 60 * 1000, price: 0.118 },
              { timestamp: Date.now(), price: 0.12 },
            ],
          },
          loading: false 
        });
      }, 500); // Small delay for UX feedback
    }
  },

  setMissions: (missions) => set({ missions }),

  fetchMissions: async () => {
    const { useRealData } = get();
    if (!useRealData) return;
    
    set({ loading: true });
    try {
      // TODO: Implement actual blockchain calls here
      // For now, simulate loading real data
      console.log('📡 Fetching missions from Soroban contracts...');
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // This is where you'd call your Soroban contracts
      // const realMissions = await sorobanService.getAllMissions();
      // const realParticipations = await sorobanService.getUserParticipations(walletAddress);
      // const realStats = await sorobanService.getUserStats(walletAddress);
      
      set({ 
        missions: [], // Empty for now since we don't have real contract calls yet
        userParticipations: [], // Will be populated from blockchain
        userStats: {
          total_staked: 0,
          missions_participated: 0,
          total_rewards: 0,
          missions_completed: 0,
          success_rate: 0,
          average_contribution: 0,
          rank: 'Unranked',
        },
        loading: false 
      });
    } catch (error) {
      console.error('❌ Failed to fetch missions from blockchain:', error);
      // Fallback to demo mode on error
      set({ 
        useRealData: false,
        missions: mockMissions,
        userParticipations: mockUserParticipations,
        userStats: mockUserStats,
        loading: false 
      });
    }
  },

  createMission: async (formData, walletAddress, signTx) => {
    const { useRealData } = get();
    
    if (useRealData && walletAddress && signTx) {
      set({ loading: true });
      try {
        console.log('🚀 Creating mission on Stellar blockchain:', formData);
        // TODO: Implement actual contract call
        // const transaction = await sorobanService.createMission(formData);
        // const signedTx = await signTx(transaction.toXDR());
        // await sorobanService.submitTransaction(signedTx);
        
        await new Promise<void>(resolve => setTimeout(resolve, 3000)); // Simulate
        
        // Refresh missions after creation
        await get().fetchMissions();
        set({ loading: false });
      } catch (error) {
        console.error('❌ Failed to create mission on blockchain:', error);
        set({ loading: false });
        throw error;
      }
    } else {
      // Mock implementation for demo mode
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
      
      set(state => ({
        missions: [...state.missions, newMission]
      }));
    }
  },

  enlistInMission: async (missionId, stakeAmount, walletAddress, signTx) => {
    const { useRealData } = get();
    
    if (useRealData && walletAddress && signTx) {
      set({ loading: true });
      try {
        console.log('⚡ Enlisting in mission on blockchain:', { missionId, stakeAmount });
        // TODO: Implement actual contract call
        // const transaction = await sorobanService.enlistInMission(missionId, stakeAmount);
        // const signedTx = await signTx(transaction.toXDR());
        // await sorobanService.submitTransaction(signedTx);
        
        await new Promise<void>(resolve => setTimeout(resolve, 2000)); // Simulate
        
        // Refresh data after enlisting
        await get().fetchMissions();
        set({ loading: false });
      } catch (error) {
        console.error('❌ Failed to enlist in mission:', error);
        set({ loading: false });
        throw error;
      }
    } else {
      // Mock implementation for demo mode
      console.log('🎭 Enlisting in mission in DEMO mode');
      const newParticipation: UserParticipation = {
        mission_id: missionId,
        stake_amount: stakeAmount,
        contribution_amount: 0,
        rewards_earned: 0,
        enlisted_at: new Date(),
        last_contribution: new Date(),
      };
      
      set(state => ({
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
      }));
    }
  },

  addContribution: async (missionId, amount, walletAddress, signTx) => {
    const { useRealData } = get();
    
    if (useRealData && walletAddress && signTx) {
      set({ loading: true });
      try {
        console.log('💰 Adding contribution on blockchain:', { missionId, amount });
        // TODO: Implement actual contract call
        // const transaction = await sorobanService.addContribution(missionId, amount);
        // const signedTx = await signTx(transaction.toXDR());
        // await sorobanService.submitTransaction(signedTx);
        
        await new Promise<void>(resolve => setTimeout(resolve, 2000)); // Simulate
        
        // Refresh data after contribution
        await get().fetchMissions();
        set({ loading: false });
      } catch (error) {
        console.error('❌ Failed to add contribution:', error);
        set({ loading: false });
        throw error;
      }
    } else {
      // Mock implementation for demo mode
      console.log('🎭 Adding contribution in DEMO mode');
      set(state => ({
        userParticipations: state.userParticipations.map(p =>
          p.mission_id === missionId
            ? {
                ...p,
                contribution_amount: p.contribution_amount + amount,
                last_contribution: new Date(),
              }
            : p
        ),
        missions: state.missions.map(mission =>
          mission.id === missionId
            ? { ...mission, current_progress: mission.current_progress + amount }
            : mission
        )
      }));
    }
  },

  updatePriceData: (data) => set({ priceData: data }),
  setLoading: (loading) => set({ loading }),
}));
