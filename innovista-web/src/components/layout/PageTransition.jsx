import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({ children, className = "", delay = 0.1 }) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: delay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem = ({ children, className = "" }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
