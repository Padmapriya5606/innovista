import React, { useEffect, useState } from 'react';

export const MatchScoreRing = ({ score }) => {
    const [offset, setOffset] = useState(100);

    useEffect(() => {
        // Animate stroke dashoffset on mount
        const timer = setTimeout(() => {
            setOffset(100 - score);
        }, 300);
        return () => clearTimeout(timer);
    }, [score]);

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#1E293B" // Slate 800 background circle
                    strokeWidth="6"
                    fill="transparent"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#gradient)" // Linear gradient ref
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="176" // 2 * pi * 28 = ~175.9
                    strokeDashoffset={(176 * offset) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="flex flex-col items-center justify-center -mt-1">
                <span className="text-gradient font-bold text-lg leading-none">{score}%</span>
            </div>
        </div>
    );
};
