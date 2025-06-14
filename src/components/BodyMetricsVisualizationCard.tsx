
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressChart } from "@/components/ProgressChart";
import { Weight, TrendingUp, Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface BodyMetricsVisualizationCardProps {
  data: any[];
  selectedMetric: 'weight' | 'waist' | 'chest' | 'arms' | 'hips';
  onMetricSelect: (metric: 'weight' | 'waist' | 'chest' | 'arms' | 'hips') => void;
  timeRange: string;
  isLoading: boolean;
  hasData: boolean;
  className?: string;
}

export function BodyMetricsVisualizationCard({ 
  data, 
  selectedMetric, 
  onMetricSelect, 
  timeRange, 
  isLoading, 
  hasData, 
  className 
}: BodyMetricsVisualizationCardProps) {
  const metrics = [
    { key: 'weight' as const, label: 'Weight', unit: 'kg' },
    { key: 'waist' as const, label: 'Waist', unit: 'cm' },
    { key: 'chest' as const, label: 'Chest', unit: 'cm' },
    { key: 'arms' as const, label: 'Arms', unit: 'cm' },
    { key: 'hips' as const, label: 'Hips', unit: 'cm' }
  ];

  const getSingleMetricData = () => {
    return data.map(item => ({
      date: item.date,
      value: item[selectedMetric]
    }));
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Weight className="h-5 w-5 text-hashim-600" />
            <CardTitle className="text-lg">Body Metrics</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-hashim-600"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Trends
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasData ? (
          <>
            {/* Metric Selector */}
            <div className="flex space-x-2 mb-4 overflow-x-auto">
              {metrics.map((metric) => (
                <Button
                  key={metric.key}
                  size="sm"
                  variant={selectedMetric === metric.key ? "default" : "outline"}
                  onClick={() => onMetricSelect(metric.key)}
                  className="capitalize flex-shrink-0"
                >
                  {metric.label}
                </Button>
              ))}
            </div>
            
            {/* Chart */}
            <div className="h-48 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hashim-600"></div>
                </div>
              ) : (
                <ProgressChart
                  data={getSingleMetricData()}
                  singleMetric={selectedMetric}
                />
              )}
            </div>

            {/* Latest Measurement */}
            {data.length > 0 && (
              <div className="p-3 bg-hashim-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Latest {metrics.find(m => m.key === selectedMetric)?.label}</span>
                  <span className="text-lg font-bold text-hashim-700">
                    {data[data.length - 1]?.[selectedMetric]} {metrics.find(m => m.key === selectedMetric)?.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  📈 Tracking since {timeRange === 'week' ? '1 week' : timeRange === 'month' ? '1 month' : '3 months'} ago
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Weight size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium mb-2">No data yet — log your measurements to see trends over time 📈</p>
            <div className="flex justify-center space-x-2 mt-4">
              <Button size="sm" variant="outline">
                <Weight className="h-4 w-4 mr-2" />
                Log Weight
              </Button>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </div>
        )}

        {/* Body Measurements Section */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Progress Photos</h4>
            <Button size="sm" variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Compare
            </Button>
          </div>
          <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Camera size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs text-muted-foreground mb-2">Upload progress photos</p>
            <p className="text-xs text-muted-foreground">Compare side-by-side (1st week vs latest)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
