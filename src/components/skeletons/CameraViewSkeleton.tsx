import { Skeleton } from "@/components/ui/skeleton";

const CameraViewSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-black relative flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto bg-gray-800" />
        <Skeleton className="h-6 w-48 mx-auto bg-gray-800" />
        <Skeleton className="h-4 w-64 mx-auto bg-gray-800" />
      </div>
      
      {/* Timer Skeleton */}
      <div className="absolute top-4 right-4">
        <Skeleton className="h-8 w-20 bg-gray-800" />
      </div>
      
      {/* Stop Button Skeleton */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Skeleton className="h-14 w-48 rounded-full bg-gray-800" />
      </div>
    </div>
  );
};

export default CameraViewSkeleton;
