import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react';

// --- Role-Aware AI Knowledge Base ---
const ROLE_CONTEXT = {
    Student: {
        greeting: "Hi! I'm your InnoVista AI Assistant 🎓 I'm here to help you as a student. What would you like guidance on?",
        suggestions: [
            "How do I choose the right mentor?",
            "How can I improve my profile for better matches?",
            "What skills should I focus on for placements?",
            "How do I prepare for startup internships?",
            "What is the best way to connect with mentors?"
        ],
        responses: {
            "mentor": "To choose the right mentor:\n\n1. Look at their domain expertise — it should match your career goal\n2. Check their current company and years of experience\n3. During first contact, be clear about what you want to learn\n4. Ask for 1 specific piece of advice rather than broad help\n5. Follow up consistently — mentors value students who take action",

            "profile": "To improve your student profile:\n\n• Add specific skills (React, Python, Machine Learning)\n• Write a clear bio describing your projects\n• Mention your CGPA and LeetCode count — these stand out!\n• List your target goal (Placement / Startup / Higher Study)\n• Fill in your college name and graduation year",

            "placement": "Top skills for campus placements:\n\n📌 Technical: DSA, System Design, SQL\n📌 Coding: LeetCode 150+ problems is a good baseline\n📌 Projects: 2-3 strong GitHub projects\n📌 Communication: Practice HR rounds\n📌 CGPA: Aim above 7.5 for most companies",

            "startup": "For startup internships:\n\n• Build a personal project that solves a real problem\n• Contribute to open source (shows initiative)\n• Connect with startup founders on InnoVista\n• Learn product thinking, not just coding\n• Write about what you build — LinkedIn posts help",

            "connect": "Best practices for connecting with mentors:\n\n1. Send a personalized message — don't use a template\n2. Mention specifically why you chose them\n3. Ask one clear, specific question\n4. Respect their time — keep it short\n5. Use the Chat button on their match card!"
        }
    },
    Mentor: {
        greeting: "Hello! I'm your InnoVista AI Assistant 🧠 I'm here to help you make an impact as a mentor. What's on your mind?",
        suggestions: [
            "How can I find the right students to mentor?",
            "What makes a great mentoring session?",
            "How do I help a student pick a career path?",
            "How do I guide a student with a startup idea?",
            "Best practices for remote mentoring?"
        ],
        responses: {
            "student": "To find the best-fit students:\n\n• Look for students whose domain matches yours\n• Check their bio for genuine curiosity and projects\n• Prioritize students with a specific goal (not 'I want to learn everything')\n• Students with high LeetCode count + CGPA can handle technical mentoring\n• Start with a 30-min intro session before committing",

            "session": "A great mentoring session:\n\n1. Start with: What specific challenge are you facing?\n2. Share your own story — real experience beats advice\n3. Give 1-3 actionable tasks to complete before next session\n4. Follow up via the chat to check progress\n5. End with: What's your next step?",

            "career": "Guiding career choices:\n\n• Ask: What problem do you love solving?\n• Help them identify their 3 top strengths\n• Walk them through what a typical week looks like in each path\n• Introduce them to 1-2 people in that field (connections matter)\n• Avoid pushing your own path — guide, don't decide",

            "startup": "Guiding a student startup idea:\n\n• First ask: Who is the customer and what pain do they have?\n• Have them do 5 customer interviews before building anything\n• Help them make an MVP in 2 weeks max\n• Connect them with investors on InnoVista when ready\n• Teach them: Build → Measure → Learn cycle",

            "remote": "Effective remote mentoring:\n\n• Use async voice notes for complex explanations\n• Set a regular cadence (weekly 30-min calls)\n• Use shared docs for tracking goals and progress\n• Give specific feedback on code/projects via GitHub\n• Celebrate small wins — motivation matters remotely"
        }
    },
    Startup: {
        greeting: "Hey Founder! I'm your InnoVista AI co-pilot 🚀 I'm here to help you grow your startup. What do you need?",
        suggestions: [
            "How do I pitch to investors?",
            "How do I find the right investor on InnoVista?",
            "What should my MVP look like?",
            "How do I build a founding team?",
            "How do I validate my startup idea?"
        ],
        responses: {
            "pitch": "How to pitch to investors:\n\n📌 Problem: Start with the pain point (1 slide)\n📌 Solution: Your unique approach (1-2 slides)\n📌 Market Size: TAM/SAM/SOM (1 slide)\n📌 Traction: Users, revenue, or pilots\n📌 Team: Why you are the right team\n📌 Ask: How much you need and how you'll use it\n\nKeep the deck to 10 slides. Practice under 10 minutes.",

            "investor": "Finding the right investor:\n\n• Filter by their Investment Stage Focus\n• Match their Preferred Domains to your sector\n• Look for investors who've funded similar startups\n• Use the Chat button to reach out\n• Lead with traction, not just the idea",

            "mvp": "Building your MVP:\n\n1. Define the ONE core use case\n2. Build only what validates your hypothesis\n3. Target: ship in 3-4 weeks\n4. Use no-code tools if possible (Bubble, Webflow)\n5. Get 10 real users before adding features\n6. Success = users come back on their own",

            "team": "Building your founding team:\n\n• Ideal team: 1 builder + 1 seller + 1 domain expert\n• Find co-founders with complementary skills\n• Look for student collaborators via InnoVista\n• Equity: Vest over 4 years with 1-year cliff\n• Culture fit > skill fit at early stage",

            "validate": "How to validate your startup idea:\n\n1. Talk to 20 potential customers before building\n2. Ask: What's the hardest part of [problem]?\n3. See if they pay for an existing solution already\n4. Create a landing page and measure sign-ups\n5. Run a 2-week paid pilot with 3 customers"
        }
    },
    Investor: {
        greeting: "Welcome! I'm your InnoVista AI Deal Scout 💼 I help you find and evaluate high-potential startups. What are you looking for?",
        suggestions: [
            "What makes a startup investable?",
            "How do I evaluate a founding team?",
            "What red flags should I watch for?",
            "How do I structure a seed deal?",
            "What domains are high potential in 2025?"
        ],
        responses: {
            "investable": "What makes a startup investable:\n\n✅ Large addressable market (>$1B)\n✅ Clear unique insight / unfair advantage\n✅ Early traction (users, revenue, pilots)\n✅ Strong founding team with domain expertise\n✅ Capital efficiency — can do more with less\n✅ Defensible business model over time",

            "team": "Evaluating a founding team:\n\n• Do they deeply understand the problem they're solving?\n• Have they worked together before under pressure?\n• Do they move fast — when did they ship the MVP?\n• Coachability: Do they take feedback or get defensive?\n• Commitment: Are they all-in full time?",

            "red": "Red flags in early-stage startups:\n\n🚩 No customer conversations done\n🚩 Idea pivot every few weeks\n🚩 Founders don't agree on equity/roles\n🚩 Market too small or too crowded\n🚩 No technical founder for a tech product\n🚩 Revenue projections with no basis",

            "deal": "How to structure a seed deal:\n\n• Use a SAFE (Simple Agreement for Future Equity)\n• Standard seed terms: $500K-$2M at $5M-$10M valuation cap\n• Include pro-rata rights for follow-on\n• Board seat: Usually not at pre-seed unless leading round\n• Due diligence: Team, market, tech, legal",

            "domain": "High-potential domains in 2025:\n\n🔥 AI / Generative AI tools (B2B focus)\n🔥 Climate Tech & Green Energy\n🔥 HealthTech (AI diagnostics, remote care)\n🔥 EdTech (personalized learning)\n🔥 FinTech (embedded finance, payments)\n🔥 Deep-Tech (robotics, space, defense)"
        }
    },
    Alumni: {
        greeting: "Great to have you here! I'm your InnoVista AI Advisor 🎓 I can help you give back to the ecosystem. What's on your mind?",
        suggestions: [
            "How can I best support students?",
            "How do I connect with startups to advise?",
            "How do I become an angel investor?",
            "What's the best way to share my experience?",
            "How do I find startups in my domain?"
        ],
        responses: {
            "student": "Supporting students effectively:\n\n• Share 1 real career story — successes AND failures\n• Offer resume reviews and mock interview sessions\n• Connect them to your professional network when appropriate\n• Be honest about the gap between college and the real world\n• Small gestures matter — a single introduction can change careers",

            "startup": "Connecting with startups as an advisor:\n\n• Offer domain-specific expertise (not generic advice)\n• Agree on clear scope: monthly calls? introductions?\n• Typical advisor equity: 0.1%-0.5% over 2 years\n• Help them avoid mistakes you made at your company\n• Make intros to investors in your network",

            "angel": "Becoming an angel investor:\n\n1. Start small: $5K-$25K per deal\n2. Invest in domains you deeply understand\n3. Expect 7-10 year horizon per investment\n4. Evaluate team first, idea second\n5. Connect with angel networks (AngelList, Let's Venture)\n6. Diversify: invest in 5-10 startups minimum",

            "experience": "Best ways to share your experience:\n\n• Write LinkedIn articles about lessons learned\n• Host a workshop for students on InnoVista\n• Offer office hours (1 hour/week, huge impact)\n• Mentor on InnoVista platform\n• Speak at college events in your city",

            "find": "Finding startups in your domain:\n\n• Use the InnoVista ecosystem map to explore\n• Filter matches by domain tags\n• Search by keywords in the search bar on this page\n• Connect with startup founders who match your background\n• Offer to review their pitch deck — great way to start"
        }
    }
};

