import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Network, Target, Bell, LogOut, Activity, Users, Presentation,
    TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight
} from 'lucide-react';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import api from '../services/api';

// --- SUB-COMPONENTS ---
const MetricTile = ({ title, value, icon: Icon, trend }) => (
    <Card hover className="p-5 flex flex-col justify-between h-full bg-[#111827] border-[#1E293B]">
        <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{title}</span>
            <div className="p-2 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                <Icon size={18} className="text-[#3B82F6]" />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <span className="text-3xl font-bold tracking-tight text-white" style={{ WebkitTextFillColor: 'white' }}>{value}</span>
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-[#10B981]' : trend < 0 ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`}>
                {trend > 0 ? <ArrowUpRight size={16} /> : trend < 0 ? <ArrowDownRight size={16} /> : null}
                {trend !== 0 ? `${Math.abs(trend)}%` : '-'}
            </div>
        </div>
    </Card>
);

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

    const [userProfile, setUserProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [milestonesInfo, setMilestonesInfo] = useState({
        total_members: 0,
        active_startups: 0,
        matches_made: 0,
        total_funding_cr: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [meRes, notifsRes, milestonesRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/notifications'),
                    api.get('/analytics/milestones')
                ]);

                // Check if we have local registration data to hydrate missing fields
                const localDataRaw = localStorage.getItem('innovista_user_profile');
                let localData = null;
                try {
                    if (localDataRaw) localData = JSON.parse(localDataRaw);
                } catch(e) {}

                // Map User Data
                const user = meRes.data;
                setUserProfile({
                    name: localData?.first_name ? `${localData.first_name} ${localData.last_name || ''}`.trim() : (user.profile?.full_name || user.email.split('@')[0]),
                    role: localData?.role || user.role,
                    email: localData?.email || user.email,
                    phone: localData?.phone || user.profile?.phone || "N/A",
                    startup: localData?.company_name || user.profile?.company_name || "N/A",
                    domain: localData?.domain || user.profile?.domain || "N/A",
                    stage: localData?.stage || user.profile?.stage || "N/A",
                    joined: "Recent"
                });

                // Map Notifications
                setNotifications(notifsRes.data.map(n => ({
                    id: n.id,
                    text: n.message,
                    time: new Date(n.created_at).toLocaleDateString(),
                    unread: !n.read
                })));

                // Map Milestones & Activity
                const mData = milestonesRes.data;
                setMilestonesInfo({
                    total_members: mData.total_members,
                    active_startups: mData.active_startups,
                    matches_made: mData.matches_made,
                    total_funding_cr: 45 // Hardcoded for demo if not in API
                });

                if (mData.growth_trend && mData.growth_trend.length > 0) {
                    setActivityData(mData.growth_trend);
                } else {
                    // Fallback mock chart data if DB trend is empty
                    setActivityData([
                        { month: 'Sep', students: 1200, startups: 150 },
                        { month: 'Oct', students: 1800, startups: 210 },
                        { month: 'Nov', students: 2400, startups: 280 },
                        { month: 'Dec', students: 3100, startups: 320 },
                        { month: 'Jan', students: 3800, startups: 390 },
                        { month: 'Feb', students: 4208, startups: 450 }
                    ]);
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                if (error.response?.status === 401) {
                    navigate('/register/startup'); // Redirect to login/register flow
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('innovista_token');
        navigate('/');
    };

    if (loading || !userProfile) {
        return (
            <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#3B82F6] animate-spin" />
            </div>
        );
    }

    // --- TAB RENDERS ---
    const renderProfile = () => (
        <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">My Profile</h2>
                    <p className="text-[#94A3B8] font-medium">Manage your ecosystem identity.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                    {userProfile.name.charAt(0)}
                </div>
            </div>

            <Card className="p-8 bg-[#0D1425] border-[#1E293B]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-bold mb-1">Full Name</p>
                        <p className="text-white font-medium text-lg">{userProfile.name}</p>
                    </div>
                    <div>
                        <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-bold mb-1">Role</p>
                        <span className="inline-block px-3 py-1 bg-[#3B82F6]/10 text-[#22D3EE] text-sm font-bold rounded border border-[#3B82F6]/30">
                            {userProfile.role}
                        </span>
                    </div>
                    <div>
                        <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-bold mb-1">Email</p>
                        <p className="text-white font-medium">{userProfile.email}</p>
                    </div>
                    <div>
                        <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-bold mb-1">Phone</p>
                        <p className="text-white font-medium">{userProfile.phone}</p>
                    </div>
                    <div className="md:col-span-2 pt-6 border-t border-[#1E293B]">
                        <h4 className="text-white font-bold mb-4">Startup Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-bold mb-1">Company</p>
                                <p className="text-white font-medium">{userProfile.startup}</p>
                            </div>
                            <div>
                                <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-bold mb-1">Domain</p>
                                <p className="text-white font-medium">{userProfile.domain}</p>
                            </div>
                            <div>
                                <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-bold mb-1">Stage</p>
                                <p className="text-white font-medium">{userProfile.stage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );

    const renderMatchmaking = () => (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Ecosystem Matchmaking</h2>
                <p className="text-[#94A3B8] font-medium">Discover synergies with mentors and investors.</p>
            </div>

            <Card className="p-8 md:p-12 bg-gradient-to-br from-[#0D1425] to-[#111827] border-[#1E293B] flex flex-col items-center text-center relative overflow-hidden animate-[float_6s_ease-in-out_infinite]">
                <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#3B82F6]/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#22D3EE] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                    <Network size={40} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">You have <span className="text-[#22D3EE]">5 New Matches!</span></h3>
                <p className="text-[#94A3B8] max-w-md mx-auto mb-8 leading-relaxed">
                    Our intelligence core has analyzed your profile and found highly relevant connections in the ecosystem tailored to your growth trajectory.
                </p>

                <Button onClick={() => navigate('/match-results')} className="bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] border-none text-white px-8 py-4 text-lg font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform">
                    View Match Results <ArrowRight className="ml-2" />
                </Button>
            </Card>
        </div>
    );

    const renderMilestones = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Ecosystem Milestones</h2>
                <p className="text-[#94A3B8] font-medium">Platform growth and community numbers.</p>
            </div>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StaggerItem><MetricTile title="Total Members" value={milestonesInfo.total_members.toLocaleString()} icon={Users} trend={12} /></StaggerItem>
                <StaggerItem><MetricTile title="Active Startups" value={milestonesInfo.active_startups.toLocaleString()} icon={Presentation} trend={8} /></StaggerItem>
                <StaggerItem><MetricTile title="Matches Made" value={milestonesInfo.matches_made.toLocaleString()} icon={Network} trend={24} /></StaggerItem>
                <StaggerItem><MetricTile title="Total Funding" value={`₹${milestonesInfo.total_funding_cr}Cr`} icon={TrendingUp} trend={0} /></StaggerItem>
            </StaggerContainer>

            <Card className="mt-8 p-6 bg-[#0D1425] border-[#1E293B] h-96 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Platform Growth</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-[#3B82F6] to-[#2563EB]" /> Students
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-[#22D3EE] to-[#0891B2]" /> Startups
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorStartups" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                            <Area type="monotone" dataKey="startups" stroke="#22D3EE" strokeWidth={3} fillOpacity={1} fill="url(#colorStartups)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );

    const renderNotifications = () => (
        <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Notifications</h2>
                    <p className="text-[#94A3B8] font-medium">Recent activity and alerts.</p>
                </div>
                <Button variant="secondary" className="border-[#334155] text-xs h-8">Mark all read</Button>
            </div>

            <Card className="p-2 bg-[#0D1425] border-[#1E293B] overflow-hidden">
                <div className="divide-y divide-[#1E293B]">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 flex gap-4 transition-colors hover:bg-[#111827] ${notif.unread ? 'bg-[#3B82F6]/5' : ''}`}>
                            <div className="mt-1">
                                {notif.unread ? (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
                                ) : (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#334155]" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm md:text-base ${notif.unread ? 'text-white font-semibold' : 'text-[#94A3B8] font-medium'}`}>
                                    {notif.text}
                                </p>
                                <p className="text-xs text-[#64748B] mt-2 tracking-wide uppercase">{notif.time}</p>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="p-8 text-center text-[#64748B]">No new notifications.</div>
                    )}
                </div>
            </Card>
        </div>
    );

    return (
        <PageTransition className="min-h-screen bg-[#070B14] flex flex-col md:flex-row">

            {/* Sidebar Desktop */}
            <div className="hidden md:flex flex-col w-64 bg-[#0D1425] border-r border-[#1E293B] h-screen sticky top-0 p-6 z-20">
                <div className="mb-12">
                    <h1 className="text-2xl font-black tracking-widest uppercase font-outfit"
                        style={{
                            background: 'linear-gradient(to right, #3B82F6, #22D3EE)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        INNOVISTA
                    </h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'profile', label: 'My Profile', icon: User },
                        { id: 'matchmaking', label: 'Matchmaking', icon: Network },
                        { id: 'milestones', label: 'Milestones', icon: Target },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === item.id
                                ? 'bg-gradient-to-r from-[#3B82F6]/20 to-[#22D3EE]/10 text-white border border-[#3B82F6]/30 shadow-sm'
                                : 'text-[#64748B] hover:text-white hover:bg-[#111827] border border-transparent'
                                }`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? "text-[#22D3EE]" : ""} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-[#1E293B]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Header Navigation */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1425] border-b border-[#1E293B] sticky top-0 z-20">
                <h1 className="text-xl font-black uppercase font-outfit"
                    style={{ background: 'linear-gradient(to right, #3B82F6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                    INNOVISTA
                </h1>
                <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="bg-[#111827] border border-[#1E293B] text-white text-sm rounded-lg px-3 py-2 outline-none"
                >
                    <option value="profile">My Profile</option>
                    <option value="matchmaking">Matchmaking</option>
                    <option value="milestones">Milestones</option>
                    <option value="notifications">Notifications</option>
                </select>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 w-full max-w-6xl mx-auto">
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'matchmaking' && renderMatchmaking()}
                    {activeTab === 'milestones' && renderMilestones()}
                    {activeTab === 'notifications' && renderNotifications()}
                </div>
            </div>

        </PageTransition>
    );
}
