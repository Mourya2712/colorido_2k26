import React from 'react';
import type { SectionId } from '../../types';
import { festivalConfig } from '../../data/festivalData';
import { MapPin, Phone, Mail, Globe, ShieldCheck, Ticket, ArrowUp } from 'lucide-react';

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
                  Cultural Events (Virtual OAT)
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
                  <span>Register for Events (Free)</span>
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
                {festivalConfig.googleMapsUrl && (
                  <a
                    href={festivalConfig.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 mt-2.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Open in Google Maps</span>
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
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
              <div className="flex items-center space-x-3">
                {/* Instagram */}
                <a
                  href={festivalConfig.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow RVRJC on Instagram"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-pink-600/20 hover:border-pink-500/40 hover:text-pink-400 text-slate-400 transition-all"
                  title="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={festivalConfig.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to RVRJC on YouTube"
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/40 hover:text-red-400 text-slate-400 transition-all"
                  title="YouTube"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* X / Twitter */}
                {festivalConfig.socialLinks.twitter && (
                  <a
                    href={festivalConfig.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow RVRJC on X (Twitter)"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-slate-600/20 hover:border-slate-400/40 hover:text-white text-slate-400 transition-all"
                    title="X (Twitter)"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
              </div>
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
