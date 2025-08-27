import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { FurnitureItem } from "@/types/furniture";

interface PriceChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: FurnitureItem[];
}

export function PriceChartDialog({ open, onOpenChange, items }: PriceChartDialogProps) {
  const chartData = React.useMemo(() => {
    const validPriceItems = items.filter(item => 
      item.price !== undefined && 
      item.status !== 'deleted'
    );
    return validPriceItems.map(item => ({
      name: item.title,
      value: item.price || 0,
      status: item.status,
    }));
  }, [items]);

  const totalPrice = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const STATUS_COLORS = {
    pending: "#6366F1",  // Indigo - vibrant but not too harsh
    ordered: "#22C55E",  // Green - distinct from both pending and received
    received: "#EC4899", // Pink - strong contrast with other colors
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Price Distribution</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold">Total: €{totalPrice.toFixed(2)}</p>
          </div>
          {chartData.length > 0 ? (
            <ChartContainer className="h-[300px]" config={{}}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={(entry) => `€${entry.value}`}
                  strokeWidth={1}
                  stroke="#fff" // White border to help separate segments
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 shadow rounded">
                        <p className="font-medium">{data.name}</p>
                        <p>€{data.value}</p>
                        <p className="capitalize">{data.status}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <ChartLegend />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="text-center text-muted-foreground">
              No items with prices found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 