import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OwnerSettingsSkeleton() {
  return (
    <div className="w-full max-w-7xl flex flex-col items-start justify-start gap-8 sm:mx-auto mx-0 px-4 py-10">
      <div className="w-full flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-9 w-40" />
      </div>

      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

