/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Download, 
  FileText,
  User,
  Clock,
  Briefcase,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Connection, Message, UserProfile } from '../types.js';

interface ChatSystemProps {
  user: UserProfile;
  onRefreshUser: () => void;
}

export default function ChatSystem({
  user,
  onRefreshUser
}: ChatSystemProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [writingMessage, setWritingMessage] = useState('');
  
  // Simulated File Inputs
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingChannels, setLoadingChannels] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll Interval Reference for real-time simulation
  const pollTimerRef = useRef<any>(null);

  const fetchChannels = async (selectFirst = false) => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.ok) {
        const data = await r.json();
        setConnections(data);

        if (selectFirst && data.length > 0 && !selectedConnection) {
          setSelectedConnection(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchMessages = async (connectionId: string) => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch(`/api/messages/${connectionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.ok) {
        const msgs = await r.json();
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchChannels(true);
  }, []);

  // Sync messages on selection
  useEffect(() => {
    if (!selectedConnection) return;
    
    // Fetch immediately
    fetchMessages(selectedConnection.id);

    // Setup active 3-second long-poller fallback
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      fetchMessages(selectedConnection.id);
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [selectedConnection]);

  // Scroll to bottom on entries changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writingMessage && !attachedFile) return;

    try {
      const token = localStorage.getItem('fi_auth_token');
      const payload: any = {
        text: writingMessage
      };

      if (attachedFile) {
        payload.fileName = attachedFile.name;
        payload.fileUrl = attachedFile.url;
        payload.fileType = attachedFile.type;
      }

      const r = await fetch(`/api/messages/${selectedConnection.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (r.ok) {
        const newMsg = await r.json();
        setMessages(prev => [...prev, newMsg]);
        setWritingMessage('');
        setAttachedFile(null);
        // Refresh channels to update last message preview
        fetchChannels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated PDF or Images attachment logs
  const triggerAttachmentSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate direct sandbox server URL representation on the fly
    const simulatedObject = {
      name: file.name,
      type: file.type || "application/octet-stream",
      url: "#"
    };

    setAttachedFile(simulatedObject);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-150 shadow-md h-[calc(100vh-14rem)] overflow-hidden grid grid-cols-1 md:grid-cols-3">
        
        {/* LEFT BAR PANEL: Channels index listing */}
        <div className="border-r border-slate-150 h-full flex flex-col bg-slate-50/50">
          <div className="p-5 border-b border-slate-150 bg-white">
            <h2 className="font-display font-extrabold text-slate-900 text-lg flex items-center">
              Direct Messages
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Secure, 5-credits matches only</p>
          </div>

          <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
            {loadingChannels ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading pipelines...</div>
            ) : connections.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-550">
                <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <span>No active chat channels. Apply on briefs or connect with experts to open secure direct tunnels.</span>
              </div>
            ) : (
              connections.map(cn => {
                const isActive = selectedConnection?.id === cn.id;
                return (
                  <div
                    key={cn.id}
                    onClick={() => setSelectedConnection(cn)}
                    className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                      isActive ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                        {cn.otherUser?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{cn.otherUser?.name}</h4>
                        {cn.otherUser?.companyName ? (
                          <p className="text-[9px] text-indigo-700 font-semibold">{cn.otherUser.companyName}</p>
                        ) : (
                          <p className="text-[9px] text-slate-500 truncate font-light">{cn.otherUser?.headline || 'Freelance Director'}</p>
                        )}
                        {cn.lastMessage && (
                          <p className="text-[10px] text-slate-400 italic mt-1 max-w-[120px] truncate">
                            {cn.lastMessage.senderId === user.id ? 'You: ' : ''}{cn.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Unread dot alerts */}
                    {cn.lastMessage && !cn.lastMessage.read && cn.lastMessage.senderId !== user.id && (
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PART: ACTIVE CHAT SHELTER */}
        <div className="col-span-1 md:col-span-2 flex flex-col justify-between h-full bg-slate-50 relative">
          {selectedConnection ? (
            <>
              {/* Partner Contact Card strip */}
              <div className="p-4 sm:p-5 border-b border-slate-150 bg-white flex justify-between items-center shadow-sm relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold">
                    {selectedConnection.otherUser?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 text-sm">{selectedConnection.otherUser?.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider flex items-center">
                      <MapPin className="w-3 h-3 text-rose-500 mr-1" />
                      {selectedConnection.otherUser?.city}, {selectedConnection.otherUser?.state}
                    </p>
                  </div>
                </div>

                {/* Connection unlocked contact details tray */}
                <div className="flex flex-wrap items-center gap-3">
                  {selectedConnection.otherUser && (
                    <div className="hidden sm:flex text-[10px] text-slate-550 gap-4 pr-3 border-r border-slate-200">
                      <div className="flex items-center" title="Unlocked Direct Email">
                        <Mail className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                        <span className="font-semibold text-slate-800">{selectedConnection.otherUser.email}</span>
                      </div>
                      <div className="flex items-center" title="Unlocked Direct Mobile">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                        <span className="font-semibold text-slate-800">{selectedConnection.otherUser.mobile}</span>
                      </div>
                    </div>
                  )}
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] uppercase font-bold py-1 px-2.5 rounded-full border border-emerald-300 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Secured
                  </span>
                </div>
              </div>

              {/* Chat Records history stack */}
              <div className="flex-grow overflow-y-auto p-5 space-y-4">
                
                {selectedConnection.otherUser && (
                  <div className="flex sm:hidden p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[10px] space-y-1 mb-2">
                    <p className="font-bold text-blue-800">Unlocked Direct Contacts:</p>
                    <p>✉️ {selectedConnection.otherUser.email}</p>
                    <p>📞 {selectedConnection.otherUser.mobile}</p>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400">Tunnels established. Send your opening pitch below!</div>
                ) : (
                  messages.map(msg => {
                    const isSelf = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative ${
                          isSelf 
                            ? 'bg-slate-900 text-white rounded-br-none' 
                            : 'bg-white text-slate-900 border border-slate-150 rounded-bl-none'
                        }`}>
                          <p className="text-xs leading-relaxed font-light">{msg.text}</p>
                          
                          {/* Rich File attachment render */}
                          {msg.fileName && (
                            <div className={`mt-3 p-3 rounded-lg flex items-center justify-between text-[11px] border ${
                              isSelf ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-50 border-slate-100'
                            }`}>
                              <div className="flex items-center space-x-2 truncate pr-2">
                                <FileText className="w-4.5 h-4.5 text-blue-500 flex-shrink-0" />
                                <span className="truncate font-medium">{msg.fileName}</span>
                              </div>
                              <a 
                                href={msg.fileUrl} 
                                className="p-1 rounded bg-slate-950/20 hover:bg-slate-950/40 text-blue-500" 
                                title="Download Simulated File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[8px] opacity-60 mt-2">
                            <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isSelf && (
                              <span className="font-semibold lowercase select-none">
                                {msg.read ? '· read' : '· sent'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Message toolbar box */}
              <div className="p-4 bg-white border-t border-slate-150">
                
                {/* File Attachment Pill Preview */}
                {attachedFile && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs flex justify-between items-center animate-fade-in">
                    <span className="flex items-center truncate">
                      <Paperclip className="w-4.5 h-4.5 text-blue-600 mr-2" />
                      Attaching file: <strong className="ml-1 truncate">{attachedFile.name}</strong>
                    </span>
                    <button 
                      onClick={() => setAttachedFile(null)}
                      className="text-slate-400 hover:text-rose-600 font-bold px-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={triggerAttachmentSim}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerFileInput}
                    className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors bg-slate-50"
                    title="Simulate adding file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={writingMessage}
                    onChange={(e) => setWritingMessage(e.target.value)}
                    placeholder="Enter message details..."
                    className="flex-grow rounded-xl border border-slate-200 px-4 py-3 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white">
              <MessageSquare className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="font-display font-bold text-slate-900 text-base">Live Secure Chat Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                Unlock communication tunnels using 5 connects. Select a contact on the left sidebar to resume active marketing agreements negotiations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
