import React from 'react';
import { cn } from '../../utils/cn';

export const Card = React.forwardRef(({ className, children, noPadding = false, hover = false, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "rounded-[16px] bg-[#111827] border border-[#6366F1]/15",
                !noPadding && "p-6",
                hover && "transition-all duration-300 hover:bg-[#1A2236] hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] hover:border-[#6366F1]/30",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = "Card";
