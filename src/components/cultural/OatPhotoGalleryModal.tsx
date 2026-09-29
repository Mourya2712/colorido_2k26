import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { campusVenues } from '../../data/festivalData';

interface OatPhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OatPhotoGalleryModal: React.FC<OatPhotoGalleryModalProps> = ({ isOpen, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const oatVenue = campusVenues['oat'];

  if (!isOpen) return null;

  const nextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % oatVenue.images.length);
  };

  const prevPhoto = () => {
    setActiveIndex((prev) => (prev - 1 + oatVenue.images.length) % oatVenue.images.length);
  };

  const currentAngle = oatVenue.guidedViewAngles[activeIndex] || oatVenue.guidedViewAngles[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl bg-[#0c0a15] border border-purple-500/30 overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.3)] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase font-['Outfit']">
                REAL RVRJC OAT ARCHITECTURAL GALLERY
              </h3>
              <p className="text-xs text-purple-300">
                Official campus visual references • Open Air Theatre
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close photo gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Photo Display Area */}
        <div className="relative flex-1 min-h-[350px] sm:min-h-[480px] bg-black flex items-center justify-center overflow-hidden">
          <img
            src={oatVenue.images[activeIndex]}
            alt={`RVRJC OAT View ${activeIndex + 1}`}
            className="max-h-[65vh] w-full object-contain select-none transition-all duration-300"
          />

          {/* Previous / Next Navigation Arrows */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-purple-600 text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-purple-600 text-white border border-white/20 transition-all cursor-pointer backdrop-blur-md"
            aria-label="Next photograph"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Current Angle Architectural Caption Overlay */}
          <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 p-3.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                VANTAGE ANGLE {activeIndex + 1} OF {oatVenue.images.length}:
              </span>
              <h4 className="text-sm font-extrabold text-white">
                {currentAngle?.label}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentAngle?.description}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                Actual RVRJC Campus Asset
              </span>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-center space-x-3 overflow-x-auto no-scrollbar">
          {oatVenue.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                activeIndex === idx
                  ? 'border-purple-400 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white drop-shadow">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
