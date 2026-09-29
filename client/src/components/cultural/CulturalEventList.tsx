import React, { useState } from 'react';
import type { BaseEvent, CulturalCategory } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Ticket,
  Users,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface CulturalEventListProps {
  category: CulturalCategory;
  onRegisterEvent: (event: BaseEvent) => void;
}

export const CulturalEventList: React.FC<CulturalEventListProps> = ({
  category,
  onRegisterEvent,
}) => {
  // Accordion state tracking open rules for each event
  const [openRules, setOpenRules] = useState<Record<string, boolean>>({});

  const toggleRules = (eventId: string) => {
    setOpenRules((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  return (
    <div className="w-full space-y-6 pt-6">
      {/* Category Header & Introduction */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-black/60 to-purple-900/30 border border-purple-500/20 backdrop-blur-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-xs font-bold uppercase tracking-widest text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Category Showcase • {category.name}</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-['Outfit']">
            {category.subtitle}
          </h3>

          <p className="text-sm text-purple-200/80 leading-relaxed">
            {category.description}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-purple-300 font-semibold shrink-0">
          <div className="px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-500/30">
            <span>Official Venue: </span>
            <strong className="text-white">RVRJC OAT</strong>
          </div>
        </div>
      </div>

      {/* Cinematic Horizontal Scrollable Event Cards */}
      <div className="relative">
        <div className="flex space-x-6 overflow-x-auto pb-6 pt-2 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar">
          {category.events.map((event) => {
            const isRulesOpen = !!openRules[event.id];

            return (
              <div
                key={event.id}
                className="w-[320px] sm:w-[420px] lg:w-[460px] shrink-0 snap-start rounded-3xl bg-gradient-to-b from-[#140e24] via-[#0d0919] to-[#07050d] border border-purple-500/30 p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:border-purple-400/70 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Event Card Top Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                      {event.category}
                    </span>

                    <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{event.registrationFee}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-['Outfit'] group-hover:text-purple-200 transition-colors">
                      {event.name}
                    </h4>
                    {event.tagline && (
                      <p className="text-xs text-amber-300/90 font-medium mt-1">
                        {event.tagline}
                      </p>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {event.shortDescription}
                  </p>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center space-x-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <div className="truncate">
                        <span className="block text-[10px] text-slate-400">Date</span>
                        <span className="font-semibold text-slate-200 truncate">{event.date}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center space-x-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <div className="truncate">
                        <span className="block text-[10px] text-slate-400">Time</span>
                        <span className="font-semibold text-slate-200 truncate">{event.time}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center space-x-2 text-xs col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <span className="block text-[10px] text-slate-400">Venue</span>
                        <span className="font-semibold text-amber-200 truncate">{event.venue}</span>
                      </div>
                    </div>

                    {event.teamSize && (
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center space-x-2 text-xs col-span-2">
                        <Users className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <div>
                          <span className="block text-[10px] text-slate-400">Participation Size</span>
                          <span className="font-semibold text-slate-200">{event.teamSize}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion for Rules & Regulations */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => toggleRules(event.id)}
                      className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-purple-200 cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>Rules & Regulations</span>
                      </div>
                      {isRulesOpen ? (
                        <ChevronUp className="w-4 h-4 text-purple-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-purple-400" />
                      )}
                    </button>

                    {isRulesOpen && (
                      <div className="mt-2 p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-3 text-xs text-slate-300 animate-in fade-in slide-in-from-top-1 duration-200">
                        {event.rules.map((rule, rIdx) => (
                          <div key={rIdx} className="space-y-1">
                            <h5 className="font-bold text-amber-300 text-[11px] uppercase tracking-wide">
                              {rule.title}
                            </h5>
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
                </div>

                {/* Event Card Bottom Action */}
                <div className="pt-6">
                  <button
                    onClick={() => onRegisterEvent(event)}
                    className="w-full group/btn relative flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer overflow-hidden"
                  >
                    <Ticket className="w-4 h-4 text-amber-200" />
                    <span>REGISTER NOW</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
