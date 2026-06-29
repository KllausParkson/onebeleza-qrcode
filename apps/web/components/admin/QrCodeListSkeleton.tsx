import { Skeleton } from "@/components/ui/skeleton";

export default function QrCodeListSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="ml-auto h-4 w-24" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3"
          >
            <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="text-right space-y-1 shrink-0">
              <Skeleton className="h-4 w-10 ml-auto" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
            <div className="flex gap-1 shrink-0">
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} className="w-7 h-7 rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
