/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  User, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  TrendingUp, 
  Coins, 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Unlock 
} from 'lucide-react';
import { UserProfile, UserNotification } from '../types.js';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
  notifications: UserNotification[];
  onMarkNotificationRead: (id: string) => void;
  onOpenPaymentModal: () => void;
}

export default function Navbar({
  user,
  onLogout,
  onNavigate,
  currentView,
  notifications,
  onMarkNotificationRead,
  onOpenPaymentModal
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('landing')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] mr-3">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-sans font-black text-xl tracking-tight text-[#2563EB] uppercase">
                Freelance India
              </span>
              <span className="block text-[9px] text-[#2563EB] font-bold tracking-widest uppercase leading-none">
                Niche Exclusivity
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {user ? (
              <>
                {user.role === 'freelancer' && (
                  <>
                    <button
                      onClick={() => handleNav('freelancer-dashboard')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentView === 'freelancer-dashboard' 
                          ? 'bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE]/80' 
                          : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('browse-jobs')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentView === 'browse-jobs' 
                          ? 'bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE]/80' 
                          : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                      }`}
                    >
                      Find Jobs
                    </button>
                  </>
                )}

                {user.role === 'employer' && (
                  <>
                    <button
                      onClick={() => handleNav('employer-dashboard')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentView === 'employer-dashboard' 
                          ? 'bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE]/80' 
                          : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                      }`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('browse-freelancers')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentView === 'browse-freelancers' 
                          ? 'bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE]/80' 
                          : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                      }`}
                    >
                      Browse Talent
                    </button>
                    <button
                      onClick={() => handleNav('post-job')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        currentView === 'post-job' 
                          ? 'bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE]/80' 
                          : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                      }`}
                    >
                      Post a Job
                    </button>
                  </>
                )}

                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin-dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1 ${
                      currentView === 'admin-dashboard' 
                        ? 'bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE]/80' 
                        : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={() => handleNav('chat')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                    currentView === 'chat' 
                      ? 'bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE]/80' 
                      : 'text-slate-600 hover:bg-slate-55 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>DMs</span>
                </button>
                
                {/* Visual Connector Credits Badge with purchasing portal */}
                <div className="flex items-center gap-2 bg-[#EEF2FF] px-3 py-1.5 rounded-full border border-[#DBEAFE] ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                  <span className="text-xs font-bold text-[#2563EB] tracking-wide uppercase">{user.connects} CONNECTS</span>
                  <button 
                    onClick={onOpenPaymentModal}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-full text-[10px] uppercase font-bold py-0.5 px-2.5 transition-colors leading-normal active:scale-95"
                    id="nav-buy-credits"
                  >
                    + Buy
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('browse-jobs')}
                  className="text-slate-600 hover:text-[#2563EB] px-3 py-2 text-sm font-semibold transition-colors"
                >
                  Find Campaigns
                </button>
                <button
                  onClick={() => handleNav('browse-freelancers')}
                  className="text-slate-600 hover:text-[#2563EB] px-3 py-2 text-sm font-semibold transition-colors"
                >
                  Browse Talent
                </button>
              </>
            )}
          </div>

          {/* User actions Tray & Notifications Panel */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                
                {/* Verified user Badge icon */}
                {(user.isEmailVerified && user.isMobileVerified) && (
                  <div className="flex items-center text-[10px] text-[#2563EB] bg-[#EEF2FF] border border-[#DBEAFE] rounded-full px-2.5 py-1 font-bold uppercase" title="Both email and SMS verified">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> VERIFIED
                  </div>
                )}

                {/* Notifications Bell Tray */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifDropdown(!showNotifDropdown);
                      setShowUserDropdown(false);
                    }}
                    className="p-1.5 text-slate-550 hover:text-[#2563EB] hover:bg-slate-105 rounded-full relative transition-colors focus:outline-none"
                    id="bell-notif-btn"
                  >
                    <Bell className="w-5 h-5 text-slate-600 hover:text-[#2563EB]" />
                    {unreadNotifs.length > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-[#2563EB] rounded-full text-[8px] font-bold flex items-center justify-center text-white ring-2 ring-white">
                        {unreadNotifs.length}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-xl bg-white border border-slate-200 ring-1 ring-black/5 focus:outline-none overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-900">System Notifications</span>
                        <span className="text-[10px] text-[#2563EB] font-bold">{unreadNotifs.length} unread</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs">
                            No notifications to display
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={`p-3 text-xs transition-colors hover:bg-slate-50 ${notif.read ? 'text-slate-550 bg-white' : 'text-slate-900 bg-blue-50/20'}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold ${!notif.read ? 'text-[#2563EB]' : 'text-slate-700'}`}>{notif.title}</span>
                                {!notif.read && (
                                  <button
                                    onClick={() => onMarkNotificationRead(notif.id)}
                                    className="text-[10px] text-[#2563EB] hover:text-blue-700 font-bold whitespace-nowrap pl-2"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] leading-relaxed text-slate-550">{notif.message}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile User Dropdown menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserDropdown(!showUserDropdown);
                      setShowNotifDropdown(false);
                    }}
                    className="flex text-sm items-center space-x-2 p-1 hover:bg-slate-55 rounded-lg transition-colors focus:outline-none"
                    id="profile-dropdown-btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EEF2FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-black">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-slate-700 text-xs font-bold hidden lg:inline max-w-[120px] truncate">{user.name}</span>
                  </button>

                  {showUserDropdown && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white border border-slate-200 ring-1 ring-black/5 focus:outline-none overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Signed in as</p>
                        <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-[#EEF2FF] text-[#2563EB] border border-[#DBEAFE] text-center">
                          {user.role}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleNav(user.role === 'freelancer' ? 'freelancer-dashboard' : 'employer-dashboard')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] transition-colors"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => handleNav('profile-settings')}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#2563EB] transition-colors"
                      >
                        Edit Public Profile
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold flex items-center space-x-1.5 border-t border-slate-100"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleNav('login')}
                  className="text-slate-600 hover:text-[#2563EB] hover:bg-slate-50 px-3.5 py-2 rounded-lg text-sm font-bold transition-all"
                  id="btn-nav-login"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
                  id="btn-nav-signup"
                >
                  Join Marketplace
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 focus:outline-none"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-2 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              <div className="px-3 py-3 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-blue-50 text-[#2563EB] border border-blue-100">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center bg-[#EEF2FF] border border-[#DBEAFE] rounded-full py-1 px-3">
                  <Coins className="w-3.5 h-3.5 text-[#2563EB] mr-1" />
                  <span className="text-xs font-bold text-[#2563EB] mr-1.5">{user.connects}</span>
                  <button 
                    onClick={onOpenPaymentModal}
                    className="text-[10px] text-[#2563EB] font-bold uppercase pl-1.5 border-l border-blue-100"
                  >
                    + Buy
                  </button>
                </div>
              </div>

              {user.role === 'freelancer' && (
                <>
                  <button
                    onClick={() => handleNav('freelancer-dashboard')}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('browse-jobs')}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                  >
                    Find Jobs
                  </button>
                </>
              )}

              {user.role === 'employer' && (
                <>
                  <button
                    onClick={() => handleNav('employer-dashboard')}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('browse-freelancers')}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                  >
                    Browse Freelancers
                  </button>
                  <button
                    onClick={() => handleNav('post-job')}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                  >
                    Post a Job
                  </button>
                </>
              )}

              {user.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
                >
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => handleNav('chat')}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
              >
                Chat Messages
              </button>
              <button
                onClick={() => handleNav('profile-settings')}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-[#0F172A] hover:bg-slate-50 hover:text-[#2563EB]"
              >
                Edit Profile
              </button>
              <button
                onClick={onLogout}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('browse-jobs')}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#2563EB]"
              >
                Find Jobs
              </button>
              <button
                onClick={() => handleNav('browse-freelancers')}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#2563EB]"
              >
                Browse Freelancers
              </button>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleNav('login')}
                  className="text-center block px-3 py-2.5 rounded-lg text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="text-center block px-3 py-2.5 rounded-lg text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-750"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
