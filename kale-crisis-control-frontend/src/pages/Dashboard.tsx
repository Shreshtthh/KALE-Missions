import { useState, useEffect } from 'react';
import { useMissionStore } from '@/stores/missionStore';
import { useWallet } from '@/lib/wallet';
import { MissionCard } from '@/components/MissionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Database, 
  TestTube, 
  Loader2,
  TrendingUp,
  Shield,
  Users,
  Zap,
  Target,
  DollarSign
} from 'lucide-react';

export const Dashboard = () => {
  const { 
    missions, 
    useRealData,
    loading,
    fetchMissions,
    userParticipations,
    userStats
  } = useMissionStore();
  const { wallet } = useWallet();

  useEffect(() => {
    const initializeData = async () => {
      if (useRealData) {
        console.log('🔴 Initializing LIVE mode - fetching real data');
        await fetchMissions();
      } else {
        console.log('🟢 Demo mode - using mock data');
      }
    };

    initializeData();
  }, [useRealData, fetchMissions]);

  // Calculate mission analytics
  const activeMissions = missions.filter(m => m.active);
  const totalLiquidityDeployed = missions.reduce((sum, m) => sum + m.current_progress, 0);
  const totalRewardPool = missions.reduce((sum, m) => sum + m.reward_pool, 0);
  const totalParticipants = missions.reduce((sum, m) => sum + m.participants_count, 0);
  const completedMissions = missions.filter(m => !m.active).length;
  const criticalMissions = missions.filter(m => m.difficulty === 'critical').length;

  // Calculate ecosystem health percentage based on mission progress
  const avgProgress = missions.length > 0 
    ? missions.reduce((sum, m) => sum + (m.current_progress / m.target_liquidity), 0) / missions.length 
    : 0;
  const ecosystemHealth = Math.min(100, Math.max(0, avgProgress * 100));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Mode Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mission Command Center</h1>
          <p className="text-muted-foreground">
            KALE Crisis Control - Coordinating DeFi ecosystem stability
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {useRealData ? (
            <Badge variant="default" className="flex items-center space-x-1">
              <Database className="h-3 w-3" />
              <span>Live Mode</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <TestTube className="h-3 w-3" />
              <span>Demo Mode</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Mode-specific alerts */}
      {useRealData && !wallet?.connected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're in Live Mode but no wallet is connected. Connect your wallet to interact with real missions on the blockchain.
          </AlertDescription>
        </Alert>
      )}

      {!useRealData && (
        <Alert>
          <TestTube className="h-4 w-4" />
          <AlertDescription>
            You're in Demo Mode using mock data. Perfect for presentations and testing the UI. Switch to Live Mode to connect to the blockchain.
          </AlertDescription>
        </Alert>
      )}

      {/* Mission Analytics Dashboard - Replacing Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mission Analytics
            <Badge variant="outline">
              {useRealData ? "Live Blockchain Data" : "Demo Data"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time mission performance and KALE ecosystem health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">
                ${(totalLiquidityDeployed / 1000).toFixed(1)}K
              </div>
              <p className="text-sm text-muted-foreground">Liquidity Deployed</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div className="text-2xl font-bold text-success">{totalParticipants}</div>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-warning" />
              </div>
              <div className="text-2xl font-bold text-warning">{completedMissions}</div>
              <p className="text-sm text-muted-foreground">Crises Resolved</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-2xl font-bold text-destructive">
                {criticalMissions > 0 ? 'HIGH' : 'STABLE'}
              </div>
              <p className="text-sm text-muted-foreground">Alert Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ecosystem Health Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>Ecosystem Health</CardTitle>
          <CardDescription>KALE Crisis Control Network Status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  ecosystemHealth > 70 
                    ? 'bg-success/20 text-success' 
                    : ecosystemHealth > 40 
                    ? 'bg-warning/20 text-warning' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  <div className="text-lg font-bold">{ecosystemHealth.toFixed(0)}%</div>
                </div>
              </div>
              <h4 className="font-medium">Mission Progress</h4>
              <p className="text-xs text-muted-foreground">Average completion rate</p>
            </div>
            
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  activeMissions.length > 0 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted/20 text-muted-foreground'
                }`}>
                  <div className="text-lg font-bold">{activeMissions.length}</div>
                </div>
              </div>
              <h4 className="font-medium">Active Operations</h4>
              <p className="text-xs text-muted-foreground">Ongoing missions</p>
            </div>
            
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
                  <div className="text-lg font-bold text-success">
                    ${(totalRewardPool / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
              <h4 className="font-medium">Reward Pool</h4>
              <p className="text-xs text-muted-foreground">Available incentives</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.length}</div>
            <p className="text-xs text-muted-foreground">
              {useRealData ? "From Soroban blockchain" : "Demo missions"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeMissions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently accepting participants
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Participation</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallet?.connected ? userParticipations?.length || 0 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {wallet?.connected ? "Missions joined" : "Connect wallet to view"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Missions List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Missions</h2>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">
              {useRealData ? 'Loading missions from Soroban...' : 'Loading missions...'}
            </span>
          </div>
        ) : missions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {useRealData ? (
              <div>
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No missions found on the blockchain.</p>
                <p className="text-sm">Try creating a mission in Admin mode or switch to Demo mode.</p>
              </div>
            ) : (
              <div>
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No missions available in demo mode.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
