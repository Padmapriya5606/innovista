import React from 'react';
import { cn } from '../../utils/cn';

export const GradientText = ({ children, as: Component = 'span', className, ...props }) => {
    return (
        <Component
            className={cn("bg-clip-text text-transparent bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]", className)}
            {...props}
            style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}
        >
            {children}
        </Component>
    );
};
