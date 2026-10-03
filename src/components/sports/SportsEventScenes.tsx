import React, { useState } from 'react';
import {
  MapPin, ShieldCheck, ChevronDown, ChevronUp,
  Ticket, ArrowRight, ChevronLeft, ChevronRight, Users,
} from 'lucide-react';
import { formatParticipantCount } from '../../utils/formatParticipantCount';

interface SportsEventScenesProps {
  events: any[]; // API-shaped events
  gender: 'boys' | 'girls';
  onRegisterEvent: (event: any) => void;
  onViewVenue: (venueId: string) => void;
}

const getSportsVenue = (event: any): string => {
  if (!event) return '';
  const searchKey = `${event.id || ''} ${event.slug || ''} ${event.name || ''}`.toLowerCase();

  if (searchKey.includes('volleyball')) {
    return 'Playground in front of SJB Block';
  }
  if (searchKey.includes('throwball')) {
    return 'Playground in front of SJB Block';
  }
  if (searchKey.includes('basketball')) {
    return 'Basketball Court inside campus';
  }
  if (searchKey.includes('table-tennis') || searchKey.includes('table tennis')) {
    return 'Sports Plex in front of Canteen';
  }
  if (searchKey.includes('tennikoit')) {
    return 'Sports Plex in front of Canteen';
  }
  return event.venue || 'RVR & JC College Campus Ground';
};

