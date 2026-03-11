import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'default',
    children,
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#0A0F1E] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-gradient-primary text-white hover:scale-[1.02] shadow-[0_0_16px_rgba(99,102,241,0.2)] hover:shadow-[0_0_32px_rgba(99,102,241,0.4)]",
        secondary: "bg-transparent text-white border border-[#6366F1] hover:bg-[#6366F1]/10 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(99,102,241,0.15)]",
        danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(239,68,68,0.2)]",
        ghost: "bg-transparent text-white hover:bg-white/5",
    };

    const sizes = {
        default: "px-7 py-3 text-[15px]",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-base",
    };

    return (
        <button
            ref={ref}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {variant === 'secondary' ? (
                <span className="text-gradient font-semibold">{children}</span>
            ) : children}
        </button>
    );
});

Button.displayName = "Button";
