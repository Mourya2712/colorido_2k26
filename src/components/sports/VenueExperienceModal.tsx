import React from 'react';
import type { VenueInfo } from '../../types';
import { campusVenues } from '../../data/festivalData';
import {
  X,
  MapPin,
  CheckCircle2,
  Building,
  Info,
  ShieldAlert,
  Users
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
  if (!venueId || !campusVenues[venueId]) return null;

  const venue: VenueInfo = campusVenues[venueId];
  const isCyan = accentTheme === 'cyan';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl rounded-3xl bg-[#0e0c15] border p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col space-y-6 ${
          isCyan ? 'border-cyan-500/40 shadow-cyan-950/50' : 'border-orange-500/40 shadow-orange-950/50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${
              isCyan ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
            }`}>
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  isCyan ? 'bg-cyan-500/20 text-cyan-300' : 'bg-orange-500/20 text-orange-300'
                }`}>
                  Official Tournament Venue
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-['Outfit'] mt-1">
                {venue.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{venue.locationDetails}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close venue details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Venue Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-purple-400" />
            <span>Venue Overview</span>
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            {venue.description}
          </p>
        </div>

        {/* Features & Facilities */}
        {venue.features && venue.features.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Court Features &amp; Infrastructure</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {venue.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-slate-200"
                >
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${isCyan ? 'text-cyan-400' : 'text-orange-400'}`} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reporting & Conduct Instructions */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-xs text-amber-200/90">
          <div className="flex items-center space-x-2 font-bold text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Tournament Reporting Notice</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-300/80">
            All teams must report to the venue referee desk at least 45 minutes prior to their scheduled match time with college ID cards. Sports attire and appropriate court footwear are mandatory.
          </p>
        </div>

        {/* Bottom Close Action */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer ${
              isCyan
                ? 'bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/30'
                : 'bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30'
            }`}
          >
            Close Venue Info
          </button>
        </div>
      </div>
    </div>
  );
};
