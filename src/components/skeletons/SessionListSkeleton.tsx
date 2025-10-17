import { Skeleton } from "@/components/ui/skeleton";

const SessionListSkeleton = () => {
  return (
    <div className="space-y-1 pb-4 px-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
      <div className="mt-2 px-2">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
};

export default SessionListSkeleton;
