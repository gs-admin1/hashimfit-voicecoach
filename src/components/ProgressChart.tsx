
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
  { week: 'Week 1', weight: 75, calories: 2600, protein: 160, carbs: 240, fat: 90 },
  { week: 'Week 2', weight: 74.2, calories: 2500, protein: 170, carbs: 220, fat: 86 },
  { week: 'Week 3', weight: 73.5, calories: 2450, protein: 175, carbs: 210, fat: 84 },
  { week: 'Week 4', weight: 72.9, calories: 2400, protein: 180, carbs: 200, fat: 82 },
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
          Calories: <span className="font-medium">{payload[1].value}</span>
        </p>
        <p className="text-sm text-green-600">
          Protein: <span className="font-medium">{payload[2].value}g</span>
        </p>
        <p className="text-sm text-blue-600">
          Carbs: <span className="font-medium">{payload[3].value}g</span>
        </p>
        <p className="text-sm text-orange-600">
          Fat: <span className="font-medium">{payload[4].value}g</span>
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
            yAxisId="weight" 
            orientation="left" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <YAxis 
            yAxisId="macro" 
            orientation="right" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
            domain={[0, 'dataMax + 100']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
          />
          <Line 
            yAxisId="weight"
            type="monotone" 
            dataKey="weight" 
            stroke="#be123c" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
          <Line 
            yAxisId="macro"
            type="monotone" 
            dataKey="calories" 
            stroke="#777777" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
          <Line 
            yAxisId="macro"
            type="monotone" 
            dataKey="protein" 
            stroke="#16a34a" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
          <Line 
            yAxisId="macro"
            type="monotone" 
            dataKey="carbs" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            animationDuration={1500}
          />
          <Line 
            yAxisId="macro"
            type="monotone" 
            dataKey="fat" 
            stroke="#ea580c" 
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
