import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
    return (
        <div className="min-h-screen pt-24 bg-background relative overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-10 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Hero Section Skeleton */}
            <section className="py-20 relative z-10 text-center space-y-8 flex flex-col items-center">
                <div className="container mx-auto px-4 flex flex-col items-center">
                    <Skeleton className="h-6 w-32 rounded-full mb-4 opacity-70" />
                    <Skeleton className="h-16 md:h-20 w-4/5 max-w-2xl rounded-3xl" />
                    <Skeleton className="h-6 w-2/3 max-w-md rounded-lg mt-6 opacity-60" />
                    <div className="flex gap-4 mt-8">
                        <Skeleton className="h-11 w-32 rounded-full" />
                        <Skeleton className="h-11 w-32 rounded-full opacity-80" />
                    </div>
                </div>
            </section>

            {/* Grid Section Skeleton */}
            <section className="py-10 relative z-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div 
                                key={i} 
                                className="p-6 border border-border/50 rounded-4xl bg-card/40 backdrop-blur-md flex flex-col space-y-5 relative overflow-hidden"
                            >
                                {/* Banner Image Placeholder */}
                                <Skeleton className="aspect-video w-full rounded-3xl" />
                                
                                {/* Header: Category & Rating */}
                                <div className="flex justify-between items-center px-1">
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-12 rounded-md" />
                                </div>
                                
                                {/* Title & Text */}
                                <div className="space-y-3 px-1 grow">
                                    <Skeleton className="h-7 w-3/4 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full rounded-md opacity-70" />
                                        <Skeleton className="h-4 w-5/6 rounded-md opacity-70" />
                                    </div>
                                </div>
                                
                                {/* Footer */}
                                <div className="flex justify-between items-center border-t border-border/30 pt-4 px-1 mt-auto">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
