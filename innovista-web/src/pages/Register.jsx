import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap, BrainCircuit, Rocket, Briefcase, GraduationCap as Alumni, ArrowRight } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { GradientText } from '../components/ui/GradientText';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const roleMeta = {
    student: { title: 'Student Innovator', icon: GraduationCap, color: '#6366F1' },
    mentor: { title: 'Ecosystem Mentor', icon: BrainCircuit, color: '#10B981' },
    startup: { title: 'Startup Founder', icon: Rocket, color: '#F59E0B' },
    investor: { title: 'Venture Investor', icon: Briefcase, color: '#8B5CF6' },
    alumni: { title: 'University Alumni', icon: Alumni, color: '#06B6D4' },
};

export default function Register() {
    const { role } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Unified form state matching the backend Profile schema roughly
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: 'password123', // Default hackathon password
        company_name: '',
        domain: '',
        stage: '',
        tags: '',
        bio: ''
    });

    const meta = roleMeta[role] || roleMeta['student'];
    const Icon = meta.icon;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = async () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            // Final Step - Submit to Backend
            setIsLoading(true);
            try {
                // Step 1: Create the base User
                const registerPayload = {
                    email: formData.email,
                    password: formData.password,
                    role: role.charAt(0).toUpperCase() + role.slice(1) // Capitalize
                };

                try {
                    await api.post('/auth/register', registerPayload);
                } catch (err) {
                    if (err.response?.data?.detail?.includes("already exists")) {
                        toast.success("Welcome back! Loading your profile...");
                    } else {
                        throw err;
                    }
                }

                // Step 2: Login immediately to get Token
                const loginData = new URLSearchParams();
                loginData.append('username', formData.email);
                loginData.append('password', formData.password);

                const loginResponse = await api.post('/auth/login', loginData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                if (loginResponse.data && loginResponse.data.access_token) {
                    const token = loginResponse.data.access_token;
                    localStorage.setItem('innovista_token', token);

                    // Step 3: Hydrate the Profile with form data
                    const fullName = role === 'startup'
                        ? formData.first_name // used for founder name
                        : `${formData.first_name} ${formData.last_name}`.trim();

                    const profilePayload = {
                        full_name: fullName,
                        company_name: formData.company_name,
                        domain: formData.domain,
                        stage: formData.stage,
                        tags: formData.tags,
                        bio: formData.bio,
                        phone: formData.phone
                    };

                    await api.put('/users/profile', profilePayload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // Save local copy for Dashboard to use immediately
                    localStorage.setItem('innovista_user_profile', JSON.stringify({
                        ...formData,
                        role: role.charAt(0).toUpperCase() + role.slice(1)
                    }));

                    toast.success("Profile created successfully!");
                    navigate('/match-results', {
                        state: {
                            query: formData.bio || formData.tags || `Seeking connections in ${formData.domain || 'tech'} ecosystem.`
                        }
                    });
                }
            } catch (error) {
                console.error("Registration failed:", error);
                if (!error.response || error.code === 'ERR_NETWORK') {
                    toast.success("Offline Mode: Proceeding to Matches");
                    localStorage.setItem('innovista_token', 'mock_offline_token');
                    
                    // Save local copy for offline dashboard
                    localStorage.setItem('innovista_user_profile', JSON.stringify({
                        ...formData,
                        role: role.charAt(0).toUpperCase() + role.slice(1)
                    }));
                    
                    navigate('/match-results', {
                        state: {
                            query: formData.bio || formData.tags || "Seeking ecosystem connection."
                        }
                    });
                } else {
                    const msg = error.response?.data?.detail || "Failed to register. Please check your inputs.";
                    toast.error(msg);
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderStudentFields = () => (
        <>
            {step === 1 && (
                <>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">First Name</label>
                            <Input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="John" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Last Name</label>
                            <Input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Doe" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@university.edu" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Department</label>
                            <Input name="domain" value={formData.domain} onChange={handleInputChange} placeholder="Computer Science" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Phone Number</label>
                            <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Year of Graduation</label>
                            <Input placeholder="YYYY" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">College Name</label>
                            <Input placeholder="University Name" />
                        </div>
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Skills / Tags</label>
                        <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="React, Node.js, Hardware..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Bio / Projects</label>
                        <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="w-full rounded-[10px] border border-[#6366F1]/20 bg-[#0D1425] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] min-h-[120px]" placeholder="Briefly describe yourself and past projects..." />
                    </div>
                </>
            )}
        </>
    );

    const renderMentorFields = () => (
        <>
            {step === 1 && (
                <>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">First Name</label>
                            <Input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Jane" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Last Name</label>
                            <Input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Smith" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="jane@company.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Phone Number</label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Current Company & Role</label>
                        <Input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="e.g. Senior SWE at Google" />
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Domain Expertise</label>
                        <Input name="domain" value={formData.domain} onChange={handleInputChange} placeholder="AI, Blockchain, Web Dev..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Years of Experience / Stage</label>
                        <Input name="stage" value={formData.stage} onChange={handleInputChange} placeholder="e.g. 8 years" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Past Mentoring Experience & Skills</label>
                        <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="w-full rounded-[10px] border border-[#6366F1]/20 bg-[#0D1425] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] min-h-[100px]" placeholder="Tell us about yourself..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Tags / Keywords</label>
                        <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="SaaS, Mobile, Python..." />
                    </div>
                </>
            )}
        </>
    );

    const renderStartupFields = () => (
        <>
            {step === 1 && (
                <>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Founder Name</label>
                        <Input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Founder Full Name" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Startup Name</label>
                        <Input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="e.g. InnovateTech" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="founder@startup.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Phone Number</label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" />
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Domain / Sector</label>
                        <Input name="domain" value={formData.domain} onChange={handleInputChange} placeholder="e.g. FinTech, AgriTech, SaaS" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Current Stage</label>
                        <Input name="stage" value={formData.stage} onChange={handleInputChange} placeholder="Idea, MVP, Seed, Series A..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Keywords / Tags</label>
                        <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="AI, Blockchain, Hardware..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Pitch / Description</label>
                        <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="w-full rounded-[10px] border border-[#6366F1]/20 bg-[#0D1425] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] min-h-[100px]" placeholder="Briefly describe what your startup does..." />
                    </div>
                </>
            )}
        </>
    );

    const renderAlumniFields = () => (
        <>
            {step === 1 && (
                <>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">First Name</label>
                            <Input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Alex" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Last Name</label>
                            <Input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Johnson" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="alex.alumni@domain.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Phone Number</label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Year of Graduation</label>
                            <Input name="stage" value={formData.stage} onChange={handleInputChange} placeholder="YYYY" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">College Name</label>
                            <Input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="University Name" />
                        </div>
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Current Company & Role</label>
                        <Input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="e.g. Product Manager at TechCorp" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Area of Expertise</label>
                        <Input name="domain" value={formData.domain} onChange={handleInputChange} placeholder="Sales, Marketing, Engineering..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8] block mb-2">Willing to mentor?</label>
                        <select name="tags" value={formData.tags} onChange={handleInputChange} className="w-full rounded-[10px] border border-[#6366F1]/20 bg-[#0D1425] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]">
                            <option value="Mentoring: Yes">Yes</option>
                            <option value="Mentoring: No">No</option>
                        </select>
                    </div>
                </>
            )}
        </>
    );

    const renderInvestorFields = () => (
        <>
            {step === 1 && (
                <>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">First Name</label>
                            <Input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="Michael" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Last Name</label>
                            <Input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Brown" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Email</label>
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="michael@vc.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Phone Number</label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Investment Firm</label>
                        <Input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="e.g. Quantum Capital" />
                    </div>
                </>
            )}
            {step === 2 && (
                <>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Investment Stage Focus</label>
                        <Input name="stage" value={formData.stage} onChange={handleInputChange} placeholder="Pre-seed, Seed, Series A..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Preferred Domains / Sectors</label>
                        <Input name="domain" value={formData.domain} onChange={handleInputChange} placeholder="AI, SaaS, BioTech..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8]">Investment Thesis & Keywords</label>
                        <Input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="B2B, Automation..." />
                    </div>
                </>
            )}
        </>
    );

    const renderFieldsByRole = () => {
        switch (role) {
            case 'student': return renderStudentFields();
            case 'mentor': return renderMentorFields();
            case 'startup': return renderStartupFields();
            case 'alumni': return renderAlumniFields();
            case 'investor': return renderInvestorFields();
            default: return renderStudentFields();
        }
    };

    return (
        <PageTransition className="min-h-screen flex">
            {/* LEFT PANEL - Decorative */}
            <div className="hidden lg:flex w-[40%] bg-[#0D1425] border-r border-[#6366F1]/15 relative overflow-hidden flex-col justify-between p-12">
                <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] rounded-[100%] blur-[120px] pointer-events-none opacity-40" style={{ backgroundColor: meta.color }} />

                <div className="z-10 mt-12">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8" style={{ backgroundColor: `${meta.color}20`, border: `1px solid ${meta.color}50` }}>
                        <Icon color={meta.color} size={40} />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
                        Join as a <br /><GradientText>{meta.title}</GradientText>
                    </h2>
                    <p className="text-[#94A3B8] text-lg leading-relaxed mb-6 max-w-sm">
                        Complete your profile to unlock a tailored ecosystem experience.
                    </p>

                    {/* Dashboard Visual Preview Graphic */}
                    <div className="relative w-full max-w-sm mt-8 group perspective-[1000px]">
                        {/* Glow Behind */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#22D3EE] opacity-20 blur-[30px] rounded-2xl group-hover:opacity-40 transition-opacity duration-700" />

                        {/* Floating Dashboard Frame */}
                        <div className="relative bg-[#070B14] border border-[#1E293B] rounded-xl overflow-hidden shadow-2xl transform rotate-y-[-12deg] rotate-x-[5deg] group-hover:rotate-y-0 group-hover:rotate-x-0 transition-transform duration-700 ease-out">

                            {/* Dashboard Header Bar */}
                            <div className="h-4 bg-[#111827] border-b border-[#1E293B] flex items-center px-2 gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] opacity-80" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] opacity-80" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] opacity-80" />
                            </div>

                            <div className="flex h-32">
                                {/* Miniature Sidebar */}
                                <div className="w-12 bg-[#0D1425] border-r border-[#1E293B] p-2 flex flex-col gap-2">
                                    <div className="w-full h-2 rounded bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] opacity-80 mb-2" />
                                    <div className="w-full h-2 rounded bg-[#1E293B]" />
                                    <div className="w-full h-2 rounded bg-[#1E293B]" />
                                    <div className="w-full h-2 rounded bg-[#1E293B]" />
                                </div>

                                {/* Miniature Main Content */}
                                <div className="flex-1 p-3 bg-[#070B14] flex flex-col gap-3">
                                    <div className="w-1/2 h-2 rounded bg-[#334155]" />

                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Mock Metric Tile 1 */}
                                        <div className="h-10 rounded-lg bg-[#111827] border border-[#1E293B] p-1.5 flex flex-col justify-between relative overflow-hidden">
                                            <div className="w-1/3 h-1 rounded bg-[#3B82F6]/50" />
                                            <div className="w-2/3 h-2 rounded bg-white/80" />
                                            <div className="absolute top-0 right-0 w-8 h-8 bg-[#3B82F6] opacity-10 blur-xl rounded-full" />
                                        </div>
                                        {/* Mock Metric Tile 2 */}
                                        <div className="h-10 rounded-lg bg-[#111827] border border-[#1E293B] p-1.5 flex flex-col justify-between">
                                            <div className="w-1/3 h-1 rounded bg-[#10B981]/50" />
                                            <div className="w-2/3 h-2 rounded bg-white/80" />
                                        </div>
                                    </div>

                                    {/* Mock Matchmaking Card */}
                                    <div className="flex-1 rounded-lg bg-gradient-to-r from-[#111827] to-[#0D1425] border border-[#1E293B] flex items-center justify-center relative overflow-hidden">
                                        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] animate-pulse" />
                                        <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-[#22D3EE] opacity-10 blur-xl rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="z-10 mt-12">
                    <p className="text-[#64748B] text-sm font-medium tracking-wider uppercase">Innovista Professional Ecosystem</p>
                </div>
            </div>

            {/* RIGHT PANEL - Form */}
            <div className="flex-1 overflow-y-auto bg-[#0A0F1E] flex flex-col pt-12">

                <div className="max-w-2xl w-full mx-auto px-8 pb-12">
                    {/* Progress Indicator */}
                    <div className="mb-12">
                        <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#94A3B8] mb-4">Step {step} of 2</p>
                        <div className="flex gap-3">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full flex-1 transition-all duration-500 line`}
                                    style={{
                                        backgroundColor: i <= step ? '#6366F1' : '#1E293B',
                                        boxShadow: i <= step ? '0 0 12px rgba(99,102,241,0.4)' : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-8">
                        {step === 1 && "Basic Information"}
                        {step === 2 && "Profile & Expertise"}
                    </h3>

                    <div className="space-y-6">
                        {renderFieldsByRole()}

                        <div className="pt-8 flex justify-between items-center">
                            {step > 1 ? (
                                <button onClick={() => setStep(step - 1)} className="text-[#94A3B8] hover:text-white transition-colors text-sm font-medium">
                                    ← Back
                                </button>
                            ) : <div />}

                            <Button onClick={handleNext} disabled={isLoading} className="gap-2">
                                {isLoading ? "Processing..." : (step === 2 ? "Complete Registration" : "Next Step")}
                                {step === 2 && !isLoading ? <Rocket size={18} /> : null}
                                {step === 1 && !isLoading ? <ArrowRight size={18} /> : null}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

