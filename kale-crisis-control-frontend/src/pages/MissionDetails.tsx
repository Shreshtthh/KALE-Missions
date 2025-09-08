import { useState, useEffect } from 'react';
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
import { ArrowLeft, Users, Target, Clock, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const MissionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, useRealData, enlistInMission, addContribution, loading } = useMissionStore();
  const { wallet, signTransaction } = useWallet();
  const { toast } = useToast();

  const [stakeAmount, setStakeAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isEnlisting, setIsEnlisting] = useState(false);
  const [isContributing, setIsContributing] = useState(false);

  const mission = missions.find(m => m.id === id);

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
    if (!useRealData) {
      // Demo mode - no wallet required
      const amount = parseInt(stakeAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid stake amount.",
          variant: "destructive",
        });
        return;
      }

      try {
        await enlistInMission(mission.id, amount);
        setStakeAmount('');
        toast({
          title: "Mission Enlisted! (Demo)",
          description: `Successfully enlisted with ${amount} KALE tokens in demo mode.`,
        });
      } catch (error) {
        toast({
          title: "Enlistment Failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Live mode - wallet required
    if (!wallet.connected || !wallet.address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join missions in live mode.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount.",
        variant: "destructive",
      });
      return;
    }

    setIsEnlisting(true);
    try {
      await enlistInMission(
        mission.id,
        amount,
        wallet.address,
        signTransaction
      );
      
      setStakeAmount('');
      toast({
        title: "Mission Enlisted!",
        description: `Successfully enlisted with ${amount} KALE tokens on the blockchain.`,
      });
    } catch (error) {
      toast({
        title: "Enlistment Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnlisting(false);
    }
  };

  const handleContribute = async () => {
    if (!useRealData) {
      // Demo mode
      const amount = parseInt(contributionAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid contribution amount.",
          variant: "destructive",
        });
        return;
      }

      try {
        await addContribution(mission.id, amount);
        setContributionAmount('');
        toast({
          title: "Contribution Added! (Demo)",
          description: `Added ${amount} KALE to the mission in demo mode.`,
        });
      } catch (error) {
        toast({
          title: "Contribution Failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Live mode - wallet required
    if (!wallet.connected || !wallet.address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to contribute in live mode.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }

    setIsContributing(true);
    try {
      await addContribution(
        mission.id,
        amount,
        wallet.address,
        signTransaction
      );
      
      setContributionAmount('');
      toast({
        title: "Contribution Added!",
        description: `Added ${amount} KALE to the mission on the blockchain.`,
      });
    } catch (error) {
      toast({
        title: "Contribution Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Mode indicator */}
      {useRealData && !wallet.connected && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're in Live Mode but no wallet is connected. Connect your wallet to participate in real blockchain transactions.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mission Details */}
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

        {/* Action Panel */}
        <div className="space-y-6">
          {/* Enlist Card */}
          <Card>
            <CardHeader>
              <CardTitle>Join Mission</CardTitle>
              <CardDescription>
                {useRealData 
                  ? "Stake KALE tokens to participate (requires wallet)" 
                  : "Stake KALE tokens to participate (demo mode)"}
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
                />
              </div>
              <Button 
                onClick={handleEnlist} 
                className="w-full"
                disabled={isEnlisting || (!useRealData ? false : !wallet.connected)}
              >
                {isEnlisting ? "Enlisting..." : "Enlist in Mission"}
              </Button>
            </CardContent>
          </Card>

          {/* Contribute Card */}
          <Card>
            <CardHeader>
              <CardTitle>Add Liquidity</CardTitle>
              <CardDescription>
                {useRealData 
                  ? "Contribute to mission progress (requires wallet)" 
                  : "Contribute to mission progress (demo mode)"}
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
                />
              </div>
              <Button 
                onClick={handleContribute} 
                variant="outline" 
                className="w-full"
                disabled={isContributing || (!useRealData ? false : !wallet.connected)}
              >
                {isContributing ? "Contributing..." : "Add Contribution"}
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Status */}
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