import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, updateRegistrationStatus, getSiteConfig, updateSiteConfig } from '../../lib/api';
import {
  Users, Ticket, Trophy, Calendar, Megaphone,
  CheckCircle, ArrowUpRight,
  Download, ShieldCheck, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalRegistrations: number;
  culturalCount: number;
  boysSportsCount: number;
  girlsSportsCount: number;
  sportsCount: number;
  pendingCount: number;
  confirmedCount: number;
  totalEvents?: number;
}

interface RecentReg {
  id: string;
  registration_number: string;
  event_name: string;
  participant_name: string;
  college_name: string;
  event_type: string;
  status: string;
  created_at: string;
}

const INITIAL_STATS: DashboardStats = {
  totalRegistrations: 0,
  culturalCount: 0,
  boysSportsCount: 0,
  girlsSportsCount: 0,
  sportsCount: 0,
  pendingCount: 0,
  confirmedCount: 0,
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [recentRegs, setRecentRegs] = useState<RecentReg[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [festivalDates, setFestivalDates] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>('');
  const [savingDate, setSavingDate] = useState<boolean>(false);

  const fetchDashboardData = () => {
    getAdminDashboard()
      .then((res) => {
        if (res.data?.stats) {
          const s = res.data.stats;
          setStats({
            totalRegistrations: s.total_registrations ?? s.totalRegistrations ?? 0,
            culturalCount: s.cultural_registrations ?? s.culturalCount ?? 0,
            boysSportsCount: s.boys_sports_registrations ?? s.boysSportsCount ?? 0,
            girlsSportsCount: s.girls_sports_registrations ?? s.girlsSportsCount ?? 0,
            sportsCount:
              (s.boys_sports_registrations ?? s.boysSportsCount ?? 0) +
              (s.girls_sports_registrations ?? s.girlsSportsCount ?? 0) ||
              (s.sports_registrations ?? s.sportsCount ?? 0),
            pendingCount: s.pending_registrations ?? s.pendingCount ?? 0,
            confirmedCount: s.confirmed_registrations ?? s.confirmedCount ?? 0,
            totalEvents: s.total_events ?? 19,
          });
        }
        if (res.data?.recentRegistrations) {
          setRecentRegs(res.data.recentRegistrations);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
    // Load current festival dates from site_config
    getSiteConfig()
      .then((res) => {
        const d = res.data?.festival_dates;
        if (d && d !== '[OFFICIAL DATE TO BE UPDATED]') {
          setFestivalDates(d);
          setDateInput(d);
        } else {
          setFestivalDates('');
          setDateInput('');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveDate = async () => {
    const val = dateInput.trim();
    if (!val) {
      toast.error('Please enter a date before saving.');
      return;
    }
    setSavingDate(true);
    try {
      await updateSiteConfig('festival_dates', val);
      setFestivalDates(val);
      toast.success('Festival date updated! It will now appear on the public home page.');
    } catch {
      toast.error('Failed to save festival date.');
    } finally {
      setSavingDate(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      toast.success(`Registration status updated to ${newStatus}`);
      fetchDashboardData();
    } catch {
      setRecentRegs((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success(`Registration status updated to ${newStatus}`);
    }
  };

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Reg Number,Event,Participant,College,Category,Status,Date'].join(',') +
      '\n' +
      recentRegs
        .map(
          (r) =>
            `"${r.registration_number}","${r.event_name}","${r.participant_name}","${r.college_name}","${r.event_type}","${r.status}","${r.created_at}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'colorido_2k26_registrations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Registration report exported to CSV!');
  };

  return (
    <div className="space-y-8 animate-section-enter">
      {/* Top Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-950/40 via-[#0d0b15] to-pink-950/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
            Festival Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
            Executive Organizer Console
          </h1>
          <p className="text-xs text-slate-400">
            Real-time candidate registrations, event tracking, and central communications for RVR & JC College.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center space-x-2 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
          <Link
            to="/admin/registrations"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-purple-600/20"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>All Registrations</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Enrolled</span>
            <Ticket className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white font-['Outfit']">{stats.totalRegistrations}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Real-time DB records</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cultural</span>
            <Users className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-3xl font-black text-pink-400 font-['Outfit']">{stats.culturalCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Dance, Music, Fine Arts</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Boys Sports</span>
            <Trophy className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-3xl font-black text-orange-400 font-['Outfit']">{stats.boysSportsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Volleyball, Basketball, TT</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Girls Sports</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 font-['Outfit']">{stats.girlsSportsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Throwball, Tennikoit, TT</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 p-5 backdrop-blur-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed Passes</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-['Outfit']">{stats.confirmedCount}</p>
          <p className="text-[10px] text-amber-400 mt-1">{stats.pendingCount} pending verification</p>
        </div>
      </div>

      {/* ── Festival Event Date ────────────────────────────────────── */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-[#0d0b15] to-pink-950/30 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
                Festival Event Date
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sets the date displayed on the public home page.{' '}
              {festivalDates ? (
                <span className="text-emerald-400 font-semibold">Currently: {festivalDates}</span>
              ) : (
                <span className="text-amber-400 font-semibold">No date set — showing fallback text.</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              id="festival-date-input"
              type="text"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="e.g. 25 May – 1 June 2026"
              className="flex-1 sm:w-72 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all"
            />
            <button
              onClick={handleSaveDate}
              disabled={savingDate}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingDate ? 'Saving…' : 'Save Date'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/announcements"
          className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:scale-105 transition-transform">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">Post Bulletin</p>
            <p className="text-[10px] text-slate-400">Live announcements</p>
          </div>
        </Link>

        <Link
          to="/admin/results"
          className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Publish Results</p>
            <p className="text-[10px] text-slate-400">Winners podium</p>
          </div>
        </Link>

        <Link
          to="/admin/schedule"
          className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Manage Schedule</p>
            <p className="text-[10px] text-slate-400">Timeline & venues</p>
          </div>
        </Link>

        <Link
          to="/admin/events"
          className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Event Rules</p>
            <p className="text-[10px] text-slate-400">Capacity & status</p>
          </div>
        </Link>
      </div>

      {/* Recent Registrations Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">Recent Registrations</h3>
            <p className="text-xs text-slate-400">Live incoming applications from the registration portal</p>
          </div>
          <Link
            to="/admin/registrations"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Pass No.</th>
                <th className="px-6 py-3">Candidate / Team</th>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">College</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {recentRegs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No registrations found in the central database.
                  </td>
                </tr>
              ) : (
                recentRegs.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3 font-mono text-purple-300 font-semibold">
                      {reg.registration_number}
                    </td>
                    <td className="px-6 py-3 font-medium text-white">
                      {reg.participant_name}
                    </td>
                    <td className="px-6 py-3">
                      <span className="truncate block max-w-xs">{reg.event_name}</span>
                    </td>
                    <td className="px-6 py-3 text-slate-400 truncate max-w-xs">
                      {reg.college_name}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          reg.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : reg.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      {reg.status === 'pending' ? (
                        <button
                          onClick={() => handleStatusChange(reg.id, 'confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(reg.id, 'checked_in')}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 font-bold text-[10px] uppercase transition-colors cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
