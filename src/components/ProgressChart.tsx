
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

const data = [
  { week: 'Week 1', weight: 75, strength: 100 },
  { week: 'Week 2', weight: 74.2, strength: 110 },
  { week: 'Week 3', weight: 73.5, strength: 120 },
  { week: 'Week 4', weight: 72.9, strength: 130 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glassmorphism-card p-3 shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-hashim-800">
          Weight: <span className="font-medium">{payload[0].value}kg</span>
        </p>
        <p className="text-sm text-hashim-600">
          Strength: <span className="font-medium">{payload[1].value}</span>
        </p>
      </div>
    );
  }

  return null;
};

export function ProgressChart() {
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
            dataKey="week" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
            domain={[0, 'dataMax + 20']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="weight" 
            stroke="#075985" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="strength" 
            stroke="#0ea5e9" 
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
