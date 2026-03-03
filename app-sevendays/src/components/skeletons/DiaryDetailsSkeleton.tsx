import { Skeleton } from "@/components/ui/skeleton";

export default function DiaryDetailsSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-8 w-60" />
      <Skeleton className="h-4 w-72" />
      <div className="w-full">
        <Skeleton className="h-[420px] w-full" />
      </div>
    </div>
  );
}
