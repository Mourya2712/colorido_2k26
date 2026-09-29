import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { culturalCategories, boysSportsEvents, girlsSportsEvents } from '../../data/festivalData';
import { getEvents, registerForEvent, uploadAudioFile } from '../../lib/api';
import {
  Ticket, ShieldCheck, ArrowRight, Users, User, AlertCircle,
  CheckCircle, Trophy, Sparkles, ChevronDown, Loader2, Clock, Upload, Music, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MemberField {
  full_name: string;
  roll_number: string;
  phone: string;
  college: string;
}

const EMPTY_MEMBER: MemberField = { full_name: '', roll_number: '', phone: '', college: '' };

const departments = [
  'Computer Science (CSE)', 'Information Technology (IT)', 'Electronics & Comm (ECE)',
  'Electrical & Electronics (EEE)', 'Mechanical Engineering', 'Civil Engineering',
  'AI & Data Science / ML', 'MBA / MCA', 'Other',
];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG / Post Graduate'];

const RegisterPage: React.FC = () => {
  const { eventSlug, eventId } = useParams<{ eventSlug?: string; eventId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCat = queryParams.get('category') === 'boysSports'
    ? 'boysSports'
    : queryParams.get('category') === 'girlsSports'
    ? 'girlsSports'
    : 'cultural';

  /* ── Live Events State from Backend ── */
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  /* ── Category & Event Selection ── */
  const [categoryType, setCategoryType] = useState<'cultural' | 'boysSports' | 'girlsSports'>(initialCat);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  /* ── Participant Details ── */
  const [participantName, setParticipantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState(departments[0]);
  const [customDepartment, setCustomDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(years[2]);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  /* ── Team Details ── */
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<MemberField[]>([]);

  /* ── Audio Upload State ── */
  const [audioFileUrl, setAudioFileUrl] = useState<string>('');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [uploadingAudio, setUploadingAudio] = useState(false);

  /* ── Submission State ── */
  const [submitting, setSubmitting] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [formError, setFormError] = useState('');

  /* ── Countdown Timer State ── */
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Fetch live events from API
  useEffect(() => {
    let isMounted = true;
    const fetchLiveEvents = async () => {
      try {
        const res = await getEvents();
        if (isMounted && res.data?.events && Array.isArray(res.data.events)) {
          setLiveEvents(res.data.events);
        }
      } catch (err) {
        console.warn('Could not fetch live events from API, using fallback data:', err);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    };
    fetchLiveEvents();
    return () => { isMounted = false; };
  }, []);

  /* ── Derived Event Lists (Unified from API or local fallback) ── */
  const allCulturalFallback = culturalCategories.flatMap((c) =>
    c.events.map((e) => ({
      id: e.id,
      slug: e.id,
      name: e.name,
      category: c.name,
      type: 'cultural',
      gender: 'all',
      description: e.shortDescription,
      venue_name: e.venue,
      min_team_size: e.teamSize?.includes('-') ? parseInt(e.teamSize.split('-')[0]) : e.teamSize?.includes('Individual') ? 1 : 1,
      max_team_size: e.teamSize?.includes('-') ? parseInt(e.teamSize.split('-')[1]) : e.teamSize?.includes('Individual') ? 1 : 2,
      team_size_label: e.teamSize,
      is_registration_open: 1,
      registration_deadline: '2026-10-15T23:59:59.000Z',
      requires_audio: e.name.toLowerCase().includes('dance') || e.name.toLowerCase().includes('vocals') ? 1 : 0,
      rules: e.rules,
    }))
  );

  const allBoysFallback = boysSportsEvents.map((e) => ({
    id: e.id,
    slug: e.id,
    name: e.name,
    category: 'Boys Sports',
    type: 'sports',
    gender: 'boys',
    description: e.shortDescription,
    venue_name: e.venue,
    min_team_size: e.teamSize?.includes('Individual') ? 1 : 5,
    max_team_size: e.teamSize?.includes('+') ? 12 : e.teamSize?.includes('Individual') ? 1 : 10,
    team_size_label: e.teamSize,
    is_registration_open: 1,
    registration_deadline: '2026-10-15T23:59:59.000Z',
    requires_audio: 0,
    rules: e.rules,
  }));

  const allGirlsFallback = girlsSportsEvents.map((e) => ({
    id: e.id,
    slug: e.id,
    name: e.name,
    category: 'Girls Sports',
    type: 'sports',
    gender: 'girls',
    description: e.shortDescription,
    venue_name: e.venue,
    min_team_size: e.teamSize?.includes('Individual') ? 1 : 5,
    max_team_size: e.teamSize?.includes('+') ? 12 : e.teamSize?.includes('Individual') ? 1 : 10,
    team_size_label: e.teamSize,
    is_registration_open: 1,
    registration_deadline: '2026-10-15T23:59:59.000Z',
    requires_audio: 0,
    rules: e.rules,
  }));

  const eventPool = liveEvents.length > 0 ? liveEvents : [...allCulturalFallback, ...allBoysFallback, ...allGirlsFallback];

  const culturalList = eventPool.filter((e) =>
    e.type === 'cultural' || (e.category_id && !e.category_id.includes('sports'))
  );

  // Requirement 1: Boys Sports games: Volleyball, Basketball, Table Tennis
  const boysGameKeys = [
    { key: 'volleyball', name: 'Volleyball', fallbackId: 'volleyball-boys' },
    { key: 'basketball', name: 'Basketball', fallbackId: 'basketball-boys' },
    { key: 'table-tennis', name: 'Table Tennis', fallbackId: 'table-tennis-boys' },
  ];
  const boysList = boysGameKeys.map(({ key, name, fallbackId }) => {
    const found = eventPool.find((e) => {
      const id = (e.id || e.slug || '').toLowerCase();
      const isBoys = e.type === 'sports_boys' || e.category_id === 'boys-sports' || id.includes('boys');
      return isBoys && (id.includes(key) || (e.name || '').toLowerCase().includes(key));
    });
    if (found) return found;
    return allBoysFallback.find((e) => e.id === fallbackId || e.slug === fallbackId) || {
      id: fallbackId,
      slug: fallbackId,
      name: `${name} Championship (Boys)`,
      category: 'Boys Sports',
      type: 'sports_boys',
      gender: 'boys',
      description: `Official Inter-College ${name} Championship for Boys at COLORIDO 2K26.`,
      venue_name: key === 'table-tennis' ? 'Indoor Sports Complex' : 'Outdoor Sports Courts',
      min_team_size: key === 'table-tennis' ? 1 : 5,
      max_team_size: key === 'table-tennis' ? 1 : 12,
      team_size_label: key === 'table-tennis' ? '1 Player (Solo)' : '6 - 12 Players',
      is_registration_open: 1,
      registration_deadline: '2026-10-15T23:59:59.000Z',
      rules: ['Valid college student ID required.', 'Matches follow standard collegiate federation rules.'],
    };
  });

  // Requirement 1: Girls Sports games: Throwball, Tennikoit, Table Tennis
  const girlsGameKeys = [
    { key: 'throwball', name: 'Throwball', fallbackId: 'throwball-girls' },
    { key: 'tennikoit', name: 'Tennikoit', fallbackId: 'tennikoit-girls' },
    { key: 'table-tennis', name: 'Table Tennis', fallbackId: 'table-tennis-girls' },
  ];
  const girlsList = girlsGameKeys.map(({ key, name, fallbackId }) => {
    const found = eventPool.find((e) => {
      const id = (e.id || e.slug || '').toLowerCase();
      const isGirls = e.type === 'sports_girls' || e.category_id === 'girls-sports' || id.includes('girls');
      return isGirls && (id.includes(key) || (e.name || '').toLowerCase().includes(key));
    });
    if (found) return found;
    return allGirlsFallback.find((e) => e.id === fallbackId || e.slug === fallbackId) || {
      id: fallbackId,
      slug: fallbackId,
      name: `${name} Tournament (Girls)`,
      category: 'Girls Sports',
      type: 'sports_girls',
      gender: 'girls',
      description: `Official Inter-College ${name} Championship for Girls at COLORIDO 2K26.`,
      venue_name: key === 'table-tennis' ? 'Indoor Sports Complex' : 'Girls Sports Arena',
      min_team_size: key === 'throwball' ? 7 : 1,
      max_team_size: key === 'throwball' ? 12 : 2,
      team_size_label: key === 'throwball' ? '7 - 12 Players' : '1 - 2 Players',
      is_registration_open: 1,
      registration_deadline: '2026-10-15T23:59:59.000Z',
      rules: ['Valid college student ID required.', 'Standard tournament rules apply.'],
    };
  });

  const currentList =
    categoryType === 'cultural' ? culturalList
    : categoryType === 'boysSports' ? boysList
    : girlsList;

  /* Pre-select from URL slug or eventId */
  useEffect(() => {
    const target = eventId || eventSlug;
    if (target && eventPool.length > 0) {
      const targetLower = target.toLowerCase();
      const match = eventPool.find((e) => {
        const idLower = (e.id || '').toLowerCase();
        const slugLower = (e.slug || '').toLowerCase();
        return idLower === targetLower || slugLower === targetLower;
      });
      if (match) {
        if (match.type === 'cultural' || (match.category_id && !match.category_id.includes('sports'))) {
          setCategoryType('cultural');
        } else if (match.gender === 'girls' || match.type === 'sports_girls' || match.category_id === 'girls-sports') {
          setCategoryType('girlsSports');
        } else {
          setCategoryType('boysSports');
        }
        setSelectedEventId(match.id || match.slug);
      }
    }
  }, [eventSlug, eventId, eventPool.length]);

  /* Auto-select first event when category changes if current not in list */
  useEffect(() => {
    if (currentList.length > 0) {
      const found = currentList.find((e) => e.id === selectedEventId || e.slug === selectedEventId);
      if (!found) {
        setSelectedEventId(currentList[0].id || currentList[0].slug);
      }
    }
  }, [categoryType, currentList]);

  const activeEvent = currentList.find((e) => e.id === selectedEventId || e.slug === selectedEventId) || currentList[0];

  /* Safely extract rules as strings so objects never crash React render */
  const parsedRules: string[] = (() => {
    if (!activeEvent?.rules) return [];
    let raw = activeEvent.rules;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        return [raw];
      }
    }
    if (!Array.isArray(raw)) return [];
    const result: string[] = [];
    for (const r of raw) {
      if (typeof r === 'string') {
        result.push(r);
      } else if (r && typeof r === 'object') {
        if (r.title && Array.isArray(r.points) && r.points.length > 0) {
          for (const p of r.points) {
            result.push(`${r.title}: ${p}`);
          }
        } else if (Array.isArray(r.points)) {
          for (const p of r.points) {
            result.push(String(p));
          }
        } else if (r.title) {
          result.push(String(r.title));
        } else {
          result.push(JSON.stringify(r));
        }
      }
    }
    return result;
  })();

  const minTeamSize = activeEvent ? (activeEvent.min_team_size || 1) : 1;
  const maxTeamSize = activeEvent ? (activeEvent.max_team_size || 1) : 1;
  const isTeamEvent = maxTeamSize > 1;

  /* Reset team members & audio upload when active event changes */
  useEffect(() => {
    if (!activeEvent) return;
    if (isTeamEvent) {
      const neededMembers = Math.max(0, minTeamSize - 1);
      setMembers(Array.from({ length: neededMembers }, () => ({ ...EMPTY_MEMBER })));
    } else {
      setMembers([]);
    }
    setAudioFileUrl('');
    setAudioFileName('');
    setFormError('');
  }, [activeEvent?.id, activeEvent?.slug]);

  /* ── Live Deadline Countdown Timer ── */
  useEffect(() => {
    if (!activeEvent?.registration_deadline) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
      return;
    }

    const calculateTime = () => {
      const target = new Date(activeEvent.registration_deadline).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0 || activeEvent.is_registration_open === 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeRemaining({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeEvent?.registration_deadline, activeEvent?.is_registration_open]);

  const isClosed = timeRemaining.isExpired || activeEvent?.is_registration_open === 0;

  const addMember = () => {
    if (members.length < maxTeamSize - 1) {
      setMembers((prev) => [...prev, { ...EMPTY_MEMBER }]);
    }
  };

  const removeMember = (idx: number) => {
    if (members.length > Math.max(0, minTeamSize - 1)) {
      setMembers((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const updateMember = (idx: number, field: keyof MemberField, value: string) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  /* ── Handle Audio File Upload ── */
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('Audio file size must be less than 25MB');
      return;
    }

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['mp3', 'wav', 'm4a'].includes(ext || '')) {
      toast.error('Only MP3, WAV, and M4A audio files are accepted');
      return;
    }

    setUploadingAudio(true);
    try {
      const data = await uploadAudioFile(file);
      setAudioFileUrl(data.fileUrl);
      setAudioFileName(data.fileName || file.name);
      toast.success('Track uploaded successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to upload audio file');
    } finally {
      setUploadingAudio(false);
    }
  };

  /* ── Validation ── */
  const validate = (): string => {
    if (isClosed) return 'Registration for this event is closed.';
    if (!participantName.trim()) return 'Full name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email address is required.';
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) return 'Enter a valid 10-digit Indian mobile number.';
    if (!collegeName.trim()) return 'College / Institution name is required.';
    if (!rollNumber.trim()) return 'Student Roll Number / ID is required.';
    if (isTeamEvent) {
      if (!teamName.trim()) return 'Team Name is required for this event.';
      for (let i = 0; i < members.length; i++) {
        if (!members[i].full_name.trim()) return `Team member #${i + 2} name is required.`;
      }
    }
    if ((activeEvent?.requires_audio === 1 || activeEvent?.requires_audio === true) && !audioFileUrl) {
      return 'Audio/Music track upload is required for this competition.';
    }
    if (department === 'Other' && !customDepartment.trim()) {
      return 'Please enter your branch / department.';
    }
    if (!agreeRules) return 'You must agree to the festival rules and code of conduct.';
    return '';
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); toast.error(err); return; }
    setFormError('');
    setSubmitting(true);

    const eventTypeForPayload =
      categoryType === 'boysSports' ? 'sports_boys'
      : categoryType === 'girlsSports' ? 'sports_girls'
      : 'cultural';

    const payload = {
      event_id: activeEvent?.id || selectedEventId,
      event_name: activeEvent?.name || 'Festival Event',
      event_type: eventTypeForPayload,
      registration_type: isTeamEvent ? 'team' : 'individual',
      participant_name: participantName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      college_name: collegeName.trim(),
      roll_number: rollNumber.trim(),
      department: department === 'Other' ? (customDepartment.trim() || 'Other') : department,
      year_of_study: yearOfStudy,
      gender,
      team_name: isTeamEvent ? teamName.trim() : undefined,
      team_members: isTeamEvent ? members : [],
      audio_file_url: audioFileUrl || undefined,
      audio_file_name: audioFileName || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      const result = await registerForEvent(payload);
      const regNumber = result?.registration?.registration_number || result?.registration_number;
      if (regNumber) {
        localStorage.setItem(`reg_${regNumber}`, JSON.stringify({ ...payload, registration_number: regNumber, status: 'confirmed' }));
        toast.success('Registration successful! Generating your official E-Pass...');
        navigate(`/registration/${regNumber}`);
      } else {
        throw new Error('No registration number returned');
      }
    } catch (apiErr: any) {
      const msg = apiErr?.message || 'Registration failed. Please try again.';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('duplicate')) {
        toast.error('⚠️ Duplicate registration detected. You are already registered for this event.');
      } else {
        toast.error(`Registration error: ${msg}`);
      }
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── UI Helpers ── */
  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/8 transition-all';
  const selectClass = 'w-full px-3.5 py-2.5 rounded-xl bg-[#0f0c1b] border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-all';
  const labelClass = 'block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider';
  const categoryColor = categoryType === 'cultural' ? 'purple' : categoryType === 'boysSports' ? 'orange' : 'cyan';

  return (
    <div className="min-h-screen bg-[#07070a] pt-24 pb-20">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-20 ${
          categoryType === 'cultural' ? 'bg-purple-600' : categoryType === 'boysSports' ? 'bg-orange-600' : 'bg-cyan-600'
        }`} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center py-8 space-y-3">
          <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${
            categoryType === 'cultural' ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
            : categoryType === 'boysSports' ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
            : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
          }`}>
            <Ticket className="w-3.5 h-3.5" />
            <span>Official Festival Registration Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            Event{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
              categoryType === 'cultural' ? 'from-purple-400 via-pink-400 to-amber-300'
              : categoryType === 'boysSports' ? 'from-orange-400 to-red-500'
              : 'from-cyan-400 to-blue-500'
            }`}>
              Registration
            </span>
          </h1>

          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Register directly into the COLORIDO 2K26 central database. Live updates from administrators reflect automatically.
          </p>

          {/* Prominent Free Registration Badge */}
          <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NO REGISTRATION FEE — 100% FREE ENTRY</span>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center justify-center space-x-2 mb-8 overflow-x-auto pb-1">
          {([
            { id: 'cultural', label: '🎭 Cultural Events', icon: Sparkles },
            { id: 'boysSports', label: '🔥 Boys Sports', icon: Trophy },
            { id: 'girlsSports', label: '⚡ Girls Sports', icon: Trophy },
          ] as const).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryType(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                categoryType === cat.id
                  ? cat.id === 'cultural' ? 'bg-purple-600 text-white border-purple-400/30 shadow-lg shadow-purple-600/30'
                  : cat.id === 'boysSports' ? 'bg-orange-600 text-white border-orange-400/30 shadow-lg shadow-orange-600/30'
                  : 'bg-cyan-600 text-white border-cyan-400/30 shadow-lg shadow-cyan-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Requirement 6: Prominent Registration Info Message */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start space-x-3 mb-6 shadow-lg shadow-amber-500/5">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong className="text-amber-300 font-bold">Important Notice:</strong> Please ensure that all your registration details are correct before submitting. Once submitted, changes cannot be made.
          </p>
        </div>

        {/* Main Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-[#0d0b18]/95 p-6 sm:p-10 backdrop-blur-md shadow-2xl shadow-black/70 space-y-8"
        >
          {/* ─── STEP 1: Choose Competition ─── */}
          <div className="space-y-4">
            <SectionHeader step={1} title="Choose Competition" color={categoryColor} />

            {/* If sports, show clear selectable cards */}
            {(categoryType === 'boysSports' || categoryType === 'girlsSports') ? (
              <div>
                <label className={labelClass}>
                  Select Game ({categoryType === 'boysSports' ? 'Boys Sports' : 'Girls Sports'}) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentList.map((ev) => {
                    const isSelected = ev.id === selectedEventId || ev.slug === selectedEventId;
                    const isBoys = categoryType === 'boysSports';
                    const cleanName = ev.name.replace(/\s*\((Boys|Girls|Men|Women)\)/i, '');
                    return (
                      <button
                        key={ev.id || ev.slug}
                        type="button"
                        onClick={() => setSelectedEventId(ev.id || ev.slug)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? isBoys
                              ? 'border-orange-500 bg-orange-950/40 shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/40'
                              : 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/40'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-extrabold text-sm sm:text-base text-white">
                            {cleanName}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? isBoys
                                  ? 'border-orange-400 bg-orange-500 text-white'
                                  : 'border-cyan-400 bg-cyan-500 text-white'
                                : 'border-white/20 bg-white/5'
                            }`}
                          >
                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <span>{ev.team_size_label || (ev.max_team_size > 1 ? 'Team Squad' : 'Individual')}</span>
                          <span className="text-amber-300/80">📍 {ev.venue_name || ev.venue || 'Sports Complex'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <label className={labelClass}>Select Cultural Event *</label>
                <div className="relative">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className={selectClass}
                    disabled={loadingEvents}
                  >
                    {currentList.map((ev) => (
                      <option key={ev.id || ev.slug} value={ev.id || ev.slug}>
                        {ev.name} — {ev.category_name || ev.category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Active Event Card with Rules & Live Countdown */}
            {activeEvent && (
              <motion.div
                key={activeEvent.id || activeEvent.slug}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border p-4 sm:p-5 text-sm space-y-3 ${
                  categoryType === 'cultural' ? 'border-purple-500/25 bg-purple-500/5'
                  : categoryType === 'boysSports' ? 'border-orange-500/25 bg-orange-500/5'
                  : 'border-cyan-500/25 bg-cyan-500/5'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="font-extrabold text-white text-base sm:text-lg">{activeEvent.name}</span>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">{activeEvent.short_description || activeEvent.description}</p>
                  </div>
                  <div className="shrink-0 space-y-1 text-right">
                    <div className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      isTeamEvent ? 'bg-white/10 text-slate-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {isTeamEvent ? (
                        <span><Users className="w-3 h-3 inline mr-1" />{activeEvent.team_size_label || `${minTeamSize} - ${maxTeamSize} Members`}</span>
                      ) : (
                        <span><User className="w-3 h-3 inline mr-1" />Solo / Individual</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">📍 {activeEvent.venue_name || activeEvent.venue || 'RVR & JC Campus'}</div>
                  </div>
                </div>

                {/* Registration Countdown Timer / Status */}
                <div className="pt-2 border-t border-white/10">
                  {isClosed ? (
                    <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/30 px-3.5 py-2 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>REGISTRATIONS CLOSED: The deadline for this event has expired or registration was closed by organizers.</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-black/40 border border-white/10 px-3.5 py-2.5 rounded-xl">
                      <div className="flex items-center space-x-2 text-amber-300 font-bold">
                        <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                        <span>Registration Closes In:</span>
                      </div>
                      <div className="flex items-center space-x-1 font-mono font-black text-amber-300 text-xs sm:text-sm">
                        <span className="bg-amber-400/20 px-2 py-0.5 rounded">{String(timeRemaining.days).padStart(2, '0')}d</span>
                        <span>:</span>
                        <span className="bg-amber-400/20 px-2 py-0.5 rounded">{String(timeRemaining.hours).padStart(2, '0')}h</span>
                        <span>:</span>
                        <span className="bg-amber-400/20 px-2 py-0.5 rounded">{String(timeRemaining.minutes).padStart(2, '0')}m</span>
                        <span>:</span>
                        <span className="bg-amber-400/20 px-2 py-0.5 rounded">{String(timeRemaining.seconds).padStart(2, '0')}s</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rules & Guidelines */}
                {parsedRules.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Rules &amp; Guidelines:</p>
                    <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
                      {parsedRules.slice(0, 5).map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Audio Notice if required */}
                {(activeEvent.requires_audio === 1 || activeEvent.requires_audio === true) && (
                  <div className="flex items-center space-x-2 text-purple-300 text-xs bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl">
                    <Music className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Audio track upload (MP3/WAV/M4A) is required during registration for this performance.</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ─── STEP 2: Participant Details ─── */}
          <div className="space-y-4">
            <SectionHeader step={2} title={isTeamEvent ? 'Team Captain / Primary Participant' : 'Participant Details'} color={categoryColor} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text" required value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="e.g. Mourya Teja"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mobile No. (WhatsApp) *</label>
                <input
                  type="tel" required value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender *</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')} className={selectClass}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>College / Institution *</label>
                <input
                  type="text" required value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. RVR & JC College of Engineering"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Roll No. / Student ID *</label>
                <input
                  type="text" required value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. Y22CS001"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Branch / Department *</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectClass}>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {department === 'Other' && (
                <div>
                  <label className={labelClass}>Enter your Branch / Department *</label>
                  <input
                    type="text"
                    required
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="Enter your Branch / Department"
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>Year of Study *</label>
                <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} className={selectClass}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ─── STEP 3: Team Details (If team event) ─── */}
          <AnimatePresence>
            {isTeamEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <SectionHeader step={3} title={`Team Squad (${minTeamSize}–${maxTeamSize} Members)`} color={categoryColor} />

                <div>
                  <label className={labelClass}>Team Name *</label>
                  <input
                    type="text" value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Thunder Strikers"
                    className={inputClass}
                  />
                </div>

                <p className="text-xs text-slate-400">
                  Primary registrant is <span className="text-amber-300 font-bold">Captain</span> (Member #1). Add between {minTeamSize - 1} and {maxTeamSize - 1} additional squad members below.
                </p>

                <div className="space-y-3">
                  {members.map((member, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                          Squad Member #{idx + 2}
                        </span>
                        {members.length > Math.max(0, minTeamSize - 1) && (
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Full Name *</label>
                          <input
                            type="text" value={member.full_name}
                            onChange={(e) => updateMember(idx, 'full_name', e.target.value)}
                            placeholder="Full Name"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Roll No.</label>
                          <input
                            type="text" value={member.roll_number}
                            onChange={(e) => updateMember(idx, 'roll_number', e.target.value)}
                            placeholder="Roll Number"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Mobile No.</label>
                          <input
                            type="tel" value={member.phone}
                            onChange={(e) => updateMember(idx, 'phone', e.target.value)}
                            placeholder="Phone Number"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>College</label>
                          <input
                            type="text" value={member.college}
                            onChange={(e) => updateMember(idx, 'college', e.target.value)}
                            placeholder={collegeName || 'College name'}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {members.length < maxTeamSize - 1 && (
                  <button
                    type="button"
                    onClick={addMember}
                    className="w-full py-3 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-white hover:border-purple-500/50 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
                  >
                    <span>+ Add Squad Member</span>
                    <span className="text-slate-500">({members.length}/{maxTeamSize - 1})</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── STEP 4: Audio Track Upload (If required by event) ─── */}
          {(activeEvent?.requires_audio === 1 || activeEvent?.requires_audio === true) && (
            <div className="space-y-4">
              <SectionHeader step={isTeamEvent ? 4 : 3} title="Music Track Upload" color={categoryColor} />
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Upload Performance Track *</h4>
                    <p className="text-xs text-slate-400">Supported formats: MP3, WAV, M4A (Max: 25MB)</p>
                  </div>
                </div>

                {!audioFileUrl ? (
                  <div className="relative border-2 border-dashed border-white/20 hover:border-purple-500/50 rounded-2xl p-6 text-center transition-all">
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,audio/*"
                      onChange={handleAudioUpload}
                      disabled={uploadingAudio || isClosed}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {uploadingAudio ? (
                        <>
                          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                          <span className="text-xs font-bold text-purple-300">Uploading audio file...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-bold text-white">Click or drag audio file to upload</span>
                          <span className="text-[11px] text-slate-500">Files are securely hosted on festival server</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-purple-950/30 border border-purple-500/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-purple-200 truncate max-w-xs sm:max-w-md">{audioFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setAudioFileUrl(''); setAudioFileName(''); }}
                        className="text-red-400 hover:text-red-300 p-1 transition-colors"
                        title="Remove track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <audio controls className="w-full h-9 rounded-lg" src={audioFileUrl} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── FINAL STEP: Terms & Submit ─── */}
          <div className="pt-2 border-t border-white/10 space-y-5">
            {formError && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox" checked={agreeRules}
                onChange={(e) => setAgreeRules(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded bg-white/10 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                I agree to abide by all festival rules and regulations of COLORIDO 2K26 at RVR &amp; JC College of Engineering. 
                I confirm that all submitted details are authentic and that I will present a valid college ID at reporting.
              </span>
            </label>

            {/* Registration constraint warning */}
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
              <p className="leading-relaxed">
                <strong>Important Notice:</strong> Please ensure that all your registration details are correct before submitting. Once submitted, changes cannot be made.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || isClosed}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center space-x-2.5 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                isClosed
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  : categoryType === 'cultural'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-purple-600/30'
                  : categoryType === 'boysSports'
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-orange-600/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-600/30'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering & Generating E-Pass...</span>
                </>
              ) : isClosed ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Registrations Closed</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Registration &amp; Get E-Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-500">
              Registrations are securely stored directly in COLORIDO 2K26 central database. No payment required — festival entry is completely free.
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ step: number; title: string; color: string }> = ({ step, title, color }) => (
  <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
    <span className={`w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shrink-0 ${
      color === 'orange' ? 'bg-orange-600' : color === 'cyan' ? 'bg-cyan-600' : 'bg-purple-600'
    }`}>
      {step}
    </span>
    <h3 className="text-base font-bold text-white font-['Outfit']">{title}</h3>
  </div>
);

export default RegisterPage;
