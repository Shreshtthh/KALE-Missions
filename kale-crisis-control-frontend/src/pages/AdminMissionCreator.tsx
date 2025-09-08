import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMissionStore } from '../stores/missionStore';
import { ArrowLeft, Plus } from 'lucide-react';

export const AdminMissionCreator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { missions, setMissions } = useMissionStore();

  const [formData, setFormData] = useState({
    target_liquidity: '',
    reward_pool: '',
    duration_hours: '',
    trigger_price: '',
    title: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateMission = () => {
    // Validate form
    const requiredFields = ['target_liquidity', 'reward_pool', 'duration_hours', 'trigger_price', 'title', 'description'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Create new mission
    const newMission = {
      id: `mission-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      target_liquidity: parseInt(formData.target_liquidity),
      current_progress: 0,
      reward_pool: parseInt(formData.reward_pool),
      deadline: new Date(Date.now() + parseInt(formData.duration_hours) * 60 * 60 * 1000),
      participants_count: 0,
      trigger_price: parseFloat(formData.trigger_price),
      active: true,
      difficulty: 'medium' as const,
      mission_type: 'liquidity' as const
    };

    // Add to store
    setMissions([...missions, newMission]);

    // Reset form
    setFormData({
      target_liquidity: '',
      reward_pool: '',
      duration_hours: '',
      trigger_price: '',
      title: '',
      description: ''
    });

    toast({
      title: "Mission Created",
      description: `${formData.title} has been activated and deployed to agents.`,
    });

    // Navigate back to Command Center
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Command Center
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Manual Mission Creator</h1>
            <p className="text-muted-foreground">Deploy emergency missions to stabilize the ecosystem</p>
          </div>

          <Card className="bg-card border-border p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground font-medium">Mission Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., XLM/USDC Liquidity Crisis"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger_price" className="text-foreground font-medium">Trigger Price (USD)</Label>
                  <Input
                    id="trigger_price"
                    type="number"
                    step="0.001"
                    placeholder="0.085"
                    value={formData.trigger_price}
                    onChange={(e) => handleInputChange('trigger_price', e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Mission Description</Label>
                <Input
                  id="description"
                  placeholder="Detailed mission briefing and objectives"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="target_liquidity" className="text-foreground font-medium">Target Liquidity</Label>
                  <Input
                    id="target_liquidity"
                    type="number"
                    placeholder="100000"
                    value={formData.target_liquidity}
                    onChange={(e) => handleInputChange('target_liquidity', e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reward_pool" className="text-foreground font-medium">Reward Pool</Label>
                  <Input
                    id="reward_pool"
                    type="number"
                    placeholder="50000"
                    value={formData.reward_pool}
                    onChange={(e) => handleInputChange('reward_pool', e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_hours" className="text-foreground font-medium">Duration (Hours)</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    placeholder="24"
                    value={formData.duration_hours}
                    onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateMission}
                className="w-full mt-8"
                variant="mission"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Mission
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};