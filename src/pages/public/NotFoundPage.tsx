import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold uppercase tracking-widest text-red-400">
          <span>Error 404 • Page Not Found</span>
        </div>

        <h1 className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-['Outfit'] tracking-tighter">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-['Outfit'] uppercase">
            Off-Stage Signal Lost
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The page you are looking for has either moved to a different stage or does not exist on the COLORIDO 2K26 digital platform.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-600/20"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/cultural"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Cultural Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
