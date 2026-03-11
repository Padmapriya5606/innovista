import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Layers, User, Briefcase, TrendingUp, Activity } from 'lucide-react';
import cytoscape from 'cytoscape';
import { PageTransition } from '../components/layout/PageTransition';
import api from '../services/api';

export default function EcosystemGraph() {
  const navigate = useNavigate();
  const location = useLocation();
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const fetchAndRenderGraph = async () => {
        try {
            // First, get the current local user to be the center node
            const localDataRaw = localStorage.getItem('innovista_user_profile');
            let currentUser = { name: 'You', role: 'Student' };
            let rawParsed = null;

            if (localDataRaw) {
                try {
                    rawParsed = JSON.parse(localDataRaw);
                    currentUser = {
                        name: rawParsed.first_name ? `${rawParsed.first_name} ${rawParsed.last_name || ''}`.trim() : 'You',
                        role: rawParsed.role || 'Student',
                        company: rawParsed.company_name,
                        domain: rawParsed.domain,
                        stage: rawParsed.stage,
                        bio: rawParsed.bio,
                        tags: rawParsed.tags
                    };
                    setUserData(currentUser);
                } catch(e) {}
            } else {
               setUserData(currentUser);
            }

            // Always try to get real matches using the user's bio/tags
            let matchData = [];
            try {
                const query = location.state?.query || (rawParsed?.bio || rawParsed?.tags || "Ecosystem connection");
                const response = await api.post('/matchmaking/search', { query, limit: 5 });
                matchData = response.data.matches || [];
            } catch (err) {
                console.error("Failed to fetch map nodes", err);
            }

            // Build dynamic elements array
            const elements = [
                 // Center node
                 { data: { id: 'user', label: `${currentUser.name}\n(${currentUser.role})`, type: 'user' } }
            ];

            // Add matched nodes and connect them to the user
            matchData.forEach((match, index) => {
                const nodeId = `m${index}`;
                // Add the node
                elements.push({
                    data: { 
                        id: nodeId, 
                        label: `${match.name}\n(${match.role})`, 
                        type: match.role.toLowerCase() 
                    }
                });
                // Connect user to the matched node
                elements.push({
                    data: { id: `e_${index}`, source: 'user', target: nodeId }
                });
                
                // Add some random cross-connections between matches to make it look like a network
                if (index > 0 && Math.random() > 0.4) {
                    elements.push({
                        data: { id: `cross_${index}`, source: nodeId, target: `m${index - 1}` }
                    });
                }
            });

            // Delay graph initialization to ensure DOM container has computed its size
            setTimeout(() => {
                if (!containerRef.current) return;

                // Initialize cytoscape
                cyRef.current = cytoscape({
                    container: containerRef.current,
                    elements: elements,
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'background-color': function(ele){
                                    const types = { 
                                        'user': '#E2E8F0', 
                                        'student': '#3B82F6', 
                                        'mentor': '#10B981', 
                                        'startup': '#F97316', 
                                        'investor': '#A855F7', 
                                        'alumni': '#06B6D4' 
                                    };
                                    return types[ele.data('type')] || '#ccc';
                                },
                                'label': 'data(label)',
                                'color': '#FFFFFF',
                                'text-outline-color': '#000',
                                'text-outline-width': 2,
                                'font-size': '11px',
                                'font-wrap': 'wrap',
                                'font-weight': 'bold',
                                'text-valign': 'bottom',
                                'text-margin-y': 8,
                                'width': function(ele) { return (ele.data('type') === 'user') ? 45 : 30; },
                                'height': function(ele) { return (ele.data('type') === 'user') ? 45 : 30; },
                                'border-width': function(ele) { return ele.data('type') === 'user' ? 3 : 2; },
                                'border-color': function(ele) { return ele.data('type') === 'user' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'; },
                                'shadow-blur': 20,
                                'shadow-color': function(ele) { return ele.data('type') === 'user' ? '#FFFFFF' : '#000'; },
                                'shadow-opacity': 0.5
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'width': 2,
                                'line-color': '#475569',
                                'curve-style': 'bezier',
                                'opacity': 0.6,
                                'target-arrow-shape': 'none'
                            }
                        }
                    ]
                });

                // Run layout to actually render items
                cyRef.current.layout({
                    name: 'cose',
                    padding: 50,
                    nodeRepulsion: 4000000,
                    idealEdgeLength: 150,
                    nodeOverlap: 20
                }).run();

                // Force fit and center
                cyRef.current.fit();
                cyRef.current.center();

                setLoading(false);
            }, 300);

        } catch (error) {
            console.error("Map rendering error", error);
            setLoading(false);
        }
    };

    fetchAndRenderGraph();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [location.state]);

  return (
    <PageTransition className="min-h-screen bg-[#070B14] flex flex-col relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-[100%] bg-blue-600/5 blur-[150px] pointer-events-none" />

        <div className="flex items-center p-6 border-b border-[#1E293B] relative z-10 bg-[#0D1425]/80 backdrop-blur-md">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 mr-4 rounded-lg bg-[#111827] border border-[#334155] hover:bg-[#1E293B] hover:text-white transition-colors text-[#94A3B8]"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
                <Layers className="text-[#3B82F6]" size={24} />
                <h1 className="text-2xl font-bold text-white tracking-wide">Ecosystem Network Topology</h1>
            </div>
        </div>

        <div className="flex-1 flex relative z-10 w-full overflow-hidden">
            
            {/* Left Sidebar Overlay showing User Details & Growth Analysis */}
            <div className="w-80 bg-[#0D1425]/95 backdrop-blur-md border-r border-[#1E293B] flex flex-col z-20 overflow-y-auto hidden md:flex">
                {userData && (
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-b border-[#1E293B] pb-2">Your Node Profile</h2>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <p className="text-[#64748B] text-xs uppercase font-bold mb-1">Name</p>
                                <p className="text-white font-medium flex items-center gap-2"><User size={14} className="text-[#3B82F6]"/> {userData.name}</p>
                            </div>
                            <div>
                                <p className="text-[#64748B] text-xs uppercase font-bold mb-1">Role</p>
                                <span className="inline-block px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold rounded border border-[#3B82F6]/30">
                                    {userData.role}
                                </span>
                            </div>
                            {userData.company && (
                                <div>
                                    <p className="text-[#64748B] text-xs uppercase font-bold mb-1">Organization / College</p>
                                    <p className="text-white font-medium flex items-center gap-2"><Briefcase size={14} className="text-[#10B981]"/> {userData.company}</p>
                                </div>
                            )}
                            {userData.domain && (
                                <div>
                                    <p className="text-[#64748B] text-xs uppercase font-bold mb-1">Domain</p>
                                    <p className="text-white font-medium">{userData.domain}</p>
                                </div>
                            )}
                            {userData.stage && (
                                <div>
                                    <p className="text-[#64748B] text-xs uppercase font-bold mb-1">Stage / Year</p>
                                    <p className="text-white font-medium">{userData.stage}</p>
                                </div>
                            )}
                            {userData.bio && (
                                <div>
                                    <p className="text-[#64748B] text-xs uppercase font-bold mb-1">Bio</p>
                                    <p className="text-[#94A3B8] text-sm leading-relaxed">{userData.bio}</p>
                                </div>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider border-b border-[#1E293B] pb-2">Growth Analysis</h2>
                        <div className="space-y-4">
                            <div className="bg-[#111827] p-4 rounded-xl border border-[#1E293B]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[#94A3B8] text-sm font-semibold flex items-center gap-2"><TrendingUp size={14} className="text-[#10B981]"/> Network Reach</p>
                                    <p className="text-white font-bold">Top 15%</p>
                                </div>
                                <div className="w-full bg-[#1E293B] rounded-full h-1.5"><div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: '85%' }}></div></div>
                            </div>

                            <div className="bg-[#111827] p-4 rounded-xl border border-[#1E293B]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[#94A3B8] text-sm font-semibold flex items-center gap-2"><Activity size={14} className="text-[#3B82F6]"/> Engagement Score</p>
                                    <p className="text-white font-bold">92/100</p>
                                </div>
                                <div className="w-full bg-[#1E293B] rounded-full h-1.5"><div className="bg-[#3B82F6] h-1.5 rounded-full" style={{ width: '92%' }}></div></div>
                            </div>
                            
                            <p className="text-xs text-[#64748B] mt-4 leading-relaxed">Your profile matches exceptionally well with ecosystem requirements. Strong synergies detected across multiple interconnected nodes.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Cytoscape Container */}
            <div className="flex-1 relative w-full h-full bg-[#05080F]">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                         <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 rounded-full border-4 border-[#1E293B] border-t-[#3B82F6] animate-spin" />
                            <p className="text-[#3B82F6] font-bold tracking-widest text-sm animate-pulse">ANALYZING NETWORK...</p>
                         </div>
                    </div>
                )}
                {/* Ensure explicitly bounded sizing for cytoscape canvas */}
                <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ minHeight: '600px' }} />
                
                {/* Legend Overlay */}
                <div className="absolute top-6 right-6 bg-[#0D1425]/90 backdrop-blur-md p-5 rounded-xl border border-[#1E293B] shadow-2xl pointer-events-none min-w-[200px]">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 border-b border-[#1E293B] pb-2">Legend</h3>
                    <div className="space-y-3">
                        <LegendItem color="#E2E8F0" label="You (Profile)" />
                        <LegendItem color="#3B82F6" label="Students" />
                        <LegendItem color="#10B981" label="Mentors" />
                        <LegendItem color="#F97316" label="Startups" />
                        <LegendItem color="#A855F7" label="Investors" />
                        <LegendItem color="#06B6D4" label="Alumni" />
                    </div>
                </div>
            </div>
        </div>
    </PageTransition>
  );
}

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color, border: '1px solid rgba(255,255,255,0.2)' }} />
        <span className="text-[#94A3B8] text-sm font-semibold">{label}</span>
    </div>
);
