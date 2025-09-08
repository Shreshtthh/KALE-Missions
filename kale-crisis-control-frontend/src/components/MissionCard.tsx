import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mission } from '../types/mission';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  Coins, 
  Target, 
  AlertTriangle, 
  Shield, 
  Zap,
  TrendingDown
} from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
}

export const MissionCard = ({ mission }: MissionCardProps) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = mission.deadline.getTime();
      const timeDiff = deadline - now;

      if (timeDiff <= 0) {
        setTimeLeft('EXPIRED');
        setIsUrgent(false);
        return;
      }

      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${hours}h ${minutes}m`);
      setIsUrgent(hours < 12);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [mission.deadline]);

  const progressPercentage = (mission.current_progress / mission.target_liquidity) * 100;

  const getDifficultyIcon = () => {
    switch (mission.difficulty) {
      case 'easy': return <Shield className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      case 'hard': return <Zap className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = () => {
    switch (mission.difficulty) {
      case 'easy': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'hard': return 'bg-primary/10 text-primary border-primary/20';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getMissionTypeIcon = () => {
    switch (mission.mission_type) {
      case 'liquidity': return <TrendingDown className="h-4 w-4" />;
      case 'stability': return <Shield className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className={`group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-mission hover:-translate-y-1 ${
      mission.active && mission.difficulty === 'critical' ? 'mission-active' : ''
    }`}>
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary/10">
              {getMissionTypeIcon()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
                {mission.title}
              </h3>
              <Badge className={`${getDifficultyColor()} border`}>
                {getDifficultyIcon()}
                <span className="ml-1 capitalize font-medium">
                  {mission.difficulty}
                </span>
              </Badge>
            </div>
          </div>
          
          <div className={`text-right ${isUrgent ? 'countdown-urgent' : ''}`}>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {mission.description}
        </p>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Mission Progress</span>
            <span className="font-mono font-medium text-foreground">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-muted"
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{mission.current_progress.toLocaleString()} KALE</span>
            <span>Target: {mission.target_liquidity.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Participants</p>
              <p className="font-mono font-medium text-sm">
                {mission.participants_count}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Coins className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Reward Pool</p>
              <p className="font-mono font-medium text-sm">
                {mission.reward_pool.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link to={`/mission/${mission.id}`} className="block">
            <Button 
              className="w-full"
              variant="mission"
              size="sm"
            >
              <Target className="h-4 w-4 mr-2" />
              {mission.active ? 'Join Mission' : 'View Results'}
            </Button>
          </Link>
        </div>

        {/* Trigger Price Info */}
        {mission.active && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Triggered at <span className="font-mono text-destructive">${mission.trigger_price.toFixed(3)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};