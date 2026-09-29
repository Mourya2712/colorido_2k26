import React, { useState } from 'react';
import type { SportsCategory, SportsEvent } from '../../types';
import { boysSportsEvents, girlsSportsEvents } from '../../data/festivalData';
import { SportsEventScenes } from './SportsEventScenes';
import { VenueExperienceModal } from './VenueExperienceModal';
import { Trophy, Flame, Zap, Ticket } from 'lucide-react';

interface SportsSectionProps {
  onRegisterEvent: (event: SportsEvent) => void;
  onOpenRegister: () => void;
}


export const SportsSection: React.FC<SportsSectionProps> = ({
  onRegisterEvent,
  onOpenRegister,
}) => {
  const [selectedGender, setSelectedGender] = useState<SportsCategory>('boys');
  const [activeVenueId, setActiveVenueId] = useState<string | null>(null);

  const isBoys = selectedGender === 'boys';
  const activeEvents = isBoys ? boysSportsEvents : girlsSportsEvents;

  return (
    <section
      className={`relative min-h-screen w-full transition-colors duration-700 py-10 text-white overflow-hidden ${
        isBoys
          ? 'bg-gradient-to-b from-[#100804] via-[#140a05] to-[#07070a]'
          : 'bg-gradient-to-b from-[#030d17] via-[#05111d] to-[#07070a]'
      }`}
      aria-label="Sports Arena Festival"
    >
      {/* Dynamic Athletic Ambient Lighting */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] blur-[150px] pointer-events-none transition-colors duration-700 ${
          isBoys ? 'bg-orange-600/15' : 'bg-cyan-600/15'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Sports Header */}
        <div className="text-center space-y-3 pt-2">
          <div
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${
              isBoys
                ? 'bg-orange-500/15 text-orange-300 border-orange-500/40'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>ATHLETIC CHAMPIONSHIPS • CAMPUS COURTS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight font-['Outfit']">
            <span>THE ARENA OF </span>
            <span
              className={`bg-clip-text text-transparent ${
                isBoys
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-red-500'
                  : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500'
              }`}
            >
              GLORY
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Choose your division to explore tournament events, rules, and real RVR & JC campus venues with interactive 360° and guided exploration.
          </p>

          <div className="pt-1">
            <button
              onClick={onOpenRegister}
              className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isBoys
                  ? 'bg-orange-600/30 hover:bg-orange-600/50 border-orange-400/40 text-orange-200 hover:text-white'
                  : 'bg-cyan-600/30 hover:bg-cyan-600/50 border-cyan-400/40 text-cyan-200 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5 text-amber-300" />
              <span>Register for Sports Division (Free)</span>
            </button>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* TWO LARGE CINEMATIC DIVISION CHOICES: BOYS SPORTS vs GIRLS SPORTS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          {/* BOYS SPORTS BUTTON (Orange / Red) */}
          <button
            onClick={() => setSelectedGender('boys')}
            className={`group relative h-48 sm:h-56 rounded-3xl overflow-hidden border p-6 sm:p-8 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              isBoys
                ? 'border-orange-400 bg-gradient-to-br from-orange-950/80 via-[#271008] to-black shadow-[0_0_50px_rgba(249,115,22,0.4)] ring-2 ring-orange-500/50 scale-[1.01]'
                : 'border-white/15 bg-black/40 hover:border-orange-500/50 hover:bg-black/60 opacity-75 hover:opacity-100'
            }`}
          >
            {/* Background image overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: 'url(/assets/basketball1.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

            <div className="relative z-10 flex items-center justify-between">
              <div
                className={`p-3 rounded-2xl ${
                  isBoys
                    ? 'bg-orange-500 text-black shadow-lg'
                    : 'bg-white/10 text-orange-400'
                }`}
              >
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                ORANGE / RED DIVISION
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl sm:text-4xl font-black text-white uppercase font-['Outfit']">
                  BOYS SPORTS
                </h3>
                {isBoys && (
                  <span className="px-2 py-0.5 rounded bg-orange-500 text-black text-[10px] font-black uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-orange-200/90 mt-1 font-medium">
                Volleyball • Basketball • Table Tennis
              </p>
            </div>
          </button>

          {/* GIRLS SPORTS BUTTON (Blue / Cyan) */}
          <button
            onClick={() => setSelectedGender('girls')}
            className={`group relative h-48 sm:h-56 rounded-3xl overflow-hidden border p-6 sm:p-8 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              !isBoys
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-950/80 via-[#061e31] to-black shadow-[0_0_50px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/50 scale-[1.01]'
                : 'border-white/15 bg-black/40 hover:border-cyan-500/50 hover:bg-black/60 opacity-75 hover:opacity-100'
            }`}
          >
            {/* Background image overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: 'url(/assets/volleyball1.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

            <div className="relative z-10 flex items-center justify-between">
              <div
                className={`p-3 rounded-2xl ${
                  !isBoys
                    ? 'bg-cyan-500 text-black shadow-lg'
                    : 'bg-white/10 text-cyan-400'
                }`}
              >
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                BLUE / CYAN DIVISION
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl sm:text-4xl font-black text-white uppercase font-['Outfit']">
                  GIRLS SPORTS
                </h3>
                {!isBoys && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500 text-black text-[10px] font-black uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-cyan-200/90 mt-1 font-medium">
                Throwball • Tennikoit • Table Tennis
              </p>
            </div>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* FULL-SCREEN CINEMATIC SPORTS EVENT SCENE DISPLAY */}
        {/* ========================================================================= */}
        <SportsEventScenes
          events={activeEvents}
          gender={selectedGender}
          onRegisterEvent={onRegisterEvent}
          onViewVenue={(venueId) => setActiveVenueId(venueId)}
        />
      </div>

      {/* Modular Venue Experience Modal (360° and Guided View) */}
      <VenueExperienceModal
        venueId={activeVenueId}
        onClose={() => setActiveVenueId(null)}
        accentTheme={isBoys ? 'orange' : 'cyan'}
      />
    </section>
  );
};
