import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { PriceData } from '../types/mission';

interface PriceChartProps {
  data: PriceData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const formatPrice = (price: number) => `$${price.toFixed(4)}`;
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPositiveChange = data.price_change_24h > 0;

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-mission">
          <p className="text-sm text-muted-foreground">{formatTime(label ?? 0)}</p>
          <p className="font-mono font-medium text-foreground">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">XLM Price</h3>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-2xl font-mono font-bold text-foreground">
              {formatPrice(data.current_price)}
            </span>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
              isPositiveChange 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isPositiveChange ? '+' : ''}{data.price_change_24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">24H Volume</p>
          <p className="font-mono font-medium">$2.4M</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.chart_data}>
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatTime}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={['dataMin - 0.002', 'dataMax + 0.002']}
              tickFormatter={(value: number) => `$${value.toFixed(3)}`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Price data updates every 5 minutes • Market stress level: 
          <span className="text-destructive font-medium ml-1">HIGH</span>
        </p>
      </div>
    </div>
  );
};
