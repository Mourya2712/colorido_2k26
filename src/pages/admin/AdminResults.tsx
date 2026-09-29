import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getAdminResults, createResult, deleteResult, getAdminEvents } from '../../lib/api';
import { Trophy, Plus, Trash2, School } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResultItem {
  id: string;
  category: string;
  event_id?: string;
  event_name: string;
  position?: string;
  winner_name?: string;
  winner_college?: string;
  description?: string;
  first_place_team?: string;
  first_place_college?: string;
  first_place_description?: string;
  second_place_team?: string;
  second_place_college?: string;
  second_place_description?: string;
  third_place_team?: string;
  third_place_college?: string;
  third_place_description?: string;
  created_at?: string;
}

interface EventOption {
  id: string;
  name: string;
  category_name: string;
  type: string;
}

const AdminResults: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    category: 'Cultural - Dance',
    event_id: '',
    event_name: '',
    position: '1st Place / Winner',
    winner_name: '',
    winner_college: '',
    description: '',
    second_place_team: '',
    second_place_college: '',
    second_place_description: '',
    third_place_team: '',
    third_place_college: '',
    third_place_description: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [resRes, evtRes] = await Promise.all([
        getAdminResults().catch(() => ({ data: { results: [] } })),
        getAdminEvents().catch(() => ({ data: { events: [] } })),
      ]);
      if (resRes.data?.results) setResults(resRes.data.results);
      if (evtRes.data?.events) {
        setEvents(evtRes.data.events);
        if (evtRes.data.events.length > 0 && !form.event_name) {
          const first = evtRes.data.events[0];
          setForm((f) => ({
            ...f,
            event_id: first.id,
            event_name: first.name,
            category: first.category_name,
          }));
        }
      }
    } catch {
      toast.error('Failed to load results from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const ev = events.find((item) => item.id === selectedId);
    if (ev) {
      setForm({
        ...form,
        event_id: ev.id,
        event_name: ev.name,
        category: ev.category_name,
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_name || !form.winner_name || !form.winner_college) {
      toast.error('Event name, winner name/team, and college are required.');
      return;
    }

    try {
      const payload = {
        category: form.category,
        event_id: form.event_id || null,
        event_name: form.event_name,
        position: form.position,
        winner_name: form.winner_name,
        winner_college: form.winner_college,
        description: form.description,
        first_place_team: form.winner_name,
        first_place_college: form.winner_college,
        first_place_description: form.description,
        second_place_team: form.second_place_team || null,
        second_place_college: form.second_place_college || null,
        second_place_description: form.second_place_description || null,
        third_place_team: form.third_place_team || null,
        third_place_college: form.third_place_college || null,
        third_place_description: form.third_place_description || null,
      };

      const res = await createResult(payload);
      const created = res.data?.result || { id: `res-${Date.now()}`, ...payload };
      setResults([created, ...results]);
      toast.success('Result successfully published live on Results page!');
      setShowModal(false);
      setForm({
        ...form,
        winner_name: '',
        winner_college: '',
        description: '',
        second_place_team: '',
        second_place_college: '',
        second_place_description: '',
        third_place_team: '',
        third_place_college: '',
        third_place_description: '',
      });
    } catch {
      toast.error('Failed to save result to server');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    try {
      await deleteResult(id);
      setResults(results.filter((r) => r.id !== id));
      toast.success('Result removed.');
    } catch {
      toast.error('Failed to delete result');
    }
  };

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center space-x-2">
            <span>Results & Winners</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              Live Published
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Publish official podium finishers with prominent Category, Event, Position, and Winner details.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg shadow-amber-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Winner</span>
        </button>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading published results...</div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0f0c1b]/80 p-12 text-center text-slate-400">
          <Trophy className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
          <p className="text-sm font-bold text-white mb-1">No competition results published yet</p>
          <p className="text-xs text-slate-500">Click &ldquo;Publish New Winner&rdquo; to post winners with Category & Event names.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-6 space-y-4 hover:border-amber-500/30 transition-all shadow-xl"
            >
              {/* Category and Event Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 inline-block mb-1.5">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-black text-white font-['Outfit']">{item.event_name}</h3>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  title="Delete result"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 1st Place Highlight */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {item.position || '1st Place / Winner'}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    {item.winner_name || item.first_place_team}
                  </h4>
                  <p className="text-xs text-slate-300 flex items-center space-x-1.5 mt-0.5">
                    <School className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{item.winner_college || item.first_place_college}</span>
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-slate-400 mt-2 italic">&ldquo;{item.description}&rdquo;</p>
                  )}
                </div>
              </div>

              {/* 2nd & 3rd Place */}
              {(item.second_place_team || item.third_place_team) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  {item.second_place_team && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">🥈 2nd Place / Runner Up</span>
                      <strong className="text-slate-200 block text-xs">{item.second_place_team}</strong>
                      <span className="text-[11px] text-slate-400 truncate block">{item.second_place_college}</span>
                      {item.second_place_description && (
                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-white/5">&ldquo;{item.second_place_description}&rdquo;</p>
                      )}
                    </div>
                  )}
                  {item.third_place_team && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-amber-600 block mb-0.5">🥉 3rd Place</span>
                      <strong className="text-slate-200 block text-xs">{item.third_place_team}</strong>
                      <span className="text-[11px] text-slate-400 truncate block">{item.third_place_college}</span>
                      {item.third_place_description && (
                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-white/5">&ldquo;{item.third_place_description}&rdquo;</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publish Winner Modal — Portal to body, bypasses any overflow clipping */}
      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div
            className="rounded-3xl border border-white/15 bg-[#0f0c1b] max-w-xl w-full shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh', height: '90vh' }}
          >
            {/* Modal Header — Fixed / Non-collapsing */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#0f0c1b]">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">Publish Competition Winner</h3>
                <p className="text-xs text-amber-300">Category and Event are linked for high public visibility</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Container */}
            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Modal Body — Vertically scrollable with full access to all fields */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                {/* Event Select Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select Event *</label>
                  {events.length > 0 ? (
                    <select
                      value={form.event_id}
                      onChange={handleEventSelect}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.category_name} — {ev.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Western Group Dance Championship"
                      value={form.event_name}
                      onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                    />
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category Label *</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Cultural - Dance or Sports - Boys"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Position Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Position / Title</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="1st Place / Winner">🥇 1st Place / Winner</option>
                    <option value="2nd Place / Runner Up">🥈 2nd Place / Runner Up</option>
                    <option value="3rd Place">🥉 3rd Place</option>
                    <option value="Special Jury Award">⭐ Special Jury Award</option>
                  </select>
                </div>

                {/* 1st Place / Winner Details */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                    🥇 1st Place / Winner Details
                  </span>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Winner / Team / Solo Artist Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Team BeatBusters or Rahul Sharma"
                      value={form.winner_name}
                      onChange={(e) => setForm({ ...form, winner_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">College / Institution *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RVR & JC College of Engineering"
                      value={form.winner_college}
                      onChange={(e) => setForm({ ...form, winner_college: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Performance Highlight / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Scored 98/100 for synchronization and stage utilization"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 2nd Place / Runner Up Details */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block">
                    🥈 2nd Place / Runner Up (Optional)
                  </span>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Winner / Team / Solo Artist Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rhythm Pulse or Sneha Reddy"
                      value={form.second_place_team}
                      onChange={(e) => setForm({ ...form, second_place_team: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">College / Institution</label>
                    <input
                      type="text"
                      placeholder="e.g. Vignan University"
                      value={form.second_place_college}
                      onChange={(e) => setForm({ ...form, second_place_college: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Performance Highlight / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Energetic routine with high difficulty stunts"
                      value={form.second_place_description}
                      onChange={(e) => setForm({ ...form, second_place_description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 3rd Place Details */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 block">
                    🥉 3rd Place (Optional)
                  </span>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Winner / Team / Solo Artist Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dynamic Crew or Vikram Rao"
                      value={form.third_place_team}
                      onChange={(e) => setForm({ ...form, third_place_team: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">College / Institution</label>
                    <input
                      type="text"
                      placeholder="e.g. KL University"
                      value={form.third_place_college}
                      onChange={(e) => setForm({ ...form, third_place_college: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Performance Highlight / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Excellent musicality and synchronized footwork"
                      value={form.third_place_description}
                      onChange={(e) => setForm({ ...form, third_place_description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer — Fixed / Always accessible Cancel & Publish buttons */}
              <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0f0c1b]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Publish to Results Page
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

export default AdminResults;
