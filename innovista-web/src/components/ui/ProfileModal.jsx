import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, BrainCircuit, Briefcase, Trophy, Target, Calendar } from 'lucide-react';
import { MatchScoreRing } from './MatchScoreRing';
import { Button } from './Button';

export function ProfileModal({ isOpen, onClose, profile, type }) {
    if (!profile) return null;

    const Icon = type === 'Mentor' ? BrainCircuit : Briefcase;
    const color = type === 'Mentor' ? '#3B82F6' : '#22D3EE';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-[#070B14]/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                            className="bg-[#0D1425] border border-[#1E293B] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl pointer-events-auto relative"
                        >
                            {/* Decorative Head */}
                            <div className="absolute top-0 left-0 w-full h-32 opacity-20"
                                style={{
                                    background: `linear-gradient(to bottom, ${color}40, transparent)`,
                                }}
                            />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-white bg-[#111827] rounded-full hover:bg-[#1E293B] transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 relative z-10">
                                {/* Header */}
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0A0F1E] flex items-center justify-center border border-[#334155] shadow-lg relative shrink-0">
                                        <Icon color={color} size={40} />
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center border border-[#1E293B]">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
                                                {type}
                                            </span>
                                        </div>
                                        <p className="text-[#94A3B8] text-lg mb-3">
                                            {type === 'Mentor' ? profile.role : profile.fund}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 rounded-md bg-[#111827] text-white text-xs font-semibold border border-[#1E293B]">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-col items-center p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                                        <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-bold mb-2">Match Synergy</span>
                                        <div className="scale-110">
                                            <MatchScoreRing score={profile.score} />
                                        </div>
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-[#64748B] mb-2 font-semibold text-sm">
                                                <Trophy size={16} /> Key Achievements
                                            </div>
                                            <div className="bg-[#111827] rounded-xl p-4 border border-[#1E293B] text-sm text-[#CBD5E1] space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                                                    Mentored 4 startups from idea to Series A.
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                                                    Domain expert panelist at Global Tech Summit 2025.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-[#111827] rounded-xl p-4 border border-[#1E293B]">
                                                <div className="text-[#64748B] text-xs font-bold uppercase mb-1">Experience</div>
                                                <div className="text-white font-medium">{profile.exp || profile.stage}</div>
                                            </div>
                                            <div className="flex-1 bg-[#111827] rounded-xl p-4 border border-[#1E293B]">
                                                <div className="text-[#64748B] text-xs font-bold uppercase mb-1">Availability</div>
                                                <div className="text-[#10B981] font-medium flex items-center gap-1.5">
                                                    <Calendar size={14} /> Available
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-[#64748B] mb-2 font-semibold text-sm">
                                            <Target size={16} /> Why it's a match
                                        </div>
                                        <div className="bg-gradient-to-br from-[#111827] to-[#0A0F1E] rounded-xl p-5 border border-[#1E293B] h-[calc(100%-28px)] text-[#CBD5E1] leading-relaxed text-sm relative overflow-hidden flex items-center">
                                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl rounded-full" style={{ backgroundColor: color }} />
                                            {profile.reason}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="border-t border-[#1E293B] pt-6 flex justify-end gap-3">
                                    <Button variant="secondary" onClick={onClose} className="px-6 border-[#334155] hover:bg-[#1E293B]">
                                        Close
                                    </Button>
                                    <Button className="px-8 shadow-lg" style={{ background: `linear-gradient(to right, ${color}, ${color}dd)` }}>
                                        Request Connection
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
