import { Skeleton } from "@/components/ui/skeleton";

export default function PageSkeleton() {
    return (
        <div className="flex w-full flex-col gap-3 p-6">
            <Skeleton className="h-5 w-[40%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-5 w-[80%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[60%]" />
        </div>
    )
}