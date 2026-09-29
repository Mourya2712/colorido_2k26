import React, { useState, useEffect } from 'react';
import { getSchedule } from '../../lib/api';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface ScheduleItem {
  id: string; title: string; description: string;
  event_type: string; venue: string;
  schedule_date: string; start_time: string; end_time: string;
}

const SchedulePage: React.FC = () => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedule({ type: filter === 'all' ? undefined : filter })
      .then(res => setItems(res.data.schedule))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (t: string) => t ? new Date(`2000-01-01T${t}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const typeColors: Record<string, string> = {
    cultural: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    sports: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    ceremony: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    other: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <div className="min-h-screen bg-[#07070a] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center py-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold uppercase tracking-widest text-purple-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>Event Schedule</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            COLORIDO 2K26<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300">Schedule</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Complete schedule for all cultural and sports events. [OFFICIAL DATE TO BE UPDATED]
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {['all', 'cultural', 'sports', 'ceremony'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === f
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Schedule Items */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-semibold">Schedule will be announced soon</p>
            <p className="text-xs text-slate-500">[OFFICIAL SCHEDULE TO BE UPDATED]</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.event_type && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeColors[item.event_type] || typeColors.other}`}>
                          {item.event_type}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-400">{item.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>{formatDate(item.schedule_date)}</span>
                      </span>
                      {item.start_time && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{formatTime(item.start_time)}{item.end_time ? ` – ${formatTime(item.end_time)}` : ''}</span>
                        </span>
                      )}
                      {item.venue && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-400" />
                          <span>{item.venue}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