function getAIResponse(message, role) {
    const ctx = ROLE_CONTEXT[role] || ROLE_CONTEXT['Student'];
    const lowerMsg = message.toLowerCase();
    
    // Find best matching response
    for (const [keyword, response] of Object.entries(ctx.responses)) {
        if (lowerMsg.includes(keyword)) {
            return response;
        }
    }
    
    // Generic fallback with role-aware message
    return `Great question! Here are some tips for you as a ${role}:\n\n` +
        Object.values(ctx.responses)[Math.floor(Math.random() * Object.values(ctx.responses).length)];
}

export function AIAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Detect user role from localStorage
    const localData = (() => {
        try { return JSON.parse(localStorage.getItem('innovista_user_profile') || '{}'); } catch { return {}; }
    })();
    const userRole = localData.role || 'Student';
    const ctx = ROLE_CONTEXT[userRole] || ROLE_CONTEXT['Student'];

    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: ctx.greeting }
    ]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const aiReply = getAIResponse(text, userRole);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiReply }]);
            setIsTyping(false);
        }, 800);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(message);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200 group"
                    title="Ask AI Assistant"
                >
                    <Bot size={26} className="text-white" />
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#070B14] animate-pulse" />
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px] bg-[#0D1425] rounded-2xl flex flex-col border border-[#6366F1]/30 shadow-2xl overflow-hidden"
                    style={{ boxShadow: '0 0 60px rgba(99,102,241,0.15)' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#6366F1]/20 to-[#22D3EE]/10 border-b border-[#6366F1]/20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center relative">
                                <Bot size={18} className="text-white" />
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-[#0D1425]" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                                    InnoVista AI
                                    <Sparkles size={13} className="text-[#22D3EE]" />
                                </h3>
                                <p className="text-[11px] text-[#64748B]">Your {userRole} AI Advisor • Always Online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-[#64748B] hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[380px]">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && (
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1]/40 to-[#22D3EE]/40 flex items-center justify-center mr-2 shrink-0 mt-1">
                                        <Bot size={13} className="text-[#22D3EE]" />
                                    </div>
                                )}
                                <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                                    ${msg.sender === 'user'
                                        ? 'bg-[#6366F1] text-white rounded-br-sm'
                                        : 'bg-[#111827] text-[#E2E8F0] rounded-bl-sm border border-white/5'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366F1]/40 to-[#22D3EE]/40 flex items-center justify-center shrink-0">
                                    <Bot size={13} className="text-[#22D3EE]" />
                                </div>
                                <div className="bg-[#111827] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1.5">
                                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
                        {ctx.suggestions.slice(0, 3).map((s, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(s)}
                                className="shrink-0 text-[11px] bg-[#111827] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#6366F1]/40 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-[#1E293B] bg-[#111827]">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder={`Ask me anything as a ${userRole}...`}
                                className="flex-1 bg-[#1E293B] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1]/50 placeholder:text-[#475569]"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
                            >
                                <Send size={15} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
