import React, { useState } from 'react';
import type { SectionId } from '../../types';
import { festivalConfig } from '../../data/festivalData';
import { Sparkles, Trophy, Ticket, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenRegister,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic visual identity accents
  const getSectionBorder = () => {
    switch (activeSection) {
      case 'cultural':
        return 'border-purple-500/30 bg-[#0c0817]/80 shadow-[0_4px_30px_rgba(168,85,247,0.15)]';
      case 'sports':
        return 'border-orange-500/30 bg-[#120a06]/80 shadow-[0_4px_30px_rgba(249,115,22,0.15)]';
      default:
        return 'border-white/10 bg-[#07070a]/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]';
    }
  };

  const getLogoGlow = () => {
    switch (activeSection) {
      case 'cultural':
        return 'from-fuchsia-400 via-purple-300 to-amber-300';
      case 'sports':
        return 'from-amber-400 via-orange-400 to-cyan-300';
      default:
        return 'from-purple-300 via-pink-300 to-amber-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-500">
      <nav
        aria-label="Main Navigation"
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-xl border-b transition-all duration-500 ${getSectionBorder()}`}
      >
        <div className="flex items-center justify-between">
          {/* Left Brand Identity */}
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="group flex items-center space-x-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg p-1 transition-transform active:scale-95"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-md bg-black/60 flex items-center justify-center group-hover:border-purple-400/60 transition-colors">
              <img
                src={festivalConfig.collegeLogoAsset}
                alt="RVR & JC College Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-transparent pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xl sm:text-2xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r ${getLogoGlow()} font-['Outfit']`}
                >
                  COLORIDO 2K26
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-white/10 text-slate-300 rounded border border-white/10">
                  RVR & JC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium truncate max-w-[200px] sm:max-w-xs">
                Cultural & Sports Festival
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 text-sm font-semibold tracking-wider uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                activeSection === 'home'
                  ? 'text-white bg-white/10 shadow-inner border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              HOME
            </button>

            <button
              onClick={() => onNavigate('cultural')}
              className={`group flex items-center space-x-2 px-4 py-2 text-sm font-semibold tracking-wider uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                activeSection === 'cultural'
                  ? 'text-purple-200 bg-purple-500/20 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'text-slate-300 hover:text-purple-300 hover:bg-purple-950/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span>CULTURAL</span>
            </button>

            <button
              onClick={() => onNavigate('sports')}
              className={`group flex items-center space-x-2 px-4 py-2 text-sm font-semibold tracking-wider uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                activeSection === 'sports'
                  ? 'text-orange-200 bg-orange-500/20 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'text-slate-300 hover:text-orange-300 hover:bg-orange-950/30'
              }`}
            >
              <Trophy className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>SPORTS</span>
            </button>

            {/* Cinematic REGISTER Button */}
            <button
              onClick={onOpenRegister}
              className="group relative ml-2 inline-flex items-center space-x-2 px-5 py-2 text-sm font-bold tracking-wider uppercase rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.35)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Ticket className="w-4 h-4 text-amber-200" />
              <span className="relative z-10">REGISTER</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenRegister}
              className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm"
            >
              REGISTER
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle mobile navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wider uppercase ${
                activeSection === 'home'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>HOME</span>
              <span className="text-xs text-slate-400">Campus & Fest</span>
            </button>
            <button
              onClick={() => {
                onNavigate('cultural');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wider uppercase ${
                activeSection === 'cultural'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>CULTURAL (OAT 3D)</span>
              </div>
              <span className="text-xs text-purple-300">6 Categories</span>
            </button>
            <button
              onClick={() => {
                onNavigate('sports');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wider uppercase ${
                activeSection === 'sports'
                  ? 'bg-orange-600/30 text-orange-200 border border-orange-500/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span>SPORTS ARENA</span>
              </div>
              <span className="text-xs text-orange-300">Boys & Girls</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};
