import React, { useState } from 'react';
import type { SportsEvent } from '../../types';
import {
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Ticket,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';


interface SportsEventScenesProps {
  events: SportsEvent[];
  gender: 'boys' | 'girls';
  onRegisterEvent: (event: SportsEvent) => void;
  onViewVenue: (venueId: string) => void;
}

export const SportsEventScenes: React.FC<SportsEventScenesProps> = ({
  events,
  gender,
  onRegisterEvent,
  onViewVenue,
}) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  const activeEvent = events[currentEventIndex] || events[0];
  const isCyan = gender === 'girls';

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % events.length);
    setIsRulesExpanded(false);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + events.length) % events.length);
    setIsRulesExpanded(false);
  };

  return (
    <div className="relative w-full min-h-[640px] sm:min-h-[720px] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_70px_rgba(0,0,0,0.8)] flex flex-col justify-between">
      {/* Background Cinematic Sports Imagery */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out scale-105"
          style={{
            backgroundImage: `url(${activeEvent.image || '/assets/volleyball1.jpg'})`,
          }}
        />
        {/* Contrast Overlays with Gender Specific Accents */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-black/75 to-black/60" />
        <div
          className={`absolute inset-0 opacity-40 mix-blend-overlay ${
            isCyan
              ? 'bg-gradient-to-r from-blue-900/60 via-cyan-900/40 to-transparent'
              : 'bg-gradient-to-r from-orange-950/80 via-red-950/50 to-transparent'
          }`}
        />
        {/* Glow Beams */}
        <div
          className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${
            isCyan ? 'bg-cyan-500/20' : 'bg-orange-500/20'
          }`}
        />
      </div>

      {/* Top Scene Bar: Event Selector Pills & Navigation Arrows */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        {/* Event Navigation Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {events.map((event, idx) => {
            const isActive = currentEventIndex === idx;
            return (
              <button
                key={event.id}
                onClick={() => {
                  setCurrentEventIndex(idx);
                  setIsRulesExpanded(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isActive
                    ? isCyan
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-105'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 text-black shadow-[0_0_20px_rgba(249,115,22,0.6)] scale-105'
                    : 'bg-black/60 hover:bg-black/80 text-slate-300 border border-white/10'
                }`}
              >
                <span>{event.name}</span>
                <span className="text-[10px] opacity-70">#{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevEvent}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-white/15 border border-white/15 text-white transition-colors cursor-pointer"
            aria-label="Previous sport event"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextEvent}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-white/15 border border-white/15 text-white transition-colors cursor-pointer"
            aria-label="Next sport event"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Event Scene Details */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-8 max-w-4xl space-y-6">
        {/* Category & Fee Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
              isCyan
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
            }`}
          >
            {activeEvent.category}
          </span>

          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FREE ENTRY • NO REGISTRATION FEE</span>
          </span>

          {activeEvent.matchFormat && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10">
              {activeEvent.matchFormat}
            </span>
          )}
        </div>

        {/* Big Bold Sport Name */}
        <div className="space-y-2">
          <h3
            className={`text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight font-['Outfit'] select-none ${
              isCyan
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.4)]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,0.4)]'
            }`}
          >
            {activeEvent.name}
          </h3>

          {activeEvent.tagline && (
            <p
              className={`text-sm sm:text-base font-bold tracking-wide uppercase ${
                isCyan ? 'text-cyan-300' : 'text-orange-300'
              }`}
            >
              "{activeEvent.tagline}"
            </p>
          )}
        </div>

        {/* Short Description */}
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-medium">
          {activeEvent.shortDescription}
        </p>

        {/* Assigned Official Campus Venue Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 max-w-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ASSIGNED OFFICIAL VENUE
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              Real Campus Ground
            </span>
          </div>

          <div className="flex items-center space-x-2 text-base sm:text-lg font-black text-white">
            <MapPin className={`w-5 h-5 shrink-0 ${isCyan ? 'text-cyan-400' : 'text-orange-400'}`} />
            <span>{activeEvent.venue}</span>
          </div>

          <div className="pt-1 flex items-center space-x-4 text-xs text-slate-300">
            <span>Date: <strong className="text-white">{activeEvent.date}</strong></span>
            <span>•</span>
            <span>Timing: <strong className="text-white">{activeEvent.time}</strong></span>
          </div>
        </div>

        {/* Rules & Regulations Accordion */}
        <div className="max-w-xl">
          <button
            onClick={() => setIsRulesExpanded(!isRulesExpanded)}
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer py-1"
          >
            <Info className="w-4 h-4 text-amber-400" />
            <span>Tournament Rules & Kit Guidelines</span>
            {isRulesExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isRulesExpanded && (
            <div className="mt-3 p-4 rounded-2xl bg-black/85 border border-white/10 space-y-3 text-xs text-slate-300 animate-in fade-in">
              {activeEvent.rules.map((rule, idx) => (
                <div key={idx} className="space-y-1">
                  <h6 className="font-bold text-amber-300 text-[11px] uppercase tracking-wide">
                    {rule.title}
                  </h6>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    {rule.points.map((pt, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS: VIEW VENUE & REGISTER NOW */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          {/* VIEW VENUE BUTTON */}
          <button
            onClick={() => onViewVenue(activeEvent.venueId)}
            className={`group inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border backdrop-blur-md transition-all duration-300 cursor-pointer ${
              isCyan
                ? 'bg-cyan-950/70 border-cyan-500/50 hover:border-cyan-400 text-cyan-200 hover:text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-orange-950/70 border-orange-500/50 hover:border-orange-400 text-orange-200 hover:text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>VIEW VENUE (360° / GUIDED)</span>
          </button>

          {/* REGISTER NOW BUTTON */}
          <button
            onClick={() => onRegisterEvent(activeEvent)}
            className={`group inline-flex items-center space-x-2 px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-black transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
              isCyan
                ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                : 'bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 shadow-[0_0_30px_rgba(249,115,22,0.5)]'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>REGISTER NOW</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Scene Indicators */}
      <div className="relative z-10 px-6 py-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-xs text-slate-400">
        <div>
          Swipe or Click buttons above to cycle events ({currentEventIndex + 1} of {events.length})
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          COLORIDO 2K26 Sports Arena
        </div>
      </div>
    </div>
  );
};
