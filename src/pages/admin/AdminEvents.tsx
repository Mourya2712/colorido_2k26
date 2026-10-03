import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getAdminEvents, updateEvent, createEvent } from '../../lib/api';
import {
  Search, Edit3, Music, Clock, RefreshCw, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatTo12Hour } from '../../utils/timeUtils';

export interface AdminEventData {
  id: string;
  slug: string;
  category_id: string;
  category_name: string;
  name: string;
  type: string;
  tagline?: string;
  short_description: string;
  description?: string;
  rules?: string[] | { title: string; points: string[] }[];
  venue: string;
  schedule_date?: string;
  start_time?: string;
  end_time?: string;
  registration_type: 'individual' | 'team';
  min_team_size: number;
  max_team_size: number;
  team_size_label?: string;
  gender: string;
  is_active: number;
  is_registration_open: number;
  registration_deadline?: string;
  registration_deadline_updated_at?: string;
  requires_audio: number;
  reg_count?: number;
}

const categoriesList = [
  { id: 'dance', name: 'Dance' },
  { id: 'music', name: 'Music & Band' },
  { id: 'fine-arts', name: 'Fine Arts' },
  { id: 'choreoday', name: 'Choreoday' },
  { id: 'dramatics', name: 'Dramatics' },
  { id: 'fashion', name: 'Fashion Show' },
  { id: 'tekraft', name: 'Tekraft Events' },
  { id: 'literary', name: 'Literary' },
  { id: 'boys-sports', name: 'Boys Sports' },
  { id: 'girls-sports', name: 'Girls Sports' },
];

const initialNewEvent = {
  name: '',
  category_id: 'dance',
  category_name: 'Dance',
  type: 'cultural',
  tagline: '',
  short_description: '',
  description: '',
  venue: 'RVRJC Open Air Theatre (OAT)',
  schedule_date: '2026-02-26',
  start_time: '10:00 AM',
  end_time: '01:00 PM',
  registration_type: 'individual' as 'individual' | 'team',
  min_team_size: 1,
  max_team_size: 1,
  team_size_label: 'Individual Solo',
  gender: 'all',
  is_registration_open: 1,
  registration_deadline: '2026-10-15T23:59:59.000Z',
  requires_audio: 0,
};

