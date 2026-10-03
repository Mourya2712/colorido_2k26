import React, { useState, useEffect } from 'react';
import type { SectionId } from '../../types';
import { festivalConfig } from '../../data/festivalData';
import { getPublicConfig } from '../../lib/api';
import { Sparkles, Trophy, ArrowRight, Calendar, MapPin, ShieldCheck } from 'lucide-react';

interface HomeHeroProps {
  onNavigate: (section: SectionId) => void;
  onOpenRegister: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onNavigate, onOpenRegister }) => {
  // Parallax mouse position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [festivalDates, setFestivalDates] = useState<string>(festivalConfig.dates);

  useEffect(() => {
    // Stage 1 -> Stage 6 opening animation sequence trigger
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fetch dynamic event date from admin config
    getPublicConfig()
      .then((res) => {
        const d = res.data?.festival_dates;
        if (d && d !== '[OFFICIAL DATE TO BE UPDATED]') {
          setFestivalDates(d);
        } else if (d === '[OFFICIAL DATE TO BE UPDATED]') {
          setFestivalDates('[OFFICIAL DATE TO BE UPDATED]');
        }
      })
      .catch(() => {
        // Keep fallback from festivalConfig
      });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientWidth, clientHeight } = document.documentElement;
    const x = (e.clientX / clientWidth - 0.5) * 2; // -1 to 1
    const y = (e.clientY / clientHeight - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[95vh] w-full flex flex-col justify-between overflow-hidden bg-black text-white"
      aria-label="COLORIDO 2K26 Hero Experience"
    >
      {/* ========================================================================= */}
      {/* 1. REAL RVR & JC COLLEGE BACKGROUND WITH SUBTLE 3D PARALLAX */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Parallax layer for building */}
        <div
          className="absolute -inset-10 bg-cover bg-center transition-transform duration-300 ease-out will-change-transform"
          style={{
            backgroundImage: `url(${festivalConfig.collegeBackgroundAsset})`,
            transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -14}px, 0) scale(1.08)`,
          }}
        />

        {/* Cinematic Vignette, Gradient Lighting & Contrast Layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-black/60 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#07070a_95%)]" />

        {/* Dynamic Dual Atmosphere Lights (Purple for Cultural, Orange for Sports) */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple-600/25 rounded-full blur-[130px] pointer-events-none transition-transform duration-700"
          style={{
            transform: `translate3d(${mousePos.x * 25}px, ${mousePos.y * 20}px, 0)`,
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[130px] pointer-events-none transition-transform duration-700"
          style={{
            transform: `translate3d(${mousePos.x * -25}px, ${mousePos.y * -20}px, 0)`,
          }}
        />

        {/* Ambient Subtle Particle Specks */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. FOREGROUND FLOATING BRANDING & HERO TITLE */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 flex-1 flex flex-col items-center justify-center text-center">
        {/* College Crest & Identity Pill */}
        <div
          className={`inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-xl shadow-lg mb-6 transition-all duration-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`,
          }}
        >
          <img
            src={festivalConfig.collegeLogoAsset}
            alt="RVR & JC College Logo"
            className="w-5 h-5 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-200">
            {festivalConfig.collegeName}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
        </div>

        {/* MAIN FESTIVAL TITLE: COLORIDO 2K26 */}
        <div
          className={`relative transition-all duration-1000 delay-200 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 10}px, 0)`,
          }}
        >
          <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-amber-500/30 blur-3xl opacity-60 pointer-events-none" />

          <h1 className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight font-['Outfit'] select-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
              COLORIDO
            </span>{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 drop-shadow-[0_0_40px_rgba(168,85,247,0.7)]">
              2K26
            </span>
          </h1>
        </div>

        {/* OFFICIAL TAGLINE */}
        <p
          className={`mt-4 sm:mt-6 text-lg sm:text-2xl md:text-3xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-purple-200 to-amber-100 max-w-2xl mx-auto transition-all duration-1000 delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 7}px, 0)`,
          }}
        >
          "{festivalConfig.tagline}"
        </p>

        {/* Festival Key Badges (Dates & Free Fee) */}
        <div
          className={`mt-6 flex flex-wrap items-center justify-center gap-3 transition-all duration-1000 delay-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 text-xs sm:text-sm text-slate-300 backdrop-blur-md">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">{festivalDates}</span>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 backdrop-blur-md shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold">{festivalConfig.registrationFeeNotice}</span>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 text-xs sm:text-sm text-slate-300 backdrop-blur-md">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>RVR & JC Campus, Guntur</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TWO LARGE CINEMATIC ENTRY PORTALS: CULTURAL & SPORTS */}
        {/* ========================================================================= */}
        <div
          className={`mt-10 sm:mt-14 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 transition-all duration-1000 delay-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* OPTION 1: ENTER CULTURAL */}
          <button
            onClick={() => onNavigate('cultural')}
            className="group relative h-44 sm:h-52 rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-950/70 via-[#180d28]/80 to-black/90 p-6 sm:p-7 text-left shadow-[0_10px_40px_rgba(168,85,247,0.2)] hover:shadow-[0_15px_60px_rgba(168,85,247,0.5)] hover:border-purple-400 hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Ambient Corner Beam */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Virtual OAT
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase font-['Outfit'] group-hover:text-purple-200 transition-colors">
                  Cultural Events
                </h3>
                <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-xs text-purple-200/80 mt-1.5 font-medium line-clamp-2">
                Explore Dance, Music, Fine Arts, Literary, Dramatic, Fashion, Choreoday & Tekraft inside the Virtual OAT.
              </p>
            </div>
          </button>

          {/* OPTION 2: ENTER SPORTS */}
          <button
            onClick={() => onNavigate('sports')}
            className="group relative h-44 sm:h-52 rounded-3xl overflow-hidden border border-orange-500/30 bg-gradient-to-br from-orange-950/70 via-[#251009]/80 to-black/90 p-6 sm:p-7 text-left shadow-[0_10px_40px_rgba(249,115,22,0.2)] hover:shadow-[0_15px_60px_rgba(249,115,22,0.5)] hover:border-orange-400 hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Ambient Corner Beam */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-300 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                BOYS & GIRLS
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase font-['Outfit'] group-hover:text-orange-200 transition-colors">
                  Sports Events
                </h3>
                <ArrowRight className="w-6 h-6 text-orange-400 group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-xs text-orange-200/80 mt-1.5 font-medium line-clamp-2">
                Compete in Volleyball, Basketball, Throwball, Tennikoit & Table Tennis across real campus courts.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Hero Visual Poster Peek / Banner Integration */}
      <div className="relative z-10 w-full bg-gradient-to-t from-[#07070a] to-transparent py-4 text-center">
        <button
          onClick={onOpenRegister}
          className="inline-flex items-center space-x-2 text-xs uppercase font-extrabold tracking-widest text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <span>Free In-Website Registration — No Fee</span>
          <span className="text-amber-400">•</span>
          <span className="text-amber-300 underline underline-offset-4">Click to Register</span>
        </button>
      </div>
    </section>
  );
};
