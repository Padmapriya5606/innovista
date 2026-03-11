import React, { useState } from 'react';
import { X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { Button } from './Button';
import { MatchScoreRing } from './MatchScoreRing';

export function IdeaEvaluationModal({ isOpen, onClose }) {
    const [idea, setIdea] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, result
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    const handleEvaluate = async () => {
        if (!idea.trim() || idea.length < 10) return;

        setStatus("loading");
        try {
            const response = await api.post('/matchmaking/evaluate-idea', { idea_text: idea });
            setResult(response.data);
            setStatus("result");
        } catch (e) {
            console.error(e);
            setResult({
                score: 0,
                feedback: "Could not evaluate the idea. Please try again later."
            });
            setStatus("result");
        }
    };

    const resetForm = () => {
        setIdea("");
        setStatus("idle");
        setResult(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
            <div className="relative w-full max-w-2xl bg-[#0D1425] rounded-3xl border border-[#1E293B] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

                <button
                    onClick={resetForm}
                    className="absolute top-6 right-6 p-2 rounded-full bg-[#111827] text-[#64748B] hover:text-white hover:bg-white/10 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-10 relative z-10">
                    {status === "idle" && (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">AI Idea Evaluator</h3>
                                    <p className="text-[#94A3B8] text-sm">Get instant, actionable feedback on your startup pitch.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-[#CBD5E1] block uppercase tracking-wider">
                                    Pitch Your Idea
                                </label>
                                <textarea
                                    value={idea}
                                    onChange={e => setIdea(e.target.value)}
                                    placeholder="Describe your startup idea, the problem it solves, and your target market..."
                                    className="w-full h-40 bg-[#111827] border border-[#1E293B] focus:border-indigo-500/50 rounded-xl p-4 text-white placeholder:text-[#475569] outline-none resize-none transition-colors"
                                />
                                <Button
                                    onClick={handleEvaluate}
                                    disabled={idea.trim().length < 10}
                                    className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white text-lg font-bold transition-all border-none"
                                >
                                    Analyze Idea <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    )}

                    {status === "loading" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 mb-8 relative">
                                <div className="absolute inset-0 border-4 border-[#1E293B] rounded-full" />
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="text-indigo-400 animate-pulse" size={28} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing your pitch...</h3>
                            <p className="text-[#64748B]">Evaluating market viability and generating insights.</p>
                        </div>
                    )}

                    {status === "result" && result && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-10">
                                <div className="inline-flex justify-center mb-6">
                                    <div className="scale-125">
                                        <MatchScoreRing score={result.score} size={120} strokeWidth={8} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">Viability Score</h3>
                                <p className="text-[#94A3B8]">Based on market efficiency and innovation potential</p>
                            </div>

                            <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden mb-8">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                                <h4 className="text-xs uppercase tracking-widest font-bold text-indigo-400 mb-3">AI Evaluator Feedback</h4>
                                <p className="text-[#CBD5E1] leading-relaxed text-[15px]">
                                    {result.feedback}
                                </p>
                            </div>

                            <Button onClick={resetForm} variant="outline" className="w-full">
                                Close View
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
