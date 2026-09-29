import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BaseEvent, SportsEvent } from '../../types';
import { festivalConfig } from '../../data/festivalData';
import { X, Ticket, ShieldCheck, MapPin, Sparkles, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
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
  const navigate = useNavigate();
  const [activeFormType, setActiveFormType] = useState<'cultural' | 'boysSports' | 'girlsSports'>(
    selectedEvent?.registrationType || defaultCategory
  );
  const [selectedSport, setSelectedSport] = useState<{ id: string; name: string } | null>(null);

  // Sync state when props change
  React.useEffect(() => {
    if (selectedEvent) {
      setActiveFormType(selectedEvent.registrationType);
    } else {
      setActiveFormType(defaultCategory);
    }
  }, [selectedEvent, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const getCategoryBadge = () => {
    switch (activeFormType) {
      case 'boysSports':
        return { label: 'BOYS SPORTS ARENA', classes: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'girlsSports':
        return { label: 'GIRLS SPORTS ARENA', classes: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'cultural':
      default:
        return { label: 'CULTURAL FESTIVAL', classes: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    }
  };

  const handleProceedToRegistration = () => {
    // Celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#f97316', '#06b6d4', '#eab308'],
      });
    } catch {
      // ignore
    }

    // Navigate to the in-website registration page with event pre-selected
    const slug = selectedEvent?.id;
    const path = slug ? `/register/${slug}` : `/register?category=${activeFormType}`;
    onClose();
    setTimeout(() => navigate(path), 150);
  };

  const badge = getCategoryBadge();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reg-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
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
          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-black tracking-widest uppercase mb-3 ${badge.classes}`}>
            {badge.label}
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
                FESTIVAL{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                  REGISTRATION
                </span>
              </>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            COLORIDO 2K26 • RVR &amp; JC College of Engineering
          </p>
        </div>

        {/* Category selector (only when no specific event) */}
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
              onClick={() => { setActiveFormType('boysSports'); setSelectedSport(null); }}
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
              onClick={() => { setActiveFormType('girlsSports'); setSelectedSport(null); }}
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

        {/* Clear Sports Event Selection Options (Requirement 1) */}
        {!selectedEvent && (activeFormType === 'boysSports' || activeFormType === 'girlsSports') && (
          <div className="mb-5 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-300 tracking-wider block">
              Select {activeFormType === 'boysSports' ? 'Boys Sport' : 'Girls Sport'}:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(activeFormType === 'boysSports'
                ? [
                    { id: 'volleyball-boys', name: 'Volleyball' },
                    { id: 'basketball-boys', name: 'Basketball' },
                    { id: 'table-tennis-boys', name: 'Table Tennis' },
                  ]
                : [
                    { id: 'throwball-girls', name: 'Throwball' },
                    { id: 'tennikoit-girls', name: 'Tennikoit' },
                    { id: 'table-tennis-girls', name: 'Table Tennis' },
                  ]
              ).map((sport) => {
                const isSelected = selectedSport?.id === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => setSelectedSport(sport)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? activeFormType === 'boysSports'
                          ? 'border-orange-400 bg-orange-950/80 text-orange-200 font-bold ring-1 ring-orange-400'
                          : 'border-cyan-400 bg-cyan-950/80 text-cyan-200 font-bold ring-1 ring-cyan-400'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-xs block">{sport.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 space-y-3.5 mb-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Registration Fee</span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>FREE • NO REGISTRATION FEE</span>
            </span>
          </div>

          {(selectedEvent || selectedSport) && (
            <div className="flex items-start justify-between text-xs sm:text-sm">
              <span className="text-slate-400 font-medium">Selected Event:</span>
              <span className="font-semibold text-white text-right">
                {selectedEvent ? selectedEvent.name : selectedSport?.name}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Venue:</span>
            <div className="text-right flex items-center space-x-1 font-semibold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{selectedEvent ? selectedEvent.venue : 'Designated Campus Venues'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-medium">Festival Dates:</span>
            <span className="font-semibold text-amber-300/90">{festivalConfig.dates}</span>
          </div>
        </div>

        {/* Registration Limit Warning Note (Requirement 6) */}
        <div className="bg-amber-950/20 border border-amber-500/25 rounded-xl p-3 mb-5 text-xs text-amber-200/90 flex items-start space-x-2.5">
          <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important Notice:</strong> Please ensure that all your registration details are correct before submitting. Once submitted, changes cannot be made.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleProceedToRegistration}
            className="w-full group relative flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:shadow-[0_0_40px_rgba(217,70,239,0.7)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-amber-200" />
            <span>PROCEED TO REGISTRATION FORM</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

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
