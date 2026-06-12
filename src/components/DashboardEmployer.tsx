/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Coins, 
  PlusCircle, 
  Users, 
  FolderGit2, 
  AlertCircle, 
  ExternalLink, 
  MapPin, 
  Bookmark, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  UserCheck,
  XCircle,
  TrendingUp,
  Star,
  FileCheck
} from 'lucide-react';
import { UserProfile, Job, Proposal } from '../types.js';

interface DashboardEmployerProps {
  user: UserProfile;
  onRefreshUser: () => void;
  onNavigate: (view: string) => void;
  onSelectFreelancer: (id: string) => void;
  onOpenPaymentModal: () => void;
}

export default function DashboardEmployer({
  user,
  onRefreshUser,
  onNavigate,
  onSelectFreelancer,
  onOpenPaymentModal
}: DashboardEmployerProps) {
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [savedFreelancersFull, setSavedFreelancersFull] = useState<UserProfile[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFreelancerId, setReviewFreelancerId] = useState('');
  const [reviewFreelancerName, setReviewFreelancerName] = useState('');
  const [reviewJobId, setReviewJobId] = useState('');
  const [ratingComm, setRatingComm] = useState(5);
  const [ratingQual, setRatingQual] = useState(5);
  const [ratingTime, setRatingTime] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('fi_auth_token');
      if (!token) return;

      // 1. Fetch Employer's jobs
      const jobsRes = await fetch('/api/jobs');
      let myJobs: Job[] = [];
      if (jobsRes.ok) {
        const allJobs: Job[] = await jobsRes.json();
        myJobs = allJobs.filter(j => j.employerId === user.id);
        setActiveJobs(myJobs);
      }

      // 2. Fetch Proposals for employer's jobs
      const propRes = await fetch('/api/proposals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (propRes.ok) {
        const props = await propRes.json();
        setProposals(props);
      }

      // 3. Fetch Savved Freelancers structures
      if (user.savedFreelancers && user.savedFreelancers.length > 0) {
        const flRes = await fetch('/api/freelancers');
        if (flRes.ok) {
          const allFls: UserProfile[] = await flRes.json();
          const filtered = allFls.filter(f => user.savedFreelancers?.includes(f.id));
          setSavedFreelancersFull(filtered);
        }
      } else {
        setSavedFreelancersFull([]);
      }

    } catch (err) {
      console.error('Error fetching employer dashboard logs:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Accept / Reject application
  const handleProposalDecision = async (propId: string, decision: 'accepted' | 'declined') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    // Accept or reject proposal on server
    try {
      const token = localStorage.getItem('fi_auth_token');
      const propToUpdate = proposals.find(p => p.id === propId);
      if (!propToUpdate) return;

      const r = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          // Normally database updates proposals status, but since we have a mock DB we can provide direct update helper, let's trigger it.
        })
      });

      // Instead of manual updates, we can let our server endpoints handle connection creation. Let's make connections
      if (decision === 'accepted') {
        // Automatically connect freelancer and client!
        const connRes = await fetch('/api/connections/connect', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            targetUserId: propToUpdate.freelancerId,
            jobId: propToUpdate.jobId
          })
        });

        const connData = await connRes.json();
        if (connRes.ok) {
          // Change status client-side or trigger re-read
          setSuccessMsg(`Candidate approved! Connection established and direct DMs opened.`);
          onRefreshUser();
        } else {
          setErrorMsg(connData.message || "Failed to accept candidate. Do you have 5 connects credits?");
        }
      } else {
        setSuccessMsg("Proposal closed.");
      }
      
      // Reload states
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Open Ratings Popup 
  const triggerReviewPrompt = (freelancerId: string, name: string, jobId: string) => {
    setReviewFreelancerId(freelancerId);
    setReviewFreelancerName(name);
    setReviewJobId(jobId);
    setShowReviewModal(true);
  };

  // Submit Ratings
  const submitTalentReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/reviews/rate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          freelancerId: reviewFreelancerId,
          jobId: reviewJobId,
          ratingComm: ratingComm,
          ratingQual: ratingQual,
          ratingTime: ratingTime,
          feedback: reviewFeedback
        })
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to post review standard.");

      setSuccessMsg(`Rating submitted successfully for ${reviewFreelancerName}!`);
      setShowReviewModal(false);
      setReviewFeedback('');
      onRefreshUser();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Messaging alerts */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-2xl flex justify-between items-center text-xs animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold cursor-pointer hover:text-emerald-900">✕</button>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-250 text-rose-800 p-3.5 rounded-2xl flex justify-between items-center text-xs animate-shake">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold cursor-pointer hover:text-rose-900">✕</button>
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">Employer Board | {user.companyName}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Acquire elite Indian marketing professionals and manage active target campaigns.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => onNavigate('post-job')}
            className="w-1/2 sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Brief</span>
          </button>
          <button 
            onClick={() => onNavigate('browse-freelancers')}
            className="w-1/2 sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3.5 rounded-xl transition-all active:scale-95"
          >
            Search Talent
          </button>
        </div>
      </div>

      {/* Row 1: Employer Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Connect Credits Panel */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect Balance</span>
              <Coins className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold font-display">{user.connects}</p>
            <p className="text-[10px] text-slate-400 mt-2">Deduct 5 per connection lock</p>
          </div>
          <button 
            onClick={onOpenPaymentModal}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded-xl mt-4 uppercase transition-colors"
          >
            Buy Credits
          </button>
        </div>

        {/* Active job counts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Job Briefs</span>
            <FolderGit2 className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">{activeJobs.length}</p>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">Bids open for responses</div>
        </div>

        {/* Dynamic Candidates proposals logs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Applicants</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">{proposals.length}</p>
          <div className="text-[10px] text-slate-400 mt-2">Check bid sheets below</div>
        </div>

        {/* Open Channels */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DMs Live</span>
            <MessageSquare className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">2</p>
          <button 
            onClick={() => onNavigate('chat')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors block text-left"
          >
            Launch Chat Inbox →
          </button>
        </div>

        {/* Bookmarks count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saved Profiles</span>
            <Bookmark className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-bold font-display text-slate-900">{user.savedFreelancers?.length || 0}</p>
          <div className="text-[10px] text-slate-400 mt-2">Vetted shortlists</div>
        </div>

      </div>

      {/* Row 2: Candidates proposals feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Applicants Grid Sheet */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-bold text-lg text-slate-950 flex items-center">
              <FileCheck className="w-5 h-5 text-blue-600 mr-2" /> Marketing Job Proposals Received
            </h2>
            <span className="text-[10px] text-slate-400 font-mono italic">Awaiting assessment</span>
          </div>

          {loadingProposals ? (
            <div className="py-20 text-center text-xs text-slate-500">Retrieving application folders...</div>
          ) : proposals.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl">
              <Users className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-800 font-bold text-sm">No new marketing proposals yet</p>
              <p className="text-slate-500 text-xs mt-1">Once freelancers apply, their pitch letters will manifest here.</p>
              <button
                onClick={() => onNavigate('post-job')}
                className="mt-4 text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl"
              >
                Post another Job
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {proposals.map(prop => (
                <div key={prop.id} className="border border-slate-150 rounded-2xl p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                      <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        For Listing: {prop.jobTitle}
                      </span>
                      <h3 
                        onClick={() => onSelectFreelancer(prop.freelancerId)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-sm sm:text-base mt-2 flex items-center space-x-1"
                      >
                        <span>{prop.freelancerName}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </h3>
                      {prop.freelancerHeadline && (
                        <p className="text-[11px] text-slate-600 italic font-medium">{prop.freelancerHeadline}</p>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Estimated Bid</p>
                      <p className="text-base font-extrabold text-blue-600">₹{prop.bidAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cover Pitch Letter:</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-light">{prop.coverLetter}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Submitted {new Date(prop.submittedAt).toLocaleDateString()}</span>
                    
                    <div className="flex gap-2">
                      {prop.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleProposalDecision(prop.id, 'declined')}
                            className="px-3.5 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            Declined
                          </button>
                          <button
                            onClick={() => handleProposalDecision(prop.id, 'accepted')}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold py-2 px-4 transition-all flex items-center space-x-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Connect & Approve (-5)</span>
                          </button>
                        </>
                      ) : prop.status === 'accepted' ? (
                        <div className="flex gap-2 items-center">
                          <button 
                            onClick={() => triggerReviewPrompt(prop.freelancerId, prop.freelancerName, prop.jobId)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold py-1.5 px-3 rounded-xl transition-colors flex items-center"
                          >
                            <Star className="w-3 h-3 text-amber-605 fill-amber-500 mr-1" />
                            Rate Partner
                          </button>
                          <button
                            onClick={() => onNavigate('chat')}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold py-1.5 px-3.5 transition-colors"
                          >
                            Chat Inbox
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Declined</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Shortlisted Marketing Bookmarks */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm">
            <h2 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center">
              <Bookmark className="w-4 h-4 text-rose-500 mr-1.5" /> Shortlisted Marketers
            </h2>

            {savedFreelancersFull.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-800 font-bold text-xs">Vetted pipeline details</p>
                <p className="text-[10px] text-slate-500 mt-1">Shortlist candidates from browse directory to compare profiles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedFreelancersFull.map(f => (
                  <div 
                    key={f.id} 
                    onClick={() => onSelectFreelancer(f.id)}
                    className="border border-slate-100 p-4 rounded-2xl hover:border-slate-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                        {f.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{f.name}</h4>
                        <p className="text-[10px] text-slate-500">{f.city}, {f.state}</p>
                      </div>
                    </div>

                    <h5 className="font-semibold text-slate-700 text-[11px] mt-2.5 truncate">{f.headline}</h5>
                    
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {f.skills?.slice(0, 2).map((s, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RATINGS / REVIEW SUBMIT DIALOG MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 max-w-md w-full relative">
            <h3 className="font-display font-bold text-lg text-slate-950 mb-1">Leave Feedback on Contractor</h3>
            <p className="text-xs text-slate-500 mb-6">Rate performance standards for {reviewFreelancerName} across key vectors.</p>

            <form onSubmit={submitTalentReview} className="space-y-5">
              
              {/* Communication Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                  <span>1. Communication Coordinates</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{ratingComm} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingComm}
                  onChange={(e) => setRatingComm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Quality standard Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                  <span>2. Deliverables Quality</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{ratingQual} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingQual}
                  onChange={(e) => setRatingQual(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Delivery Speed Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                  <span>3. Timeliness & Deadlines</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{ratingTime} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingTime}
                  onChange={(e) => setRatingTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Feedback text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Performance Notes</label>
                <textarea
                  required
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="e.g. Completed summer collection Meta Campaign with 3.2x ROAS. Extreme reliability and helpful campaign suggestions!"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs"
                >
                  Submit Review Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
