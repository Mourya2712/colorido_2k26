import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BaseEvent } from '../../types';
import { culturalCategories } from '../../data/festivalData';
import { RvrjcOatCanvas } from './RvrjcOatCanvas';
import { getEvents, getPopularEvents } from '../../lib/api';
import {
  Flame, Music, Palette, BookOpen, Drama, Sparkles, ChevronRight,
  Ticket, Users, Cpu, TrendingUp, ArrowRight, ShieldCheck, MapPin, Loader2, Clock
} from 'lucide-react';
import { formatParticipantCount } from '../../utils/formatParticipantCount';

interface CulturalSectionProps {
  onRegisterEvent: (event: BaseEvent) => void;
  onOpenRegister: () => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Flame': return Flame;
    case 'Music': return Music;
    case 'Palette': return Palette;
    case 'BookOpen': return BookOpen;
    case 'Drama': return Drama;
    case 'Users': return Users;
    case 'Cpu': return Cpu;
    case 'Sparkles':
    default: return Sparkles;
  }
};

// Map category id → DB category identifiers
const CATEGORY_ID_MAP: Record<string, string[]> = {
  'dance':      ['dance', 'Dance'],
  'music':      ['music', 'Music & Band', 'music & band', 'Music'],
  'fine-arts':  ['fine-arts', 'Fine Arts', 'fine arts', 'finearts'],
  'choreoday':  ['choreoday', 'Choreoday'],
  'dramatics':  ['dramatics', 'Dramatics', 'dramatic', 'Dramatic', 'street play'],
  'dramatic':   ['dramatics', 'Dramatics', 'dramatic', 'Dramatic', 'street play'],
  'fashion':    ['fashion', 'Fashion Show', 'fashion show', 'Fashion'],
  'tekraft':    ['tekraft', 'Tekraft Events', 'tekraft events', 'Tekraft'],
  'literary':   ['literary', 'Literary', 'literature'],
};

