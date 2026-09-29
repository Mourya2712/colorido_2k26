import React, { useState, useEffect } from 'react';
import { getGallery } from '../../lib/api';
import { Image, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  caption?: string;
  year?: string;
}

const FALLBACK_GALLERY: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Grand Open Air Theatre Inaugural Ceremony',
    category: 'Cultural',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    caption: 'Over 5,000 students gathering under the lights at the iconic RVR & JC OAT.',
    year: '2025',
  },
  {
    id: 'g-2',
    title: 'Western Group Dance Explosive Performance',
    category: 'Stage',
    image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    caption: 'High-octane choreography during the inter-collegiate dance competition.',
    year: '2025',
  },
  {
    id: 'g-3',
    title: 'Inter-Collegiate Cricket Championship Finals',
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Thrilling final over clash under floodlights on the main college sports grounds.',
    year: '2025',
  },
  {
    id: 'g-4',
    title: 'Rock Band Jam & Concert Night',
    category: 'Cultural',
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    caption: 'Live drum solos and electric riffs reverberating through the amphitheatre.',
    year: '2025',
  },
  {
    id: 'g-5',
    title: 'Volleyball Spikers Championship Clash',
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
    caption: 'Intense smash play at the floodlit outdoor volleyball courts.',
    year: '2025',
  },
  {
    id: 'g-6',
    title: 'Flashmob & Campus Carnival Parade',
    category: 'Celebrations',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Colors, music, and spontaneous student dance circles at the college central quadrangle.',
    year: '2025',
  },
  {
    id: 'g-7',
    title: 'Classical Kuchipudi & Bharatanatyam Recital',
    category: 'Stage',
    image_url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=80',
    caption: 'Honoring heritage and classical expressive arts on the primary cultural dais.',
    year: '2025',
  },
  {
    id: 'g-8',
    title: 'Basketball Men & Women Semi-Finals',
    category: 'Sports',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    caption: 'Fast-break action on the newly upgraded synthetic basketball court.',
    year: '2025',
  },
  {
    id: 'g-9',
    title: 'DJ EDM Night Finale Extravaganza',
    category: 'Cultural',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    caption: 'Laser shows, confetti cannons, and unforgettable memories closing out the festival.',
    year: '2025',
  },
];

const GalleryPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery()
      .then((res) => {
        if (res.data?.gallery && res.data.gallery.length > 0) {
          setGallery(res.data.gallery);
        } else {
          setGallery(FALLBACK_GALLERY);
        }
      })
      .catch(() => {
        setGallery(FALLBACK_GALLERY);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Cultural', 'Sports', 'Stage', 'Celebrations'];

  const filteredItems = gallery.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const nextPhoto = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  return (
    <div className="min-h-screen bg-[#07070a] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold uppercase tracking-widest text-cyan-300">
            <Image className="w-3.5 h-3.5 text-cyan-400" />
            <span>Memories & Moments</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            Festival <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Gallery</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base">
            Glimpse into the electrifying energy, passionate athletic showdowns, and awe-inspiring cultural spectacles from COLORIDO editions.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 uppercase tracking-widest">Loading Media Gallery...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-8">
            <Image className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No photos found in this category</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-[#0f0c1b] aspect-[4/3] shadow-lg shadow-black/40"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/60 border border-white/20 text-cyan-300 backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/20 text-white backdrop-blur-md">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Captions */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Prev/Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Caption Box */}
          <div
            className="max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightboxIndex].image_url}
              alt={filteredItems[lightboxIndex].title}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain border border-white/10 shadow-2xl"
            />
            <div className="mt-4 text-center max-w-2xl px-4">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                {filteredItems[lightboxIndex].category} • {filteredItems[lightboxIndex].year || '2026'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {filteredItems[lightboxIndex].title}
              </h2>
              {filteredItems[lightboxIndex].caption && (
                <p className="text-sm text-slate-300 mt-1">
                  {filteredItems[lightboxIndex].caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