// ── 12-Hour Time Input Component with AM/PM ─────────────────────────────
const Time12Input: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
  const formatted = formatTo12Hour(value) || '10:00 AM';
  const match = formatted.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const hour = match ? match[1].padStart(2, '0') : '10';
  const minute = match ? match[2] : '00';
  const ampm = match ? match[3].toUpperCase() : 'AM';

  const update = (newH: string, newM: string, newP: string) => {
    onChange(`${newH.padStart(2, '0')}:${newM.padStart(2, '0')} ${newP}`);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-1">{label} (12-Hour Clock)</label>
      <div className="flex items-center space-x-1.5 bg-black/40 border border-white/10 p-2 rounded-xl">
        <select
          value={hour}
          onChange={(e) => update(e.target.value, minute, ampm)}
          className="bg-transparent text-white font-mono text-xs font-bold focus:outline-none cursor-pointer"
        >
          {['01','02','03','04','05','06','07','08','09','10','11','12'].map((h) => (
            <option key={h} value={h} className="bg-[#141026] text-white">{h}</option>
          ))}
        </select>
        <span className="text-purple-400 font-bold">:</span>
        <select
          value={minute}
          onChange={(e) => update(hour, e.target.value, ampm)}
          className="bg-transparent text-white font-mono text-xs font-bold focus:outline-none cursor-pointer"
        >
          {['00','05','10','15','20','25','30','35','40','45','50','55'].map((m) => (
            <option key={m} value={m} className="bg-[#141026] text-white">{m}</option>
          ))}
        </select>
        <div className="flex rounded-lg overflow-hidden border border-white/15 ml-auto">
          <button
            type="button"
            onClick={() => update(hour, minute, 'AM')}
            className={`px-2.5 py-1 text-[10px] font-black font-mono transition-colors ${
              ampm === 'AM'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => update(hour, minute, 'PM')}
            className={`px-2.5 py-1 text-[10px] font-black font-mono transition-colors ${
              ampm === 'PM'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<AdminEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [editingEvent, setEditingEvent] = useState<AdminEventData | null>(null);
  const [rulesText, setRulesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState(initialNewEvent);
  const [newRulesText, setNewRulesText] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAdminEvents();
      if (res.data?.events) {
        setEvents(res.data.events);
      }
    } catch (err: any) {
      toast.error('Failed to load events from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openEditModal = (ev: AdminEventData) => {
    setEditingEvent({
      ...ev,
      schedule_date: ev.schedule_date || '2026-02-26',
      start_time: formatTo12Hour(ev.start_time) || '10:00 AM',
      end_time: formatTo12Hour(ev.end_time) || '01:00 PM',
    });
    if (Array.isArray(ev.rules)) {
      const text = ev.rules.map((r: any) => (typeof r === 'string' ? r : r.title ? `${r.title}: ${r.points?.join(' ') || ''}` : '')).filter(Boolean).join('\n');
      setRulesText(text);
    } else {
      setRulesText('');
    }
  };

  const toggleEventStatus = async (item: AdminEventData) => {
    const newStatus = item.is_registration_open ? 0 : 1;
    try {
      await updateEvent(item.id, { is_registration_open: newStatus });
      setEvents((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, is_registration_open: newStatus } : e))
      );
      toast.success(newStatus ? `Opened registrations for ${item.name}` : `Closed registrations for ${item.name}`);
    } catch {
      toast.error('Failed to update registration status');
    }
  };

  const handleQuickExtend = async (item: AdminEventData, daysToAdd: number) => {
    const baseDate = item.registration_deadline ? new Date(item.registration_deadline) : new Date();
    const newDate = new Date(Math.max(Date.now(), baseDate.getTime()) + daysToAdd * 24 * 60 * 60 * 1000);
    const isoString = newDate.toISOString();

    try {
      await updateEvent(item.id, {
        registration_deadline: isoString,
        is_registration_open: 1,
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === item.id
            ? { ...e, registration_deadline: isoString, is_registration_open: 1 }
            : e
        )
      );
      toast.success(`Extended deadline for ${item.name} by ${daysToAdd} days`);
    } catch {
      toast.error('Failed to extend registration deadline');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSaving(true);
    try {
      const parsedRules = rulesText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const payload = {
        name: editingEvent.name,
        category_name: editingEvent.category_name,
        category_id: editingEvent.category_id,
        type: editingEvent.type,
        short_description: editingEvent.short_description,
        description: editingEvent.description,
        venue: editingEvent.venue,
        schedule_date: editingEvent.schedule_date || '2026-02-26',
        start_time: editingEvent.start_time || '10:00 AM',
        end_time: editingEvent.end_time || '01:00 PM',
        rules: parsedRules,
        registration_type: editingEvent.registration_type,
        min_team_size: Number(editingEvent.min_team_size),
        max_team_size: Number(editingEvent.max_team_size),
        team_size_label: editingEvent.registration_type === 'team'
          ? (Number(editingEvent.min_team_size) === Number(editingEvent.max_team_size)
              ? `${editingEvent.min_team_size} ${Number(editingEvent.min_team_size) === 1 ? 'Member' : 'Members'}`
              : `${editingEvent.min_team_size}–${editingEvent.max_team_size} Members`)
          : 'Individual Solo',
        is_registration_open: editingEvent.is_registration_open ? 1 : 0,
        registration_deadline: editingEvent.registration_deadline,
        requires_audio: editingEvent.requires_audio ? 1 : 0,
      };

      const res = await updateEvent(editingEvent.id, payload);
      const updated = res.data?.event || { ...editingEvent, ...payload, rules: parsedRules };

      setEvents((prev) =>
        prev.map((ev) => (ev.id === editingEvent.id ? { ...ev, ...updated } : ev))
      );
      toast.success(`Event updated & synchronized live to website!`);
      setEditingEvent(null);
    } catch (err: any) {
      toast.error('Failed to save event updates: ' + (err?.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name.trim()) {
      toast.error('Event title is required');
      return;
    }

    setCreating(true);
    try {
      const parsedRules = newRulesText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const isTeam = newEvent.registration_type === 'team';
      const minSize = isTeam ? Math.max(2, Number(newEvent.min_team_size) || 2) : 1;
      const maxSize = isTeam ? Math.max(minSize, Number(newEvent.max_team_size) || minSize) : 1;

      let eventType = newEvent.type;
      let eventGender = newEvent.gender;
      if (newEvent.category_id === 'boys-sports') {
        eventType = 'sports';
        eventGender = 'boys';
      } else if (newEvent.category_id === 'girls-sports') {
        eventType = 'sports';
        eventGender = 'girls';
      } else {
        eventType = 'cultural';
        eventGender = 'all';
      }

      const payload = {
        name: newEvent.name.trim(),
        category_id: newEvent.category_id,
        category_name: newEvent.category_name,
        type: eventType,
        tagline: newEvent.tagline.trim() || undefined,
        short_description: newEvent.short_description.trim() || newEvent.name.trim(),
        description: newEvent.description.trim() || newEvent.short_description.trim() || newEvent.name.trim(),
        venue: newEvent.venue.trim() || 'RVRJC Open Air Theatre (OAT)',
        schedule_date: newEvent.schedule_date || '2026-02-26',
        start_time: newEvent.start_time || '10:00',
        end_time: newEvent.end_time || '13:00',
        registration_type: newEvent.registration_type,
        min_team_size: minSize,
        max_team_size: maxSize,
        team_size_label: isTeam
          ? (minSize === maxSize
              ? `${minSize} ${minSize === 1 ? 'Member' : 'Members'}`
              : `${minSize}–${maxSize} Members`)
          : 'Individual Solo',
        gender: eventGender,
        is_registration_open: newEvent.is_registration_open ? 1 : 0,
        registration_deadline: newEvent.registration_deadline || '2026-10-15T23:59:59.000Z',
        requires_audio: newEvent.requires_audio ? 1 : 0,
        rules: parsedRules,
      };

      const res = await createEvent(payload);
      const createdItem = res.data?.event;

      if (createdItem) {
        setEvents((prev) => [createdItem, ...prev]);
      } else {
        await fetchEvents();
      }

      toast.success(`Event "${newEvent.name}" created & synchronized live!`);
      setShowAddModal(false);
      setNewEvent(initialNewEvent);
      setNewRulesText('');
    } catch (err: any) {
      toast.error('Failed to create event: ' + (err?.response?.data?.error || err?.message || 'Server error'));
    } finally {
      setCreating(false);
    }
  };

  const filtered = events.filter((ev) => {
    const matchesCat = selectedCat === 'all' || ev.category_id?.toLowerCase() === selectedCat.toLowerCase() || ev.category_name?.toLowerCase().includes(selectedCat.toLowerCase());
    const matchesSearch =
      ev.name?.toLowerCase().includes(search.toLowerCase()) ||
      ev.short_description?.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center space-x-2">
            <span>Events Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              Live DB Source of Truth
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Edits here automatically update rules, team size limits, audio upload flags, and closing countdowns on the public site.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchEvents}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-purple-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search event by title, venue, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Event Categories ({events.length})</option>
          {categoriesList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Loading synchronized events from database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isDeadlinePassed = item.registration_deadline
              ? new Date(item.registration_deadline).getTime() < Date.now()
              : false;
            const isEffectivelyOpen = Boolean(item.is_registration_open && !isDeadlinePassed);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {item.category_name}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {Boolean(item.requires_audio) && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                          <Music className="w-2.5 h-2.5" />
                          <span>Song Req</span>
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isEffectivelyOpen
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {isEffectivelyOpen ? 'Open' : isDeadlinePassed ? 'Deadline Passed' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 font-['Outfit']">{item.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {item.short_description || item.description}
                  </p>

                  <div className="text-[11px] text-slate-400 space-y-1.5 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Team Size:</span>
                      <strong className="text-slate-200">
                        {item.registration_type === 'team'
                          ? (Number(item.min_team_size) === Number(item.max_team_size)
                              ? `${item.min_team_size} ${Number(item.min_team_size) === 1 ? 'Member' : 'Members'}`
                              : `${item.min_team_size}–${item.max_team_size} Members`)
                          : 'Solo Entry'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Venue:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[170px]" title={item.venue}>
                        {item.venue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Registrations:</span>
                      <span className="text-purple-300 font-mono font-bold">
                        {item.reg_count || 0} registered
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="text-amber-300 font-mono text-[10px]">
                        {item.registration_deadline
                          ? new Date(item.registration_deadline).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Not Set'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => toggleEventStatus(item)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                        item.is_registration_open
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.is_registration_open ? 'Close' : 'Open'}
                    </button>
                  </div>

                  {/* Quick Extend Deadline Button */}
                  <div className="flex items-center space-x-1 text-[10px]">
                    <span className="text-slate-500">Extend:</span>
                    <button
                      onClick={() => handleQuickExtend(item, 3)}
                      className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 font-mono"
                    >
                      +3 Days
                    </button>
                    <button
                      onClick={() => handleQuickExtend(item, 7)}
                      className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 font-mono"
                    >
                      +7 Days
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Edit Modal — Portal to body */}
      {editingEvent && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div
            className="rounded-3xl border border-white/15 bg-[#0f0c1b] max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh', height: '90vh' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#0f0c1b]">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Edit Event: {editingEvent.name}
                </h3>
                <p className="text-xs text-purple-300 font-mono">
                  Database Sync: Changes immediately push live to public site
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                {/* Event Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.name}
                      onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={editingEvent.category_id}
                      onChange={(e) => {
                        const selected = categoriesList.find((c) => c.id === e.target.value);
                        setEditingEvent({
                          ...editingEvent,
                          category_id: e.target.value,
                          category_name: selected?.name || editingEvent.category_name,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Short Description (Cards & Previews)</label>
                  <textarea
                    rows={2}
                    required
                    value={editingEvent.short_description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, short_description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white resize-none focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Venue & Registration Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Venue Name</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.venue}
                      onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Registration Type</label>
                    <select
                      value={editingEvent.registration_type}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          registration_type: e.target.value as 'individual' | 'team',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="individual">Individual Solo</option>
                      <option value="team">Team Competition</option>
                    </select>
                  </div>
                </div>

                {/* Event Date & Time */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <p className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Event Date &amp; Schedule Time</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Event Date</label>
                      <input
                        type="date"
                        value={editingEvent.schedule_date || '2026-02-26'}
                        onChange={(e) => setEditingEvent({ ...editingEvent, schedule_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <Time12Input
                      label="Start Time"
                      value={editingEvent.start_time || '10:00 AM'}
                      onChange={(val) => setEditingEvent({ ...editingEvent, start_time: val })}
                    />
                    <Time12Input
                      label="End Time"
                      value={editingEvent.end_time || '01:00 PM'}
                      onChange={(val) => setEditingEvent({ ...editingEvent, end_time: val })}
                    />
                  </div>
                </div>

                {/* Team Size Controls (Only for Team events) */}
                {editingEvent.registration_type === 'team' && (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Dynamic Team Size Limits (Forms adapt to these limits)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Minimum Team Members</label>
                        <input
                          type="number"
                          min={2}
                          max={30}
                          value={editingEvent.min_team_size}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, min_team_size: Math.max(2, parseInt(e.target.value) || 2) })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Maximum Team Members</label>
                        <input
                          type="number"
                          min={editingEvent.min_team_size}
                          max={50}
                          value={editingEvent.max_team_size}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, max_team_size: Math.max(editingEvent.min_team_size, parseInt(e.target.value) || editingEvent.min_team_size) })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Song / Audio Upload Toggle */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      <span>Requires Song / Audio File Upload</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      If enabled, participant must upload MP3/WAV/M4A during registration.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingEvent({
                        ...editingEvent,
                        requires_audio: editingEvent.requires_audio ? 0 : 1,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      editingEvent.requires_audio
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {editingEvent.requires_audio ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Registration Deadline & Extension */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Registration Deadline (Closing Date & Time)</span>
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono">Live countdown on public site</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="datetime-local"
                      value={
                        editingEvent.registration_deadline
                          ? new Date(editingEvent.registration_deadline).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          const iso = new Date(e.target.value).toISOString();
                          setEditingEvent({ ...editingEvent, registration_deadline: iso });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />

                    {/* Extend Shortcuts */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-slate-400">Quick Extend:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingEvent.registration_deadline ? new Date(editingEvent.registration_deadline) : new Date();
                          const next = new Date(Math.max(Date.now(), current.getTime()) + 3 * 24 * 60 * 60 * 1000);
                          setEditingEvent({ ...editingEvent, registration_deadline: next.toISOString() });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-mono font-bold"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingEvent.registration_deadline ? new Date(editingEvent.registration_deadline) : new Date();
                          const next = new Date(Math.max(Date.now(), current.getTime()) + 7 * 24 * 60 * 60 * 1000);
                          setEditingEvent({ ...editingEvent, registration_deadline: next.toISOString() });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-mono font-bold"
                      >
                        +7 Days
                      </button>
                    </div>
                  </div>
                </div>

                {/* Registration Status Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white">Event Registration Status</h4>
                    <p className="text-[11px] text-slate-400">Master switch to immediately open or lock registrations</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingEvent({
                        ...editingEvent,
                        is_registration_open: editingEvent.is_registration_open ? 0 : 1,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      editingEvent.is_registration_open
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    }`}
                  >
                    {editingEvent.is_registration_open ? 'OPEN' : 'CLOSED'}
                  </button>
                </div>

                {/* Rules & Regulations Editor */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Rules & Regulations (one rule per line)
                  </label>
                  <textarea
                    rows={4}
                    value={rulesText}
                    onChange={(e) => setRulesText(e.target.value)}
                    placeholder="Enter event guidelines, each rule on a new line..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-sans focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0f0c1b]">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Syncing...</span>
                    </>
                  ) : (
                    <span>Save & Push Live</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add Event Modal — Portal to body */}
      {showAddModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div
            className="rounded-3xl border border-white/15 bg-[#0f0c1b] max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh', height: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#0f0c1b]">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Add New Event
                </h3>
                <p className="text-xs text-purple-300 font-mono">
                  Live DB Source: Will be immediately visible across Public site
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                {/* Event Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Classical Solo Instrumental"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                    <select
                      value={newEvent.category_id}
                      onChange={(e) => {
                        const selected = categoriesList.find((c) => c.id === e.target.value);
                        setNewEvent({
                          ...newEvent,
                          category_id: e.target.value,
                          category_name: selected?.name || newEvent.category_name,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tagline & Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Melody, Rhythm & Instrumental Mastery"
                      value={newEvent.tagline}
                      onChange={(e) => setNewEvent({ ...newEvent, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Venue *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RVRJC Open Air Theatre (OAT)"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Short Description (Cards & Previews) *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief 1-2 sentence overview for event cards and search results..."
                    value={newEvent.short_description}
                    onChange={(e) => setNewEvent({ ...newEvent, short_description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white resize-none focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    placeholder="Comprehensive description of the competition structure, rounds, and expectations..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white resize-none focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Registration Type & Schedule Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Registration Type</label>
                    <select
                      value={newEvent.registration_type}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          registration_type: e.target.value as 'individual' | 'team',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="individual">Individual Solo</option>
                      <option value="team">Team Competition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={newEvent.schedule_date}
                      onChange={(e) => setNewEvent({ ...newEvent, schedule_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Team Size Controls (Only for Team events) */}
                {newEvent.registration_type === 'team' && (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Dynamic Team Size Limits (Forms adapt to these limits)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Minimum Team Members</label>
                        <input
                          type="number"
                          min={2}
                          max={30}
                          value={newEvent.min_team_size}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, min_team_size: Math.max(2, parseInt(e.target.value) || 2) })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Maximum Team Members</label>
                        <input
                          type="number"
                          min={newEvent.min_team_size}
                          max={50}
                          value={newEvent.max_team_size}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, max_team_size: Math.max(newEvent.min_team_size, parseInt(e.target.value) || newEvent.min_team_size) })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Timing (Start & End Time) */}
                <div className="grid grid-cols-2 gap-4">
                  <Time12Input
                    label="Start Time"
                    value={newEvent.start_time}
                    onChange={(val) => setNewEvent({ ...newEvent, start_time: val })}
                  />
                  <Time12Input
                    label="End Time"
                    value={newEvent.end_time}
                    onChange={(val) => setNewEvent({ ...newEvent, end_time: val })}
                  />
                </div>

                {/* Song / Audio Upload Toggle */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      <span>Requires Song / Audio File Upload</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      If enabled, participant must upload MP3/WAV/M4A during registration.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNewEvent({
                        ...newEvent,
                        requires_audio: newEvent.requires_audio ? 0 : 1,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      newEvent.requires_audio
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {newEvent.requires_audio ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Registration Deadline */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Registration Deadline</span>
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono">Live countdown on public site</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={
                      newEvent.registration_deadline
                        ? new Date(newEvent.registration_deadline).toISOString().slice(0, 16)
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const iso = new Date(e.target.value).toISOString();
                        setNewEvent({ ...newEvent, registration_deadline: iso });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Rules & Regulations Editor */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Rules & Regulations (one rule per line)
                  </label>
                  <textarea
                    rows={4}
                    value={newRulesText}
                    onChange={(e) => setNewRulesText(e.target.value)}
                    placeholder="Enter competition guidelines, each rule on a new line..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-sans focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0f0c1b]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center space-x-2"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <span>Create & Publish Event</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminEvents;
