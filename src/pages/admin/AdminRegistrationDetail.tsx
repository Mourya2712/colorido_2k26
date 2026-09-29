import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminRegistration, updateRegistrationStatus, API_ORIGIN } from '../../lib/api';
import { ArrowLeft, Ticket, Printer, User, School, Phone, Music, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegDetail {
  id: string;
  registration_number: string;
  event_name: string;
  event_type: string;
  participant_name: string;
  email: string;
  phone: string;
  college_name: string;
  roll_number: string;
  department?: string;
  year_of_study?: string;
  gender?: string;
  team_name?: string;
  team_members?: any[];
  audio_file_url?: string;
  audio_file_name?: string;
  status: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
}

const AdminRegistrationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RegDetail | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAdminRegistration(id)
      .then((res) => {
        if (res.data?.registration) {
          setData(res.data.registration);
          setNotes(res.data.registration.notes || res.data.registration.admin_notes || '');
        }
      })
      .catch(() => {
        toast.error('Failed to load registration details from database');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateRegistrationStatus(id, newStatus, notes);
      if (data) setData({ ...data, status: newStatus, notes });
      toast.success(`Registration status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status on server');
    }
  };

  const handleSaveNotes = async () => {
    if (!id || !data) return;
    try {
      await updateRegistrationStatus(id, data.status, notes);
      setData({ ...data, notes });
      toast.success('Organizer internal notes saved.');
    } catch {
      toast.error('Failed to save notes on server');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading record...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center text-slate-400">
        <p className="text-sm mb-4">Registration record not found.</p>
        <Link to="/admin/registrations" className="text-xs text-purple-400 hover:underline">
          Return to Registrations List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-section-enter">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/registrations"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Registrations</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Entry Pass</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md p-6 sm:p-8 space-y-6">
        {/* Pass Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
              COLORIDO 2K26 Entry Pass
            </span>
            <h2 className="text-2xl font-black text-white font-['Outfit'] mt-1">{data.participant_name}</h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Registration No: <strong className="text-purple-300">{data.registration_number}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                data.status === 'confirmed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : data.status === 'checked_in'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : data.status === 'rejected'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {data.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase text-[10px]">
              <School className="w-3.5 h-3.5 text-purple-400" />
              <span>College & Academic Details</span>
            </div>
            <p className="text-white font-bold text-sm">{data.college_name}</p>
            <p className="text-slate-300">Roll No / Student ID: <strong className="text-white">{data.roll_number}</strong></p>
            <p className="text-slate-300">Department: {data.department || 'N/A'}</p>
            <p className="text-slate-300">Year: {data.year_of_study || 'N/A'}</p>
            {data.gender && <p className="text-slate-300">Gender: {data.gender}</p>}
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase text-[10px]">
              <Ticket className="w-3.5 h-3.5 text-pink-400" />
              <span>Event & Team Specifications</span>
            </div>
            <p className="text-white font-bold text-sm">{data.event_name}</p>
            <p className="text-slate-300">Type: <span className="capitalize">{data.event_type}</span></p>
            {data.team_name && <p className="text-purple-300 font-bold">Team Name: {data.team_name}</p>}
            <p className="text-slate-400 text-[10px]">Registered On: {new Date(data.created_at).toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase text-[10px]">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contact Coordinates</span>
            </div>
            <p className="text-white font-semibold">Phone: {data.phone}</p>
            <p className="text-slate-300">Email: {data.email}</p>
          </div>

          {data.team_members && data.team_members.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase text-[10px]">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Squad Members ({data.team_members.length})</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {data.team_members.map((m, idx) => (
                  <li key={idx}>
                    {typeof m === 'object' && m !== null
                      ? `${m.full_name || m.name || `Member #${idx + 2}`}${m.roll_number ? ` (${m.roll_number})` : ''}${m.phone ? ` - ${m.phone}` : ''}`
                      : String(m)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submitted Audio Track Panel (Requirement 2) */}
        {data.audio_file_url ? (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-amber-300 font-bold uppercase text-xs">
                <Music className="w-4 h-4 text-amber-400" />
                <span>Submitted Song / Audio File</span>
              </div>
              <a
                href={data.audio_file_url.startsWith('http') ? data.audio_file_url : `${API_ORIGIN}${data.audio_file_url}`}
                download={data.audio_file_name || 'track.mp3'}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center space-x-1.5 transition-colors self-start sm:self-auto shadow-md shadow-amber-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Audio File</span>
              </a>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Track Name: <strong className="text-white">{data.audio_file_name || 'Uploaded Track'}</strong>
            </p>
            <audio
              controls
              className="w-full h-10 rounded-lg outline-none"
              src={data.audio_file_url.startsWith('http') ? data.audio_file_url : `${API_ORIGIN}${data.audio_file_url}`}
            />
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 text-xs flex items-center space-x-2">
            <Music className="w-3.5 h-3.5 text-slate-500" />
            <span>No song / audio file was required or uploaded for this event.</span>
          </div>
        )}

        {/* Verification & Action Bar */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Status Controls</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleUpdateStatus('confirmed')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Approve / Confirm Pass
            </button>
            <button
              onClick={() => handleUpdateStatus('checked_in')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              Mark Checked In
            </button>
            <button
              onClick={() => handleUpdateStatus('pending')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
            >
              Set Pending
            </button>
            <button
              onClick={() => handleUpdateStatus('rejected')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
            >
              Reject Application
            </button>
          </div>
        </div>

        {/* Organizer Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300">Internal Organizer Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add verification notes (e.g. ID checked, music submitted, jersey kit issued)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
          />
          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
          >
            Save Internal Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrationDetail;