export const SportsEventScenes: React.FC<SportsEventScenesProps> = ({
  events,
  gender,
  onRegisterEvent,
  onViewVenue,
}) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  // Reset index when events array changes (gender switch)
  React.useEffect(() => {
    setCurrentEventIndex(0);
    setIsRulesExpanded(false);
  }, [gender]);

  const activeEvent = events[Math.min(currentEventIndex, events.length - 1)] || events[0];
  const isCyan = gender === 'girls';

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % events.length);
    setIsRulesExpanded(false);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + events.length) % events.length);
    setIsRulesExpanded(false);
  };

  if (!activeEvent) return null;

  // Parse rules — can be string[], {title,points}[], or JSON string
  const parseRules = (raw: any): string[] => {
    if (!raw) return [];
    let arr = raw;
    if (typeof raw === 'string') {
      try { arr = JSON.parse(raw); } catch { return [raw]; }
    }
    if (!Array.isArray(arr)) return [];
    const result: string[] = [];
    for (const r of arr) {
      if (typeof r === 'string') {
        result.push(r);
      } else if (r && typeof r === 'object') {
        // {title, points} format
        if (r.title) result.push(r.title);
        if (Array.isArray(r.points)) result.push(...r.points);
      }
    }
    return result;
  };

  const rules = parseRules(activeEvent.rules);

  const formatDate = (d: string) => {
    if (!d) return '[Date TBA]';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };
  const formatTime = (t: string) => {
    if (!t) return '[Time TBA]';
    try {
      const [h, m] = t.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return `${hour}:${String(m).padStart(2, '0')} ${period}`;
    } catch { return t; }
  };

  const teamLabel = activeEvent.team_size_label
    ? formatParticipantCount(activeEvent.team_size_label, undefined, 'Players')
    : (activeEvent.min_team_size && activeEvent.max_team_size
      ? activeEvent.min_team_size === activeEvent.max_team_size
        ? `${activeEvent.min_team_size} Player${activeEvent.min_team_size > 1 ? 's' : ''}`
        : `${activeEvent.min_team_size} – ${activeEvent.max_team_size} Players`
      : null);

  return (
    <div className="relative w-full min-h-[640px] sm:min-h-[720px] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_70px_rgba(0,0,0,0.8)] flex flex-col justify-between">
      {/* Cinematic Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 ${isCyan ? 'bg-gradient-to-br from-[#030d17] via-[#051525] to-[#07070a]' : 'bg-gradient-to-br from-[#120804] via-[#1a0c06] to-[#07070a]'}`} />
        <div className={`absolute inset-0 opacity-30 ${isCyan ? 'bg-[radial-gradient(ellipse_at_80%_20%,rgba(6,182,212,0.5)_0%,transparent_60%)]' : 'bg-[radial-gradient(ellipse_at_80%_20%,rgba(249,115,22,0.5)_0%,transparent_60%)]'}`} />
        <div className={`absolute bottom-0 left-0 w-full h-1/2 opacity-20 ${isCyan ? 'bg-[radial-gradient(ellipse_at_30%_100%,rgba(56,189,248,0.4)_0%,transparent_70%)]' : 'bg-[radial-gradient(ellipse_at_30%_100%,rgba(234,88,12,0.4)_0%,transparent_70%)]'}`} />
        <div className={`absolute top-0 inset-x-0 h-px opacity-60 ${isCyan ? 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent' : 'bg-gradient-to-r from-transparent via-orange-500 to-transparent'}`} />
        <div className={`absolute bottom-0 inset-x-0 h-px opacity-40 ${isCyan ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'}`} />
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${isCyan ? 'bg-cyan-500/20' : 'bg-orange-500/20'}`} />
      </div>

      {/* Top Bar: Event Pills + Navigation */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {events.map((event, idx) => {
            const isActive = currentEventIndex === idx;
            return (
              <button
                key={event.id || idx}
                onClick={() => { setCurrentEventIndex(idx); setIsRulesExpanded(false); }}
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

        <div className="flex items-center space-x-2">
          <button onClick={prevEvent} className="p-2.5 rounded-xl bg-black/60 hover:bg-white/15 border border-white/15 text-white transition-colors cursor-pointer" aria-label="Previous">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextEvent} className="p-2.5 rounded-xl bg-black/60 hover:bg-white/15 border border-white/15 text-white transition-colors cursor-pointer" aria-label="Next">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Event Details */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-8 max-w-4xl space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
            isCyan ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
          }`}>
            {isCyan ? 'Girls Sports' : 'Boys Sports'}
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FREE ENTRY • NO REGISTRATION FEE</span>
          </span>
          {teamLabel && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10">
              <Users className="w-3.5 h-3.5" />
              <span>{teamLabel}</span>
            </span>
          )}
          {(activeEvent.reg_count !== undefined && activeEvent.reg_count > 0) && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isCyan ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-orange-500/10 text-orange-300 border-orange-500/30'}`}>
              {activeEvent.reg_count} Registered
            </span>
          )}
        </div>

        {/* Big Bold Name */}
        <div className="space-y-2">
          <h3 className={`text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight font-['Outfit'] select-none ${
            isCyan
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.4)]'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,0.4)]'
          }`}>
            {activeEvent.name}
          </h3>
          {activeEvent.tagline && (
            <p className={`text-sm sm:text-base font-bold tracking-wide uppercase ${isCyan ? 'text-cyan-300' : 'text-orange-300'}`}>
              "{activeEvent.tagline}"
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-medium">
          {activeEvent.short_description || activeEvent.description}
        </p>

        {/* Venue Card — always visible */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/15 max-w-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ASSIGNED OFFICIAL VENUE</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">Real Campus Ground</span>
          </div>
          <div className="flex items-start space-x-2.5">
            <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${isCyan ? 'text-cyan-400' : 'text-orange-400'}`} />
            <div>
              <div className="text-base sm:text-lg font-black text-white">
                {getSportsVenue(activeEvent)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1 border-t border-white/10">
            <span>📅 Date: <strong className="text-white">{formatDate(activeEvent.schedule_date)}</strong></span>
            <span>⏰ Time: <strong className="text-white">{formatTime(activeEvent.start_time)}{activeEvent.end_time ? ` – ${formatTime(activeEvent.end_time)}` : ''}</strong></span>
            {activeEvent.registration_deadline && (
              <span>🔔 Deadline: <strong className={isCyan ? 'text-cyan-300' : 'text-orange-300'}>{formatDate(activeEvent.registration_deadline)}</strong></span>
            )}
          </div>
        </div>

        {/* Rules Accordion */}
        {rules.length > 0 && (
          <div className="max-w-xl">
            <button
              onClick={() => setIsRulesExpanded(!isRulesExpanded)}
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer py-1"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Tournament Rules & Kit Guidelines</span>
              {isRulesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isRulesExpanded && (
              <div className="mt-3 p-4 rounded-2xl bg-black/85 border border-white/10 space-y-2 text-xs text-slate-300 animate-in fade-in">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className={`mt-0.5 shrink-0 ${isCyan ? 'text-cyan-400' : 'text-orange-400'}`}>•</span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              const searchKey = `${activeEvent.id || ''} ${activeEvent.slug || ''} ${activeEvent.name || ''}`.toLowerCase();
              let targetVenueId = 'sjb-playground';
              if (searchKey.includes('volleyball') || searchKey.includes('throwball')) {
                targetVenueId = 'sjb-playground';
              } else if (searchKey.includes('basketball')) {
                targetVenueId = 'basketball-court';
              } else if (searchKey.includes('table-tennis') || searchKey.includes('table tennis') || searchKey.includes('tennikoit')) {
                targetVenueId = 'sportsplex';
              }
              onViewVenue(targetVenueId);
            }}
            className={`group inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border backdrop-blur-md transition-all duration-300 cursor-pointer ${
              isCyan
                ? 'bg-cyan-950/70 border-cyan-500/50 hover:border-cyan-400 text-cyan-200 hover:text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-orange-950/70 border-orange-500/50 hover:border-orange-400 text-orange-200 hover:text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>CAMPUS VENUE DETAILS</span>
          </button>

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

      {/* Bottom Bar */}
      <div className="relative z-10 px-6 py-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-xs text-slate-400">
        <div>Swipe or click above to cycle events ({currentEventIndex + 1} of {events.length})</div>
        <div className="font-mono text-[11px] text-slate-400">COLORIDO 2K26 Sports Arena</div>
      </div>
    </div>
  );
};
