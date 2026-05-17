import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section Skeleton */}
            <section className="py-20 bg-background overflow-hidden relative">
                <div className="container mx-auto px-4 relative z-10 text-center space-y-8 flex flex-col items-center">
                    <Skeleton className="h-16 md:h-24 w-3/4 max-w-3xl rounded-2xl" />
                    <Skeleton className="h-6 md:h-8 w-1/2 max-w-xl rounded-lg mt-6" />
                    <Skeleton className="h-14 w-full max-w-md rounded-full mt-10" />
                </div>
            </section>

            {/* Grid Section Skeleton */}
            <section className="py-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col space-y-4">
                                <Skeleton className="aspect-video w-full rounded-[32px]" />
                                <div className="space-y-3 pt-4 px-2">
                                    <Skeleton className="h-4 w-1/4 rounded-md" />
                                    <Skeleton className="h-8 w-full rounded-md" />
                                    <Skeleton className="h-4 w-5/6 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
