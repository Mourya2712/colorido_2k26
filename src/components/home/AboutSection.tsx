import React from 'react';
import type { SectionId } from '../../types';
import { festivalConfig } from '../../data/festivalData';
import { Sparkles, Trophy, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

interface AboutSectionProps {
  onNavigate: (section: SectionId) => void;
  onOpenRegister: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigate, onOpenRegister }) => {
  return (
    <section
      className="relative z-20 w-full py-20 lg:py-28 bg-[#07070a] border-t border-white/10 overflow-hidden"
      aria-labelledby="about-fest-title"
    >
      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Identity & Poster Integration */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(168,85,247,0.3)] bg-gradient-to-b from-[#18112e] to-black group">
              {/* Poster Asset — Full uncropped COLORIDO 2K25 image */}
              <div className="relative overflow-hidden bg-black/40">
                <img
                  src={festivalConfig.posterAsset}
                  alt="COLORIDO 2K25 Official Poster"
                  className="w-full h-auto object-contain transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to college background if poster path fails
                    (e.target as HTMLImageElement).src = festivalConfig.collegeBackgroundAsset;
                  }}
                />
              </div>

              {/* Information below poster */}
              <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                      FESTIVAL HEADQUARTERS
                    </p>
                    <h4 className="text-sm font-extrabold text-white">
                      {festivalConfig.collegeName}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Chowdavaram, Guntur, AP</p>
                    {festivalConfig.googleMapsUrl && (
                      <a
                        href={festivalConfig.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] text-purple-300 hover:text-white font-semibold mt-1 transition-colors"
                      >
                        <span>View on Google Maps</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      FREE ENTRY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: About Description & Fest Structure */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold uppercase tracking-widest text-purple-300">
              <Layers className="w-3.5 h-3.5" />
              <span>Campus Tradition Reimagined</span>
            </div>

            <h2
              id="about-fest-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase font-['Outfit']"
            >
              ABOUT{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                COLORIDO 2K26
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {festivalConfig.aboutText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                    CULTURAL WING
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Centred around the iconic Virtual OAT (Open Air Theatre) hosting 8 distinct categories: Dance, Music, Fine Arts, Literary, Dramatic, Fashion, Choreoday &amp; Tekraft.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange-500/40 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-300">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                    SPORTS WING
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dynamic athletic competition for Boys (Volleyball, Basketball, Table Tennis) and Girls (Throwball, Tennikoit, Table Tennis) across campus grounds.
                </p>
              </div>
            </div>

            {/* Quick Highlights Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('cultural')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
              >
                <span>Explore Virtual OAT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('sports')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
              >
                <span>Explore Sports Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenRegister}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-amber-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Register Now (Free)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
