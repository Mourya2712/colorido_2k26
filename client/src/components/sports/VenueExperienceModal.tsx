import React, { useState, useRef } from 'react';
import type { VenueInfo } from '../../types';
import { campusVenues } from '../../data/festivalData';
import {
  X,
  Compass,
  Video,
  MapPin,
  RotateCw,
} from 'lucide-react';


interface VenueExperienceModalProps {
  venueId: string | null;
  onClose: () => void;
  accentTheme?: 'orange' | 'cyan';
}

export const VenueExperienceModal: React.FC<VenueExperienceModalProps> = ({
  venueId,
  onClose,
  accentTheme = 'orange',
}) => {
  const [activeMode, setActiveMode] = useState<'360' | 'guided'>('guided');
  const [guidedAngleIndex, setGuidedAngleIndex] = useState(0);

  // 360 Drag Interaction State
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  if (!venueId || !campusVenues[venueId]) return null;

  const venue: VenueInfo = campusVenues[venueId];
  const isCyan = accentTheme === 'cyan';

  // 360 Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = Math.max(-100, Math.min(100, e.clientY - dragStart.current.y));
    setDragOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentAngle = venue.guidedViewAngles[guidedAngleIndex] || venue.guidedViewAngles[0];
  const currentImage = venue.images[currentAngle?.imageIndex || 0] || venue.images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-5xl rounded-3xl bg-[#0c0a12] border overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] ${
          isCyan ? 'border-cyan-500/40 shadow-cyan-950/40' : 'border-orange-500/40 shadow-orange-950/40'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl text-white ${
                isCyan ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-500/20 text-orange-300'
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase font-['Outfit']">
                {venue.name}
              </h3>
              <p className="text-xs text-slate-400">{venue.locationDetails}</p>
            </div>
          </div>

          {/* Mode Switcher Toggle: 360° EXPLORE vs GUIDED VIEW */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center p-1 rounded-xl bg-white/10 border border-white/15">
              <button
                onClick={() => setActiveMode('guided')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeMode === 'guided'
                    ? isCyan
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-orange-500 text-black shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>GUIDED VIEW</span>
              </button>

              <button
                onClick={() => setActiveMode('360')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeMode === '360'
                    ? isCyan
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-orange-500 text-black shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>360° EXPLORE</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close venue experience"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Display Container */}
        <div
          className="relative flex-1 min-h-[380px] sm:min-h-[480px] bg-black overflow-hidden select-none flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={activeMode === '360' ? handleMouseDown : undefined}
          onMouseMove={activeMode === '360' ? handleMouseMove : undefined}
          onMouseUp={activeMode === '360' ? handleMouseUp : undefined}
          onMouseLeave={activeMode === '360' ? handleMouseUp : undefined}
        >
          {/* MODE A: 360° EXPLORE (Draggable Interactive Panorama Simulation with Campus Asset) */}
          {activeMode === '360' ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out will-change-transform scale-125"
                style={{
                  backgroundImage: `url(${currentImage})`,
                  transform: `translate3d(${dragOffset.x % 600}px, ${dragOffset.y * 0.5}px, 0) scale(1.35)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />

              {/* 360 Compass & Gyro Affordance */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs text-white">
                <RotateCw className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Drag to look 360° across venue</span>
              </div>

              {/* Modular Notice: Ready for official spherical equirectangular stitch */}
              <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] text-slate-300">
                <span>Modular 360° Engine • Campus Reference</span>
              </div>

              {/* Center Crosshair Marker */}
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          ) : (
            /* MODE B: GUIDED VIEW (Cinematic Pan, Zoom, and Important Venue Features) */
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
                style={{
                  backgroundImage: `url(${currentImage})`,
                  transform: `scale(${currentAngle?.zoomLevel || 1.1})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

              {/* Active Guided Angle Banner */}
              <div className="absolute bottom-6 inset-x-6 sm:inset-x-12 p-4 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        isCyan ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-500/20 text-orange-300'
                      }`}
                    >
                      GUIDED ANGLE {guidedAngleIndex + 1} / {venue.guidedViewAngles.length}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white">
                      {currentAngle?.label}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    {currentAngle?.description}
                  </p>
                </div>

                {/* Angle Selector Pills */}
                <div className="flex items-center space-x-1.5">
                  {venue.guidedViewAngles.map((_, idx) => (
                    <button

                      key={idx}
                      onClick={() => setGuidedAngleIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        guidedAngleIndex === idx
                          ? isCyan
                            ? 'bg-cyan-500 text-black shadow-md'
                            : 'bg-orange-500 text-black shadow-md'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      Point {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Venue Architectural Features Footer */}
        <div className="px-6 py-4 bg-black/70 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
              Court Features:
            </span>
            <span className="text-slate-300">
              {venue.features.join(' • ')}
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Real RVR & JC Campus Ground Asset
          </div>
        </div>
      </div>
    </div>
  );
};
