import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../../lib/api';
import { Megaphone, AlertCircle, Bell, Tag, Calendar, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_urgent: boolean;
  link_url?: string;
  created_at: string;
}

const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Final Registration Deadline Extended!',
    content: 'Due to overwhelming demand from colleges across Andhra Pradesh and Telangana, online registration for all Cultural and Sports competitions is extended until February 20, 2026. Spot registrations will be limited.',
    category: 'Urgent',
    is_urgent: true,
    link_url: '/register',
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Celebrity Night & Chief Guests Announced',
    content: 'Get ready for an electrifying musical night on Day 2 at the RVR & JC Open Air Theatre! Renowned playback singers and DJ artists are lined up for the grand finale.',
    category: 'Cultural',
    is_urgent: false,
    link_url: '/schedule',
    created_at: '2026-02-14T14:30:00Z',
  },
  {
    id: '3',
    title: 'Cricket & Basketball Fixture Draw Scheduled',
    content: 'Team captains of all registered inter-collegiate sports teams must join the virtual fixtures briefing on February 22 at 5:00 PM. Match schedules will be posted here.',
    category: 'Sports',
    is_urgent: true,
    link_url: '/schedule',
    created_at: '2026-02-13T09:15:00Z',
  },
  {
    id: '4',
    title: 'Free Campus Transport & Accommodation Desk',
    content: 'Outstation participant teams traveling from outside Guntur/Vijayawada can request complimentary campus hostel accommodation and railway station pick-up through the desk.',
    category: 'General',
    is_urgent: false,
    link_url: '/contact',
    created_at: '2026-02-12T16:00:00Z',
  },
  {
    id: '5',
    title: 'Cash Prize Pool Increased to ₹3,50,000!',
    content: 'Management of R.V.R. & J.C. College of Engineering has enhanced the grand championship trophy cash award and individual cultural contest prizes.',
    category: 'Prizes',
    is_urgent: false,
    link_url: '/cultural',
    created_at: '2026-02-10T11:20:00Z',
  },
];

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getAnnouncements()
      .then((res) => {
        if (res.data?.announcements && res.data.announcements.length > 0) {
          setAnnouncements(res.data.announcements);
        } else {
          setAnnouncements(FALLBACK_ANNOUNCEMENTS);
        }
      })
      .catch(() => {
        setAnnouncements(FALLBACK_ANNOUNCEMENTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', 'Urgent', 'Cultural', 'Sports', 'General', 'Prizes'];

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'Urgent' ? item.is_urgent : item.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-bold uppercase tracking-widest text-pink-300">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Official News & Bulletins</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            Festival <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Announcements</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base">
            Stay up to date with official releases, event scheduling updates, rules revisions, and spot registration guidelines.
          </p>
        </div>

        {/* Urgent Alert Banner */}
        <div className="mb-10 rounded-2xl bg-gradient-to-r from-red-950/60 via-purple-950/40 to-red-950/60 border border-red-500/30 p-5 backdrop-blur-md shadow-lg shadow-red-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Live Alert</span>
                  <span className="text-xs text-slate-400">Online Portals Open</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Early bird registration confirms stage priority & kit reservation!
                </h2>
              </div>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-500/20 shrink-0"
            >
              <span>Register Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat === 'all' ? 'All Notices' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 uppercase tracking-widest">Loading Bulletins...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No bulletins match your filter</h3>
            <p className="text-xs text-slate-400 mt-1">Try selecting another category or clearing your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAnnouncements.map((item) => (
              <div
                key={item.id}
                className={`relative rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                  item.is_urgent
                    ? 'bg-gradient-to-br from-red-950/20 via-purple-950/20 to-black/60 border-red-500/30 shadow-lg shadow-red-500/5'
                    : 'bg-[#0f0c1b]/60 border-white/10 hover:border-purple-500/40 shadow-lg shadow-black/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                          item.is_urgent
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        }`}
                      >
                        {item.category}
                      </span>
                      {item.is_urgent && (
                        <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3" />
                          <span>Important</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.content}
                  </p>
                </div>

                {item.link_url && (
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-purple-400" />
                      <span>COLORIDO Bulletin</span>
                    </span>
                    <Link
                      to={item.link_url}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <span>Explore Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
