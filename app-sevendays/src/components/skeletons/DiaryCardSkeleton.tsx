import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiaryCardSkeleton() {
  return (
    <Card className="w-full border-solid border border-border rounded-md py-5">
      <CardHeader className="flex flex-row items-center justify-center pb-2">
        <Skeleton className="h-28 w-28 rounded-full" />
      </CardHeader>
      <Separator className="w-full h-[1px] bg-border" />
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <Separator className="w-full h-[1px] bg-border" />
      <CardFooter className="pt-4">
        <Skeleton className="h-12 w-full" />
      </CardFooter>
    </Card>
  );
}
