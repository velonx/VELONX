"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ProjectData {
    name: string;
    src: string;
    category?: string;
    dateMonth?: string;
    dateDay?: string;
    description?: string;
    link?: string;
}

interface ShowcaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectData | null;
}

export const ShowcaseModal: React.FC<ShowcaseModalProps> = ({ isOpen, onClose, project }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Trap focus and handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            {/* Modal Backdrop / overlay click to close */}
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

            {/* Modal Card */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Top Image Area */}
                <div className="relative h-64 w-full bg-zinc-200 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={project.src}
                        alt={project.name}
                        className="w-full h-full object-cover"
                    />

                    {/* Date Badge */}
                    <div className="absolute -bottom-10 left-8 bg-white dark:bg-[#2C2C2E] shadow-xl rounded-2xl w-20 h-20 flex flex-col items-center justify-center z-10">
                        <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 tracking-widest uppercase">
                            {project.dateMonth || "AUG"}
                        </span>
                        <span className="text-3xl font-black text-[#B03A2E] leading-none mt-1">
                            {project.dateDay || "15"}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="pt-14 pb-8 px-8 flex flex-col">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                        {project.category || "Community Project"}
                    </span>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-4">
                        {project.name}
                    </h2>
                    
                    <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed min-h-[4rem]">
                        {project.description || "A fantastic project created by a talented member of our community, showcasing emerging technologies and creative problem-solving."}
                    </p>

                    <div className="mt-8">
                        <a
                            href={project.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-[#5D6D34] dark:text-[#A4C05A] font-bold uppercase text-sm tracking-wider hover:underline underline-offset-4"
                        >
                            VISIT PROJECT
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