export const CulturalSection: React.FC<CulturalSectionProps> = () => {
  const navigate = useNavigate();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('dance');
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  // ALL cultural events from the API
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Popular events state (Top 3 most registered events)
  const [popularEvents, setPopularEvents] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        const [evRes, popRes] = await Promise.all([
          getEvents({ type: 'cultural' }),
          getPopularEvents(),
        ]);
        if (isMounted) {
          if (evRes.data?.events) setAllEvents(evRes.data.events);
          if (popRes.data?.events) setPopularEvents(popRes.data.events);
        }
      } catch (err) {
        console.warn('Failed to load events from API:', err);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, []);

  // Filter events for the selected category
  const eventsForCategory = (catId: string): any[] => {
    const aliases = CATEGORY_ID_MAP[catId] || [catId];
    return allEvents.filter((ev) =>
      aliases.some((a) => {
        const needle = a.toLowerCase();
        return (
          ev.category_id?.toLowerCase() === needle ||
          ev.category_name?.toLowerCase() === needle ||
          ev.category_name?.toLowerCase().includes(needle) ||
          ev.category_id?.toLowerCase().includes(needle)
        );
      })
    );
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    const el = document.getElementById('cultural-category-events');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const activeCategory = culturalCategories.find((c) => c.id === selectedCategoryId) || culturalCategories[0];
  const activeCategoryEvents = eventsForCategory(selectedCategoryId);

  const handlePopularRegister = (ev: any) => {
    navigate(`/register/${ev.slug || ev.id}`);
  };

  return (
    <section
      className="relative min-h-screen w-full bg-gradient-to-b from-[#090611] via-[#0d091a] to-[#07050d] text-white pt-6 pb-20 overflow-hidden"
      aria-label="Cultural Festival at RVRJC OAT"
    >
      {/* Background Stage Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.22)_0%,rgba(217,70,239,0.1)_40%,transparent_75%)] pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold uppercase tracking-widest text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>CULTURAL ARENA • OPEN AIR THEATRE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight font-['Outfit']">
            <span className="text-white">THE STAGE OF </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">
              EXPRESSION
            </span>
          </h2>

          <p className="text-sm sm:text-base text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
            Explore the festival's Cultural events at the RVRJC Open Air Theatre (OAT). Featuring 8 competitive cultural disciplines and dynamic performances.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register?category=cultural')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-amber-300" />
              <span>Register for Cultural Events</span>
            </button>
            <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NO REGISTRATION FEE</span>
            </div>
          </div>
        </div>

        {/* ── POPULAR EVENTS (Top 3 from DB) ─────────────────────────────── */}
        {popularEvents.length > 0 && (
          <div className="space-y-5 rounded-3xl bg-white/[0.02] border border-purple-500/20 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-widest text-amber-400">
                    <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    <span>POPULAR EVENTS</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-['Outfit']">
                    Top 3 Most Registered Competitions
                  </h3>
                </div>
              </div>
              <span className="text-xs text-slate-400">Live rankings calculated from festival database</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {popularEvents.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="relative rounded-2xl bg-gradient-to-b from-[#18112e] via-[#120d24] to-[#0c0817] border border-purple-500/30 p-5 flex flex-col justify-between group hover:border-amber-400/60 transition-all duration-300 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : idx === 1
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      }`}>
                        #{idx + 1} {idx === 0 ? 'Top Pick' : 'Trending'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {ev.category_name || ev.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white uppercase font-['Outfit'] group-hover:text-amber-200 transition-colors">
                        {ev.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {ev.short_description || ev.description}
                      </p>
                    </div>

                    <div className="pt-2 text-xs text-slate-400 flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{ev.venue || 'RVRJC OAT'}</span>
                      </span>
                      <span className="text-purple-400">•</span>
                      <span className="text-amber-300 font-bold">{ev.reg_count || 0} Registrations</span>
                    </div>
                  </div>

                  <div className="pt-5">
                    <button
                      onClick={() => handlePopularRegister(ev)}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-purple-600/30 hover:bg-purple-600 border border-purple-400/40 text-white transition-all cursor-pointer shadow-md"
                    >
                      <Ticket className="w-3.5 h-3.5 text-amber-300" />
                      <span>Register for this Event</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OAT CANVAS + CATEGORY TABS ─────────────────────────────────── */}
        <div className="space-y-4">
          <RvrjcOatCanvas
            selectedCategoryId={selectedCategoryId}
            hoveredCategoryId={hoveredCategoryId}
            onSelectCategory={handleSelectCategory}
            onHoverCategory={setHoveredCategoryId}
          />

          {/* 8 Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
            {culturalCategories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              const isHovered = hoveredCategoryId === category.id;
              const IconComp = getCategoryIcon(category.iconName);
              const catEvents = eventsForCategory(category.id);

              return (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  className={`group relative p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-900/80 to-[#190e2d] border-amber-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-102 ring-2 ring-amber-400/40'
                      : isHovered
                      ? 'bg-purple-950/60 border-purple-400 text-white shadow-lg scale-101'
                      : 'bg-white/[0.03] border-white/10 hover:border-purple-500/50 text-slate-300'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500 group-hover:text-white'
                    }`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-amber-300 translate-x-0.5' : 'text-slate-500 group-hover:text-purple-300'
                    }`} />
                  </div>

                  <div>
                    <span className={`block text-[11px] sm:text-xs font-black tracking-wider uppercase font-['Outfit'] truncate ${
                      isSelected ? 'text-white' : 'group-hover:text-purple-200'
                    }`}>
                      {category.name}
                    </span>
                    <span className="block text-[9px] text-purple-300/80 truncate mt-0.5">
                      {loadingEvents ? '...' : `${catEvents.length} Event${catEvents.length !== 1 ? 's' : ''}`}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-pink-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EVENTS FOR SELECTED CATEGORY ──────────────────────────────── */}
        <div id="cultural-category-events" className="w-full space-y-6 pt-2 scroll-mt-24">
          {/* Category Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-black/60 to-purple-900/30 border border-purple-500/20 backdrop-blur-xl">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-xs font-bold uppercase tracking-widest text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Category Showcase • {activeCategory.name}</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-['Outfit']">
                {activeCategory.subtitle}
              </h3>

              <p className="text-sm text-purple-200/80 leading-relaxed">
                {activeCategory.description}
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs text-purple-300 font-semibold shrink-0">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-500/30">
                <Users className="w-4 h-4 text-purple-400" />
                <span>
                  {loadingEvents ? '...' : `${activeCategoryEvents.length} Event${activeCategoryEvents.length !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          {/* Event Cards (horizontal scroll) */}
          {loadingEvents ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-3 text-purple-300 font-semibold">Loading events from database...</span>
            </div>
          ) : activeCategoryEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-500/40" />
              <p>No events found for this category yet.</p>
              <p className="text-xs mt-1 text-slate-600">Check back soon or contact the organizers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {activeCategoryEvents.map((event) => (
                <ApiEventCard
                  key={event.id}
                  event={event}
                  onRegister={(ev) => {
                    // Navigate directly to event register page
                    navigate(`/register/${ev.slug || ev.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ── API-shaped Event Card ────────────────────────────────────────────────────
interface ApiEventCardProps {
  event: any;
  onRegister: (event: any) => void;
}

const ApiEventCard: React.FC<ApiEventCardProps> = ({ event, onRegister }) => {
  const [rulesOpen, setRulesOpen] = useState(false);

  const rules: string[] = (() => {
    let raw = event.rules;
    if (!raw) return [];
    let arr = raw;
    if (typeof raw === 'string') { try { arr = JSON.parse(raw); } catch { return [raw]; } }
    if (!Array.isArray(arr)) return [];
    const result: string[] = [];
    for (const r of arr) {
      if (typeof r === 'string') { result.push(r); }
      else if (r && typeof r === 'object') {
        if (r.title) result.push(r.title);
        if (Array.isArray(r.points)) result.push(...r.points);
      }
    }
    return result;
  })();

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

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#140e24] via-[#0d0919] to-[#07050d] border border-purple-500/30 p-3 shadow-[0_6px_24px_rgba(0,0,0,0.5)] hover:border-purple-400/70 transition-all duration-300 flex flex-col justify-between group">
      {/* Header */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 leading-4">
            {event.category_name || 'Cultural'}
          </span>
          <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 leading-4">
            <ShieldCheck className="w-3 h-3" />
            <span>FREE</span>
          </span>
        </div>

        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-tight font-['Outfit'] group-hover:text-purple-200 transition-colors leading-tight">
            {event.name}
          </h4>
          {event.tagline && (
            <p className="text-[10px] text-amber-300/90 font-medium mt-0.5 leading-tight">{event.tagline}</p>
          )}
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
          {event.short_description || event.description}
        </p>

        {/* Meta chips */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center space-x-1.5 text-[10px]">
            <svg className="w-3 h-3 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <div className="truncate">
              <span className="block text-[9px] text-slate-400">Date</span>
              <span className="font-semibold text-slate-200 truncate text-[10px]">{formatDate(event.schedule_date)}</span>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center space-x-1.5 text-[10px]">
            <svg className="w-3 h-3 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="truncate">
              <span className="block text-[9px] text-slate-400">Time</span>
              <span className="font-semibold text-slate-200 truncate text-[10px]">{formatTime(event.start_time)}</span>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center space-x-1.5 text-[10px] col-span-2">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="block text-[9px] text-slate-400">Venue</span>
              <span className="font-semibold text-amber-200 truncate text-[10px]">{event.venue || 'RVRJC OAT'}</span>
            </div>
          </div>

          {(event.team_size_label || (event.registration_type === 'team' && event.min_team_size && event.max_team_size)) && (
            <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center space-x-1.5 text-[10px] col-span-2">
              <Users className="w-3 h-3 text-pink-400 shrink-0" />
              <div>
                <span className="block text-[9px] text-slate-400">Team Size</span>
                <span className="font-semibold text-slate-200 text-[10px]">
                  {formatParticipantCount(event.team_size_label || event.min_team_size, event.max_team_size)}
                </span>
              </div>
            </div>
          )}

          {event.registration_deadline && (
            <div className="p-1.5 rounded-lg bg-purple-900/30 border border-purple-500/25 flex items-center space-x-1.5 text-[10px] col-span-2">
              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
              <div>
                <span className="block text-[9px] text-amber-300 font-bold uppercase tracking-wider">Deadline</span>
                <span className="font-semibold text-slate-200 text-[10px]">{formatDate(event.registration_deadline)}</span>
              </div>
            </div>
          )}

          {(event.reg_count !== undefined && event.reg_count !== null) && (
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center space-x-1.5 text-[10px] col-span-2">
              <TrendingUp className="w-3 h-3 text-amber-400 shrink-0" />
              <div>
                <span className="block text-[9px] text-slate-400">Registrations</span>
                <span className="font-bold text-amber-300 text-[10px]">{event.reg_count} Registered</span>
              </div>
            </div>
          )}
        </div>

        {/* Rules Accordion */}
        {rules.length > 0 && (
          <div className="border-t border-white/10">
            <button
              onClick={() => setRulesOpen((v) => !v)}
              className="w-full flex items-center justify-between py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 hover:text-purple-200 cursor-pointer focus:outline-none"
            >
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Rules</span>
              </div>
              <svg className={`w-3.5 h-3.5 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {rulesOpen && (
              <div className="mb-1.5 p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1 text-[10px] text-slate-300 animate-in fade-in slide-in-from-top-1 duration-200">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-start space-x-1.5">
                    <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Register button */}
      <div className="pt-2.5">
        <button
          onClick={() => onRegister(event)}
          className="w-full group/btn relative flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer overflow-hidden"
        >
          <Ticket className="w-3.5 h-3.5 text-amber-200" />
          <span>REGISTER NOW</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
