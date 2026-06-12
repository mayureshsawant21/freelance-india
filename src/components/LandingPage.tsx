/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  MapPin, 
  Star, 
  Briefcase, 
  Users, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Zap,
  Award,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { UserProfile, Job } from '../types.js';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  onSelectFreelancer: (id: string) => void;
  onSelectJob: (id: string) => void;
}

export default function LandingPage({
  onNavigate,
  user,
  onSelectFreelancer,
  onSelectJob
}: LandingPageProps) {
  const [featuredFreelancers, setFeaturedFreelancers] = useState<UserProfile[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch seed data to showcase
    const fetchData = async () => {
      try {
        const [flRes, jobRes] = await Promise.all([
          fetch('/api/freelancers'),
          fetch('/api/jobs')
        ]);
        if (flRes.ok) {
          const fls = await flRes.json();
          setFeaturedFreelancers(fls.slice(0, 3));
        }
        if (jobRes.ok) {
          const jbs = await jobRes.json();
          setFeaturedJobs(jbs.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-[#EEF2FF] border border-[#DBEAFE] rounded px-3.5 py-1.5 text-xs text-[#2563EB] font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-sans uppercase tracking-wider">India's First Marketer-Only Hub</span>
          </div>

          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight uppercase">
            India's Dedicated Freelance Marketplace for <span className="text-[#2563EB]">Digital Marketers</span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Connect with top-tier Indian digital marketing talent or find your next high-paying campaign opportunity. Powered by niche skill vetting and a secure connect model.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => {
                if (user && user.role === 'employer') onNavigate('browse-freelancers');
                else if (user && user.role === 'freelancer') onNavigate('browse-jobs');
                else onNavigate('signup');
              }}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg shadow-blue-100 transition-all transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>{user ? (user.role === 'employer' ? 'Browse Freelancers' : 'Find Opportunities') : 'Hire Marketers'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (user && user.role === 'employer') onNavigate('post-job');
                else if (user && user.role === 'freelancer') onNavigate('browse-jobs');
                else onNavigate('signup');
              }}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-bold px-8 py-4 rounded-lg transition-all transform active:scale-95 flex items-center justify-center shadow-xs"
            >
              <span>{user && user.role === 'freelancer' ? 'Browse All Jobs' : 'Post a Job'}</span>
            </button>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="mt-16 pt-12 border-t border-slate-150 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] font-sans">15+</p>
              <p className="text-slate-500 text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-wider">Marketing Niches</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] font-sans">₹50K+</p>
              <p className="text-slate-500 text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-wider">Avg. Project Value</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] font-sans">100%</p>
              <p className="text-slate-500 text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-wider">Verified Indian Talent</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#2563EB] font-sans">0%</p>
              <p className="text-slate-500 text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-wider">Commission Cut-offs</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY FREELANCE INDIA (BENTO / GRID) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] px-3 py-1 rounded uppercase tracking-widest">
            Key Core Strengths
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-black text-slate-900 mt-4 uppercase">
            Why Freelance India?
          </h2>
          <p className="mt-4 text-slate-500 text-base max-w-xl mx-auto font-medium">
            A premium network custom-built around the unique demands of digital agencies and digital product marketers in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-50/40">
            <div className="w-12 h-12 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">India-Focused Niche</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Tailored expressly for the Indian business climate. Transact locally, wire directly, and work on campaigns aimed at Indian demographics and channels.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-50/40">
            <div className="w-12 h-12 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Profiles</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Every freelancer and employer completes two-step email and mobile cellular SMS verification checks to weed out spam and coordinate genuine inquiries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-50/40">
            <div className="w-12 h-12 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Secure Communication</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Locked contact information and standard built-in text protect your sensitive accounts until connections are established.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-50/40">
            <div className="w-12 h-12 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sleek Connect Credits</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Our 5-credits connection system stops bulk spamming. Quality over quantity ensures employers only get pitches from truly aligned marketers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-50/40">
            <div className="w-12 h-12 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Performance showcases</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Visual project cards make displaying campaign dashboards, creative hooks, search analytics, and case study files effortless for freelancers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-[#2563EB] transition-all hover:shadow-lg hover:shadow-blue-50/40">
            <div className="w-12 h-12 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mb-6">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Transparent Ratings</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Verify partner scores with granular 3-pillar metrics measuring client coordination, project execution speed, and delivery standards.
            </p>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] px-3 py-1 rounded uppercase tracking-wider">
              Systematic Pipelines
            </span>
            <h2 className="font-sans text-3xl font-black text-slate-900 mt-4 uppercase">How It Works</h2>
            <p className="text-slate-500 text-xs mt-2 font-medium">A systematic, clear matchmaker loop tailored to marketing experts.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* For Freelancers Column */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <span className="bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Marketers</span>
                <h3 className="font-sans text-xl font-bold text-slate-900">For Freelancers</h3>
              </div>

              <div className="space-y-6 relative">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">1</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Create Profile</h4>
                    <p className="text-slate-550 text-xs mt-1">Register your roles, primary marketing skills, experience levels, and city locations.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">2</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Showcase Portfolio</h4>
                    <p className="text-slate-500 text-xs mt-1">Upload verified screenshots of active ROAS, click counts, keywords rank stats, or links.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">3</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Browse Opportunities</h4>
                    <p className="text-slate-550 text-xs mt-1">Filter active campaigns by performance budgets, location parameters, and required deliverables.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">4</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Connect with Clients</h4>
                    <p className="text-slate-550 text-xs mt-1">Deduct 5 connects to lock an active proposal and unlock real-time communication bridges.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">5</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Get Hired</h4>
                    <p className="text-slate-550 text-xs mt-1">Coordinate terms, write high-converting copy, hit benchmarks, and secure top ratings.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Employers Column */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <span className="bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Clients</span>
                <h3 className="font-sans text-xl font-bold text-slate-900">For Employers</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">1</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Create Account</h4>
                    <p className="text-slate-500 text-xs mt-1">Sign up with your agency, business, startup, or brand details to get 100 free connection credits.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">2</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Post a Job</h4>
                    <p className="text-slate-500 text-xs mt-1">State required milestones, budgets, remote coordinates, and necessary digital marketing skills.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">3</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Browse Freelancers</h4>
                    <p className="text-slate-550 text-xs mt-1">Examine vetted marketer profiles, credentials, history ratings, and portfolio case logs.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">4</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Connect</h4>
                    <p className="text-slate-550 text-xs mt-1">Use 5 credits to request connection. Once accepted, mobile coordinates and direct chats are live.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mr-4 mt-0.5 shadow-sm">5</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Hire</h4>
                    <p className="text-slate-550 text-xs mt-1 font-sans">Engage the expert, finish the project deliverables, and rate performance across 3 vectors.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>      {/* 4. FEATURED FREELANCERS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] px-3 py-1 rounded uppercase tracking-wider">
              Niche Directory
            </span>
            <h2 className="font-sans text-3xl font-black text-slate-900 mt-3 uppercase">Featured Marketers</h2>
            <p className="text-slate-550 text-xs mt-1 font-medium">Discover verified experts across performance channels.</p>
          </div>
          <button
            onClick={() => onNavigate('browse-freelancers')}
            className="text-[#2563EB] hover:text-blue-700 font-bold text-xs uppercase tracking-wider flex items-center space-x-1"
          >
            <span>See all freelancers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredFreelancers.map(fl => (
              <div 
                key={fl.id} 
                onClick={() => onSelectFreelancer(fl.id)}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-[#2563EB] transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-blue-50/10"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-black text-lg">
                        {fl.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{fl.name}</h3>
                        <p className="text-[10px] text-slate-500 font-medium flex items-center uppercase mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                          {fl.city}
                        </p>
                      </div>
                    </div>
                    {fl.averageRating ? (
                      <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200/40 rounded px-2.5 py-0.5 text-xs font-bold leading-none">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{fl.averageRating}</span>
                      </div>
                    ) : null}
                  </div>

                  <p className="font-bold text-slate-800 mt-4 text-xs tracking-tight uppercase">{fl.headline}</p>
                  <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">{fl.bio}</p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {fl.skills?.slice(0, 3).map((s, i) => (
                      <span key={i} className="bg-[#EEF2FF] border border-[#DBEAFE]/80 text-[#2563EB] text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">
                        {s}
                      </span>
                    ))}
                    {(fl.skills?.length || 0) > 3 && (
                      <span className="text-slate-400 text-[10px] font-bold align-middle px-1">
                        +{(fl.skills?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-150 flex justify-between items-center text-xs text-slate-500">
                  <span className="font-medium text-[11px] uppercase tracking-wider text-slate-500"><strong>{fl.yearsOfExperience} yrs</strong> experience</span>
                  <span className="text-[#2563EB] font-bold text-[11px] uppercase tracking-wide flex items-center">
                    Review Portfolio <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. FEATURED JOBS */}
      <section className="bg-slate-50 border-y border-slate-200 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] px-3 py-1 rounded uppercase tracking-wider">
                Latest briefs
              </span>
              <h2 className="font-sans text-3xl font-black text-slate-900 mt-3 uppercase">High-Paying Open Jobs</h2>
            </div>
            <button
              onClick={() => onNavigate('browse-jobs')}
              className="text-[#2563EB] hover:text-blue-700 font-bold text-xs uppercase tracking-wider flex items-center space-x-1"
            >
              <span>Browse marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => onSelectJob(job.id)}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-[#2563EB] cursor-pointer transition-all flex flex-col justify-between group hover:shadow-lg hover:shadow-blue-50/10"
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="bg-[#EEF2FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded border border-[#DBEAFE]/80">
                        {job.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {new Date(job.postedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm mt-4 text-slate-900 group-hover:text-[#2563EB] transition-colors">{job.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">by {job.companyName}</p>
                    <p className="text-slate-600 text-xs mt-3 line-clamp-3 leading-relaxed">{job.description}</p>
                  </div>

                  <div className="pt-5 mt-6 border-t border-slate-150 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Budget limit</p>
                      <p className="text-sm font-black text-slate-900 font-mono">
                        ₹{job.budgetMin.toLocaleString()} - ₹{job.budgetMax.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal">/{job.payType === 'hourly' ? 'Hr' : 'Mo'}</span>
                      </p>
                    </div>
                    <span className="bg-slate-100 group-hover:bg-[#2563EB] group-hover:border-[#2563EB] border border-slate-200 group-hover:text-white rounded-lg p-2 transition-all">
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] px-3 py-1 rounded uppercase tracking-wider">
            Client Success
          </span>
          <h2 className="font-sans text-3xl font-black text-slate-900 mt-3 uppercase">What Our Market Says</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">Real feedback from digital agencies and freelancers across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative hover:border-[#2563EB] transition-all">
            <div className="absolute top-6 right-6 text-slate-200 text-4xl font-serif">“</div>
            <div className="flex items-center space-x-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-slate-600 text-xs leading-relaxed italic mb-4">
              "Finding Meta and Google Search consultants who actually understand attribution tracking in India used to be a nightmare. On Freelance India, we hired an expert in 3 days. The 5-credits filter works wonders against bulk spam."
            </p>
            <div className="flex items-center space-x-3 mt-4 border-t border-slate-100 pt-4">
              <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold text-xs uppercase">AM</div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Arjun Mehta</h4>
                <p className="text-[10px] text-slate-500">Co-founder, SparkD2C Agency</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative hover:border-[#2563EB] transition-all">
            <div className="absolute top-6 right-6 text-slate-200 text-4xl font-serif">“</div>
            <div className="flex items-center space-x-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-slate-600 text-xs leading-relaxed italic mb-4">
              "As an SEO specialist, other websites are filled with unrelated data-entry work. Freelance India lists actual SaaS, content, and developer roles geared exclusively toward marketing. Earned over 2.5 Lakhs inside 50 days!"
            </p>
            <div className="flex items-center space-x-3 mt-4 border-t border-slate-100 pt-4">
              <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold text-xs uppercase">NP</div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Neha Patel</h4>
                <p className="text-[10px] text-slate-500">SEO Freelancer, Ahmedabad</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative hover:border-[#2563EB] transition-all">
            <div className="absolute top-6 right-6 text-slate-200 text-4xl font-serif">“</div>
            <div className="flex items-center space-x-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
            </div>
            <p className="text-slate-600 text-xs leading-relaxed italic mb-4">
              "Love the portfolio system! I uploaded screenshots of my design creatives and got three calls directly from ecommerce owners. This niche-focused structure is exactly what active professionals are looking for."
            </p>
            <div className="flex items-center space-x-3 mt-4 border-t border-slate-100 pt-4">
              <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold text-xs uppercase">KS</div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Karan Singh</h4>
                <p className="text-[10px] text-slate-500">Video Content Editor, Noida</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. PRICING & CONNECT SYSTEM */}
      <section className="bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 rounded-lg bg-white border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Quality Safeguard</span>
          <h2 className="font-sans text-3xl font-black text-slate-900 mt-2 uppercase">The Connect Credit Philosophy</h2>
          
          <p className="text-slate-600 text-xs mt-4 leading-relaxed max-w-2xl mx-auto font-medium">
            To sustain spam-free job coordination, we operate a <strong>Connect Credit System</strong>. Bulk automation scripts are blocked. Users must spend <strong>5 credits</strong> to request connection and unlock communication tunnels.
          </p>

          <div className="mt-12 bg-white rounded-xl p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <CheckCircle className="w-5 h-5 text-[#2563EB] mr-2" />
                100 Free Initial Credits
              </h3>
              <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                Immediately receive 100 free connects on sign-up as either a freelancer or a hiring manager. Test the entire portfolio index and chat framework for free.
              </p>
              
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 pl-1">
                <li className="flex items-center">⭐ <strong>5 Credits</strong> per locked Connection</li>
                <li className="flex items-center">⭐ <strong>100 Credits</strong> lets you unlock 20 matches</li>
                <li className="flex items-center">⭐ Direct chat stays unlocked forever once connected</li>
              </ul>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-8 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Running out of connects?</h3>
                <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                  Top-up instantly using our secure Razorpay Payment simulation. Build your traction pipeline with transparent pricing plans starting at ₹999 for 100 connects.
                </p>
              </div>

              <div className="pt-8 w-full">
                <button
                  onClick={() => {
                    if (user) onNavigate('profile-settings'); // or just trigger payment modal
                    else onNavigate('signup');
                  }}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-lg text-xs text-center transition-all shadow-sm uppercase tracking-wider"
                >
                  Join & Get 100 Free Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold mr-2">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <span className="font-sans font-black text-white text-base tracking-tight uppercase">Freelance India</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's absolute dedicated directory for performance marketers, SEO agencies, writers, and growth managers. Built-to-scale digital ecosystems.
            </p>
            <p className="text-[10px] text-slate-500 mt-6 font-mono">
              © 2026 Freelance India Inc. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider font-sans">Directory</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('browse-jobs')} className="hover:text-white transition-colors">Digital Marketing Jobs</button></li>
              <li><button onClick={() => onNavigate('browse-freelancers')} className="hover:text-white transition-colors">Vetted Freelance Talents</button></li>
              <li><button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Success Case Studies</button></li>
              <li><button onClick={() => onNavigate('signup')} className="hover:text-white transition-colors">Marketers Directory</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider font-sans">Resources</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Connect Fee Structures</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Employer Job Rules</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Anti-Spam Shield</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Razorpay System Checks</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider font-sans">FAQs</h4>
            <div className="space-y-4 text-xs text-slate-400">
              <div>
                <p className="text-slate-300 font-bold">How do connect credits work?</p>
                <p className="mt-1">Spending 5 connects requests dialogue. Free connects recover upon selected packages.</p>
              </div>
              <div>
                <p className="text-slate-300 font-bold">Is my email/mobile private?</p>
                <p className="mt-1">Yes, contact info remains locked until you spend connects and clear authorization.</p>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
