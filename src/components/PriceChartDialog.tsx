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
    const validPriceItems = items.filter(item => item.price !== undefined);
    return validPriceItems.map(item => ({
      name: item.title,
      value: item.price || 0,
    }));
  }, [items]);

  const totalPrice = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9FA8DA",
    "#FFE082",
    "#A5D6A7",
    "#EF9A9A",
  ];

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
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip />
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