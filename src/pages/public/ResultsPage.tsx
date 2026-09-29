import React, { useState, useEffect } from 'react';
import { getResults } from '../../lib/api';
import { Trophy, Search, Sparkles, Building2, Medal, Award } from 'lucide-react';

interface ResultItem {
  id: string;
  category: string;
  event_id?: string;
  event_name: string;
  position?: string;
  winner_name?: string;
  winner_college?: string;
  description?: string;
  first_place_team?: string;
  first_place_college?: string;
  second_place_team?: string;
  second_place_college?: string;
  second_place_description?: string;
  third_place_team?: string;
  third_place_college?: string;
  third_place_description?: string;
  created_at?: string;
}

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'cultural' | 'sports'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getResults()
      .then((res) => {
        if (res.data?.results) {
          setResults(res.data.results);
        }
      })
      .catch((err) => {
        console.error('Failed to load results:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter((item) => {
    const catLower = (item.category || '').toLowerCase();
    const matchesTab =
      filter === 'all'
        ? true
        : filter === 'cultural'
        ? catLower.includes('cultural') || !catLower.includes('sports')
        : catLower.includes('sports');

    const searchLower = search.toLowerCase();
    const matchesSearch =
      (item.event_name || '').toLowerCase().includes(searchLower) ||
      (item.winner_name || item.first_place_team || '').toLowerCase().includes(searchLower) ||
      (item.winner_college || item.first_place_college || '').toLowerCase().includes(searchLower) ||
      (item.category || '').toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07070a] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center py-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Competition Hall of Fame</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            Festival{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500">
              Results & Winners
            </span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Verified tournament outcomes across all Cultural and Sports disciplines at COLORIDO 2K26, RVR & JC College of Engineering.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-2">
            {(['all', 'cultural', 'sports'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === tab
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab === 'all' ? 'All Competitions' : `${tab} Events`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, category, or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Results Cards */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 uppercase tracking-widest">Loading Winners from Database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white/[0.02] border border-white/5 p-8">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No results found</h3>
            <p className="text-xs text-slate-400 mt-1">Official jury results are published immediately after rounds conclude.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((item) => {
              const winnerName = item.winner_name || item.first_place_team;
              const winnerCollege = item.winner_college || item.first_place_college;
              const position = item.position || '1st Place / Winner';

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-[#0f0c1b]/80 backdrop-blur-md overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-xl shadow-black/40"
                >
                  {/* Category and Event Header */}
                  <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                        {item.category}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
                        {item.event_name}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Official Verified Result</span>
                    </div>
                  </div>

                  {/* Winner Podium Showcase */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                    {/* Primary 1st Place / Winner Showcase (8 cols) */}
                    <div className={`relative rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent p-5 sm:p-6 flex flex-col justify-between shadow-xl shadow-amber-500/5 ${
                      item.second_place_team || item.third_place_team ? 'md:col-span-8' : 'md:col-span-12'
                    }`}>
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-amber-500/30">
                        <Trophy className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{position}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                          CHAMPION / WINNER
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mb-2">
                          {winnerName}
                        </h3>
                        {winnerCollege && (
                          <p className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>{winnerCollege}</span>
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-amber-500/20 italic">
                            &ldquo;{item.description}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 2nd & 3rd Place Finishers (4 cols) */}
                    {(item.second_place_team || item.third_place_team) && (
                      <div className="md:col-span-4 flex flex-col justify-between space-y-3">
                        {item.second_place_team && (
                          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex-1 flex flex-col justify-center">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1 mb-1">
                              <Medal className="w-3.5 h-3.5 text-slate-400" />
                              <span>2nd Place / Runner Up</span>
                            </span>
                            <h4 className="text-sm font-bold text-white">{item.second_place_team}</h4>
                            <p className="text-xs text-slate-400">{item.second_place_college}</p>
                            {item.second_place_description && (
                              <p className="text-xs text-slate-300 mt-2 pt-2 border-t border-white/10 italic">
                                &ldquo;{item.second_place_description}&rdquo;
                              </p>
                            )}
                          </div>
                        )}

                        {item.third_place_team && (
                          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex-1 flex flex-col justify-center">
                            <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center space-x-1 mb-1">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>3rd Place</span>
                            </span>
                            <h4 className="text-sm font-bold text-white">{item.third_place_team}</h4>
                            <p className="text-xs text-slate-400">{item.third_place_college}</p>
                            {item.third_place_description && (
                              <p className="text-xs text-slate-300 mt-2 pt-2 border-t border-white/10 italic">
                                &ldquo;{item.third_place_description}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
