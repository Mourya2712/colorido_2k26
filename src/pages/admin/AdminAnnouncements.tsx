import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getAdminAnnouncements, createAnnouncement, deleteAnnouncement } from '../../lib/api';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: string;
  is_urgent: boolean;
  is_ticker?: boolean;
  link_url?: string;
  created_at: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Final Registration Deadline Extended!',
    content: 'Online registration for all Cultural and Sports competitions is extended until February 20, 2026.',
    category: 'Urgent',
    is_urgent: true,
    is_ticker: true,
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'Celebrity Night & Chief Guests Announced',
    content: 'Renowned playback singers and DJ artists are lined up for the grand finale.',
    category: 'Cultural',
    is_urgent: false,
    is_ticker: true,
    created_at: '2026-02-14T14:30:00Z',
  },
  {
    id: 'ann-3',
    title: 'Cricket & Basketball Fixture Draw Scheduled',
    content: 'Team captains must join the virtual fixtures briefing on February 22 at 5:00 PM.',
    category: 'Sports',
    is_urgent: true,
    is_ticker: true,
    created_at: '2026-02-13T09:15:00Z',
  },
];

const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Cultural',
    is_urgent: false,
    is_ticker: true,
    link_url: '',
  });

  const fetchList = () => {
    getAdminAnnouncements()
      .then((res) => {
        if (res.data?.announcements && res.data.announcements.length > 0) {
          setAnnouncements(res.data.announcements);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Title and message are required.');
      return;
    }

    const newItem: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      ...form,
      created_at: new Date().toISOString(),
    };

    try {
      await createAnnouncement(form);
    } catch {
      // offline / mock handling
    }

    setAnnouncements([newItem, ...announcements]);
    toast.success('Announcement published to public portal & ticker!');
    setShowAddModal(false);
    setForm({
      title: '',
      content: '',
      category: 'Cultural',
      is_urgent: false,
      is_ticker: true,
      link_url: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this bulletin?')) return;
    try {
      await deleteAnnouncement(id);
    } catch {
      // offline / mock
    }
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success('Announcement removed.');
  };

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">Bulletins & Announcements</h1>
          <p className="text-xs text-slate-400">Broadcast official news, schedule revisions, and ticker alerts.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-pink-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {item.category}
                </span>
                {item.is_urgent && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded flex items-center space-x-1 border border-red-500/20">
                    <AlertCircle className="w-3 h-3" />
                    <span>Urgent Notice</span>
                  </span>
                )}
                {item.is_ticker && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Ticker Active
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
              <p className="text-[10px] text-slate-500 pt-1">
                Published on {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                title="Delete Announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal — Portal to body */}
      {showAddModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className="rounded-3xl border border-white/10 bg-[#0f0c1b] max-w-lg w-full shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#0f0c1b]">
              <h3 className="text-xl font-bold text-white font-['Outfit']">Create New Announcement</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >✕</button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Notice Headline *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Stage 2 Soundcheck Schedule"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Notice Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Provide comprehensive details for participants..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white"
                    >
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Urgent">Urgent</option>
                      <option value="General">General</option>
                      <option value="Prizes">Prizes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Link URL (Optional)</label>
                    <input
                      type="text"
                      value={form.link_url}
                      onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                      placeholder="/schedule or https://..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_urgent}
                      onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })}
                      className="rounded bg-white/10 border-white/20 text-pink-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-300">Mark as Urgent</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_ticker}
                      onChange={(e) => setForm({ ...form, is_ticker: e.target.checked })}
                      className="rounded bg-white/10 border-white/20 text-purple-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-300">Display on Live Ticker</span>
                  </label>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0f0c1b]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Publish Announcement
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

export default AdminAnnouncements;
