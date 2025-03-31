
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface ProgressChartProps {
  data: { date: string; value: number }[];
  metric?: 'weight' | 'calories' | 'protein' | 'carbs' | 'fat';
}

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (active && payload && payload.length) {
    const unit = getMetricUnit(metric);
    
    return (
      <div className="glassmorphism-card p-3 shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-hashim-800">
          {payload[0].name}: <span className="font-medium">{payload[0].value}{unit}</span>
        </p>
      </div>
    );
  }

  return null;
};

const getMetricUnit = (metric?: string) => {
  switch(metric) {
    case 'weight':
      return 'kg';
    case 'calories':
      return '';
    case 'protein':
    case 'carbs':
    case 'fat':
      return 'g';
    default:
      return '';
  }
};

const getMetricName = (metric?: string) => {
  switch(metric) {
    case 'weight':
      return 'Weight';
    case 'calories':
      return 'Calories';
    case 'protein':
      return 'Protein';
    case 'carbs':
      return 'Carbs';
    case 'fat':
      return 'Fat';
    default:
      return 'Value';
  }
};

export function ProgressChart({ data, metric = 'weight' }: ProgressChartProps) {
  const metricName = getMetricName(metric);
  const metricColor = getMetricColor(metric);
  
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip content={<CustomTooltip metric={metric} />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name={metricName} 
            stroke={metricColor} 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getMetricColor(metric?: string): string {
  switch(metric) {
    case 'weight':
      return '#be123c'; // Red
    case 'calories':
      return '#0891b2'; // Blue
    case 'protein':
      return '#4d7c0f'; // Green
    case 'carbs':
      return '#b45309'; // Orange
    case 'fat':
      return '#7c3aed'; // Purple
    default:
      return '#be123c';
  }
}
