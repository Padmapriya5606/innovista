import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(({ className, type = "text", error, ...props }, ref) => {
    return (
        <div className="relative w-full">
            <input
                type={type}
                className={cn(
                    "flex w-full rounded-[10px] border border-[#6366F1]/20 bg-[#0D1425] px-4 py-3 text-sm text-white transition-all duration-200",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-slate-500",
                    "focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] focus:shadow-[0_0_12px_rgba(99,102,241,0.2)]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <span className="text-xs text-red-500 mt-1 absolute -bottom-5 left-0">
                    {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = "Input";
