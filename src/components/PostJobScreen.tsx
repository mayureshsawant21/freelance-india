/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  Sparkles, 
  ArrowLeft, 
  ChevronRight, 
  AlertCircle, 
  Coins, 
  MapPin, 
  FileCheck 
} from 'lucide-react';
import { UserProfile } from '../types.js';

interface PostJobScreenProps {
  user: UserProfile;
  onRefreshUser: () => void;
  onNavigate: (view: string) => void;
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

export default function PostJobScreen({
  user,
  onRefreshUser,
  onNavigate
}: PostJobScreenProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(PRIMARY_SKILLS_LIST[0]);
  const [description, setDescription] = useState('');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [payType, setPayType] = useState<'hourly' | 'monthly'>('monthly');
  const [hoursPerDay, setHoursPerDay] = useState('4');
  const [daysPerWeek, setDaysPerWeek] = useState('5');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [locationType, setLocationType] = useState<'remote' | 'hybrid' | 'on-site'>('remote');
  const [duration, setDuration] = useState('3 Months');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!title || !description || !budgetMin || !budgetMax) {
      setErrorMsg("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    if (Number(budgetMin) > Number(budgetMax)) {
      setErrorMsg("Minimum budget cannot exceed maximum estimate budget.");
      setLoading(false);
      return;
    }

    const skillsArray = requiredSkillsStr 
      ? requiredSkillsStr.split(',').map(s => s.trim()).filter(Boolean)
      : [category];

    const payload = {
      title,
      category,
      description,
      requiredSkills: skillsArray,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      payType,
      hoursPerDay: Number(hoursPerDay),
      daysPerWeek: Number(daysPerWeek),
      experienceLevel,
      locationType,
      duration
    };

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/jobs/post', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await r.json();
      if (!r.ok) {
        throw new Error(data.message || "Failed to post job brief.");
      }

      setSuccessMsg("Success! Your job brief is now live and browseable.");
      onRefreshUser();
      
      // Auto redirect to Employer Dashboard
      setTimeout(() => onNavigate('employer-dashboard'), 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      <button
        onClick={() => onNavigate('employer-dashboard')}
        className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 mb-8 font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Employer Dashboard</span>
      </button>

      {/* Title block */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-950 flex items-center">
          <FileCheck className="w-7 h-7 text-blue-600 mr-2" /> List a New Digital Marketing Job Brief
        </h1>
        <p className="text-xs text-slate-500 mt-1">Specify outlines, budgets, location boundaries, and required milestone standards.</p>
      </div>

      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs animate-fade-in">
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs animate-shake flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main post-job form card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-10 shadow-sm space-y-6">
        
        {/* Job Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Campaign/Job Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Meta Ads Lead for Lifestyle Apparel scaling ROAS to 3x+"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        {/* Categories / Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Primary marketing category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-700 focus:outline-none"
            >
              {PRIMARY_SKILLS_LIST.map((sk, i) => (
                <option key={i} value={sk}>{sk}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Other Skills Needed (Comma separated)</label>
            <input
              type="text"
              value={requiredSkillsStr}
              onChange={(e) => setRequiredSkillsStr(e.target.value)}
              placeholder="e.g. Google Analytics, Landing Pages, Shopify, ROAS"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>
        </div>

        {/* Job Description details */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Brief / Campaign Requirements</label>
          <textarea
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce your startup/agency, clarify what marketing problems you face, target performance CPC levels, key monthly milestones, write out deliverables, and describe how freelancer results should look..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        {/* Budgets range */}
        <div className="border-t border-slate-100 pt-6 space-y-6">
          <p className="font-display font-medium text-slate-900 text-sm flex items-center">
            <Coins className="w-5 h-5 text-yellow-500 mr-2" /> Budget Structure
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Budget Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayType('monthly')}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    payType === 'monthly' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setPayType('hourly')}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    payType === 'hourly' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Hourly
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Min Budget Range (INR)</label>
              <input
                type="number"
                min="100"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Min amount in ₹"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Max Budget Limit (INR)</label>
              <input
                type="number"
                min="200"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Max amount in ₹"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scope Parameters */}
        <div className="border-t border-slate-100 pt-6">
          <p className="font-display font-medium text-slate-900 text-sm mb-4">Project Parameters & Scope coordinates</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Experience Levels */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Required Grade</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-700 focus:outline-none"
              >
                <option value="beginner">Beginner (1-2 yrs)</option>
                <option value="intermediate">Intermediate (3-5 yrs)</option>
                <option value="expert">Expert Senior (5+ yrs)</option>
              </select>
            </div>

            {/* Hours Daily */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Hours Required / day</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-700 focus:outline-none"
              />
            </div>

            {/* Days Weekly */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Days Required / week</label>
              <input
                type="number"
                min="1"
                max="7"
                required
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-700 focus:outline-none"
              />
            </div>

            {/* Project Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Project Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-700 focus:outline-none"
              >
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="Ongoing">Ongoing Retainer</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            
            {/* Setup coordinates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Setup coordinates</label>
              <div className="flex gap-2">
                {[
                  { val: 'remote', lbl: 'Remote' },
                  { val: 'hybrid', lbl: 'Hybrid' },
                  { val: 'on-site', lbl: 'On-site' }
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setLocationType(item.val as any)}
                    className={`w-1/3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                      locationType === item.val ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    {item.lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-center space-x-2 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-[10px] text-blue-800 leading-normal font-light">
                Every posted contract automatically alerts aligned digital marketing search agents, triggering professional proposals within 24 hours.
              </p>
            </div>

          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigate('employer-dashboard')}
            className="w-1/2 py-3 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 shrink-0"
          >
            Cancel Post
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 py-3 bg-blue-600 hover:bg-blue-550 text-white rounded-xl font-bold text-xs"
          >
            {loading ? 'Submitting brief logs to servers...' : 'Post Campaign Brief Live'}
          </button>
        </div>

      </form>

    </div>
  );
}
