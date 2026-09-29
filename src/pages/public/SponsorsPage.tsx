import React, { useState, useEffect } from 'react';
import { getSponsors } from '../../lib/api';
import { Star, ExternalLink, Sparkles, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SponsorItem {
  id: string;
  name: string;
  tier: 'title' | 'powered_by' | 'associate' | 'partner' | 'media';
  logo_url: string;
  website_url?: string;
  description?: string;
}

const FALLBACK_SPONSORS: SponsorItem[] = [
  {
    id: 'sp-1',
    name: 'Tech Mahindra',
    tier: 'title',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://techmahindra.com',
    description: 'Title Presenting Sponsor of COLORIDO 2K26 — Fueling technological innovation and youth talent.',
  },
  {
    id: 'sp-2',
    name: 'TCS iON',
    tier: 'powered_by',
    logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://tcsion.com',
    description: 'Digital Infrastructure & Cloud Assessment Partner.',
  },
  {
    id: 'sp-3',
    name: 'Red Bull India',
    tier: 'powered_by',
    logo_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://redbull.com',
    description: 'Official Energy Drink Partner — Giving wings to stage artists and athletes.',
  },
  {
    id: 'sp-4',
    name: 'State Bank of India',
    tier: 'associate',
    logo_url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://sbi.co.in',
    description: 'Official Banking and Student Financial Services Partner.',
  },
  {
    id: 'sp-5',
    name: 'Decathlon Sports India',
    tier: 'associate',
    logo_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://decathlon.in',
    description: 'Official Sports Apparel & Equipment Partner.',
  },
  {
    id: 'sp-6',
    name: 'Radio Mirchi 98.3 FM',
    tier: 'media',
    logo_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=500&q=80',
    website_url: 'https://radiomirchi.com',
    description: 'Official Broadcasting & Exclusive Radio Media Partner.',
  },
];

const SponsorsPage: React.FC = () => {
  const [sponsors, setSponsors] = useState<SponsorItem[]>(FALLBACK_SPONSORS);

  useEffect(() => {
    getSponsors()
      .then((res) => {
        if (res.data?.sponsors && res.data.sponsors.length > 0) {
          setSponsors(res.data.sponsors);
        } else {
          setSponsors(FALLBACK_SPONSORS);
        }
      })
      .catch(() => {
        setSponsors(FALLBACK_SPONSORS);
      });
  }, []);

  const titleSponsors = sponsors.filter((s) => s.tier === 'title');
  const poweredBy = sponsors.filter((s) => s.tier === 'powered_by');
  const associates = sponsors.filter((s) => s.tier === 'associate' || s.tier === 'partner');
  const media = sponsors.filter((s) => s.tier === 'media');

  return (
    <div className="min-h-screen bg-[#07070a] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold uppercase tracking-widest text-amber-300">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Corporate Collaboration & Brand Allies</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase font-['Outfit'] tracking-tight">
            Our Esteemed <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400">Sponsors</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base">
            COLORIDO 2K26 is proudly backed by leading global brands and enterprises supporting student excellence, sportsmanship, and cultural heritage.
          </p>
        </div>

        {/* Fest Impact Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">15,000+</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Campus Footfall</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-black text-purple-400 font-['Outfit']">80+</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Colleges & Universities</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-black text-pink-400 font-['Outfit']">₹3.5 Lakhs</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Prize Pool</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center backdrop-blur-md">
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-['Outfit']">100K+</p>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Digital Reach</p>
          </div>
        </div>

        {/* Title Sponsor Section */}
        {titleSponsors.length > 0 && (
          <div className="mb-14">
            <div className="text-center mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                Title Presenting Sponsor
              </span>
            </div>
            <div className="max-w-2xl mx-auto">
              {titleSponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-[#0f0c1b] to-[#07070a] p-8 text-center backdrop-blur-md shadow-2xl shadow-amber-500/10 hover:border-amber-400 transition-all"
                >
                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-white/10 p-2 mb-4 border border-white/10 flex items-center justify-center">
                    <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mb-2">
                    {sponsor.name}
                  </h3>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto mb-5 leading-relaxed">
                    {sponsor.description}
                  </p>
                  {sponsor.website_url && (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Powered By Section */}
        {poweredBy.length > 0 && (
          <div className="mb-14">
            <div className="text-center mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                Powered By Partners
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {poweredBy.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="rounded-2xl border border-purple-500/30 bg-[#0f0c1b]/80 p-6 backdrop-blur-md flex flex-col justify-between hover:border-purple-400 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                      <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-['Outfit']">{sponsor.name}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sponsor.description}</p>
                    </div>
                  </div>
                  {sponsor.website_url && (
                    <div className="mt-4 pt-3 border-t border-white/5 text-right">
                      <a
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-400 hover:text-purple-300"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Associate & Media Partners */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              Associate & Media Allies
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...associates, ...media].map((sponsor) => (
              <div
                key={sponsor.id}
                className="rounded-xl border border-white/10 bg-[#0f0c1b]/60 p-5 backdrop-blur-md hover:border-white/20 transition-all flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0 border border-white/10">
                  <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">{sponsor.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{sponsor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner with Us CTA Banner */}
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-purple-950/60 p-8 sm:p-10 backdrop-blur-md text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-bold text-pink-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sponsorship Opportunities 2026</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-['Outfit']">
            Showcase Your Brand to Next-Gen Engineers
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Gain high-visibility stall spaces, digital branding across our live streams and banners, and direct campus engagement. Custom partnership tiers available.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-pink-500/20"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Sponsorship Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorsPage;
