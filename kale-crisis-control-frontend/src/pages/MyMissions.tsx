import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMissionStore } from '../stores/missionStore';
import { useWallet } from '@/lib/wallet';
import { Mission, UserParticipation } from '../types/mission'; // Import Mission type
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Trophy,
  Coins,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';

// Use the existing Mission type and extend it
interface MissionWithParticipation extends Mission {
  participation: UserParticipation;
}

export const MyMissions = () => {
  const { missions, userParticipations, userStats } = useMissionStore();
  const { wallet } = useWallet();

  if (!wallet?.connected) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-muted-foreground mb-4">
              Wallet Not Connected
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect your wallet to view your mission history and stats
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Fixed mapping with proper type assertion
  const activeMissions = userParticipations
    .map(p => {
      const mission = missions.find(m => m.id === p.mission_id);
      if (!mission) return null;
      return { ...mission, participation: p } as MissionWithParticipation;
    })
    .filter((m): m is MissionWithParticipation => m !== null && m.active);

  const completedMissions = userParticipations
    .map(p => {
      const mission = missions.find(m => m.id === p.mission_id);
      if (!mission) return null;
      return { ...mission, participation: p } as MissionWithParticipation;
    })
    .filter((m): m is MissionWithParticipation => m !== null && !m.active);

  const totalRewardsToClaim = completedMissions.reduce((sum, m) => 
    sum + m.participation.rewards_earned, 0);

  const getReputationColor = () => {
    if (!userStats.rank) return 'text-muted-foreground';
    
    switch (userStats.rank) {
      case 'Recruit': return 'text-muted-foreground';
      case 'Operator': return 'text-secondary';
      case 'Commander': return 'text-primary';
      case 'Elite': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const MissionRow = ({ mission }: { mission: MissionWithParticipation }) => {
    const progressPercentage = (mission.current_progress / mission.target_liquidity) * 100;
    
    return (
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-mission transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground mb-2">{mission.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="border-border">
                {mission.difficulty}
              </Badge>
              <Badge variant={mission.active ? "default" : "secondary"}>
                {mission.active ? 'Active' : 'Completed'}
              </Badge>
            </div>
          </div>
          <Link to={`/mission/${mission.id}`}>
            <Button size="sm" variant="outline" className="border-border">
              Go to Mission
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Contribution</span>
            <span className="font-mono font-medium">
              {(mission.participation.stake_amount + mission.participation.contribution_amount).toLocaleString()} KALE
            </span>
          </div>
          
          {mission.active ? (
            <>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progressPercentage.toFixed(1)}% Complete</span>
                <span>{mission.participants_count} participants</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-success">Mission Completed</span>
              <div className="flex items-center text-success">
                <Coins className="h-4 w-4 mr-1" />
                <span className="font-mono">+{mission.participation.rewards_earned.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Mission Profile</h1>
          <p className="text-muted-foreground text-lg">
            Your contribution to ecosystem stability
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-2xl font-bold font-mono">
                  {userStats.total_staked.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Missions Joined</p>
                <p className="text-2xl font-bold font-mono">
                  {userStats.missions_participated}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold font-mono">
                  {userStats.total_rewards.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reputation</p>
                <p className={`text-xl font-bold ${getReputationColor()}`}>
                  {userStats.rank || 'Unranked'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Banner */}
        {totalRewardsToClaim > 0 && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-success" />
                <div>
                  <h3 className="font-bold text-success">Rewards Available</h3>
                  <p className="text-success/80">
                    {totalRewardsToClaim.toLocaleString()} KALE ready to claim from completed missions
                  </p>
                </div>
              </div>
              <Button variant="default">
                <Coins className="h-4 w-4 mr-2" />
                Claim All Rewards
              </Button>
            </div>
          </div>
        )}

        {/* Missions Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="active" className="data-[state=active]:bg-primary/10">
              <Activity className="h-4 w-4 mr-2" />
              Active ({activeMissions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary/10">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed ({completedMissions.length})
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-primary/10">
              <Trophy className="h-4 w-4 mr-2" />
              Rewards ({completedMissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeMissions.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No Active Missions
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Join missions from the command center to start earning rewards
                </p>
                <Link to="/">
                  <Button variant="default">
                    <Target className="h-4 w-4 mr-2" />
                    View Available Missions
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMissions.map((mission) => (
                  <MissionRow key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedMissions.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No Completed Missions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete missions to see your history and claim rewards
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedMissions.map((mission) => (
                  <MissionRow key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Reward History</h3>
              
              {completedMissions.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rewards earned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedMissions.map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{mission.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed {mission.participation.last_contribution.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-success">
                          +{mission.participation.rewards_earned.toLocaleString()} KALE
                        </p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
