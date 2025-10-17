import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const ContextUploadSkeleton = () => {
  return (
    <Card className="p-6 shadow-card border border-border">
      <Skeleton className="h-6 w-56 mb-4" />
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContextUploadSkeleton;
