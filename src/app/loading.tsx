import { HeroSkeleton, GridCardSkeleton, BoneyardLoader } from "@/components/boneyard";

export default function GlobalLoading() {
    return (
        <div className="min-h-screen pt-24 bg-background relative overflow-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-10 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Hero Section Skeleton */}
            <HeroSkeleton />

            {/* Grid Section Skeleton */}
            <section className="py-10 relative z-10">
                <div className="container mx-auto px-4 max-w-6xl">
                    <BoneyardLoader
                        skeleton={GridCardSkeleton}
                        count={6}
                        columns={3}
                        label="Loading content"
                        gridClassName="gap-8"
                    />
                </div>
            </section>
        </div>
    );
}
