import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TARGET_WORD = "INNOVISTA";

export default function SplashScreen() {
    const navigate = useNavigate();
    const [phase, setPhase] = useState("blinking"); // "blinking", "revealing", "done"
    const [blinkIndex, setBlinkIndex] = useState(0);

    // Sequence the animation
    useEffect(() => {
        if (phase === "blinking") {
            if (blinkIndex < TARGET_WORD.length) {
                const timer = setTimeout(() => {
                    setBlinkIndex(prev => prev + 1);
                }, 300); // Blink each char every 300ms
                return () => clearTimeout(timer);
            } else {
                // Done blinking, wait a moment then move to reveal
                const timer = setTimeout(() => {
                    setPhase("revealing");
                }, 800);
                return () => clearTimeout(timer);
            }
        } else if (phase === "revealing") {
            // Wait for reveal animation to finish then navigate
            const timer = setTimeout(() => {
                setPhase("done");
                navigate('/select-role');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [phase, blinkIndex, navigate]);

    // Split alphabets into two rows for the grid
    const topRow = ALPHABETS.slice(0, 13);
    const bottomRow = ALPHABETS.slice(13, 26);

    // Get currently blinking character
    const currentChar = phase === "blinking" && blinkIndex < TARGET_WORD.length
        ? TARGET_WORD[blinkIndex]
        : null;

    return (
        <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background Orbs to set the scene */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-[100%] bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-[100%] bg-cyan-400/10 blur-[150px] pointer-events-none" />

            <AnimatePresence>
                {phase === "blinking" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-4 md:gap-6 z-10 w-full px-2"
                    >
                        {/* Top Row Grid - Exactly 13 items */}
                        <div className="flex justify-center flex-wrap md:flex-nowrap gap-2 md:gap-4 w-full max-w-5xl">
                            {topRow.map((letter) => {
                                const isBlinking = letter === currentChar;
                                return (
                                    <div
                                        key={letter}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-xs md:text-lg font-medium transition-all duration-300 border ${isBlinking
                                                ? "bg-white text-[#070B14] shadow-[0_0_30px_rgba(255,255,255,0.8)] border-white scale-125 z-20"
                                                : "bg-transparent text-[#334155] border-[#1E293B] hover:border-[#334155]"
                                            }`}
                                    >
                                        {letter}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Bottom Row Grid - Exactly 13 items */}
                        <div className="flex justify-center flex-wrap md:flex-nowrap gap-2 md:gap-4 w-full max-w-5xl">
                            {bottomRow.map((letter) => {
                                const isBlinking = letter === currentChar;
                                return (
                                    <div
                                        key={letter}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-xs md:text-lg font-medium transition-all duration-300 border ${isBlinking
                                                ? "bg-white text-[#070B14] shadow-[0_0_30px_rgba(255,255,255,0.8)] border-white scale-125 z-20"
                                                : "bg-transparent text-[#334155] border-[#1E293B] hover:border-[#334155]"
                                            }`}
                                    >
                                        {letter}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {phase === "revealing" && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute inset-0 flex items-center justify-center z-20"
                    >
                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-widest uppercase font-outfit"
                            style={{
                                background: 'linear-gradient(to right, #3B82F6, #22D3EE)', // Deep Blue to Cyan
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 0px 20px rgba(34, 211, 238, 0.3))'
                            }}
                        >
                            INNOVISTA
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
