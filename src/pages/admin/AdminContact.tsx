import React, { useState } from 'react';
import { Settings, MessageSquare, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  subject: string;
  message: string;
  status: 'new' | 'resolved';
  created_at: string;
}

const DEFAULT_INQUIRIES: InquiryItem[] = [
  {
    id: 'inq-1',
    name: 'K. Sai Teja',
    email: 'saiteja.k@vignan.ac.in',
    phone: '9849200112',
    college: 'Vignan University, Guntur',
    subject: 'Hostel Accommodation',
    message: 'We are a 14-member basketball contingent arriving on 25th evening from Visakhapatnam. Can we get hostel room allocation confirmed?',
    status: 'new',
    created_at: '2026-02-18T11:20:00Z',
  },
  {
    id: 'inq-2',
    name: 'P. Sneha Latha',
    email: 'sneha.dance@klu.in',
    phone: '9440188223',
    college: 'KL University',
    subject: 'Cultural Competitions',
    message: 'Can we use props such as acoustic guitars and light effects for Western Group Dance?',
    status: 'resolved',
    created_at: '2026-02-17T15:40:00Z',
  },
];

const AdminContact: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(DEFAULT_INQUIRIES);
  const [config, setConfig] = useState({
    festivalDates: 'February 26-27, 2026',
    registrationDeadline: 'February 22, 2026',
    helplinePhone: '+91 98480 12345',
    officialEmail: 'colorido2k26@rvrjc.ac.in',
    isRegistrationOpen: true,
  });

  const handleResolve = (id: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: inq.status === 'new' ? 'resolved' : 'new' } : inq))
    );
    toast.success('Inquiry status updated');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('colorido_system_config', JSON.stringify(config));
    toast.success('Festival configuration saved globally!');
  };

  return (
    <div className="space-y-8 animate-section-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white font-['Outfit']">Queries & System Configuration</h1>
        <p className="text-xs text-slate-400">Handle candidate communications and central festival parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inquiries */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Public Candidate Inquiries ({inquiries.length})</span>
          </div>

          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{inq.name}</span>
                      <span className="text-[10px] text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {inq.subject}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{inq.college}</p>
                  </div>
                  <button
                    onClick={() => handleResolve(inq.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      inq.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                  >
                    {inq.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  "{inq.message}"
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5 gap-2">
                  <span>Phone: {inq.phone} • Email: {inq.email}</span>
                  <span className="text-[10px]">{new Date(inq.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-white/10 bg-[#0f0c1b]/90 backdrop-blur-md p-6 space-y-5">
            <div className="flex items-center space-x-2 text-xs font-bold text-pink-400 uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>Central Parameters</span>
            </div>
            <h3 className="text-lg font-black text-white font-['Outfit']">Festival Global Setup</h3>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Official Festival Dates</label>
                <input
                  type="text"
                  value={config.festivalDates}
                  onChange={(e) => setConfig({ ...config, festivalDates: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Registration Cutoff Date</label>
                <input
                  type="text"
                  value={config.registrationDeadline}
                  onChange={(e) => setConfig({ ...config, registrationDeadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Primary Helpline Mobile</label>
                <input
                  type="text"
                  value={config.helplinePhone}
                  onChange={(e) => setConfig({ ...config, helplinePhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Official Desk Email</label>
                <input
                  type="email"
                  value={config.officialEmail}
                  onChange={(e) => setConfig({ ...config, officialEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <input
                    type="checkbox"
                    checked={config.isRegistrationOpen}
                    onChange={(e) => setConfig({ ...config, isRegistrationOpen: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-purple-600 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Accepting Online Registrations</span>
                    <span className="text-[10px] text-slate-400">Controls public registration portal availability</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;
