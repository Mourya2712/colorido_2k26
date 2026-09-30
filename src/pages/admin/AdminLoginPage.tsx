import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { festivalConfig } from '../../data/festivalData';
import toast from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Organizer access granted. Welcome to COLORIDO Console!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      const errMsg = err?.response?.data?.error || err?.message || 'Invalid email or password. Please verify your credentials.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0d0b15]/90 backdrop-blur-xl p-8 shadow-2xl shadow-purple-950/40">
          {/* Header */}
          <div className="text-center mb-8">
            {/* RVRJC College Logo */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 bg-white/95 p-1.5 shadow-xl shadow-purple-900/20 mx-auto mb-4 flex items-center justify-center">
              <img
                src={festivalConfig.collegeLogoAsset}
                alt="R.V.R. & J.C. College of Engineering Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.tried) {
                    target.dataset.tried = 'true';
                    target.src = '/assets/rvrjc.jpg';
                  }
                }}
              />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-1">
              R.V.R. &amp; J.C. COLLEGE OF ENGINEERING
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-wide">
              COLORIDO 2K26
            </h1>
            <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mt-1">
              ADMIN PORTAL
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@colorido.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Return to Festival Public Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
