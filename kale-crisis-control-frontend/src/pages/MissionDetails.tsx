import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMissionStore } from '@/stores/missionStore';
import { useWallet } from '@/lib/wallet'; // ✅ Import the hook
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Target, Clock, CheckCircle, Trophy, PartyPopper } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const MissionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { missions, userParticipations, useRealData, enlistInMission, addContribution, loading } = useMissionStore();
  const { wallet, kit } = useWallet(); // ✅ Use the hook to get both wallet and kit
  const { toast } = useToast();

  const [stakeAmount, setStakeAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isEnlisting, setIsEnlisting] = useState(false);
  const [isContributing, setIsContributing] = useState(false);

  const mission = missions.find(m => m.id === id);
  const userParticipation = userParticipations.find(p => p.mission_id === id);

  if (!mission) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Mission Not Found</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const progressPercentage = (mission.current_progress / mission.target_liquidity) * 100;
  const isMissionComplete = progressPercentage >= 100;

  const handleEnlist = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({ 
        title: "Invalid Amount", 
        description: "Please enter a valid stake amount.", 
        variant: "destructive" 
      });
      return;
    }

    if (useRealData && !wallet.connected) {
      toast({ 
        title: "Wallet Not Connected", 
        description: "Please connect your wallet to enlist.", 
        variant: "destructive" 
      });
      return;
    }

    setIsEnlisting(true);
    try {
      // ✅ Pass the correct WalletInfo structure with both wallet and kit
      await enlistInMission(id!, parseFloat(stakeAmount), { wallet, kit });
      
      toast({
        title: useRealData ? "Transaction Submitted" : "Enlisted Successfully (Demo)",
        description: useRealData 
          ? "Your enlistment transaction has been sent to the network." 
          : `You have enlisted with ${stakeAmount} KALE stake.`,
      });
      setStakeAmount('');
    } catch (error) {
      console.error('Enlist error:', error);
      toast({
        title: "Failed to Enlist",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsEnlisting(false);
    }
  };

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast({ 
        title: "Invalid Amount", 
        description: "Please enter a valid contribution amount.", 
        variant: "destructive" 
      });
      return;
    }

    if (useRealData && !wallet.connected) {
      toast({ 
        title: "Wallet Not Connected", 
        description: "Please connect your wallet to contribute.", 
        variant: "destructive" 
      });
      return;
    }

    setIsContributing(true);
    try {
      // ✅ Pass the correct WalletInfo structure with both wallet and kit
      await addContribution(id!, parseFloat(contributionAmount), { wallet, kit });
      
      toast({
        title: useRealData ? "Transaction Submitted" : "Contribution Added (Demo)",
        description: useRealData 
          ? "Your contribution transaction has been sent to the network." 
          : `You have contributed ${contributionAmount} KALE to the mission.`,
      });
      setContributionAmount('');
    } catch (error) {
      console.error('Contribute error:', error);
      toast({
        title: "Failed to Contribute",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handleClaimReward = () => {
    toast({
      title: "Rewards Claimed! (Demo)",
      description: `You have received your rewards for completing the mission.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{mission.title}</CardTitle>
                <Badge variant={mission.active ? "default" : "secondary"}>
                  {mission.active ? "Active" : "Completed"}
                </Badge>
              </div>
              <CardDescription>{mission.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className={isMissionComplete ? 'text-success font-bold' : ''}>
                    {progressPercentage > 100 ? '100.0' : progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{mission.current_progress.toLocaleString()} KALE</span>
                  <span>{mission.target_liquidity.toLocaleString()} KALE</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{mission.participants_count}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <Users className="h-3 w-3 mr-1" />
                    Participants
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{mission.reward_pool.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <Trophy className="h-3 w-3 mr-1" />
                    Rewards
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${mission.trigger_price.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Trigger Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {isMissionComplete ? 'Completed' : `${Math.ceil((mission.deadline.getTime() - Date.now()) / (1000 * 60 * 60))}h`}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {isMissionComplete ? 'Status' : 'Remaining'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {userParticipation && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  You Are Enlisted
                </CardTitle>
                <CardDescription>Your contributions are helping to stabilize the ecosystem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Amount Staked</span>
                  <span className="font-mono font-medium text-foreground">{userParticipation.stake_amount.toLocaleString()} KALE</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Contribution</span>
                  <span className="font-mono font-medium text-foreground">{userParticipation.contribution_amount.toLocaleString()} KALE</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conditional Action Cards */}
          {isMissionComplete ? (
            <Card className="bg-success/10 border-success/20 text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-success">
                  <PartyPopper className="h-6 w-6 mr-2"/>
                  Goal Achieved!
                </CardTitle>
                <CardDescription>This mission has been successfully completed thanks to your contribution.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleClaimReward} variant="mission-success" className="w-full">
                  <Trophy className="h-4 w-4 mr-2"/>
                  Claim Reward
                </Button>
              </CardContent>
            </Card>
          ) : !userParticipation ? (
            <Card>
              <CardHeader>
                <CardTitle>Join Mission</CardTitle>
                <CardDescription>Stake KALE tokens to participate ({useRealData ? "Live" : "Demo"} Mode)</CardDescription>
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
                <CardDescription>Contribute to mission progress ({useRealData ? "Live" : "Demo"} Mode)</CardDescription>
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
        </div>
      </div>
    </div>
  );
};
