import React, { useState, useEffect } from 'react';
import { getAdminGallery, createGalleryItem, deleteGalleryItem } from '../../lib/api';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  caption?: string;
  year?: string;
}

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Grand Open Air Theatre Inaugural Ceremony',
    category: 'Cultural',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    caption: 'Over 5,000 students gathering under the lights at the iconic RVR & JC OAT.',
  },
  {
    id: 'g-2',
    title: 'Western Group Dance Explosive Performance',
    category: 'Stage',
    image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    caption: 'High-octane choreography during the inter-collegiate dance competition.',
  },
  {
    id: 'g-3',
    title: 'Inter-Collegiate Cricket Championship Finals',
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    caption: 'Final clash under floodlights on the main college sports grounds.',
  },
];

const AdminGallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Cultural',
    image_url: '',
    caption: '',
    year: '2026',
  });

  useEffect(() => {
    getAdminGallery()
      .then((res) => {
        if (res.data?.gallery && res.data.gallery.length > 0) {
          setItems(res.data.gallery);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) {
      toast.error('Title and Image URL are required.');
      return;
    }

    const newItem: GalleryItem = {
      id: `g-${Date.now()}`,
      ...form,
    };

    try {
      await createGalleryItem(form);
    } catch {
      // offline
    }

    setItems([newItem, ...items]);
    toast.success('Photo added to public gallery!');
    setShowModal(false);
    setForm({
      title: '',
      category: 'Cultural',
      image_url: '',
      caption: '',
      year: '2026',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo from gallery?')) return;
    try {
      await deleteGalleryItem(id);
    } catch {
      // offline
    }
    setItems(items.filter((item) => item.id !== id));
    toast.success('Photo removed.');
  };

  return (
    <div className="space-y-6 animate-section-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit']">Gallery & Media Manager</h1>
          <p className="text-xs text-slate-400">Curate high-definition photo highlights and festival captures.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Photo</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 overflow-hidden flex flex-col justify-between"
          >
            <div className="aspect-video relative overflow-hidden bg-white/5">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/70 text-cyan-300 border border-white/20">
                {item.category}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] line-clamp-1">{item.title}</h4>
                {item.caption && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.caption}</p>}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end mt-3">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl border border-white/10 bg-[#0f0c1b] p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white font-['Outfit']">Add Gallery Image</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. DJ Night Crowd Finale"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141026] border border-white/10 text-xs text-white"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Stage">Stage</option>
                    <option value="Celebrations">Celebrations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Year Tag</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Short description of the moment..."
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
