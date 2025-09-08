import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMissionStore } from '../stores/missionStore';
import { ArrowLeft, Plus, TrendingDown } from 'lucide-react';

export const AdminMissionCreator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createMission, priceData, updatePriceData } = useMissionStore();

  const [formData, setFormData] = useState({
    targetLiquidity: '',
    rewardPool: '',
    duration: '',
    triggerPrice: '',
    title: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateMission = async () => {
    const requiredFields = ['targetLiquidity', 'rewardPool', 'duration', 'triggerPrice', 'title', 'description'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createMission({
        title: formData.title,
        description: formData.description,
        targetLiquidity: parseInt(formData.targetLiquidity),
        rewardPool: parseInt(formData.rewardPool),
        duration: parseInt(formData.duration),
        triggerPrice: parseFloat(formData.triggerPrice)
      });

      setFormData({
        targetLiquidity: '', rewardPool: '', duration: '',
        triggerPrice: '', title: '', description: ''
      });

      toast({
        title: "Mission Created",
        description: `${formData.title} has been activated and deployed.`,
      });

      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast({
        title: "Failed to Create Mission",
        description: "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSimulatePriceDrop = (percentage: number) => {
    const currentPrice = priceData.current_price;
    const newPrice = currentPrice * (1 - percentage / 100);
    const newPriceData = {
      ...priceData,
      current_price: newPrice,
      chart_data: [...priceData.chart_data, { timestamp: Date.now(), price: newPrice }],
    };
    updatePriceData(newPriceData);
    toast({
      title: "Price Drop Simulated",
      description: `XLM price dropped by ${percentage}% to $${newPrice.toFixed(4)}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Command Center
      </Button>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manual Mission Creator</h1>
          <p className="text-muted-foreground">Deploy emergency missions to stabilize the ecosystem</p>
        </div>

        <Card className="p-8">
          {/* Form fields remain the same... */}
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Mission Title</Label>
                  <Input id="title" placeholder="e.g., XLM/USDC Liquidity Crisis" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger_price">Trigger Price (USD)</Label>
                  <Input id="trigger_price" type="number" step="0.001" placeholder="0.085" value={formData.triggerPrice} onChange={(e) => handleInputChange('triggerPrice', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mission Description</Label>
                <Input id="description" placeholder="Detailed mission briefing" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="target_liquidity">Target Liquidity</Label>
                  <Input id="target_liquidity" type="number" placeholder="100000" value={formData.targetLiquidity} onChange={(e) => handleInputChange('targetLiquidity', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward_pool">Reward Pool</Label>
                  <Input id="reward_pool" type="number" placeholder="50000" value={formData.rewardPool} onChange={(e) => handleInputChange('rewardPool', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duration (Hours)</Label>
                  <Input id="duration_hours" type="number" placeholder="24" value={formData.duration} onChange={(e) => handleInputChange('duration', e.target.value)} />
                </div>
              </div>
              <Button onClick={handleCreateMission} className="w-full mt-8" variant="mission" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Mission
              </Button>
            </div>
        </Card>

        <div className="mt-8">
          <h2 className="text-2xl font-bold">Oracle Controls (Demo)</h2>
          <Card className="p-8 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Simulate Price Drop</h3>
                <p className="text-sm text-muted-foreground">Test mission activation conditions.</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={() => handleSimulatePriceDrop(20)} variant="destructive">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Drop XLM Price by 20%
                </Button>
                <p className="text-sm text-muted-foreground">
                  Current: <span className="font-mono text-foreground">${priceData.current_price.toFixed(4)}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};