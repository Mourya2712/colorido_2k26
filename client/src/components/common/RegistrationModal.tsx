import React, { useState } from 'react';
import type { BaseEvent, SportsEvent } from '../../types';
import { festivalConfig } from '../../data/festivalData';
import { X, CheckCircle, ExternalLink, Ticket, ShieldCheck, MapPin, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent?: BaseEvent | SportsEvent | null;
  defaultCategory?: 'cultural' | 'boysSports' | 'girlsSports';
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  defaultCategory = 'cultural',
}) => {
  const [activeFormType, setActiveFormType] = useState<'cultural' | 'boysSports' | 'girlsSports'>(
    selectedEvent?.registrationType || defaultCategory
  );
  const [showRedirectNotice, setShowRedirectNotice] = useState(false);

  // Sync state when props change
  React.useEffect(() => {
    if (selectedEvent) {
      setActiveFormType(selectedEvent.registrationType);
    } else {
      setActiveFormType(defaultCategory);
    }
    setShowRedirectNotice(false);
  }, [selectedEvent, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const getFormUrl = () => {
    switch (activeFormType) {
      case 'boysSports':
        return festivalConfig.registrationUrls.boysSports;
      case 'girlsSports':
        return festivalConfig.registrationUrls.girlsSports;
      case 'cultural':
      default:
        return festivalConfig.registrationUrls.cultural;
    }
  };

  const getFormTitle = () => {
    switch (activeFormType) {
      case 'boysSports':
        return 'Boys Sports Registration Form';
      case 'girlsSports':
        return 'Girls Sports Registration Form';
      case 'cultural':
      default:
        return 'Cultural Events Registration Form';
    }
  };

  const getCategoryBadge = () => {
    switch (activeFormType) {
      case 'boysSports':
        return {
          label: 'BOYS SPORTS ARENA',
          classes: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        };
      case 'girlsSports':
        return {
          label: 'GIRLS SPORTS ARENA',
          classes: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      case 'cultural':
      default:
        return {
          label: 'CULTURAL FESTIVAL',
          classes: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
    }
  };

  const handleContinue = () => {
    // Fire celebratory cinematic confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#f97316', '#06b6d4', '#eab308'],
      });
    } catch {
      // Fallback gracefully
    }

    const url = getFormUrl();
    setShowRedirectNotice(true);

    // If valid URL, open in new tab; if placeholder, user sees explanatory prompt
    if (url.startsWith('http')) {
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 700);
    }
  };

  const badge = getCategoryBadge();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#13111e] via-[#0c0a15] to-[#07070a] border border-white/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-purple-500/20 via-pink-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3 shadow-inner">
            <span className={badge.classes + ' px-2.5 py-0.5 rounded-full border'}>
              {badge.label}
            </span>
          </div>

          <h3
            id="reg-modal-title"
            className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-['Outfit']"
          >
            {selectedEvent ? (
              <>
                REGISTER FOR{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                  {selectedEvent.name}
                </span>
              </>
            ) : (
              <>
                OFFICIAL FESTIVAL{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                  REGISTRATION
                </span>
              </>
            )}
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            COLORIDO 2K26 • RVR & JC College of Engineering
          </p>
        </div>

        {/* If no specific event is selected, provide category selector */}
        {!selectedEvent && (
          <div className="mb-6 grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveFormType('cultural')}
              className={`p-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeFormType === 'cultural'
                  ? 'border-purple-500 bg-purple-950/60 text-purple-200 shadow-md'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              Cultural
            </button>

            <button
              onClick={() => setActiveFormType('boysSports')}
              className={`p-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeFormType === 'boysSports'
                  ? 'border-orange-500 bg-orange-950/60 text-orange-200 shadow-md'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 mx-auto mb-1 text-orange-400" />
              Boys Sports
            </button>

            <button
              onClick={() => setActiveFormType('girlsSports')}
              className={`p-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeFormType === 'girlsSports'
                  ? 'border-cyan-500 bg-cyan-950/60 text-cyan-200 shadow-md'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              Girls Sports
            </button>
          </div>
        )}

        {/* Cinematic Details Box */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 space-y-3.5 mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Registration Fee
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FREE • NO REGISTRATION FEE</span>
            </span>
          </div>

          <div className="flex items-start justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Assigned Venue:</span>
            <div className="text-right flex items-center space-x-1 font-semibold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{selectedEvent ? selectedEvent.venue : 'Designated Campus Venues'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Festival Dates:</span>
            <span className="font-semibold text-amber-300/90">{festivalConfig.dates}</span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Destination Form:</span>
            <span className="font-semibold text-slate-200">{getFormTitle()}</span>
          </div>
        </div>

        {/* Note on Google Form aggregation */}
        <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 mb-6 text-xs text-purple-200/90 flex items-start space-x-2.5">
          <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p>
            Official registrations for COLORIDO 2K26 are processed through exactly 3 centralized Google Forms (Cultural, Boys Sports, & Girls Sports). You can select your event inside the form.
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            className="w-full group relative flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:shadow-[0_0_40px_rgba(217,70,239,0.7)] hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-amber-200" />
            <span>CONTINUE TO REGISTRATION</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {showRedirectNotice && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center animate-in fade-in">
              <p className="text-xs text-amber-300 font-medium">
                Opening Official Form URL: <br />
                <code className="text-[11px] text-slate-300 font-mono bg-black/40 px-2 py-0.5 rounded mt-1 inline-block">
                  {getFormUrl()}
                </code>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                (Note: Placeholder will be replaced by the organizing committee once live)
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Return to Fest Exploration
          </button>
        </div>
      </div>
    </div>
  );
};
