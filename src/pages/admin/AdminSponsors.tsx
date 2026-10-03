import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getAdminSponsors, createSponsor, updateSponsor, deleteSponsor } from '../../lib/api';
import { Plus, Trash2, ExternalLink, Edit2, Phone, DollarSign, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SponsorItem {
  id: string;
  name: string;
  org_name?: string;
  /** DB column is "category" — values like 'title', 'platinum', 'gold', 'associate', 'media' */
  category: string;
  logo_url?: string | null;
  website?: string | null;
  description?: string | null;
  phone?: string | null;
  amount?: string | null;
  display_order?: number;
  is_active?: boolean;
}

const EMPTY_FORM = {
  name: '',
  org_name: '',
  category: 'associate',
  logo_url: '',
  website: '',
  description: '',
  phone: '',
  amount: '',
};

const CATEGORY_LABELS: Record<string, string> = {
  title: 'Title Sponsor',
  platinum: 'Platinum Sponsor',
  gold: 'Gold Sponsor',
  associate: 'Associate Partner',
  media: 'Media & Radio',
  powered_by: 'Powered By',
  partner: 'Partner',
};

const AdminSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const loadSponsors = () => {
    setLoading(true);
    getAdminSponsors()
      .then((res) => {
        if (res.data?.sponsors) {
          setSponsors(res.data.sponsors);
        }
      })
      .catch(() => toast.error('Could not load sponsors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (s: SponsorItem) => {
    setEditingId(s.id);
    setForm({
      name: s.name || '',
      org_name: s.org_name || '',
      category: s.category || 'associate',
      logo_url: s.logo_url || '',
      website: s.website || '',
      description: s.description || '',
      phone: s.phone || '',
      amount: s.amount || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Sponsor name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      org_name: form.org_name.trim() || undefined,
      category: form.category,
      logo_url: form.logo_url.trim() || undefined,
      website: form.website.trim() || undefined,
      description: form.description.trim() || undefined,
      phone: form.phone.trim() || undefined,
      amount: form.amount.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateSponsor(editingId, payload);
        toast.success('Sponsor updated!');
      } else {
        await createSponsor(payload);
        toast.success('Sponsor added!');
      }
      setShowModal(false);
      loadSponsors();
    } catch {
      toast.error('Failed to save sponsor.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this sponsor?')) return;
    try {
      await deleteSponsor(id);
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      toast.success('Sponsor removed.');
    } catch {
      toast.error('Failed to remove sponsor.');
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all';
  const selectCls = 'w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all';
  const labelCls = 'block text-xs font-bold text-slate-300 mb-1';

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">Sponsors & Brand Alliances</h1>
          <p className="text-xs text-slate-400">Manage corporate banners, tiers, and partner links.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sponsor</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-slate-400 py-8 text-sm">Loading sponsors…</div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm">
              No sponsors yet. Click "Add Sponsor" to add the first one.
            </div>
          )}
          {sponsors.map((s) => {
            /* Safe category label — fallback for missing/null */
            const catLabel = CATEGORY_LABELS[s.category] ?? (s.category || 'Partner');

            return (
              <div
                key={s.id}
                className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {catLabel}
                    </span>
                    {s.amount && (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{s.amount}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    {s.logo_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                        <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0 border border-white/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white font-['Outfit'] truncate">{s.name}</h4>
                      {s.org_name && <p className="text-[11px] text-slate-400 truncate">{s.org_name}</p>}
                      {s.website && (
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center space-x-1 mt-0.5"
                        >
                          <span className="truncate max-w-[140px]">{s.website}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {s.phone && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.description && <p className="text-xs text-slate-400 leading-relaxed mt-1">{s.description}</p>}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-end space-x-2 mt-4">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                    title="Edit sponsor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete sponsor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal — Portal to body to avoid containing block and z-index clipping */}
      {showModal && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="rounded-3xl border border-white/10 bg-[#0f0c1b] max-w-lg w-full shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
            style={{ maxHeight: '90vh' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#0f0c1b]">
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit']">
                  {editingId ? 'Edit Sponsor' : 'Add Sponsor Partner'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingId ? 'Update existing partner branding and tier' : 'Add new corporate banner and sponsorship details'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Sponsor Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Red Bull India"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Organisation Name (optional)</label>
                    <input
                      type="text"
                      value={form.org_name}
                      onChange={(e) => setForm({ ...form, org_name: e.target.value })}
                      placeholder="e.g. Red Bull GmbH"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Sponsorship Category / Tier</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={selectCls}
                  >
                    <option value="title">Title Sponsor</option>
                    <option value="platinum">Platinum Sponsor</option>
                    <option value="gold">Gold Sponsor</option>
                    <option value="powered_by">Powered By</option>
                    <option value="associate">Associate Partner</option>
                    <option value="media">Media & Radio</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Phone Number (optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 9999999999"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Sponsorship Amount (optional)</label>
                    <input
                      type="text"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="e.g. ₹50,000"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Logo URL (optional)</label>
                  <input
                    type="url"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Official Link / Website (optional)</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://brand.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Description (optional)</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Official Energy Drink Partner..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-white/10 shrink-0 bg-[#0f0c1b]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-600/20"
                >
                  {editingId ? 'Update Sponsor' : 'Save Sponsor'}
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

export default AdminSponsors;
