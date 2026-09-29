import React from 'react';
import { festivalConfig } from '../../data/festivalData';
import { Sparkles, Calendar, Zap } from 'lucide-react';

interface AnnouncementTickerProps {
  onRegisterClick?: () => void;
}

export const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ onRegisterClick }) => {
  const tickerItems = [
    { text: 'NO REGISTRATION FEE', isHighlight: true, icon: Zap },
    { text: 'COLORIDO 2K26', isHighlight: false, icon: Sparkles },
    { text: festivalConfig.dates, isHighlight: false, icon: Calendar },
    { text: 'REGISTER NOW', isHighlight: true, icon: Zap },
    { text: 'RVR & JC COLLEGE OF ENGINEERING', isHighlight: false, icon: null },
    { text: 'CULTURAL & SPORTS EXTRAVAGANZA', isHighlight: false, icon: null },
  ];

  return (
    <div
      role="region"
      aria-label="Festival announcements"
      className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-purple-950/90 via-black/95 to-slate-950/90 border-b border-white/10 py-2.5 backdrop-blur-md"
    >
      <div className="flex w-max animate-ticker items-center select-none text-xs md:text-sm font-medium tracking-wider text-slate-300">
        {/* Repeat sequence twice for seamless infinite looping */}
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} className="flex items-center space-x-6 pr-6">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                {item.icon && (
                  <item.icon
                    className={`w-3.5 h-3.5 ${
                      item.isHighlight ? 'text-amber-400 animate-pulse' : 'text-purple-400'
                    }`}
                  />
                )}
                {item.isHighlight ? (
                  <button
                    onClick={onRegisterClick}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-widest bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 text-amber-300 border border-amber-400/30 hover:border-amber-400 hover:text-amber-200 transition-colors shadow-sm cursor-pointer"
                  >
                    {item.text}
                  </button>
                ) : (
                  <span className="text-slate-300/90 hover:text-white transition-colors">
                    {item.text}
                  </span>
                )}
                <span className="text-white/20 font-bold">•</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
