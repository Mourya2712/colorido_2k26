import React, { useState } from 'react';
import type { BaseEvent } from '../../types';
import { culturalCategories } from '../../data/festivalData';
import { RvrjcOatCanvas } from './RvrjcOatCanvas';
import { CulturalEventList } from './CulturalEventList';
import { OatPhotoGalleryModal } from './OatPhotoGalleryModal';
import { Flame, Music, Palette, BookOpen, Drama, Sparkles, ChevronRight, Ticket } from 'lucide-react';

interface CulturalSectionProps {
  onRegisterEvent: (event: BaseEvent) => void;
  onOpenRegister: () => void;
}


const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Flame':
      return Flame;
    case 'Music':
      return Music;
    case 'Palette':
      return Palette;
    case 'BookOpen':
      return BookOpen;
    case 'Drama':
      return Drama;
    case 'Sparkles':
    default:
      return Sparkles;
  }
};

export const CulturalSection: React.FC<CulturalSectionProps> = ({
  onRegisterEvent,
  onOpenRegister,
}) => {
  // Active selected category
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('dance');
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState<boolean>(false);

  const activeCategory =
    culturalCategories.find((c) => c.id === selectedCategoryId) || culturalCategories[0];

  return (
    <section
      className="relative min-h-screen w-full bg-gradient-to-b from-[#090611] via-[#0d091a] to-[#07050d] text-white pt-6 pb-20 overflow-hidden"
      aria-label="Cultural Festival at RVRJC OAT"
    >
      {/* Background Stage Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.22)_0%,rgba(217,70,239,0.1)_40%,transparent_75%)] pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Title & Subheading */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold uppercase tracking-widest text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>CULTURAL ARENA • OPEN AIR THEATRE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight font-['Outfit']">
            <span className="text-white">THE STAGE OF </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">
              EXPRESSION
            </span>
          </h2>

          <p className="text-sm sm:text-base text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
            Experience the RVRJC Open Air Theatre (OAT) in interactive 3D. Explore all six cultural categories, stage hotspots, and performance events.
          </p>

          <div className="pt-1">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-xs font-bold uppercase tracking-wider text-purple-200 hover:text-white transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-300" />
              <span>Register for Cultural Events (Free)</span>
            </button>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* A. 3D RVRJC OAT CENTRAL HERO EXPERIENCE */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <RvrjcOatCanvas
            selectedCategoryId={selectedCategoryId}
            hoveredCategoryId={hoveredCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onHoverCategory={setHoveredCategoryId}
            onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
          />

          {/* ========================================================================= */}
          {/* B. FLOATING CATEGORY CARDS (Synchronized with 3D Hotspots) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {culturalCategories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              const isHovered = hoveredCategoryId === category.id;
              const IconComp = getCategoryIcon(category.iconName);

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  onMouseEnter={() => setHoveredCategoryId(category.id)}
                  onMouseLeave={() => setHoveredCategoryId(null)}
                  className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-900/80 to-[#190e2d] border-amber-400 shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-102 ring-2 ring-amber-400/40'
                      : isHovered
                      ? 'bg-purple-950/60 border-purple-400 text-white shadow-lg scale-101'
                      : 'bg-white/[0.03] border-white/10 hover:border-purple-500/50 text-slate-300'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500 group-hover:text-white'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'text-amber-300 translate-x-0.5'
                          : 'text-slate-500 group-hover:text-purple-300'
                      }`}
                    />
                  </div>

                  <div>
                    <span
                      className={`block text-xs sm:text-sm font-black tracking-wider uppercase font-['Outfit'] ${
                        isSelected ? 'text-white' : 'group-hover:text-purple-200'
                      }`}
                    >
                      {category.name}
                    </span>
                    <span className="block text-[10px] text-purple-300/80 truncate mt-0.5">
                      {category.events.length} Events on OAT
                    </span>
                  </div>

                  {/* Little Active indicator */}
                  {isSelected && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-pink-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* C. CULTURAL EVENT PRESENTATION (Horizontal Cinematic Cards) */}
        {/* ========================================================================= */}
        <CulturalEventList
          category={activeCategory}
          onRegisterEvent={onRegisterEvent}
        />
      </div>

      {/* Real OAT Photo Gallery Modal */}
      <OatPhotoGalleryModal
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
      />
    </section>
  );
};
