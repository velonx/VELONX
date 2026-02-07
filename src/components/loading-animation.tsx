"use client";

import React from 'react';
import Image from 'next/image';

export default function LoadingAnimation() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6" role="status" aria-live="polite">
            <span className="sr-only">Loading, please wait...</span>
            <div className="relative w-64 h-16 animate-pulse">
                <Image
                    src="/logo.png"
                    alt="Velonx Logo"
                    fill
                    sizes="256px"
                    className="object-contain"
                    priority
                />
            </div>

            <div className="flex space-x-2" aria-hidden="true">
                <div className="w-3 h-3 bg-[#800020] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-[#FB923C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-[#800020] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>

            <span className="text-sm text-gray-500 uppercase tracking-[0.3em]" aria-hidden="true">
                Innovating the Gap
            </span>
        </div>
    );
}
