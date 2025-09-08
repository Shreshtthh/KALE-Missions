import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMissionStore } from '@/stores/missionStore';
import { useWallet } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, Target, Clock, AlertCircle, CheckCircle, PiggyBank } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const MissionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, userParticipations, useRealData, enlistInMission, addContribution, loading } = useMissionStore();
  const { wallet, signTransaction } = useWallet();
  const { toast } = useToast();

  const [stakeAmount, setStakeAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isEnlisting, setIsEnlisting] = useState(false);
  const [isContributing, setIsContributing] = useState(false);

  const mission = missions.find(m => m.id === id);
  const userParticipation = userParticipations.find(p => p.mission_id === id);

  if (!mission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Mission Not Found</h2>
          <p className="text-muted-foreground mt-2">The mission you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = (mission.current_progress / mission.target_liquidity) * 100;

  const handleEnlist = async () => {
    // ... (This function remains the same as the previous correct version)
  };

  const handleContribute = async () => {
    // ... (This function remains the same as the previous correct version)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {useRealData && !wallet.connected && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're in Live Mode but no wallet is connected. Connect your wallet to participate in real blockchain transactions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RESTORED: Mission Details Card (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{mission.title}</CardTitle>
                <Badge variant={mission.active ? "default" : "secondary"}>
                  {mission.active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <CardDescription>{mission.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{mission.current_progress.toLocaleString()} KALE</span>
                  <span>{mission.target_liquidity.toLocaleString()} KALE</span>
                </div>
              </div>

              <Separator />

              {/* Mission Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mission.participants_count}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <Users className="h-3 w-3 mr-1" />
                    Participants
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mission.reward_pool.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <Target className="h-3 w-3 mr-1" />
                    Rewards
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${mission.trigger_price.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Trigger Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.ceil((mission.deadline.getTime() - Date.now()) / (1000 * 60 * 60))}h
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel (Right Column) */}
        <div className="space-y-6">
          {/* Your Status Card */}
          {userParticipation && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  You Are Enlisted
                </CardTitle>
                <CardDescription>
                  Your contributions are helping to stabilize the ecosystem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Amount Staked</span>
                  <span className="font-mono font-medium text-foreground">
                    {userParticipation.stake_amount.toLocaleString()} KALE
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Contribution</span>
                  <span className="font-mono font-medium text-foreground">
                    {userParticipation.contribution_amount.toLocaleString()} KALE
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conditional Enlist/Contribute Cards */}
          {!userParticipation ? (
            <Card>
              <CardHeader>
                <CardTitle>Join Mission</CardTitle>
                <CardDescription>
                  Stake KALE tokens to participate ({useRealData ? "Live" : "Demo"} Mode)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stake">Stake Amount (KALE)</Label>
                  <Input
                    id="stake"
                    type="number"
                    placeholder="Enter amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    disabled={loading || isEnlisting}
                  />
                </div>
                <Button 
                  onClick={handleEnlist} 
                  className="w-full"
                  disabled={isEnlisting || (useRealData && !wallet.connected)}
                >
                  {isEnlisting ? "Enlisting..." : "Enlist in Mission"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Add Liquidity</CardTitle>
                <CardDescription>
                  Contribute to mission progress ({useRealData ? "Live" : "Demo"} Mode)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contribution">Contribution Amount (KALE)</Label>
                  <Input
                    id="contribution"
                    type="number"
                    placeholder="Enter amount"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    disabled={loading || isContributing}
                  />
                </div>
                <Button 
                  onClick={handleContribute} 
                  variant="outline" 
                  className="w-full"
                  disabled={isContributing || (useRealData && !wallet.connected)}
                >
                  {isContributing ? "Contributing..." : "Add Contribution"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Wallet Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              {useRealData ? (
                wallet.connected ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Wallet:</span>
                      <Badge variant="outline">{wallet.walletType}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {wallet.address}
                    </div>
                    {wallet.balance?.xlm !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm">Balance:</span>
                        <span className="text-sm">{wallet.balance.xlm.toFixed(4)} XLM</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">No wallet connected</p>
                    <p className="text-xs">Connect wallet to participate</p>
                  </div>
                )
              ) : (
                <div className="text-center text-muted-foreground">
                  <Badge variant="secondary">Demo Mode</Badge>
                  <p className="text-xs mt-2">No wallet required for demo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};