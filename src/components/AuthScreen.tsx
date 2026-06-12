/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Linkedin, 
  Globe, 
  Building, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types.js';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (token: string, user: UserProfile) => void;
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

const INDUSTRIES_LIST = [
  "Startups",
  "SMEs",
  "Agencies",
  "D2C Brands",
  "E-commerce Companies",
  "Real Estate Companies",
  "Consultants",
  "Individual Business Owners"
];

const METROPOLITANS = [
  { city: "Bangalore", state: "Karnataka" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Gurgaon", state: "Haryana" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Ahmedabad", state: "Gujarat" }
];

export default function AuthScreen({
  initialMode = 'login',
  onAuthSuccess,
  onNavigate
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Who are you? selector state
  const [selectedRole, setSelectedRole] = useState<UserRole>('freelancer');

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');

  // Freelancer Fields
  const [headline, setHeadline] = useState('');
  const [primarySkill, setPrimarySkill] = useState(PRIMARY_SKILLS_LIST[0]);
  const [yearsOfExperience, setYearsOfExperience] = useState('3');
  const [linkedin, setLinkedin] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Employer Fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES_LIST[0]);
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Errors & Messaging
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setCity(cityName);
    const match = METROPOLITANS.find(m => m.city === cityName);
    if (match) {
      setState(match.state);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Basic Validation
    if (!email || !password) {
      setErrorMsg("Email and password fields are required.");
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (!name || !mobile) {
        setErrorMsg("Please complete key details (Name, Contact number).");
        setLoading(false);
        return;
      }
      
      // Phone structure
      if (!/^\+?[\d\s-]{10,14}$/.test(mobile)) {
        setErrorMsg("Please issue a valid mobile number (e.g. +91 98765 43210).");
        setLoading(false);
        return;
      }

      if (selectedRole === 'employer' && !companyName) {
        setErrorMsg("Company name is required for Employer accounts.");
        setLoading(false);
        return;
      }
    }

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { email, password }
      : {
          email,
          password,
          role: selectedRole,
          name,
          mobile,
          city,
          state,
          // Employer
          companyName,
          industry,
          companyWebsite,
          // Freelancer
          headline: headline || `${primarySkill} Consultant`,
          primarySkill,
          yearsOfExperience: Number(yearsOfExperience),
          linkedin,
          portfolioUrl
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed. Please try again.");
      }

      // Successful Auth
      onAuthSuccess(data.token, data.user);
      onNavigate(data.user.role === 'freelancer' ? 'freelancer-dashboard' : 'employer-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google SSO Integration Mock Click
  const handleGoogleSSO = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const simulatedEmail = name 
        ? `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com` 
        : `google.user.${Math.floor(Math.random() * 10000)}@gmail.com`;
      const simulatedName = name || "Google SSO User";

      const r = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: simulatedEmail,
          name: simulatedName,
          role: selectedRole
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Google single sign-in failed");

      onAuthSuccess(data.token, data.user);
      onNavigate(data.user.role === 'freelancer' ? 'freelancer-dashboard' : 'employer-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative z-10">
        
        {/* Toggle Mode Title */}
        <div className="text-center">
          <span className="text-[10px] font-bold text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] px-3 py-1 rounded uppercase tracking-wider">
            Secured Access
          </span>
          <h2 className="font-sans font-black text-2xl text-slate-900 tracking-tight mt-3 uppercase">
            {mode === 'login' ? 'Welcome Back' : 'Join Freelance India'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {mode === 'login' 
              ? 'Enter marketing credentials to access your workspace' 
              : 'Create your elite account and secure 100 Free Connect credits'}
          </p>
        </div>

        {/* Errors Block */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start space-x-3 text-xs text-rose-700 animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Role Selector Mode ("Who are you?") */}
        {mode === 'signup' && (
          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Who are you?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('freelancer')}
                className={`py-3.5 px-4 rounded-lg text-xs font-bold text-center border transition-all flex flex-col items-center justify-center space-y-1.5 uppercase tracking-wide ${
                  selectedRole === 'freelancer' 
                    ? 'border-[#2563EB] bg-[#EEF2FF] text-[#2563EB] shadow-xs' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Freelancer</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('employer')}
                className={`py-3.5 px-4 rounded-lg text-xs font-bold text-center border transition-all flex flex-col items-center justify-center space-y-1.5 uppercase tracking-wide ${
                  selectedRole === 'employer' 
                    ? 'border-[#2563EB] bg-[#EEF2FF] text-[#2563EB] shadow-xs' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Employer</span>
              </button>
            </div>
          </div>
        )}

        {/* Registration Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Mobile phone number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Company specific parameters */}
              {selectedRole === 'employer' && (
                <div className="space-y-4 p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center">
                    <Building className="w-3.5 h-3.5 mr-1" /> Company Information
                  </p>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Bold Wear Cosmetics"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                      >
                        {INDUSTRIES_LIST.map((ind, i) => (
                          <option key={i} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="e.g. https://domain.co"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Freelancer specific parameters */}
              {selectedRole === 'freelancer' && (
                <div className="space-y-4 p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1" /> Professional Details
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
                    <input
                      type="text"
                      required
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Meta Ads Specialist | 3.5x average ROAS"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Skill</label>
                      <select
                        value={primarySkill}
                        onChange={(e) => setPrimarySkill(e.target.value)}
                        className="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                      >
                        {PRIMARY_SKILLS_LIST.map((sk, i) => (
                          <option key={i} value={sk}>{sk}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        required
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center"><Linkedin className="w-3 h-3 text-blue-600 mr-1" /> LinkedIn</label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center"><Globe className="w-3 h-3 text-slate-600 mr-1" /> Portfolio Website</label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://myportfolio.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Location parameters */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1" /> City
                  </label>
                  <select
                    value={city}
                    onChange={handleCityChange}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
                  >
                    {METROPOLITANS.map((met, i) => (
                      <option key={i} value={met.city}>{met.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
                  <input
                    type="text"
                    disabled
                    value={state}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs bg-slate-100 text-slate-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Secret Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
              <span>Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-55 flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Processing Security Keys...' : (mode === 'login' ? 'Confirm Account' : 'Register Profile & Claim 100 Credits')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Divider / Social login options */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[9px] text-slate-400 uppercase font-bold tracking-widest font-sans">Or Sandbox Connected OAuth</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Google SSO click triggers */}
        <button
          type="button"
          onClick={handleGoogleSSO}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer"
          id="btn-google-sso"
        >
          {/* Flat vector Google svg */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-1.01-1.19-2.24-1.19-3.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>One-Click Sign in with Google</span>
        </button>

        {/* Sign in toggle */}
        <div className="text-center pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs text-[#2563EB] hover:text-blue-500 font-bold uppercase tracking-wide"
            id="toggle-auth-mode"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Log In"
            }
          </button>
        </div>

      </div>
    </div>
  );
}
