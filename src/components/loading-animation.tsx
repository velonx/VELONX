"use client";

import React from 'react';

export default function LoadingAnimation() {
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-in fade-in zoom-in duration-500"
            >
                {/* Stairs - Black Line */}
                <path
                    d="M40 160H80V130H120V100H160"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Shape 1: Vertical Bar (Maroon) - Hopping on Step 1 */}
                <rect
                    x="45"
                    y="125"
                    width="12"
                    height="30"
                    rx="4"
                    fill="#800020"
                    className="origin-bottom"
                    style={{
                        animation: 'hop 1.5s ease-in-out infinite',
                        animationDelay: '0s'
                    }}
                />

                {/* Shape 2: Semi-circle (Orange) - Hopping on Step 2 */}
                <path
                    d="M85 125C85 113.954 93.9543 105 105 105C116.046 105 125 113.954 125 125H85Z"
                    fill="#FB923C"
                    className="origin-bottom"
                    style={{
                        animation: 'hop 1.5s ease-in-out infinite',
                        animationDelay: '0.2s'
                    }}
                />

                {/* Shape 3: Oval (Maroon) - Hopping on Step 3 */}
                <ellipse
                    cx="145"
                    cy="85"
                    rx="18"
                    ry="12"
                    fill="#800020"
                    style={{
                        animation: 'hop 1.5s ease-in-out infinite',
                        animationDelay: '0.4s'
                    }}
                />
            </svg>

            <style jsx>{`
                @keyframes hop {
                    0%, 100% {
                        transform: translateY(0) scaleY(1);
                    }
                    50% {
                        transform: translateY(-20px) scaleY(1.1);
                    }
                }
            `}</style>

            <div className="flex flex-col items-center">
                <span className="text-xl font-bold tracking-widest text-white animate-pulse">
                    VELONX
                </span>
                <span className="text-sm text-gray-500 mt-1 uppercase tracking-[0.3em]">
                    Innovating the Gap
                </span>
            </div>
        </div>
    );
}
