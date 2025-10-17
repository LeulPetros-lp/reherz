import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const ScoreCardSkeleton = () => {
  return (
    <Card className="p-6 md:p-8 shadow-card">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Overall Score */}
        <div className="text-center py-4 space-y-2">
          <Skeleton className="h-16 w-32 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ScoreCardSkeleton;
