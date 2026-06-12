/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Coins, 
  Briefcase, 
  CheckCircle, 
  Bookmark, 
  ChevronRight, 
  ArrowLeft,
  X,
  Filter,
  DollarSign,
  Lock,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Job, UserProfile } from '../types.js';

interface JobMarketplaceProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
  onNavigate: (view: string) => void;
  selectedJobId: string | null;
  onSelectJob: (id: string | null) => void;
}

const PRIMARY_SKILLS_LIST = [
  "Performance Marketers",
  "Meta Ads Experts",
  "Google Ads Specialists",
  "SEO Specialists",
  "Content Writers",
  "Social Media Managers",
  "Graphic Designers",
  "Video Editors",
  "Marketing Automation Experts",
  "Email Marketers",
  "Influencer Marketing Specialists",
  "Marketing Consultants",
  "Analytics Experts",
  "Website Designers",
  "WordPress Developers"
];

export default function JobMarketplace({
  user,
  onRefreshUser,
  onNavigate,
  selectedJobId,
  onSelectJob
}: JobMarketplaceProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [locationType, setLocationType] = useState('');
  const [expLevel, setExpLevel] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  // active selected job details
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Application / connecting forms state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  // connection checking
  const [isConnected, setIsConnected] = useState(false);

  // alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [spendingConnect, setSpendingConnect] = useState(false);

  const fetchJobsList = async () => {
    setLoading(true);
    let url = `/api/jobs?`;
    if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
    if (selectedSkill) url += `skill=${encodeURIComponent(selectedSkill)}&`;
    if (locationType) url += `locationType=${locationType}&`;
    if (expLevel) url += `experience=${expLevel}&`;
    
    try {
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsList();
  }, [selectedSkill, locationType, expLevel, searchQuery]);

  // Load Single Job Campaign Details on select
  useEffect(() => {
    if (!selectedJobId) {
      setJobDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      try {
        const r = await fetch(`/api/jobs/${selectedJobId}`);
        if (r.ok) {
          const detailObj = await r.json();
          setJobDetails(detailObj);

          // Check if bookmark-saved (for logged-in freelancers)
          if (user) {
            setIsSaved(user.savedJobs?.includes(selectedJobId) || false);
          }

          // Check connection status
          if (user) {
            const token = localStorage.getItem('fi_auth_token');
            const connResponse = await fetch('/api/connections', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (connResponse.ok) {
              const connectionsList = await connResponse.json();
              const foundConn = connectionsList.some((c: any) => 
                c.otherUser?.id === detailObj.employerId
              );
              setIsConnected(foundConn);
            }
          }

          // Preset bid default values
          setBidAmount(String(detailObj.budgetMin));
        } else {
          setJobDetails(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedJobId, user]);

  // Handle Bookmarks Toggle
  const handleToggleSave = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/jobs/save-job', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId: selectedJobId })
      });
      if (r.ok) {
        const resObj = await r.json();
        setIsSaved(resObj.savedJobs.includes(selectedJobId));
        setSuccessMsg(resObj.savedJobs.includes(selectedJobId) ? "Job campaign added to bookmarks." : "Job removed from bookmarks.");
        onRefreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Proposal Bidding Flow
  const handleApplyBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      onNavigate('login');
      return;
    }

    if (!coverLetter || !bidAmount) {
      setErrorMsg("Please complete the pitch statement and offer amount.");
      return;
    }

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/proposals/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          coverLetter,
          bidAmount: Number(bidAmount)
        })
      });

      const data = await r.json();
      if (!r.ok) {
        throw new Error(data.message || "Failed to submit proposal application.");
      }

      setSuccessMsg("Success! Your proposal brief has been reported, and client has been notified.");
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Spend Connect Action: Deducts 5 contacts credits to unlock direct active messages instantly!
  const handleSpendConnectToChat = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setSpendingConnect(true);

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/connections/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          targetUserId: jobDetails.employerId,
          jobId: selectedJobId
        })
      });

      const data = await r.json();
      setSpendingConnect(false);

      if (!r.ok) {
        setErrorMsg(data.message || "Connection transaction failed.");
        return;
      }

      setSuccessMsg("Connection Unlocked! 5 Connects were used. Direct chat inbox is now live.");
      setIsConnected(true);
      onRefreshUser();
      setTimeout(() => onNavigate('chat'), 2000); // Route to chats to let them execute!
    } catch (err: any) {
      setSpendingConnect(false);
      setErrorMsg(err.message);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSkill('');
    setLocationType('');
    setExpLevel('');
    fetchJobsList();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Dynamic Alerts inside market view */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-2xl flex justify-between items-center text-xs animate-fade-in relative z-20">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-250 text-rose-850 p-3.5 rounded-2xl flex justify-between items-center text-xs animate-shake relative z-20">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {selectedJobId && jobDetails ? (
        
        /* SINGLE JOB DETAILS DETAIL SHEET SCREEN */
        <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-10 shadow-sm animate-fade-in">
          
          <button
            onClick={() => onSelectJob(null)}
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 mb-8 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Campaign Market directory</span>
          </button>

          {loadingDetails ? (
            <div className="py-20 text-center text-slate-500 text-xs animate-pulse">Parsing brief details...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left 2 Columns: Long details */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      {jobDetails.category}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-medium font-mono px-3 py-1 rounded-full flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Posted {new Date(jobDetails.postedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-950 leading-tight">
                    {jobDetails.title}
                  </h1>

                  <p className="text-slate-500 text-xs mt-2 font-medium">
                    posted code: {jobDetails.id} · Employer client: <span className="text-slate-900 font-bold">{jobDetails.companyName}</span>
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-bold text-slate-900 text-sm mb-3 font-display">Campaign Outline & Task Parameters</h3>
                  <p className="text-sm text-slate-705 leading-relaxed font-light whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    {jobDetails.description}
                  </p>
                </div>

                {/* Skills tags */}
                <div className="border-t border-slate-105 pt-6">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Required Marketing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobDetails.requiredSkills?.map((s: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Action sheet card */}
              <div className="space-y-6">
                
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-md border border-slate-800">
                  
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Bidding Budget Estimate</span>
                    <p className="text-3xl font-extrabold text-amber-400 font-display mt-1">
                      ₹{jobDetails.budgetMin.toLocaleString()} - ₹{jobDetails.budgetMax.toLocaleString()}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-1">Fixed {jobDetails.payType === 'hourly' ? 'Hourly rate standard' : 'Monthly Retainer contract'}</span>
                  </div>

                  <div className="border-t border-slate-800 pt-5 space-y-4 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="font-light text-slate-400">Target Level Required:</span>
                      <span className="font-semibold text-white uppercase tracking-wider">{jobDetails.experienceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-light text-slate-400">Setup Coordinates:</span>
                      <span className="font-semibold text-white uppercase tracking-wider">{jobDetails.locationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-light text-slate-400">Hours Required:</span>
                      <span className="font-semibold text-white">{jobDetails.hoursPerDay || 4} Hrs/Day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-light text-slate-400">Project Duration:</span>
                      <span className="font-semibold text-white">{jobDetails.duration || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    {user?.role === 'freelancer' ? (
                      <>
                        <button
                          onClick={() => setShowApplyModal(true)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>Submit a Bid</span>
                        </button>

                        {isConnected ? (
                          <button
                            onClick={() => onNavigate('chat')}
                            className="w-full bg-slate-800 hover:bg-slate-750 text-white py-3 px-4 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center space-x-1"
                          >
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            <span>Connect Unlocked - Chat Now</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleSpendConnectToChat}
                            disabled={spendingConnect}
                            className="w-full bg-slate-950 text-amber-400 py-3 px-4 rounded-xl text-xs font-bold border border-slate-850 hover:bg-slate-850 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1"
                            id="spend-credits-btn"
                          >
                            <Coins className="w-4 h-4 text-amber-400" />
                            <span>{spendingConnect ? 'Connecting Tunnels...' : 'Direct Unlock Chat (-5 Credits)'}</span>
                          </button>
                        )}

                        <button
                          onClick={handleToggleSave}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-300 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{isSaved ? 'Bookmarked' : 'Save Brief Bookmark'}</span>
                        </button>
                      </>
                    ) : user ? (
                      <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-xs font-light text-slate-400 text-center">
                        Authenticate as a Freelancer to submit campaign bids.
                      </div>
                    ) : (
                      <button
                        onClick={() => onNavigate('login')}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold"
                      >
                        Sign in to Bid / Unlock Chat
                      </button>
                    )}
                  </div>

                </div>

                {/* Company details card */}
                {jobDetails.employer && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Poster Credentials</p>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm leading-tight">{jobDetails.employer.companyName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{jobDetails.employer.industry}</p>
                    </div>

                    <div className="border-t border-slate-50 pt-4 text-xs text-slate-600 space-y-2.5">
                      <div className="flex justify-between">
                        <span className="font-light">Representative:</span>
                        <span className="font-semibold text-slate-900">{jobDetails.employer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-light">Mobile:</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {isConnected ? jobDetails.employer.mobile : "[Locked - Connect Credit]"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-light">Email:</span>
                        <span className="text-[10px] text-slate-400">
                          {isConnected ? jobDetails.employer.email : "[Locked - Connect Credit]"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      ) : (
        
        /* BROWSE ALL SEARCH & DIRECTORY LISTINGS */
        <div className="space-y-8 animate-fade-in">
          
          <div className="bg-[#2563EB] text-white p-6 sm:p-10 rounded-xl relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 w-84 h-84 bg-white/5 rounded-full pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-[10px] font-bold text-white bg-blue-500/50 border border-blue-400 px-2.5 py-1 rounded uppercase tracking-wider">
                Vetted Briefs Only
              </span>
              <h1 className="font-sans font-black text-2xl sm:text-3xl text-white mt-3 uppercase">Find Your Next marketing Campaign</h1>
              <p className="text-blue-100 text-xs mt-1.5 leading-relaxed font-medium">
                Browse client briefs from Indian startups, D2C brands, and tech agencies. Quality filters with direct token-spend access blocks automated spam completely.
              </p>
            </div>
            
            {/* Search Input Filter bar */}
            <div className="mt-8 relative max-w-2xl z-10">
              <Search className="absolute left-4 top-3 text-white/70 w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Meta Ads, SEO specialists, Video creators, blogs writing..."
                className="w-full bg-blue-700/35 text-white placeholder-blue-200 pl-11 pr-4 py-3 rounded-lg text-xs border border-blue-400/50 focus:border-white focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT SIDEBAR FILTERS SHEET */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-150">
                <span className="font-sans font-black text-xs text-slate-900 uppercase tracking-wider flex items-center">
                  <Filter className="w-3.5 h-3.5 mr-1" /> Marketing Filters
                </span>
                <button 
                  onClick={handleResetFilters}
                  className="text-[10px] text-[#2563EB] hover:text-blue-700 font-bold uppercase tracking-wider"
                >
                  Reset all
                </button>
              </div>

              {/* Niche Category Primary Skill Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Niche</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
                >
                  <option value="">All Marketing Roles</option>
                  {PRIMARY_SKILLS_LIST.map((sk, i) => (
                    <option key={i} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>

              {/* Location Type Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Location Coordinates</label>
                <div className="space-y-2">
                  {[
                    { value: '', label: 'All Setups' },
                    { value: 'remote', label: 'Remote Only' },
                    { value: 'hybrid', label: 'Hybrid Contracts' },
                    { value: 'on-site', label: 'On-site Office' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer text-[11px] font-medium">
                      <input
                        type="radio"
                        name="locType"
                        checked={locationType === opt.value}
                        onChange={() => setLocationType(opt.value)}
                        className="accent-[#2563EB] h-4 w-4"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Required Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Grade Tier</label>
                <div className="space-y-2">
                  {[
                    { value: '', label: 'Any Grade' },
                    { value: 'winner', label: 'Beginner (1-2 yrs)', target: 'beginner' },
                    { value: 'intermediate', label: 'Intermediate (3-5 yrs)', target: 'intermediate' },
                    { value: 'expert', label: 'Expert Lead (5+ yrs)', target: 'expert' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer text-[11px] font-medium">
                      <input
                        type="radio"
                        name="expTier"
                        checked={expLevel === (opt.target || opt.value)}
                        onChange={() => setExpLevel(opt.target || opt.value)}
                        className="accent-[#2563EB] h-4 w-4"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT MARKET LISTINGS DIRECTORY */}
            <div className="lg:col-span-3 space-y-4">
              
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium pb-1.5">
                <span>Displaying <strong>{jobs.length}</strong> active campaigns</span>
                <span className="text-[10px] font-mono">100% verified posters</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-20 bg-white border border-slate-150 rounded-3xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white p-16 border border-slate-150 rounded-3xl text-center shadow-sm">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-800 font-bold text-base font-display">No job listings found matching filters</p>
                  <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                    Try adjusting your criteria, removing search queries, or resetting primary skill categories to see more.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-5 bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl"
                  >
                    Reset and Search All
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div 
                      key={job.id}
                      onClick={() => onSelectJob(job.id)}
                      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-[#2563EB] hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between group h-fit"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="bg-[#EEF2FF] text-[#2563EB] text-[10px] font-bold px-2.5 py-0.5 rounded border border-[#DBEAFE] uppercase">
                              {job.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium capitalize bg-slate-50 border border-slate-200 rounded px-2.5 py-0.5">
                              {job.locationType}
                            </span>
                          </div>

                          <h3 className="font-sans font-black text-slate-900 group-hover:text-[#2563EB] transition-colors text-sm sm:text-base mt-2 max-w-xl uppercase">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">by {job.companyName}</p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Retainer budget</p>
                          <p className="text-base sm:text-lg font-black text-[#2563EB]">
                            ₹{job.budgetMin.toLocaleString()} - ₹{job.budgetMax.toLocaleString()}
                          </p>
                          <span className="text-[9px] text-slate-400 font-normal">/{job.payType === 'hourly' ? 'Hr' : 'Mo'}</span>
                        </div>
                      </div>

                      <p className="text-slate-650 text-xs font-light mt-3 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {job.requiredSkills.map((sk, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-55 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Posted {new Date(job.postedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        
                        <span className="text-blue-600 font-extrabold flex items-center group-hover:translate-x-1 duration-200">
                          <span>View Campaign brief</span>
                          <ChevronRight className="w-4 h-4 ml-0.5" />
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* DETAILED PROPOSAL APPLICANT SUBMIT MODAL */}
      {showApplyModal && jobDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 max-w-lg w-full relative">
            
            <button 
              onClick={() => setShowApplyModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-900 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-lg text-slate-950 mb-1">Apply for Campaign Brief</h3>
            <p className="text-xs text-slate-500 mb-6 truncate">Target listing: {jobDetails.title}</p>

            <form onSubmit={handleApplyBrief} className="space-y-4">
              
              {/* Proposal Bid Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Retainer Bid Offer (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter budget offer in INR"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50/50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Client Budget Range: ₹{jobDetails.budgetMin.toLocaleString()} - ₹{jobDetails.budgetMax.toLocaleString()}</p>
              </div>

              {/* Cover letter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Cover Pitch Statement</label>
                <textarea
                  required
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Draft details on matching ROAS deliverables, previous cosmetics, SaaS or lead campaign success rates, and what milestones you propose for this job..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel Application
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
