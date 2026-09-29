import React from 'react';
import type { SectionId } from '../../types';
import { festivalConfig } from '../../data/festivalData';
import { MapPin, Phone, Mail, Globe, Share2, MessageSquare, ShieldCheck, Ticket, ArrowUp } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: SectionId) => void;
  onOpenRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenRegister }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-30 w-full bg-[#050508] border-t border-white/10 text-slate-400 pt-16 pb-12 overflow-hidden">
      {/* Background Accent Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-orange-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & College */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-black/60 p-0.5">
                <img
                  src={festivalConfig.collegeLogoAsset}
                  alt="RVR & JC College Logo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h4 className="text-xl font-black text-white tracking-wider font-['Outfit']">
                  COLORIDO 2K26
                </h4>
                <p className="text-xs text-purple-300 font-semibold">
                  {festivalConfig.collegeName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {festivalConfig.tagline}
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ALL EVENTS FREE TO REGISTER</span>
              </span>
            </div>
          </div>

          {/* Column 2: Navigation & Quick Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              FESTIVAL SECTIONS
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Homepage & Campus View
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cultural')}
                  className="hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Cultural Events (RVRJC OAT 3D)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sports')}
                  className="hover:text-orange-300 transition-colors cursor-pointer"
                >
                  Sports Arena (Boys & Girls Events)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenRegister}
                  className="flex items-center space-x-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Register for Events (Google Forms)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: College Location */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              COLLEGE VENUE & LOCATION
            </h5>
            <div className="flex items-start space-x-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300">{festivalConfig.collegeName}</p>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  Chandramoulipuram, Chowdavaram, Guntur, Andhra Pradesh 522019
                </p>
                <p className="mt-2 text-[11px] text-purple-300/80 font-mono">
                  {festivalConfig.address}
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Social Placeholders */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              OFFICIAL CONTACT & UPDATES
            </h5>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono text-[11px]">{festivalConfig.contactDetails}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono text-[11px]">[CONTACT NUMBERS TO BE ADDED]</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
                Official Channels
              </p>
              <div className="flex items-center space-x-3 text-slate-400">
                <span className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-colors cursor-pointer" title={festivalConfig.socialLinks.instagram}>
                  <Share2 className="w-4 h-4" />
                </span>
                <span className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-colors cursor-pointer" title={festivalConfig.socialLinks.youtube}>
                  <Globe className="w-4 h-4" />
                </span>
                <span className="p-2 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-colors cursor-pointer" title={festivalConfig.socialLinks.facebook}>
                  <MessageSquare className="w-4 h-4" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400/80 mt-1.5 font-mono">
                {festivalConfig.socialLinks.instagram}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} COLORIDO 2K26 • {festivalConfig.collegeName}. All rights reserved.
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-400">
              Cultural & Sports Prototype
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
