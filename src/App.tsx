/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.js';
import LandingPage from './components/LandingPage.js';
import AuthScreen from './components/AuthScreen.js';
import DashboardFreelancer from './components/DashboardFreelancer.js';
import DashboardEmployer from './components/DashboardEmployer.js';
import JobMarketplace from './components/JobMarketplace.js';
import TalentMarketplace from './components/TalentMarketplace.js';
import PostJobScreen from './components/PostJobScreen.js';
import ChatSystem from './components/ChatSystem.js';
import AdminPanel from './components/AdminPanel.js';
import { UserProfile, UserNotification } from './types.js';
import { Coins, ShieldCheck, CreditCard, Sparkles, AlertCircle, X, Check } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<string>('landing');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([
    {
      id: "notif-1",
      userId: "",
      title: "Welcome Bonus!",
      message: "You have been credited with 100 Free Connects to start scaling campaigns.",
      type: "credits",
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "notif-2",
      userId: "",
      title: "Portfolio Ready",
      message: "Add case studies inside your dashboard to capture employer interest.",
      type: "system",
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);

  // Razorpay simulated Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'packages' | 'razorpay-frame' | 'success'>('packages');
  const [selectedPack, setSelectedPack] = useState<{ name: string; connects: number; price: number } | null>(null);
  
  // Payment gateway simulation states
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNo, setCardNo] = useState('4321 8765 0987');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Authenticate / refresh user data
  const refreshUser = async () => {
    const token = localStorage.getItem('fi_auth_token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const r = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.ok) {
        const u = await r.json();
        setUser(u);
      } else {
        localStorage.removeItem('fi_auth_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failure:', err);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [activeView]);

  // Handle Logouts
  const handleLogout = () => {
    localStorage.removeItem('fi_auth_token');
    setUser(null);
    setActiveView('landing');
  };

  // Process topup simulated Razorpay API
  const handleProcessRazorpay = async () => {
    if (!selectedPack || !user) return;
    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const token = localStorage.getItem('fi_auth_token');
      const r = await fetch('/api/payments/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packName: selectedPack.name,
          connectsAdded: selectedPack.connects,
          amountPaid: selectedPack.price
        })
      });

      const data = await r.json();
      setProcessingPayment(false);

      if (r.ok) {
        setPaymentStep('success');
        refreshUser();
      } else {
        setPaymentError(data.message || "Failed to process Razorpay checkout transaction.");
      }
    } catch (err: any) {
      setProcessingPayment(false);
      setPaymentError(err.message);
    }
  };

  const handleOpenPaymentModal = () => {
    if (!user) {
      setActiveView('auth');
      return;
    }
    setPaymentStep('packages');
    setSelectedPack(null);
    setShowPaymentModal(true);
  };

  // Nav helper ensuring filters are cleared on swap
  const handleNavigate = (view: string) => {
    setSelectedJobId(null);
    setSelectedTalentId(null);
    setActiveView(view);
  };

  // Handle successful login or registrar flow
  const handleAuthSuccess = (token: string, u: UserProfile) => {
    localStorage.setItem('fi_auth_token', token);
    setUser(u);
    if (u.role === 'freelancer') {
      handleNavigate('freelancer-dashboard');
    } else if (u.role === 'employer') {
      handleNavigate('employer-dashboard');
    } else {
      handleNavigate('landing');
    }
  };

  // Mark alerts as read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return (
          <LandingPage 
            onNavigate={handleNavigate} 
            user={user}
            onSelectFreelancer={(id) => { setSelectedTalentId(id); setActiveView('browse-freelancers'); }}
            onSelectJob={(id) => { setSelectedJobId(id); setActiveView('browse-jobs'); }}
          />
        );
      
      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;
      
      case 'browse-jobs':
        return (
          <JobMarketplace 
            user={user} 
            onRefreshUser={refreshUser} 
            onNavigate={handleNavigate} 
            selectedJobId={selectedJobId} 
            onSelectJob={setSelectedJobId} 
          />
        );
      
      case 'browse-freelancers':
        return (
          <TalentMarketplace 
            user={user} 
            onRefreshUser={refreshUser} 
            onNavigate={handleNavigate} 
            selectedTalentId={selectedTalentId} 
            onSelectTalent={setSelectedTalentId} 
            onOpenPaymentModal={handleOpenPaymentModal}
          />
        );

      case 'freelancer-dashboard':
        return user ? (
          <DashboardFreelancer 
            user={user} 
            onRefreshUser={refreshUser} 
            onNavigate={handleNavigate} 
            onSelectJob={(id) => { setSelectedJobId(id); setActiveView('browse-jobs'); }}
            onOpenPaymentModal={handleOpenPaymentModal}
          />
        ) : <AuthScreen onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;

      case 'employer-dashboard':
        return user ? (
          <DashboardEmployer 
            user={user} 
            onRefreshUser={refreshUser} 
            onNavigate={handleNavigate} 
            onSelectFreelancer={(id) => { setSelectedTalentId(id); setActiveView('browse-freelancers'); }}
            onOpenPaymentModal={handleOpenPaymentModal}
          />
        ) : <AuthScreen onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;

      case 'post-job':
        return user ? (
          <PostJobScreen 
            user={user} 
            onRefreshUser={refreshUser} 
            onNavigate={handleNavigate} 
          />
        ) : <AuthScreen onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;

      case 'chat':
        return user ? (
          <ChatSystem 
            user={user} 
            onRefreshUser={refreshUser} 
          />
        ) : <AuthScreen onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;

      case 'admin':
        return user && user.role === 'admin' ? (
          <AdminPanel 
            user={user} 
            onRefreshUser={refreshUser} 
            onNavigate={handleNavigate} 
          />
        ) : (
          <LandingPage 
            onNavigate={handleNavigate} 
            user={user}
            onSelectFreelancer={(id) => { setSelectedTalentId(id); setActiveView('browse-freelancers'); }}
            onSelectJob={(id) => { setSelectedJobId(id); setActiveView('browse-jobs'); }}
          />
        );

      default:
        return (
          <LandingPage 
            onNavigate={handleNavigate} 
            user={user}
            onSelectFreelancer={(id) => { setSelectedTalentId(id); setActiveView('browse-freelancers'); }}
            onSelectJob={(id) => { setSelectedJobId(id); setActiveView('browse-jobs'); }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      
      {/* Dynamic Header Navbar navigation */}
      <Navbar 
        user={user} 
        currentView={activeView} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenPaymentModal={handleOpenPaymentModal}
      />

      {/* Main Container Workspace */}
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* RAZORPAY SANDBOX CONNECTION CREDITS TOPUP MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
            
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentStep === 'packages' && (
              <div>
                <span className="text-[10px] font-bold text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] px-2.5 py-1 rounded inline-block mb-3 uppercase tracking-wider">
                  Select Refill Package
                </span>
                <h3 className="font-sans font-black text-slate-900 text-xl flex items-center mb-1">
                  <Coins className="w-6 h-6 text-[#2563EB] mr-2" /> Purchase Connect Credits
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Unlock active chat pipelines and direct mobile contacts to seal agreements.</p>

                <div className="space-y-4">
                  {[
                    { name: 'Starter Connect Pack', connects: 50, price: 499, desc: 'Ideal for trial client reviews.' },
                    { name: 'Scale Up Marketing Pack', connects: 120, price: 999, desc: 'Best Seller! For fast-growing freelancers and employers.', popular: true },
                    { name: 'Agency Turbo Pack', connects: 300, price: 1999, desc: 'Maximum savings! Recommended for persistent hirers.' }
                  ].map(pack => (
                    <div 
                      key={pack.name}
                      onClick={() => {
                        setSelectedPack(pack);
                        setPaymentStep('razorpay-frame');
                      }}
                      className={`p-4 border rounded-xl cursor-pointer hover:border-[#2563EB] hover:bg-slate-50/50 transition-all flex justify-between items-center relative ${
                        pack.popular ? 'border-2 border-[#2563EB] bg-[#EEF2FF]/40' : 'border-slate-200'
                      }`}
                    >
                      {pack.popular && (
                        <span className="absolute -top-3 left-4 bg-[#2563EB] text-[8px] uppercase font-bold text-white px-2.5 py-0.5 rounded inline-flex items-center gap-1 leading-none shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" /> Recommended
                        </span>
                      )}
                      
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{pack.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{pack.desc}</p>
                        <p className="text-xs font-bold text-[#2563EB] mt-2 font-mono">+{pack.connects} credits</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-950 font-mono">₹{pack.price}</span>
                        <span className="text-[10px] text-[#2563EB] block font-bold mt-1 uppercase tracking-wider">Get Pack →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paymentStep === 'razorpay-frame' && selectedPack && (
              <div>
                <div className="bg-slate-900 rounded-xl p-4 mb-6 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-blue-400 font-mono tracking-wider">Razorpay Sandbox Gateway</span>
                    <h4 className="font-bold text-xs sm:text-sm mt-0.5">{selectedPack.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Total payable</p>
                    <p className="text-base font-bold text-amber-400 font-mono">₹{selectedPack.price}</p>
                  </div>
                </div>

                {paymentError && (
                  <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center font-semibold">
                    <AlertCircle className="w-5 h-5 mr-1.5 text-rose-500 flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">1. Choose Simulated UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. buyer@okaxis"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#2563EB] bg-slate-50/50 text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">OR 2. Enter Cards Details</span>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value)}
                        placeholder="Card Number"
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-5 border-t border-slate-150">
                    <button
                      onClick={() => setPaymentStep('packages')}
                      className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-55"
                    >
                      Change Package
                    </button>
                    <button
                      onClick={handleProcessRazorpay}
                      disabled={processingPayment}
                      className="w-1/2 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex justify-center items-center space-x-1.5 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{processingPayment ? 'Authorizing Gateway...' : `Pay ₹${selectedPack.price}`}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === 'success' && selectedPack && (
              <div className="text-center py-6 animate-fade-in">
                
                <div className="w-16 h-16 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>

                <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold uppercase py-1 px-3 border border-emerald-200 rounded inline-block mb-3 tracking-wider">
                  Simulated Transaction Confirmed
                </span>

                <h3 className="font-sans font-black text-slate-900 text-xl leading-tight">Razorpay payment completed!</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
                  Your billing account has been accredited with <strong>{selectedPack.connects} Connects</strong> immediately. You can now unlock further marketing pipelines.
                </p>

                <div className="mt-8">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs py-3 px-8 rounded-xl leading-none transition-all active:scale-95 shadow-lg shadow-blue-100"
                  >
                    Done
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
