import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BrainCircuit, Rocket, Briefcase, GraduationCap as Alumni, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const roles = [
    { id: 'student', title: 'Student', icon: GraduationCap, color: '#3B82F6', hoverFrom: '#3B82F6', hoverTo: '#2563EB', description: 'Track your innovation journey and build your portfolio' },
    { id: 'mentor', title: 'Mentor', icon: BrainCircuit, color: '#10B981', hoverFrom: '#10B981', hoverTo: '#059669', description: 'Guide the next generation of founders to success' },
    { id: 'startup', title: 'Startup', icon: Rocket, color: '#F59E0B', hoverFrom: '#F59E0B', hoverTo: '#D97706', description: 'Accelerate your growth with the right ecosystem support' },
    { id: 'investor', title: 'Investor', icon: Briefcase, color: '#8B5CF6', hoverFrom: '#8B5CF6', hoverTo: '#7C3AED', description: 'Discover high-potential early-stage startups' },
    { id: 'alumni', title: 'Alumni', icon: Alumni, color: '#06B6D4', hoverFrom: '#06B6D4', hoverTo: '#0891B2', description: 'Give back and stay connected to your university roots' },
];

export default function RoleSelection() {
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app we'd authenticate here. For now, we simulate and route to dashboard.
        if (email && phone) {
            navigate('/dashboard');
        } else {
            alert('Please enter your email and phone number.');
        }
    };

    return (
        <PageTransition className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#070B14]">

            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-[100%] bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-[100%] bg-cyan-400/10 blur-[150px] pointer-events-none" />

            <div className="flex-1 w-full max-w-6xl flex flex-col relative z-10 justify-center">
                <div className="text-center mb-16 mt-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                        Who are <span style={{
                            background: 'linear-gradient(to right, #3B82F6, #22D3EE)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>you?</span>
                    </h1>
                    <p className="text-[#94A3B8] text-lg font-medium max-w-2xl mx-auto">
                        Select your role below to join the professional ecosystem and unlock tailored opportunities.
                    </p>
                </div>

                {!showLogin ? (
                    <>
                        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                            {roles.map((role, idx) => (
                                <StaggerItem
                                    key={role.id}
                                    className={idx > 2 ? "lg:col-span-1 lg:col-start-2 place-self-center lg:translate-x-[-50%] last:translate-x-[50%]" : ""}
                                >
                                    <button
                                        onClick={() => navigate(`/register/${role.id}`)}
                                        className="w-full h-full text-left bg-[#0D1425] border border-[#1E293B] rounded-2xl p-8 group transition-all duration-300 relative overflow-hidden hover:border-transparent hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col"
                                    >
                                        {/* Hover Gradient Border Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                                            style={{ background: `linear-gradient(to bottom right, ${role.hoverFrom}, ${role.hoverTo})` }} />

                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-lg"
                                            style={{ backgroundColor: `${role.color}15`, border: `1px solid ${role.color}30` }}
                                        >
                                            <role.icon color={role.color} size={32} strokeWidth={2} />
                                        </div>

                                        <h3 className="text-2xl font-bold mb-3 transition-colors duration-300 text-white"
                                            // on hover we can apply a gradient drop shadow or just let the base color shine
                                            style={{ WebkitTextFillColor: 'white' }}>
                                            {role.title}
                                        </h3>

                                        <p className="text-[#94A3B8] leading-relaxed font-normal text-[15px] flex-1">
                                            {role.description}
                                        </p>
                                    </button>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>

                        <div className="mt-20 text-center pb-12">
                            <p className="text-[#64748B] mb-4 font-medium uppercase tracking-widest text-sm">Already part of the ecosystem?</p>
                            <button
                                onClick={() => setShowLogin(true)}
                                className="px-8 py-3 rounded-xl bg-transparent border border-[#3B82F6]/30 text-[#3B82F6] font-semibold hover:bg-[#3B82F6]/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
                            >
                                Get Started
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="max-w-md w-full mx-auto bg-[#0D1425] border border-[#1E293B] rounded-2xl p-8 md:p-10 shadow-2xl relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] rounded-t-2xl" />

                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-[#94A3B8] text-sm mb-8 font-medium">Access your ecosystem dashboard.</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] uppercase tracking-[0.08em] font-bold text-[#64748B]">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="yourname@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] uppercase tracking-[0.08em] font-bold text-[#64748B]">Phone Number (Password)</label>
                                <Input
                                    type="password"
                                    placeholder="+91 98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="font-mono tracking-widest"
                                />
                            </div>

                            <Button type="submit" className="w-full justify-center bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] text-white border-none py-3.5 mt-4 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]" size="lg">
                                Login to Dashboard <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-[#1E293B]">
                            <button
                                onClick={() => setShowLogin(false)}
                                className="text-sm font-medium text-[#64748B] hover:text-[#22D3EE] transition-colors"
                            >
                                ← Back to Roles
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
}
