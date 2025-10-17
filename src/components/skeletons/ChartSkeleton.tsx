import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const ChartSkeleton = () => {
  return (
    <Card className="p-6 shadow-card border border-border">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="h-64 w-full space-y-4">
        <div className="flex items-end justify-between h-48">
          {[...Array(9)].map((_, i) => (
            <Skeleton
              key={i}
              className="w-8"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
      
      {/* Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </div>
      </div>
      
      <Skeleton className="h-10 w-full mt-6 rounded-md" />
    </Card>
  );
};

export default ChartSkeleton;
