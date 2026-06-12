/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Eye, 
  MessageSquare, 
  Send, 
  Bookmark, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Star,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { UserProfile, Proposal, Job } from '../types.js';

interface DashboardFreelancerProps {
  user: UserProfile;
  onRefreshUser: () => void;
  onNavigate: (view: string) => void;
  onSelectJob: (id: string) => void;
  onOpenPaymentModal: () => void;
}

export default function DashboardFreelancer({
  user,
  onRefreshUser,
  onNavigate,
  onSelectJob,
  onOpenPaymentModal
}: DashboardFreelancerProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [savedJobsFull, setSavedJobsFull] = useState<Job[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // Portfolio items states
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [pTitle, setPTitle] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCat, setPCat] = useState('Performance Marketer');
  const [pLink, setPLink] = useState('');
  const [pImg, setPImg] = useState('');

  // Notifications systems
  const [successNotif, setSuccessNotif] = useState<string | null>(null);
  const [errorNotif, setErrorNotif] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposalsAndSaves = async () => {
      try {
        const token = localStorage.getItem('fi_auth_token');
        if (!token) return;

        const res = await fetch('/api/proposals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const props = await res.json();
          setProposals(props);
        }

        // Fetch saved jobs details
        if (user.savedJobs && user.savedJobs.length > 0) {
          const jobsRes = await fetch('/api/jobs');
          if (jobsRes.ok) {
            const allJobs: Job[] = await jobsRes.json();
            const filtered = allJobs.filter(j => user.savedJobs?.includes(j.id));
            setSavedJobsFull(filtered);
          }
        } else {
          setSavedJobsFull([]);
        }

      } catch (err) {
        console.error('Error loading proposals:', err);
      } finally {
        setLoadingProposals(false);
      }
    };

    fetchProposalsAndSaves();
  }, [user]);

  // Handle Mock Email Verification
  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/verification/verify-email', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.ok) {
        setSuccessNotif("Email address successfully authenticated via sandbox checks!");
        onRefreshUser();
      } else {
        setErrorNotif("Email authentication bypassed. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Handle Mock Phone Verification (OTP)
  const handleSendOtp = () => {
    setOtpSent(true);
    setShowOtpField(true);
    setSuccessNotif("Simulation SMS Code (1234) dispatched to your registered handle!");
  };

  const handleVerifyOtp = async () => {
    setVerifyingPhone(true);
    if (otpCode !== '1234') {
      setErrorNotif("Invalid simulator OTP. Please enter 1234.");
      setVerifyingPhone(false);
      return;
    }

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/verification/verify-phone', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ otpCode })
      });
      if (r.ok) {
        setSuccessNotif("OTP verified perfectly! Verification Badge loaded.");
        setShowOtpField(false);
        onRefreshUser();
      } else {
        setErrorNotif("SMS OTP authorization failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Add Portfolio Case
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pDesc) {
      setErrorNotif("Please supply portfolio title and case description.");
      return;
    }

    const newItem = {
      id: "port-" + Math.random().toString(36).substr(2, 9),
      title: pTitle,
      description: pDesc,
      category: pCat,
      linkUrl: pLink,
      imageUrl: pImg || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
    };

    const updatedPortfolio = [...(user.portfolioItems || []), newItem];

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ portfolioItems: updatedPortfolio })
      });

      if (r.ok) {
        setSuccessNotif("Portfolio case card added successfully!");
        setShowPortfolioModal(false);
        setPTitle('');
        setPDesc('');
        setPLink('');
        setPImg('');
        onRefreshUser();
      } else {
        setErrorNotif("Failed to update profile portfolios entries.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Portfolio Case
  const handleDeletePortfolio = async (id: string) => {
    const updatedPortfolio = (user.portfolioItems || []).filter(item => item.id !== id);

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ portfolioItems: updatedPortfolio })
      });

      if (r.ok) {
        setSuccessNotif("Portfolio item deleted successfully!");
        onRefreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Notifications Triggers */}
      {successNotif && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 p-3 rounded-2xl flex justify-between items-center animate-fade-in">
          <span>{successNotif}</span>
          <button onClick={() => setSuccessNotif(null)} className="font-bold text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}
      {errorNotif && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-[11px] text-rose-800 p-3 rounded-2xl flex justify-between items-center animate-shake">
          <span>{errorNotif}</span>
          <button onClick={() => setErrorNotif(null)} className="font-bold text-rose-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-950">Namaste, {user.name}!</h1>
            {user.isEmailVerified && user.isMobileVerified && (
              <span className="bg-emerald-150 text-emerald-800 text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border border-emerald-300 inline-flex items-center">
                <CheckCircle className="w-3 h-3 text-emerald-600 mr-1" /> Vetted Member
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage marketing bids, showcases, and connect credit balances in one place.</p>
        </div>

        <button 
          onClick={() => onNavigate('browse-jobs')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1.5"
        >
          <span>Find Job Campaigns</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: Key Statistics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Connect Balance Box */}
        <div className="bg-blue-950 text-white p-5 rounded-2xl shadow-sm border border-blue-900 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Connect Credits</span>
              <Coins className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold font-display">{user.connects}</p>
            <p className="text-[10px] text-blue-300 mt-2">Spent 5 per connection hook</p>
          </div>
          <button 
            onClick={onOpenPaymentModal}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded-xl mt-4 uppercase tracking-wider transition-colors active:scale-95"
          >
            + Buy Credits
          </button>
        </div>

        {/* Profile Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Views</span>
            <Eye className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">42</p>
          <p className="text-[10px] text-slate-50 relative top-1 bg-indigo-50 text-indigo-700 py-1.5 rounded-lg text-center font-semibold">+12% in last 7 days</p>
        </div>

        {/* Messages Unread */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Channels</span>
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">2</p>
          <button 
            onClick={() => onNavigate('chat')}
            className="w-full text-blue-600 hover:text-blue-700 text-[10px] font-bold py-2 text-left transition-colors flex items-center justify-between"
          >
            <span>Open Inbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total bids sent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bids Submitted</span>
            <Send className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">{proposals.length}</p>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">Auto-notifies clients</div>
        </div>

        {/* Saved Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saved Campaigns</span>
            <Bookmark className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">{user.savedJobs?.length || 0}</p>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">Quick link reminders</div>
        </div>

      </div>

      {/* Row 2: Verification Action Card */}
      {(!user.isEmailVerified || !user.isMobileVerified) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                Complete Sandbox Verifications to Enable Vetted Badges!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Hiring companies prioritize vetted digital marketers by 400%. Simulate instant verification triggers here inside the sandbox safely.
              </p>
              
              {showOtpField && (
                <div className="mt-4 p-3 bg-white rounded-2xl border border-amber-200 inline-flex items-center space-x-2 animate-fade-in">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Enter simulated code (1234):</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-16 p-1 border border-slate-300 rounded-lg text-xs font-bold text-center"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifyingPhone}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold py-1 px-3 transition-colors disabled:opacity-50"
                  >
                    {verifyingPhone ? 'Checking...' : 'Submit OTP'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {!user.isEmailVerified && (
              <button
                onClick={handleVerifyEmail}
                disabled={verifyingEmail}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs py-3 px-5 rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {verifyingEmail ? 'Authenticating...' : 'Verify Email'}
              </button>
            )}
            {!user.isMobileVerified && !otpSent && (
              <button
                onClick={handleSendOtp}
                className="bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-sm transition-colors"
              >
                Verify Phone via OTP
              </button>
            )}
          </div>
        </div>
      )}

      {/* Row 3: Split layouts (Proposals Track vs Portfolio Display) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLUMNS: Active Bids & Saved Jobs */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Proposals list */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm">
            <h2 className="font-display font-bold text-lg text-slate-950 flex items-center mb-6">
              <ClipboardList className="w-5 h-5 text-blue-600 mr-2" /> Applied Marketing Campaigns
            </h2>

            {loadingProposals ? (
              <div className="py-10 text-center text-xs text-slate-500">Checking direct databases...</div>
            ) : proposals.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-2xl text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-800 font-bold text-sm">No active briefs applied</p>
                <p className="text-slate-500 text-xs mt-1">Your proposals track sheet will appear list here.</p>
                <button
                  onClick={() => onNavigate('browse-jobs')}
                  className="mt-4 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl"
                >
                  Browse Briefs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map(prop => (
                  <div key={prop.id} className="border border-slate-100 rounded-2xl p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onSelectJob(prop.jobId)}>
                          {prop.jobTitle}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">Applied {new Date(prop.submittedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wide ${
                        prop.status === 'accepted' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' 
                          : prop.status === 'declined' 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {prop.status}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-xs border-t border-slate-50 pt-4">
                      <span className="text-slate-500">Your Bid: <strong>₹{prop.bidAmount.toLocaleString()}</strong></span>
                      {prop.status === 'accepted' ? (
                        <button
                          onClick={() => onNavigate('chat')}
                          className="bg-blue-600 text-white font-bold py-1.5 px-3.5 rounded-lg text-[10px] transition-all flex items-center space-x-1"
                        >
                          <span>Open Live Chat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Pending client decision</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Jobs list */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm">
            <h2 className="font-display font-bold text-lg text-slate-950 flex items-center mb-6">
              <Bookmark className="w-5 h-5 text-rose-500 mr-2" /> Saved Careers & Jobs
            </h2>

            {savedJobsFull.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 rounded-2xl">
                No saved jobs bookmarks found. Browse jobs and toggle save icons to bookmark.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobsFull.map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => onSelectJob(job.id)}
                    className="border border-slate-100 p-4 rounded-2xl hover:border-slate-200 cursor-pointer transition-colors"
                  >
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {job.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-1">{job.title}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">by {job.companyName}</span>
                    <div className="flex justify-between items-center text-xs text-amber-600 font-bold mt-4 pt-3 border-t border-slate-50">
                      <span>₹{job.budgetMin.toLocaleString()} - ₹{job.budgetMax.toLocaleString()} / Mo</span>
                      <span className="text-[10px] text-blue-600">Apply Now →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Portable Portfolio Item Creator */}
        <div>
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-base text-slate-950 flex items-center">
                <Sparkles className="w-5 h-5 text-blue-500 mr-1.5" /> Marketing Portfolio
              </h2>
              <button 
                onClick={() => setShowPortfolioModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white p-1.5 rounded-lg active:scale-95 transition-all"
                title="Add new item"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {(user.portfolioItems || []).length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                <Plus className="w-10 h-10 text-slate-300 mx-auto mb-2 cursor-pointer" onClick={() => setShowPortfolioModal(true)} />
                <p className="text-slate-800 font-bold text-xs">Varnish your showcases</p>
                <p className="text-[10px] text-slate-500 mt-1">Include high-ROI dashboards, creative models, or metrics screenshots.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(user.portfolioItems || []).map(p => (
                  <div key={p.id} className="group relative border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                    {p.imageUrl && (
                      <div className="h-28 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                        <img 
                          src={p.imageUrl} 
                          alt={p.title} 
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="bg-blue-100 text-blue-800 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {p.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-2 truncate">{p.title}</h4>
                      <p className="text-slate-600 text-[10px] mt-1 line-clamp-2 leading-normal">{p.description}</p>
                      
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
                        {p.linkUrl ? (
                          <a href={p.linkUrl} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center">
                            <span>Link URL</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        ) : <span />}

                        <button 
                          onClick={() => handleDeletePortfolio(p.id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PORTFOLIO CASE STUDY CREATION MODAL */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 max-w-md w-full relative">
            <h3 className="font-display font-bold text-lg text-slate-950 mb-1">Add Case Study / Showcase Card</h3>
            <p className="text-xs text-slate-500 mb-6">Explain visual benchmarks or direct metrics to grab employer trust.</p>

            <form onSubmit={handleAddPortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  placeholder="e.g. Scaling purchase ROAS to 3.8x"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deliverable Category</label>
                <select
                  value={pCat}
                  onChange={(e) => setPCat(e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-700"
                >
                  <option value="Performance Marketer">Performance Marketer</option>
                  <option value="Meta Ads Experts">Meta Ads Experts</option>
                  <option value="Google Ads Specialists">Google Ads Specialists</option>
                  <option value="SEO Specialists">SEO Specialists</option>
                  <option value="Content Writers">Content Writers</option>
                  <option value="Video Editors">Video Editors</option>
                  <option value="WordPress Developers">WordPress Developers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Case Description</label>
                <textarea
                  required
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Draft your process, initial blocks, campaign tactics, and absolute outcome metrics..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reference URL (Optional)</label>
                <input
                  type="url"
                  value={pLink}
                  onChange={(e) => setPLink(e.target.value)}
                  placeholder="e.g. Behance link or live website dashboard"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={pImg}
                  onChange={(e) => setPImg(e.target.value)}
                  placeholder="https://image-source.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
                >
                  Save showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
