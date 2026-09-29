import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getSchedule, createScheduleItem, deleteScheduleItem } from '../../lib/api';
import { Plus, Trash2, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScheduleSlot {
  id: string;
  title: string;
  description: string;
  event_type: string;
  venue: string;
  schedule_date: string;
  start_time: string;
  end_time: string;
}

const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  {
    id: 's-1',
    title: 'Inaugural Ceremony & Lighting of the Lamp',
    description: 'Welcome address by Principal, Management, and Chief Guests.',
    event_type: 'ceremony',
    venue: 'Open Air Theatre (OAT)',
    schedule_date: '2026-02-26',
    start_time: '09:30',
    end_time: '11:00',
  },
  {
    id: 's-2',
    title: 'Inter-College Cricket Preliminary Matches',
    description: 'Round of 16 knockouts across ground A & B.',
    event_type: 'sports',
    venue: 'College Main Sports Complex',
    schedule_date: '2026-02-26',
    start_time: '11:00',
    end_time: '17:00',
  },
  {
    id: 's-3',
    title: 'Classical & Solo Singing Prelims',
    description: 'Vocal competitions in Carnatic, Hindustani, and Light Music.',
    event_type: 'cultural',
    venue: 'Silver Jubilee Seminar Hall',
    schedule_date: '2026-02-26',
    start_time: '13:00',
    end_time: '16:30',
  },
  {
    id: 's-4',
    title: 'Western Group Dance Championship & DJ Night',
    description: 'High voltage choreo dance battle followed by student DJ party.',
    event_type: 'cultural',
    venue: 'Open Air Theatre (OAT)',
    schedule_date: '2026-02-27',
    start_time: '18:00',
    end_time: '22:00',
  },
];

const AdminSchedule: React.FC = () => {
  const [items, setItems] = useState<ScheduleSlot[]>(DEFAULT_SCHEDULE);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'cultural',
    venue: 'Open Air Theatre (OAT)',
    schedule_date: '2026-02-26',
    start_time: '10:00',
    end_time: '12:00',
  });

  useEffect(() => {
    getSchedule()
      .then((res) => {
        if (res.data?.schedule && res.data.schedule.length > 0) {
          setItems(res.data.schedule);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Title is required');
      return;
    }

    const newItem: ScheduleSlot = {
      id: `sch-${Date.now()}`,
      ...form,
    };

    try {
      await createScheduleItem(form);
    } catch {
      // offline / mock fallback
    }

    setItems([...items, newItem]);
    toast.success('Schedule slot added!');
    setShowModal(false);
    setForm({
      title: '',
      description: '',
      event_type: 'cultural',
      venue: 'Open Air Theatre (OAT)',
      schedule_date: '2026-02-26',
      start_time: '10:00',
      end_time: '12:00',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this schedule slot?')) return;
    try {
      await deleteScheduleItem(id);
    } catch {
      // offline
    }
    setItems(items.filter((it) => it.id !== id));
    toast.success('Schedule slot removed.');
  };

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">Festival Schedule</h1>
          <p className="text-xs text-slate-400">Configure event timelines, stage schedules, and court bookings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule Slot</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((slot) => (
          <div
            key={slot.id}
            className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {slot.event_type}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {slot.schedule_date}
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">{slot.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{slot.description}</p>

              <div className="text-[11px] text-slate-300 space-y-1">
                <p className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot.start_time} - {slot.end_time}</span>
                </p>
                <p className="flex items-center space-x-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{slot.venue}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end">
              <button
                onClick={() => handleDelete(slot.id)}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Delete Slot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal — Portal to body */}
      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className="rounded-3xl border border-white/10 bg-[#0f0c1b] max-w-lg w-full shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#0f0c1b]">
              <h3 className="text-xl font-bold text-white font-['Outfit']">Add Schedule Slot</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >✕</button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Event Slot Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Battle of the Bands Semi-Finals"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={form.event_type}
                      onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white"
                    >
                      <option value="cultural">Cultural</option>
                      <option value="sports">Sports</option>
                      <option value="ceremony">Ceremony</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={form.schedule_date}
                      onChange={(e) => setForm({ ...form, schedule_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">End Time</label>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Venue Location</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    placeholder="e.g. Open Air Theatre, Sports Ground A"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0f0c1b]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Save Slot
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


export default AdminSchedule;
