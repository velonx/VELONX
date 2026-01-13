import LoadingAnimation from "@/components/loading-animation";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]">
            <LoadingAnimation />
        </div>
    );
}
