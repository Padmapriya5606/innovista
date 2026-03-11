import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrainCircuit, Briefcase, Users, ArrowRight, MessageCircle } from 'lucide-react';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { MatchScoreRing } from '../components/ui/MatchScoreRing';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ChatModal } from '../components/ui/ChatModal';
import { ProfileModal } from '../components/ui/ProfileModal';
import { IdeaEvaluationModal } from '../components/ui/IdeaEvaluationModal';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

export default function MatchResults() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we passed a specific intent query from registration or dashboard
    const query = location.state?.query || "Seeking mentorship and scaling advice for an early stage tech startup.";

    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [chatTarget, setChatTarget] = useState(null);
    const [profileTarget, setProfileTarget] = useState(null);
    const [isIdeaEvalOpen, setIsIdeaEvalOpen] = useState(false);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await api.post('/matchmaking/search', {
                    query: query,
                    limit: 5
                });

                // Store all matches sequentially
                const allMatches = response.data.matches;

                setMatches(allMatches);

                toast.success(`Ecosystem scan complete. ${allMatches.length} matches found.`, {
                    style: { borderRadius: '10px', background: '#111827', color: '#fff', border: '1px solid #1E293B' },
                    iconTheme: { primary: '#10B981', secondary: '#111827' }
                });
            } catch (error) {
                console.error("Matchmaking error:", error);
                toast.error("Failed to connect to AI engine. Defaulting to mock profiles.");
                setMatches([
                    {
                        user_id: 9991,
                        name: "Sarah Chen (Mock)",
                        role: "Mentor",
                        score: 95,
                        tags: ["Mock", "AI", "Startup"],
                        reason: "Mock fallback data due to connection error."
                    },
                    {
                        user_id: 9992,
                        name: "Venture Partners (Mock)",
                        role: "Investor",
                        score: 91,
                        tags: ["Mock", "Seed", "Fund"],
                        reason: "Mock fallback data due to connection error."
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [query]);

    const openChat = (name, role) => {
        setChatTarget({ name, role });
    };

    const openProfile = (profile, type) => {
        setProfileTarget({ profile, type });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />
                <div className="flex gap-2 mb-6 z-10">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
                <h2 className="text-xl font-bold tracking-widest animate-pulse z-10"
                    style={{
                        background: 'linear-gradient(to right, #3B82F6, #22D3EE)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    SCANNING ECOSYSTEM...
                </h2>
            </div>
        );
    }

    return (
        <PageTransition className="min-h-screen bg-[#070B14] container mx-auto px-6 py-12 relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-blue-600/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-[100%] bg-cyan-400/5 blur-[150px] pointer-events-none" />

            {/* Hero Header */}
            <div className="text-center mb-16 max-w-3xl mx-auto pt-8 relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    Ecosystem <span
                        style={{
                            background: 'linear-gradient(to right, #3B82F6, #22D3EE)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >Matches</span>
                </h1>

                <div className="bg-[#111827]/80 backdrop-blur-sm border border-[#3B82F6]/20 rounded-[16px] p-6 relative overflow-hidden text-left">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#3B82F6] to-[#22D3EE]" />
                    <p className="text-[11px] uppercase tracking-[0.08em] font-bold text-[#22D3EE] mb-2">Based on your idea profile</p>
                    <p className="text-[#94A3B8] italic text-lg leading-relaxed font-light">
                        "{query}"
                    </p>
                </div>
            </div>

            {/* Top Matches */}
            <div className="mb-16 relative z-10 w-full max-w-6xl mx-auto">
                <div className="flex flex-col items-center justify-center gap-3 mb-12 px-2 text-center">
                    <div className="p-3 bg-gradient-to-r from-[#3B82F6]/10 to-[#22D3EE]/10 rounded-xl border border-[#3B82F6]/20 inline-block">
                        <Users className="text-[#3B82F6]" size={28} />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Top Ecosystem Synergies</h2>
                    <p className="text-[#94A3B8]">AI-curated connections tailored specifically for your profile.</p>
                </div>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.length === 0 && <p className="text-[#94A3B8] col-span-full py-12 text-center text-lg">No matches found based on this query. Please verify your profile info.</p>}
                    {matches.map((match) => {
                        const isInvestor = ['investor', 'startup'].includes(match.role?.toLowerCase());
                        const colorSet = isInvestor ?
                            { primary: "#22D3EE", gradient: "from-[#22D3EE] to-[#0891B2]", icon: Briefcase } :
                            { primary: "#3B82F6", gradient: "from-[#3B82F6] to-[#2563EB]", icon: BrainCircuit };
                        const Icon = colorSet.icon;

                        return (
                            <StaggerItem key={match.user_id}>
                                <Card hover className={`h-full flex flex-col group relative bg-[#0D1425] border-[#1E293B] hover:border-[${colorSet.primary}]/40 transition-all duration-300`}>

                                    <div className="flex justify-between items-start mb-6 w-full">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0A0F1E] flex items-center justify-center overflow-hidden border border-[#334155] group-hover:border-[${colorSet.primary}] transition-colors duration-300 shadow-lg shrink-0`}>
                                                <Icon color={colorSet.primary} size={24} />
                                            </div>
                                            <div>
                                                <h3 className={`text-[17px] font-bold text-white mb-0.5 group-hover:text-[${colorSet.primary}] transition-colors duration-300 line-clamp-1`}>{match.name || 'Anonymous'}</h3>
                                                <p className="text-[13px] text-[#94A3B8] font-medium line-clamp-1">
                                                    <span style={{ color: colorSet.primary }}>{match.role}</span> • {match.tags?.[0] || 'Tech'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="scale-90 origin-top-right shrink-0">
                                            <MatchScoreRing score={match.score} />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(match.tags && match.tags.length > 0 ? match.tags.slice(0, 3) : ['Innovator']).map(tag => (
                                            <span key={tag} className={`px-2.5 py-1 rounded-md bg-[#1E293B] text-[#94A3B8] text-[11px] font-semibold border border-[#334155] group-hover:border-[${colorSet.primary}]/30 transition-colors`}>
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>

                                    <div className={`bg-gradient-to-r from-[${colorSet.primary}]/10 to-transparent border-l-2 border-[${colorSet.primary}] p-4 rounded-r-lg mb-8 flex-1`}>
                                        <p className="text-sm text-[#CBD5E1] leading-relaxed font-normal">
                                            {match.reason}
                                        </p>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <Button onClick={() => openChat(match.name || 'Connection', match.role)} className={`text-[13px] px-2 py-2.5 w-full gap-2 bg-gradient-to-r ${colorSet.gradient} border-none text-white font-semibold shadow-lg`}>
                                            <MessageCircle size={14} /> Chat Now
                                        </Button>
                                        <button onClick={() => openProfile(match, match.role)} className="text-[13px] px-2 py-2.5 w-full rounded-lg border border-[#334155] text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors font-medium">
                                            View Profile
                                        </button>
                                    </div>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </StaggerContainer>
            </div>

            <div className="text-center pb-20 relative z-10 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                    className="group inline-flex items-center justify-center w-full md:w-auto gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-400/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] text-white font-bold transition-all duration-300"
                    onClick={() => setIsIdeaEvalOpen(true)}
                >
                    <BrainCircuit size={20} className="group-hover:rotate-12 transition-transform" />
                    Submit Idea for AI Evaluation
                </button>
                <button
                    className="group inline-flex items-center justify-center w-full md:w-auto gap-3 px-8 py-4 rounded-xl bg-[#111827] border border-[#334155] hover:border-[#3B82F6] text-[#CBD5E1] hover:text-white font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                    onClick={() => navigate('/ecosystem')}
                >
                    Explore full ecosystem map
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-[#3B82F6]" />
                </button>
            </div>

            {/* Chat Modal */}
            <ChatModal
                isOpen={chatTarget !== null}
                onClose={() => setChatTarget(null)}
                contactName={chatTarget?.name || ""}
                contactRole={chatTarget?.role || ""}
            />

            {/* View Profile Modal */}
            <ProfileModal
                isOpen={profileTarget !== null}
                onClose={() => setProfileTarget(null)}
                profile={profileTarget?.profile}
                type={profileTarget?.type}
            />

            {/* AI Idea Evaluation Modal */}
            <IdeaEvaluationModal
                isOpen={isIdeaEvalOpen}
                onClose={() => setIsIdeaEvalOpen(false)}
            />

            <Toaster position="top-right" />
        </PageTransition>
    );
}
