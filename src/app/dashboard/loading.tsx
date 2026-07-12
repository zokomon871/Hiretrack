import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2 mb-6">
        <Skeleton className="h-9 w-[150px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[50px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[150px] w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
