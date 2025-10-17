import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface CardSkeletonProps {
  lines?: number;
  hasButton?: boolean;
}

const CardSkeleton = ({ lines = 4, hasButton = false }: CardSkeletonProps) => {
  return (
    <Card className="p-6 shadow-card border border-border">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        
        <div className="space-y-3 pt-2">
          {[...Array(lines)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: `${Math.random() * 30 + 70}%` }}
            />
          ))}
        </div>
        
        {hasButton && (
          <Skeleton className="h-10 w-full mt-4 rounded-md" />
        )}
      </div>
    </Card>
  );
};

export default CardSkeleton;
