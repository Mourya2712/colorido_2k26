import React, { useState, useEffect } from 'react';
import { getAdminSponsors, createSponsor, deleteSponsor } from '../../lib/api';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface SponsorItem {
  id: string;
  name: string;
  tier: 'title' | 'powered_by' | 'associate' | 'partner' | 'media';
  logo_url: string;
  website_url?: string;
  description?: string;
}

const DEFAULT_SPONSORS: SponsorItem[] = [
  {
    id: 'sp-1',
    name: 'Tech Mahindra',
    tier: 'title',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://techmahindra.com',
    description: 'Title Presenting Sponsor of COLORIDO 2K26.',
  },
  {
    id: 'sp-2',
    name: 'TCS iON',
    tier: 'powered_by',
    logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://tcsion.com',
    description: 'Digital Infrastructure Partner.',
  },
];

const AdminSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorItem[]>(DEFAULT_SPONSORS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    tier: 'associate' as SponsorItem['tier'],
    logo_url: '',
    website_url: '',
    description: '',
  });

  useEffect(() => {
    getAdminSponsors()
      .then((res) => {
        if (res.data?.sponsors && res.data.sponsors.length > 0) {
          setSponsors(res.data.sponsors);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.logo_url) {
      toast.error('Brand name and logo URL are required.');
      return;
    }

    const newItem: SponsorItem = {
      id: `sp-${Date.now()}`,
      ...form,
    };

    try {
      await createSponsor(form);
    } catch {
      // offline
    }

    setSponsors([...sponsors, newItem]);
    toast.success('Sponsor added!');
    setShowModal(false);
    setForm({
      name: '',
      tier: 'associate',
      logo_url: '',
      website_url: '',
      description: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this sponsor?')) return;
    try {
      await deleteSponsor(id);
    } catch {
      // offline
    }
    setSponsors(sponsors.filter((s) => s.id !== id));
    toast.success('Sponsor removed.');
  };

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">Sponsors & Brand Alliances</h1>
          <p className="text-xs text-slate-400">Manage corporate banners, tiers, and partner links.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sponsor</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {s.tier.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                  <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Outfit']">{s.name}</h4>
                  {s.website_url && (
                    <a
                      href={s.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                    >
                      <span className="truncate max-w-[150px]">{s.website_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              {s.description && <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end mt-4">
              <button
                onClick={() => handleDelete(s.id)}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl border border-white/10 bg-[#0f0c1b] p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white font-['Outfit']">Add Sponsor Partner</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Red Bull India"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sponsorship Tier</label>
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value as SponsorItem['tier'] })}
                  className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white"
                >
                  <option value="title">Title Sponsor</option>
                  <option value="powered_by">Powered By</option>
                  <option value="associate">Associate Partner</option>
                  <option value="media">Media & Radio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Logo URL *</label>
                <input
                  type="url"
                  required
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Website URL</label>
                <input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  placeholder="https://brand.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Official Energy Drink Partner..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Save Sponsor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSponsors;
