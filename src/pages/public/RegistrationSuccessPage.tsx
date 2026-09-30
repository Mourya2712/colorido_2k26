import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Share2, ShieldCheck, Home, Music } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { getRegistrationByNumber, API_ORIGIN } from '../../lib/api';
import { downloadEPassPDF, type TeamMemberData } from '../../utils/generateEPassPDF';

interface RegDetails {
  id?: string;
  registration_number: string;
  event_id?: string;
  event_name: string;
  event_type?: string;
  registration_type?: string;
  category_name?: string;
  participant_name: string;
  email?: string;
  phone?: string;
  college_name: string;
  roll_number: string;
  department?: string;
  year_of_study?: string;
  gender?: string;
  team_name?: string;
  team_members?: TeamMemberData[] | string;
  venue?: string;
  event_date?: string;
  start_time?: string;
  status: string;
  created_at: string;
  audio_file_url?: string;
  audio_file_name?: string;
}

const RegistrationSuccessPage: React.FC = () => {
  const { regNumber } = useParams<{ regNumber: string }>();
  const [regData, setRegData] = useState<RegDetails | null>(null);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Try fetching from server API first
    if (regNumber) {
      getRegistrationByNumber(regNumber)
        .then((res) => {
          if (res.data?.registration) {
            setRegData(res.data.registration);
          }
        })
        .catch(() => {
          // Fallback to localStorage
          const localItem = localStorage.getItem(`reg_${regNumber}`);
          if (localItem) {
            try {
              setRegData(JSON.parse(localItem));
            } catch {
              // fallback
            }
          }
        });
    }
  }, [regNumber]);

  const parsedTeamMembers: TeamMemberData[] = React.useMemo(() => {
    if (!regData?.team_members) return [];
    if (Array.isArray(regData.team_members)) return regData.team_members;
    if (typeof regData.team_members === 'string') {
      try {
        const p = JSON.parse(regData.team_members);
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [regData?.team_members]);

  const isTeam = (regData?.registration_type || '').toLowerCase() === 'team' ||
    Boolean(regData?.team_name) ||
    parsedTeamMembers.length > 0;

  const handleDownloadPDF = () => {
    if (!regData) {
      toast.error('Registration details are still loading. Please wait.');
      return;
    }
    try {
      downloadEPassPDF(regData);
      toast.success('Registration document downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My COLORIDO 2K26 E-Pass',
        text: `I just registered for COLORIDO 2K26 at R.V.R. & J.C. College of Engineering! Registration No: ${regNumber}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('E-Pass link copied to clipboard!');
    }
  };

  const formatCategory = (type?: string, catName?: string) => {
    if (catName) return catName;
    const lower = (type || '').toLowerCase();
    if (lower.includes('boy')) return 'Boys Sports';
    if (lower.includes('girl')) return 'Girls Sports';
    return 'Cultural';
  };

  return (
    <div className="min-h-screen bg-[#07070a] pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Celebration Header */}
        <div className="text-center py-6 space-y-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            Registration Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Welcome to <strong className="text-purple-400">COLORIDO 2K26</strong>. Your official entry pass is ready.
          </p>
        </div>

        {/* Official E-Pass Card */}
        <div
          id="festival-e-pass"
          className="relative rounded-3xl border-2 border-purple-500/40 bg-gradient-to-b from-[#161226] via-[#0d0a17] to-[#07070a] p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple-600/25 my-6 overflow-hidden"
        >
          {/* Top holographic stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400" />

          {/* Header */}
          <div className="text-center border-b border-white/10 pb-5 mb-6">
            <p className="text-xs sm:text-sm font-black tracking-widest text-slate-300 uppercase">
              R.V.R. &amp; J.C. COLLEGE OF ENGINEERING
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Chandramoulipuram, Chowdavaram, Guntur, Andhra Pradesh - 522019
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 font-['Outfit'] mt-1 tracking-wide uppercase">
              COLORIDO 2K26 — OFFICIAL REGISTRATION E-PASS
            </h2>
            <div className="inline-block mt-2 px-4 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs tracking-widest uppercase">
              {isTeam ? 'TEAM REGISTRATION E-PASS' : 'INDIVIDUAL REGISTRATION E-PASS'}
            </div>
          </div>

          {/* Registration Number (Large, Prominent) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">
                E-Pass / Registration Number
              </span>
              <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-mono tracking-wider">
                {regNumber || regData?.registration_number || 'CD26000001'}
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-end space-y-1">
              <span className="inline-flex items-center space-x-1.5 text-xs font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Status: {(regData?.status || 'Confirmed').toUpperCase()}</span>
              </span>
              {regData?.created_at && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(regData.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Section 1: Registered Event Information */}
          <div className="mb-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <span className="w-1.5 h-3 bg-purple-500 rounded-sm" />
              <span>Registered Event Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Event Name</span>
                <p className="font-bold text-white text-sm">{regData?.event_name || 'Festival Event'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Category & Type</span>
                <p className="font-bold text-purple-300 text-sm">
                  {formatCategory(regData?.event_type, regData?.category_name)} • {isTeam ? 'Team' : 'Individual'}
                </p>
              </div>

              {regData?.venue && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Event Venue</span>
                  <p className="font-bold text-white text-sm">{regData.venue}</p>
                </div>
              )}

              {regData?.event_date && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Schedule Date & Time</span>
                  <p className="font-bold text-amber-300 text-sm">
                    {regData.event_date}{regData.start_time ? ` • ${regData.start_time}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Submitted Participant Details */}
          <div className="mb-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <span className="w-1.5 h-3 bg-indigo-500 rounded-sm" />
              <span>{isTeam ? 'Participant / Team Leader Information' : 'Participant Registration Information'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Full Name</span>
                <p className="font-bold text-white text-sm">{regData?.participant_name || 'Participant'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Roll Number / Student ID</span>
                <p className="font-bold text-white text-sm font-mono">{regData?.roll_number || 'N/A'}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">College / Institution</span>
                <p className="font-bold text-white text-sm leading-snug">{regData?.college_name || 'N/A'}</p>
              </div>

              {regData?.department && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Department / Branch</span>
                  <p className="font-bold text-slate-200 text-sm">{regData.department}</p>
                </div>
              )}

              {regData?.email && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Email Address</span>
                  <p className="font-semibold text-slate-300 text-xs font-mono truncate">{regData.email}</p>
                </div>
              )}

              {regData?.phone && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Mobile Number</span>
                  <p className="font-semibold text-slate-300 text-xs font-mono">{regData.phone}</p>
                </div>
              )}

              {(regData?.year_of_study || regData?.gender) && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Additional Details</span>
                  <p className="font-semibold text-slate-300 text-xs">
                    {[
                      regData.year_of_study ? `Year: ${regData.year_of_study}` : null,
                      regData.gender ? `Gender: ${regData.gender}` : null,
                    ].filter(Boolean).join('  •  ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Registered Team & Members (ONLY FOR TEAM REGISTRATIONS) */}
          {isTeam && (
            <div className="mb-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-3 bg-amber-500 rounded-sm" />
                  <span>Registered Team: {regData?.team_name || 'N/A'}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {parsedTeamMembers.length} Registered Members
                </span>
              </h3>

              {parsedTeamMembers.length > 0 && (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-300">
                        <tr>
                          <th className="py-2 px-3 w-8">#</th>
                          <th className="py-2 px-3">Member Name</th>
                          <th className="py-2 px-3">Roll / ID</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">College</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {parsedTeamMembers.map((member, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-white">{member.full_name || 'Member'}</td>
                            <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">{member.roll_number || '—'}</td>
                            <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{member.phone || '—'}</td>
                            <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]">{member.college || regData?.college_name || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submitted Audio Track for Cultural Events */}
          {regData?.audio_file_url && (
            <div className="mb-5 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                <Music className="w-4 h-4 text-purple-400" />
                <span>Uploaded Performance Track / Song</span>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                File: <strong className="text-white">{regData.audio_file_name || 'Attached Audio Track'}</strong>
              </p>
              <audio
                controls
                className="w-full h-9 rounded-lg outline-none"
                src={regData.audio_file_url.startsWith('http') ? regData.audio_file_url : `${API_ORIGIN}${regData.audio_file_url}`}
              />
            </div>
          )}

          {/* Verification Box */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-slate-200 text-xs leading-relaxed">
            <p className="font-bold text-amber-300 mb-0.5 text-[11px] uppercase tracking-wider">
              Official Verification Notice
            </p>
            <p className="text-[11px] text-slate-400">
              This computer-generated document confirms official registration for COLORIDO 2K26. Please present this E-Pass along with your original college identity card at the reporting desk.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download E-Pass</span>
          </button>
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessPage;


