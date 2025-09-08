import { useMissionStore } from '../stores/missionStore';
import { mockMissions, mockPriceData } from '../data/mockData';

// Simulate real-time price updates
export const startPriceUpdates = () => {
  const { updatePriceData } = useMissionStore.getState();
  
  setInterval(() => {
    const currentPrice = mockPriceData.current_price;
    const volatility = 0.002; // 0.2% volatility
    const change = (Math.random() - 0.5) * volatility;
    const newPrice = Math.max(0.001, currentPrice + change);
    
    const priceChange24h = ((newPrice - 0.0925) / 0.0925) * 100;
    
    const newPriceData = {
      ...mockPriceData,
      current_price: newPrice,
      price_change_24h: priceChange24h,
      chart_data: [
        ...mockPriceData.chart_data.slice(1),
        { timestamp: Date.now(), price: newPrice }
      ]
    };
    
    updatePriceData(newPriceData);
  }, 5000); // Update every 5 seconds
};

// Simulate mission progress updates
export const startMissionUpdates = () => {
  const { updateMissionProgress } = useMissionStore.getState();
  
  setInterval(() => {
    mockMissions.forEach((mission) => {
      if (mission.active && mission.current_progress < mission.target_liquidity) {
        const progressIncrease = Math.random() * 500; // Random progress increase
        const participantsIncrease = Math.floor(Math.random() * 2); // 0-1 new participants
        
        const newProgress = Math.min(
          mission.target_liquidity,
          mission.current_progress + progressIncrease
        );
        const newParticipants = mission.participants_count + participantsIncrease;
        
        updateMissionProgress(mission.id, newProgress, newParticipants);
      }
    });
  }, 15000); // Update every 15 seconds
};

// Initialize all mock updates
export const initializeMockUpdates = () => {
  if (typeof window !== 'undefined') {
    startPriceUpdates();
    startMissionUpdates();
  }
};