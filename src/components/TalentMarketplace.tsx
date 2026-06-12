/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Coins, 
  Briefcase, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft,
  X,
  Filter,
  ExternalLink,
  Lock,
  MessageSquare,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { UserProfile, UserReview as Review } from '../types.js';

interface TalentMarketplaceProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
  onNavigate: (view: string) => void;
  selectedTalentId: string | null;
  onSelectTalent: (id: string | null) => void;
  onOpenPaymentModal: () => void;
}

const SPECIALTIES_LIST = [
  "Performance Marketer",
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

const STATES_LIST = [
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Haryana",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Kerala"
];

export default function TalentMarketplace({
  user,
  onRefreshUser,
  onNavigate,
  selectedTalentId,
  onSelectTalent,
  onOpenPaymentModal
}: TalentMarketplaceProps) {
  const [freelancers, setFreelancers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search queries & Filtes
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [minExp, setMinExp] = useState('');

  // Individual profile state
  const [talentDetails, setTalentDetails] = useState<UserProfile | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Reviews list
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aveRating, setAveRating] = useState(5.0);

  // messaging limits
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchFreelancers = async () => {
    setLoading(true);
    let url = `/api/freelancers?`;
    if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
    if (selectedSpecialty) url += `specialty=${encodeURIComponent(selectedSpecialty)}&`;
    if (selectedState) url += `state=${encodeURIComponent(selectedState)}&`;
    if (minExp) url += `minExperience=${minExp}&`;

    try {
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        setFreelancers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [selectedSpecialty, selectedState, minExp, searchQuery]);

  // Handle detailed talent inspection
  useEffect(() => {
    if (!selectedTalentId) {
      setTalentDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      try {
        const r = await fetch(`/api/freelancers/${selectedTalentId}`);
        if (r.ok) {
          const detailObj = await r.json();
          setTalentDetails(detailObj);

          // Check if candidate saved in Employer lists
          if (user) {
            setIsSaved(user.savedFreelancers?.includes(selectedTalentId) || false);
          }

          // Fetch reviews
          const revRes = await fetch(`/api/reviews/freelancer/${selectedTalentId}`);
          if (revRes.ok) {
            const revList = await revRes.json();
            setReviews(revList);

            if (revList.length > 0) {
              const sum = revList.reduce((acc: number, item: any) => 
                acc + ((item.ratingComm + item.ratingQual + item.ratingTime) / 3), 0
              );
              setAveRating(Number((sum / revList.length).toFixed(1)));
            } else {
              setAveRating(5.0); // Baseline rating default
            }
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
                c.otherUser?.id === selectedTalentId
              );
              setIsConnected(foundConn);
            }
          }

        } else {
          setTalentDetails(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedTalentId, user]);

  // Handle Saved bookmarks
  const handleToggleSaveFreelancer = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/freelancers/save-freelancer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ freelancerId: selectedTalentId })
      });
      if (r.ok) {
        const resObj = await r.json();
        setIsSaved(resObj.savedFreelancers.includes(selectedTalentId));
        setSuccessMsg(resObj.savedFreelancers.includes(selectedTalentId) ? "Marketer saved to shortlist." : "Marketer removed from shortlist.");
        onRefreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Spend Connect transaction to connect with Freelancer
  const handleConnectWithFreelancer = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setConnecting(true);

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/connections/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ targetUserId: selectedTalentId })
      });

      const data = await r.json();
      setConnecting(false);

      if (!r.ok) {
        setErrorMsg(data.message || "Could not spin up direct tunnels connection.");
        return;
      }

      setSuccessMsg("Success! Tunnel established and 5 credits spent. Inbox ready.");
      setIsConnected(true);
      onRefreshUser();
      setTimeout(() => onNavigate('chat'), 2000);
    } catch (err: any) {
      setConnecting(false);
      setErrorMsg(err.message);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    setSelectedState('');
    setMinExp('');
    fetchFreelancers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-2xl flex justify-between items-center text-xs animate-fade-in relative z-20">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-250 text-rose-800 p-3.5 rounded-2xl flex justify-between items-center text-xs animate-shake relative z-20">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {selectedTalentId && talentDetails ? (
        
        /* DETAILED PROFFILE PAGE INSPECTION */
        <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-10 shadow-sm animate-fade-in">
          
          <button
            onClick={() => onSelectTalent(null)}
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 mb-8 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Talent Search directory</span>
          </button>

          {loadingDetails ? (
            <div className="py-20 text-center text-slate-500 text-xs">Parsing portfolio credentials...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left Column 2: Detailed bio, specialities list, showcase portfolios */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Intro block */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                    {talentDetails.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display font-bold text-2xl text-slate-950">{talentDetails.name}</h1>
                      {talentDetails.isEmailVerified && talentDetails.isMobileVerified && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] uppercase font-extrabold py-0.5 px-2.5 rounded-full border border-emerald-350 flex items-center">
                          Vetted Professional
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 font-semibold text-sm mt-1">{talentDetails.headline}</p>
                    <p className="text-slate-500 text-xs mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {talentDetails.city}, {talentDetails.state}
                    </p>
                  </div>
                </div>

                {/* Cover Narrative */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">About specialist</h3>
                  <p className="text-sm text-slate-650 leading-relaxed font-light whitespace-pre-line">
                    {talentDetails.bio || "This registered marketing partner is expert at Meta acquisition campaigns, programmatic SEO architectures, Google Analytics configurations and content strategies in premium niches."}
                  </p>
                </div>

                {/* Portfolio items */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">Case Studies & Showcase Catalog</h3>
                  
                  {(!talentDetails.portfolioItems || talentDetails.portfolioItems.length === 0) ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-500">
                      Showcase items coming soon. Contact professional for direct campaign credentials.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {talentDetails.portfolioItems.map((p, index) => (
                        <div key={p.id || index} className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                          {p.imageUrl && (
                            <div className="h-32 w-full overflow-hidden bg-slate-150">
                              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="p-4">
                            <span className="bg-blue-100 text-blue-800 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {p.category}
                            </span>
                            <h4 className="font-semibold text-slate-950 text-xs mt-2">{p.title}</h4>
                            <p className="text-slate-600 text-[10px] mt-1 leading-normal line-clamp-3">{p.description}</p>
                            {p.linkUrl && (
                              <a href={p.linkUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-[10px] text-blue-600 hover:underline mt-3">
                                <span>Explore Showcase</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ratings block reviews */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">Reviews & Client Endorsements ({reviews.length})</h3>
                  
                  {reviews.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500">
                      No ratings posted yet. Be the first to partner and evaluate performance benchmarks!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map(r => (
                        <div key={r.id} className="border border-slate-100 p-4 rounded-xl bg-slate-50/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{r.employerName || "Client partner"}</p>
                              <span className="text-[10px] text-slate-400">Campaign: {r.jobTitle || "Undisclosed project"}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-bold text-slate-900">
                                {((r.ratingComm + r.ratingQual + r.ratingTime) / 3).toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-700 text-xs mt-2 italic font-light">"{r.feedback}"</p>
                          
                          <div className="mt-3 flex gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>Comm: {r.ratingComm}/5</span>
                            <span>Quality: {r.ratingQual}/5</span>
                            <span>Time: {r.ratingTime}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column Action Panel */}
              <div className="space-y-6">
                
                <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-800 shadow-md">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Expert Specialty</span>
                    <p className="text-xl font-bold font-display text-blue-400 mt-1">{talentDetails.specialty}</p>
                  </div>

                  <div className="border-t border-slate-800 pt-5 space-y-3.5 text-xs text-slate-350">
                    <div className="flex justify-between">
                      <span>Experience Years:</span>
                      <strong className="text-white">{talentDetails.experience} Years</strong>
                    </div>
                    {talentDetails.website && (
                      <div className="flex justify-between">
                        <span>Personal Link:</span>
                        <a href={talentDetails.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                          Browse Web
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Vetted Mobile:</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {isConnected ? talentDetails.mobile : "[Locked]"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vetted Email:</span>
                      <span className="text-[10px] text-slate-450">
                        {isConnected ? talentDetails.email : "[Locked]"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-5 space-y-3">
                    {user?.role === 'employer' ? (
                      <>
                        {isConnected ? (
                          <button
                            onClick={() => onNavigate('chat')}
                            className="w-full bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-1"
                          >
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            <span>Tunnels unlocked - Chat now</span>
                          </button>
                        ) : (
                          <button
                            onClick={handleConnectWithFreelancer}
                            disabled={connecting}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-1 shadow-md active:scale-95 disabled:opacity-50"
                          >
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span>{connecting ? 'Enabling messaging...' : 'Unlock messaging (-5 credits)'}</span>
                          </button>
                        )}

                        <button
                          onClick={handleToggleSaveFreelancer}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-300 py-2 rounded-xl text-xs flex justify-center items-center gap-2"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{isSaved ? 'Shortlisted' : 'Shortlist talent'}</span>
                        </button>
                      </>
                    ) : user ? (
                      <div className="bg-slate-850 p-4 border border-slate-800 rounded-xl text-[10px] text-slate-400 text-center leading-normal">
                        Verify your Employer company profile to unlock candidate direct messaging.
                      </div>
                    ) : (
                      <button
                        onClick={() => onNavigate('login')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold"
                      >
                        Sign in to Unlock Profile DMs
                      </button>
                    )}
                  </div>
                </div>

                {/* Score breakdown metrics card */}
                {reviews.length > 0 && (
                  <div className="bg-white p-5 border border-slate-150 rounded-3xl shadow-sm space-y-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quality Scoreboard</p>
                    
                    <div className="flex items-center space-x-3">
                      <p className="text-3xl font-extrabold text-slate-950 font-display">{aveRating}</p>
                      <div>
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map(starObj => (
                            <Star key={starObj} className={`w-3.5 h-3.5 ${starObj <= Math.round(aveRating) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-450 mt-0.5">Average score out of {reviews.length} gigs</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      ) : (
        
        /* SEARCH DIRECTORY LAYOUT */
        <div className="space-y-8 animate-fade-in">
          
          <div className="bg-[#2563EB] text-white p-6 sm:p-10 rounded-xl relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 w-84 h-84 bg-white/5 rounded-full pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-[10px] font-bold text-white bg-blue-500/50 border border-blue-400 px-2.5 py-1 rounded uppercase tracking-wider">
                Vetted Talents Exclusive
              </span>
              <h1 className="font-sans font-black text-2xl sm:text-3xl text-white mt-3 uppercase">Acquire Vetted Indian Marketing Talents</h1>
              <p className="text-blue-100 text-xs mt-1.5 leading-relaxed font-medium">
                Search verified Performance Marketers, Meta Ads Consultants, and SEO Experts located in India. Lock direct chats using credits to secure elite contract partnerships.
              </p>
            </div>

            {/* Search filter widget */}
            <div className="mt-8 relative max-w-2xl z-10">
              <Search className="absolute left-4 top-3 text-white/70 w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search specialties, expertise keywords, analytical suites..."
                className="w-full bg-blue-700/35 text-white placeholder-blue-200 pl-11 pr-4 py-3 rounded-lg text-xs border border-blue-400/50 focus:border-white focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                     {/* SEARCH FILTERS PANEL */}
            <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 h-fit space-y-6 shadow-xs">
              <div className="flex justify-between items-center pb-4 border-b border-slate-150">
                <span className="font-sans font-black text-xs text-slate-900 uppercase tracking-wider flex items-center">
                  <Filter className="w-3.5 h-3.5 mr-1" /> Filter parameters
                </span>
                <button onClick={resetFilters} className="text-[10px] text-[#2563EB] hover:text-blue-700 font-bold uppercase tracking-wider">Reset</button>
              </div>

              {/* Specialty dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Expert Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
                >
                  <option value="">All Specialties</option>
                  {SPECIALTIES_LIST.map((spec, i) => (
                    <option key={i} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* State India filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">India State Location</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
                >
                  <option value="">All Indian States</option>
                  {STATES_LIST.map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Experience Range */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Min Experience years</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value)}
                  placeholder="e.g. 3 Years"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none text-slate-700"
                />
              </div>

            </div>

            {/* RESULTS DIRECTORY GRID */}
            <div className="lg:col-span-3 space-y-4">
              
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium font-sans pb-1.5">
                <span>Displaying <strong>{freelancers.length}</strong> available marketing specialists</span>
                <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">● India Exclusive</span>
              </div>

              {loading ? (
                <div className="py-20 text-center bg-white border border-slate-150 rounded-3xl flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : freelancers.length === 0 ? (
                <div className="bg-white p-16 border border-slate-150 rounded-3xl text-center shadow-sm">
                  <Sparkles className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                  <p className="text-slate-900 font-bold text-base font-display">No specialist found</p>
                  <p className="text-slate-500 text-xs mt-1">Try resetting state tags, specialties, or experience filters.</p>
                  <button onClick={resetFilters} className="mt-4 bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl">Reset All filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancers.map(f => (
                    <div
                      key={f.id}
                      onClick={() => onSelectTalent(f.id)}
                      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-[#2563EB] hover:shadow-xs cursor-pointer flex flex-col justify-between group transition-all"
                    >
                      <div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] text-[9px] font-bold px-2.5 py-0.5 rounded uppercase">
                            {f.specialty}
                          </span>
                          
                          <span className="text-[9px] text-slate-500 font-medium capitalize bg-slate-50 border border-slate-200 rounded px-2 py-0.5 flex items-center">
                            <MapPin className="w-3 h-3 text-[#2563EB] mr-0.5" />
                            {f.city}
                          </span>
                        </div>

                        <h3 className="font-sans font-black text-slate-900 group-hover:text-[#2563EB] transition-colors text-sm sm:text-base uppercase">
                          {f.name}
                        </h3>

                        <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 font-medium">
                          {f.headline}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-4">
                          {f.skills?.slice(0, 4).map((sk, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                              {sk}
                            </span>
                          ))}
                        </div>

                      </div>

                      <div className="border-t border-slate-100 pt-3.5 mt-5 flex justify-between items-center text-xs font-medium">
                        
                        <span className="text-slate-500 text-[11px]">
                          Years Exp: <strong className="text-slate-900">{f.experience} Yrs</strong>
                        </span>

                        <span className="text-[#2563EB] font-bold flex items-center group-hover:translate-x-1 duration-250 text-[11px]">
                          <span>Inspect credentials</span>
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

    </div>
  );
}
