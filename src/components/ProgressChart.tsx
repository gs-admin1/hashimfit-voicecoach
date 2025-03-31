
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
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glassmorphism-card p-3 shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-hashim-800">
          {payload[0].name}: <span className="font-medium">{payload[0].value}{payload[0].name === "Weight" ? "kg" : "g"}</span>
        </p>
      </div>
    );
  }

  return null;
};

export function ProgressChart({ data }: ProgressChartProps) {
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
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Weight" 
            stroke="#be123c" 
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
