import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Check, CheckCheck, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ChatModal({ isOpen, onClose, contactName, contactRole }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'system', text: `You are now connected with ${contactName}. Phone numbers are hidden for your privacy.`, time: 'System' },
        { id: 2, sender: 'them', text: `Hi there! I saw we matched on the Innovista platform. Looking forward to discussing your idea!`, time: '10:00 AM' },
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            sender: 'me',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setMessage('');

        // Mock auto-reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'them',
                text: "That sounds great! Let's schedule a call to discuss further.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-md bg-[#0D1425] rounded-2xl flex flex-col overflow-hidden border border-[#6366F1]/20 shadow-2xl h-[600px] max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-[#111827] border-b border-[#6366F1]/10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#6366F1]/20 flex items-center justify-center overflow-hidden border border-[#6366F1]/30">
                                <User color="#6366F1" size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    {contactName}
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </h3>
                                <p className="text-xs text-[#94A3B8] flex items-center gap-1">
                                    <Lock size={10} /> Private Connection • {contactRole}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#0A0F1E] to-[#0D1425]">
                        {messages.map((msg) => {
                            if (msg.sender === 'system') {
                                return (
                                    <div key={msg.id} className="flex justify-center my-4">
                                        <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#94A3B8] text-[11px] px-3 py-1.5 rounded-full flex items-center gap-2">
                                            <Lock size={12} className="text-[#6366F1]" />
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            }

                            const isMe = msg.sender === 'me';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className="flex flex-col max-w-[80%]">
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl ${isMe
                                                    ? 'bg-[#6366F1] text-white rounded-br-sm'
                                                    : 'bg-[#1E293B] text-[#E2E8F0] rounded-bl-sm border border-white/5'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-[#64748B] ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {msg.time}
                                            {isMe && <CheckCheck size={12} className="text-[#6366F1]" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Box */}
                    <div className="p-4 bg-[#111827] border-t border-[#6366F1]/10">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#1E293B] border border-white/10 rounded-full px-5 py-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/50"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4F46E5] transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
