/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Globe, Bell, Menu, X, LogOut, Shield, Heart, Users } from 'lucide-react';
import { auth } from '../lib/firebase';
import { Language } from '../types';
import { translations } from '../lib/translations';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAuth: () => void;
  user: any;
  isAdmin: boolean;
  onShowFavorites: () => void;
  onShowAdminDashboard: () => void;
  onGoHome: () => void;
  favoritesCount: number;
  unresolvedAlerts: string[];
  onClearAlerts: () => void;
  onShowOthersPosts: () => void;
  currentView: string;
}

export default function Header({
  currentLang,
  onLanguageChange,
  onOpenAuth,
  user,
  isAdmin,
  onShowFavorites,
  onShowAdminDashboard,
  onGoHome,
  favoritesCount,
  unresolvedAlerts,
  onClearAlerts,
  onShowOthersPosts,
  currentView
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);

  const t = translations[currentLang];

  function handleLogout() {
    localStorage.removeItem('petfinder_georgia_bypass_user');
    auth.signOut();
    setMobileMenuOpen(false);
    window.location.reload();
  }

  return (
    <header 
      id="app-header" 
      className="sticky top-0 z-40 bg-[#FFFBF7]/90 backdrop-blur-md border-b-4 border-[#F0E6D2] shadow-sm px-4 lg:px-8 py-3.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Slogan */}
        <button 
          id="brand-logo-button" 
          onClick={() => { onGoHome(); setMobileMenuOpen(false); }}
          className="flex items-center gap-2.5 text-left group outline-none"
        >
          <span className="text-3xl sm:text-4xl animate-bounce duration-1000">🐾</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] font-sans tracking-tight leading-none group-hover:text-[#FF8E3C] transition-colors flex items-center gap-1.5">
              {t.brandName}
              <span className="text-[10px] bg-emerald-50 text-[#2CB67D] font-black border border-[#2CB67D]/20 px-1.5 py-0.5 rounded-full uppercase">
                GE
              </span>
            </h1>
            <p className="hidden sm:block text-[10px] text-zinc-500 font-bold mt-0.5 tracking-wide uppercase">
              {t.tagline}
            </p>
          </div>
        </button>

        {/* Desktop Interface controls */}
        <div className="hidden lg:flex items-center gap-4 text-sm font-black">
          
          {/* Others' Lost Pets Button */}
          <button
            id="toggle-others-posts"
            onClick={onShowOthersPosts}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 transition-all cursor-pointer select-none
              ${currentView === 'others_posts'
                ? 'border-[#FF8E3C] bg-orange-50 text-[#FF8E3C]'
                : 'border-[#FFE8D6] bg-[#FFFBF7] text-zinc-700 hover:border-[#FF8E3C] hover:text-[#FF8E3C]'}`}
          >
            <Users className="w-4.5 h-4.5 stroke-[3]" />
            <span>{currentLang === 'en' ? "Others' Lost Pets" : "სხვების დაკარგული"}</span>
          </button>

          {/* Favorites List Filter Toggle */}
          <button
            id="toggle-favorites-list"
            onClick={onShowFavorites}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFFBF7] text-zinc-700 hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all relative"
          >
            <Heart className={`w-4.5 h-4.5 stroke-[3] ${favoritesCount > 0 ? 'fill-[#FF6B6B] text-[#FF6B6B]' : ''}`} />
            <span>{t.favoritesOnly}</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B6B] text-white text-[10px] font-black px-1.5 rounded-full border border-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Admin panel control */}
          {isAdmin && (
            <button
              id="admin-dashboard-toggle"
              onClick={onShowAdminDashboard}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all uppercase tracking-wider text-xs"
            >
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>{t.adminDashboard}</span>
            </button>
          )}

          {/* Dynamic alerts center */}
          <div className="relative">
            <button
              id="alerts-dropdown-button"
              onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
              className="relative p-2 rounded-2xl border-2 border-[#FFE8D6] text-zinc-600 hover:border-[#FF8E3C] hover:text-[#FF8E3C] transition-all"
            >
              <Bell className="w-4.5 h-4.5 stroke-[3]" />
              {unresolvedAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-ping" />
              )}
            </button>

            {alertsDropdownOpen && (
              <div 
                id="alerts-dropdown-menu" 
                className="absolute right-0 mt-3 w-80 rounded-3xl bg-white border-2 border-[#F0E6D2] p-4 shadow-xl z-50 text-left"
              >
                <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-2 mb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF8E3C]">
                    {t.notificationTitle}
                  </h4>
                  {unresolvedAlerts.length > 0 && (
                    <button
                      id="clear-all-alerts"
                      onClick={() => { onClearAlerts(); setAlertsDropdownOpen(false); }}
                      className="text-[10px] text-zinc-400 hover:text-[#FF6B6B] font-bold"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {unresolvedAlerts.length === 0 ? (
                  <p className="text-xs font-medium text-zinc-500 py-4 text-center">
                    {currentLang === 'en' ? "No recent alerts or reports." : "შეტყობინებები არ არის."}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {unresolvedAlerts.map((alert, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#FFFBF7] border border-[#FFE8D6] text-xs font-bold text-zinc-700">
                        {alert}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Controller */}
          <button
            id="change-locale-toggle"
            onClick={() => onLanguageChange(currentLang === 'en' ? 'ka' : 'en')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border-2 border-[#FFE8D6] bg-white text-zinc-700 hover:border-[#FF8E3C] transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#FF8E3C]" />
            <span className="font-sans font-black">{currentLang === 'en' ? "KA" : "EN"}</span>
          </button>

          {/* Authorization actions */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l-2 border-[#FFE8D6]">
              <div className="text-right">
                <div className="text-xs font-black text-zinc-900 leading-none">
                  {user.displayName || t.guestUser}
                </div>
                {isAdmin && (
                  <span className="inline-block text-[8px] font-black text-rose-500 tracking-wider">
                    {t.adminBadge}
                  </span>
                )}
              </div>
              <button
                id="btn-logout-desktop"
                onClick={handleLogout}
                className="p-2 rounded-2xl border-2 border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 transition-all"
                title={t.logoutButton}
              >
                <LogOut className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              id="btn-login-desktop"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#FF8E3C] hover:opacity-95 text-white shadow-[0_4px_0_rgba(255,142,60,0.2)] active:translate-y-[2px] transition-all"
            >
              <User className="w-4 h-4" />
              <span>{t.loginTitle}</span>
            </button>
          )}

        </div>

        {/* Mobile controls bar */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Quick Locale switch */}
          <button
            id="change-locale-mob-toggle"
            onClick={() => onLanguageChange(currentLang === 'en' ? 'ka' : 'en')}
            className="p-2 rounded-xl bg-[#FFF9F2] text-[#FF8E3C] font-black text-xs border border-[#FFE8D6]"
          >
            {currentLang === 'en' ? "KA" : "EN"}
          </button>

          {/* Favorites filter view icon */}
          <button
            id="view-favorites-mob"
            onClick={onShowFavorites}
            className="relative p-2 rounded-xl bg-white border border-[#FFE8D6] text-[#FF6B6B]"
          >
            <Heart className="w-4.5 h-4.5 fill-[#FF6B6B] stroke-[3]" />
          </button>

          {/* Hamburger button */}
          <button
            id="mobile-hamburger-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#FFFBF7] border-2 border-[#F0E6D2] text-zinc-700 hover:bg-[#FFF9F2]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
          </button>
        </div>

      </div>

      {/* Mobile Slideout Panel */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation-overlay" 
          className="lg:hidden absolute top-full left-0 right-0 bg-[#FFFBF7] border-b-4 border-[#F0E6D2] p-4 shadow-xl z-50 text-left font-black flex flex-col gap-3"
        >
          {isAdmin && (
            <button
               id="admin-dashboard-toggle-mob"
               onClick={() => { onShowAdminDashboard(); setMobileMenuOpen(false); }}
               className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 text-emerald-800 border-2 border-emerald-200"
            >
              <Shield className="w-4.5 h-4.5 text-emerald-700" />
              <span>{t.adminDashboard}</span>
            </button>
          )}

          {/* Others' Lost Pets Mobile Trigger */}
          <button
            id="toggle-others-posts-mob"
            onClick={() => { onShowOthersPosts(); setMobileMenuOpen(false); }}
            className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all 
              ${currentView === 'others_posts'
                ? 'border-[#FF8E3C] bg-orange-50 text-[#FF8E3C]'
                : 'border-[#FFE8D6] bg-white text-zinc-750'}`}
          >
            <Users className="w-4.5 h-4.5 text-[#FF8E3C] stroke-[3]" />
            <span>{currentLang === 'en' ? "Others' Lost Pets" : "სხვების დაკარგული"}</span>
          </button>

          {user ? (
            <div className="p-3 bg-zinc-50 border-2 border-zinc-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-bold">{t.profileTitle}</p>
                <h5 className="text-sm font-black text-zinc-900">{user.displayName || t.guestUser}</h5>
              </div>
              <button
                id="btn-logout-mob"
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-zinc-200 text-xs font-bold text-zinc-600"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.logoutButton}</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-login-mob"
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-[#FF8E3C] text-white text-base leading-none shadow-[0_4px_0_rgba(255,142,60,0.2)]"
            >
              <User className="w-4.5 h-4.5" />
              <span>{t.loginTitle}</span>
            </button>
          )}
        </div>
      )}

    </header>
  );
}
