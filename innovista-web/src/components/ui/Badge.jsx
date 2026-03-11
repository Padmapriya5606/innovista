import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, className, ...props }) => {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full bg-[#6366F1]/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-gradient border border-[#6366F1]/20",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
