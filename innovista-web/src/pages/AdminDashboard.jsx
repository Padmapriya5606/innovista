import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertOctagon, TrendingUp, Users, Presentation, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/layout/PageTransition';
import { GradientText } from '../components/ui/GradientText';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Mock Data
const chartData = [
    { name: 'Jan', CSE: 40, ECE: 24, BioTech: 10 },
    { name: 'Feb', CSE: 30, ECE: 13, BioTech: 20 },
    { name: 'Mar', CSE: 20, ECE: 50, BioTech: 22 },
    { name: 'Apr', CSE: 27, ECE: 39, BioTech: 15 },
    { name: 'May', CSE: 18, ECE: 48, BioTech: 21 },
    { name: 'Jun', CSE: 23, ECE: 38, BioTech: 25 },
];

const pipeline = {
    Ideation: [
        { id: 1, name: 'AI Tutor', domain: 'EdTech', health: 42 },
        { id: 2, name: 'EcoPack', domain: 'CleanTech', health: 38 },
    ],
    Prototype: [
        { id: 3, name: 'AgriSense', domain: 'Hardware', health: 65 },
    ],
    MVP: [
        { id: 4, name: 'CropVision', domain: 'AgriTech', health: 88 },
        { id: 5, name: 'FinFlow', domain: 'FinTech', health: 74 },
    ],
    Revenue: [
        { id: 6, name: 'MedConnect', domain: 'HealthTech', health: 92 },
    ],
};

const alerts = [
    { id: 1, type: 'critical', text: '5 startups unassigned mentor for > 2 weeks', time: '10m ago' },
    { id: 2, type: 'warning', text: 'Engineering dept activity down 40% vs last month', time: '1h ago' },
    { id: 3, type: 'warning', text: '2 investors dormant for > 90 days', time: '3h ago' },
];

const MetricTile = ({ title, value, icon: Icon, trend }) => (
    <Card hover className="p-5 flex flex-col justify-between h-full bg-[#1A2236]/50">
        <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">{title}</span>
            <div className="p-2 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20">
                <Icon size={18} className="text-[#6366F1]" />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <GradientText className="text-3xl font-bold tracking-tight">{value}</GradientText>
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(trend)}%
            </div>
        </div>
    </Card>
);

const PipelineColumn = ({ title, startups }) => (
    <div className="w-64 shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-white font-semibold">{title}</h4>
            <span className="bg-[#1A2236] text-[#94A3B8] text-xs font-bold px-2.5 py-1 rounded-full">{startups.length}</span>
        </div>
        <div className="flex flex-col gap-3 flex-1">
            {startups.map(startup => (
                <Card key={startup.id} className="p-4 bg-[#0D1425] border-[#6366F1]/10 hover:border-[#6366F1]/30 hover:-translate-y-1 transition-transform cursor-pointer">
                    <h5 className="text-white font-bold mb-1">{startup.name}</h5>
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-[#8B5CF6] uppercase tracking-wider font-semibold bg-[#8B5CF6]/10 px-2 py-0.5 rounded">{startup.domain}</span>
                        <span className={`text-xs font-bold ${startup.health > 70 ? 'text-[#10B981]' : startup.health > 40 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                            {startup.health}/100
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    </div>
);

export default function AdminDashboard() {
    return (
        <PageTransition className="min-h-screen bg-[#0A0F1E] flex flex-col">
            {/* Navbar mock */}
            <header className="h-16 border-b border-[#6366F1]/15 bg-[#111827] px-6 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                        <Layers size={18} color="white" />
                    </div>
                    <span className="font-bold text-white tracking-widest uppercase text-sm">Innovista <span className="text-[#94A3B8] font-normal">Command Center</span></span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> System Live</span>
                    <div className="w-8 h-8 rounded-full bg-[#0D1425] border border-[#6366F1]/20 overflow-hidden" />
                </div>
            </header>

            <div className="flex-1 p-6 lg:p-8 shrink-0 overflow-x-hidden">
                <div className="max-w-[1600px] mx-auto">

                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
                            <p className="text-[#94A3B8]">Real-time intelligence from your university ecosystem.</p>
                        </div>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                        {/* Top Left: Heatmap / Chart */}
                        <StaggerItem>
                            <Card className="h-[400px] flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-6">Innovation Activity by Department</h3>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111827', borderColor: '#475569', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line type="monotone" dataKey="CSE" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="ECE" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="BioTech" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </StaggerItem>

                        {/* Top Right: Kanban Pipeline */}
                        <StaggerItem>
                            <Card className="h-[400px] flex flex-col overflow-hidden">
                                <h3 className="text-lg font-bold text-white mb-6 shrink-0">Startup Pipeline</h3>
                                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                                    <div className="flex gap-4 h-full">
                                        <PipelineColumn title="Ideation" startups={pipeline.Ideation} />
                                        <PipelineColumn title="Prototype" startups={pipeline.Prototype} />
                                        <PipelineColumn title="MVP" startups={pipeline.MVP} />
                                        <PipelineColumn title="Revenue" startups={pipeline.Revenue} />
                                    </div>
                                </div>
                            </Card>
                        </StaggerItem>

                        {/* Bottom Left: Alert Feed */}
                        <StaggerItem>
                            <Card className="h-[320px] flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <AlertOctagon size={20} className="text-[#F59E0B]" /> Default Triggers
                                    </h3>
                                    <span className="bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-bold px-2 py-0.5 rounded uppercase">3 Active</span>
                                </div>

                                <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {alerts.map(alert => (
                                        <div key={alert.id} className="p-4 rounded-xl bg-[#0D1425] border border-[#1E293B] flex items-start gap-4 hover:border-[#6366F1]/30 transition-colors">
                                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${alert.type === 'critical' ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]' : 'bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]'}`} />
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium leading-snug mb-1">{alert.text}</p>
                                                <span className="text-xs text-[#64748B]">{alert.time}</span>
                                            </div>
                                            <Button variant="secondary" size="sm" className="text-[11px] px-3 py-1.5 shrink-0 hidden sm:block">Action</Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </StaggerItem>

                        {/* Bottom Right: Key Metrics */}
                        <StaggerItem className="grid grid-cols-2 gap-6 h-[320px]">
                            <MetricTile title="Total Students" value="2,408" icon={Users} trend={12} />
                            <MetricTile title="Active Startups" value="84" icon={Presentation} trend={8} />
                            <MetricTile title="Funding Raised" value="₹4.2Cr" icon={TrendingUp} trend={44} />
                            <MetricTile title="Avg Health" value="76/100" icon={Activity} trend={-2} />
                        </StaggerItem>

                    </StaggerContainer>
                </div>
            </div>
        </PageTransition>
    );
}
